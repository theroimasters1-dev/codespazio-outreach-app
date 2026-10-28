const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const storageService = require('./services/storageService');
const geminiService = require('./services/geminiService');
const emailService = require('./services/emailService');
const prospectorService = require('./services/prospectorService');
const { CODESPAZIO_KNOWLEDGE } = require('./services/codespazioKnowledge');

let mainWindow = null;
let autoPilotInterval = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    title: 'CodeSpazio Solutions - AI Client Acquisition & Deal Closer',
    backgroundColor: '#040711',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function notifyRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

// Intercept storage log additions to push live to UI
const originalAddLog = storageService.addLog.bind(storageService);
storageService.addLog = (type, message, details = null) => {
  const logItem = originalAddLog(type, message, details);
  notifyRenderer('log:added', logItem);
  notifyRenderer('stats:updated', storageService.getStats());
  return logItem;
};

/* -------------------------------------------------------------
 * Background Auto-Pilot Worker
 * 1. Polls inbox, detects client replies, analyzes intent,
 *    and automatically responds to close deals & share payment details!
 * 2. Checks unreplied contacted leads and sends automated follow-ups!
 * ----------------------------------------------------------- */
async function runAutoPilotCycle() {
  try {
    const settings = storageService.getSettings();
    if (!settings.gmail?.address || !settings.gmail?.appPassword) {
      return; // Gmail not configured yet
    }

    if (!settings.outreach?.autoPilotReply) {
      return; // Auto-pilot disabled
    }

    storageService.addLog('info', 'Auto-Pilot: Checking Gmail inbox for prospect replies...');
    const result = await emailService.checkInboxForReplies({ sinceHours: 48 });

    // Step 1: Handle Incoming Replies & Close Deals
    if (result.newReplies && result.newReplies.length > 0) {
      storageService.addLog('success', `Auto-Pilot: Found ${result.newReplies.length} new incoming email(s)!`);
      notifyRenderer('inbox:updated', storageService.getInbox());

      for (const reply of result.newReplies) {
        if (!reply.repliedByAi) {
          const lead = storageService.getLeads().find(l => l.contactEmail && l.contactEmail.toLowerCase() === reply.from.toLowerCase());
          
          storageService.addLog('ai', `Auto-Pilot: Analyzing reply from ${reply.fromName || reply.from}...`);
          
          const intentAnalysis = await geminiService.analyzeIncomingReply({
            subject: reply.subject,
            body: reply.text,
            senderEmail: reply.from,
            prospectContext: lead || {}
          });

          storageService.addLog('info', `Intent identified: ${intentAnalysis.intent} (${intentAnalysis.sentiment}) - "${intentAnalysis.summary}"`);

          // Formulate conversion response
          if (intentAnalysis.intent !== 'NOT_INTERESTED' && intentAnalysis.intent !== 'OUT_OF_OFFICE') {
            const aiReply = await geminiService.generateConversionReply({
              subject: reply.subject,
              incomingBody: reply.text,
              senderEmail: reply.from,
              intentAnalysis,
              prospectContext: lead || {}
            });

            if (settings.outreach?.requireApprovalBeforeSendingReply) {
              storageService.addLog('warning', `Draft ready for review for ${reply.from}. User approval required before sending.`);
              reply.aiDraft = aiReply;
              reply.intentAnalysis = intentAnalysis;
              storageService.saveInbox(storageService.getInbox());
            } else {
              // Autonomous send
              storageService.addLog('ai', `Auto-Pilot: Sending automated conversion reply to ${reply.from}...`);
              await emailService.sendEmail({
                to: reply.from,
                subject: aiReply.subject,
                text: aiReply.body,
                html: aiReply.html,
                inReplyTo: reply.messageId,
                leadId: lead?.id || null
              });

              reply.repliedByAi = true;
              reply.aiDraft = aiReply;
              reply.intentAnalysis = intentAnalysis;
              storageService.saveInbox(storageService.getInbox());

              // If payment details or closing stage, update lead status
              if (intentAnalysis.intent === 'READY_TO_CONVERT') {
                if (lead) storageService.updateLead(lead.id, { status: 'converted' });
                storageService.incrementStat('conversions', 1);
                storageService.addLog('success', `🎉 CONVERSION STAGE REACHED! Payment & Onboarding details delivered to ${reply.from}!`);
              } else if (intentAnalysis.intent === 'INTERESTED_WANTS_CALL' || intentAnalysis.intent === 'INTERESTED_WANTS_PRICING') {
                if (lead) storageService.updateLead(lead.id, { status: 'interested' });
              }

              storageService.addLog('success', `Auto-Pilot: Successfully sent response to ${reply.from}!`);
            }
          } else if (intentAnalysis.intent === 'NOT_INTERESTED') {
            if (lead) {
              storageService.updateLead(lead.id, { status: 'opt-out' });
            }
            storageService.addLog('info', `Lead ${reply.from} marked as Opt-Out.`);
          }
        }
      }
    }

    // Step 2: Automated Follow-Up Engine (for leads who haven't replied)
    const allLeads = storageService.getLeads();
    const now = Date.now();
    const twoDaysMs = 48 * 60 * 60 * 1000;

    for (const lead of allLeads) {
      if (lead.status === 'contacted' && !lead.lastReplyAt) {
        const lastContactTime = lead.lastFollowUpAt ? new Date(lead.lastFollowUpAt).getTime() : (lead.lastContactedAt ? new Date(lead.lastContactedAt).getTime() : 0);
        const followUpCount = lead.followUpCount || 0;

        if (lastContactTime > 0 && (now - lastContactTime) >= twoDaysMs && followUpCount < 3) {
          const nextStage = followUpCount + 1;
          storageService.addLog('ai', `Auto-Pilot: Drafting Stage ${nextStage} follow-up for ${lead.companyName} (${lead.contactEmail})...`);

          const followUp = await geminiService.generateFollowUpEmail({
            prospect: lead,
            previousSubject: lead.lastSubject || `Collaboration with ${lead.companyName}`,
            followUpStage: nextStage
          });

          await emailService.sendEmail({
            to: lead.contactEmail,
            subject: followUp.subject,
            text: followUp.body,
            html: followUp.html,
            leadId: lead.id
          });

          storageService.updateLead(lead.id, {
            followUpCount: nextStage,
            lastFollowUpAt: new Date().toISOString()
          });

          storageService.addLog('success', `Auto-Pilot: Delivered Stage ${nextStage} follow-up to ${lead.companyName}!`);
          break; // Process at most 1 follow-up per cycle to maintain natural pacing
        }
      }
    }

  } catch (err) {
    storageService.addLog('error', `Auto-Pilot error: ${err.message}`);
  }
}

function startAutoPilot() {
  if (autoPilotInterval) clearInterval(autoPilotInterval);
  const settings = storageService.getSettings();
  const minutes = Math.max(2, settings.outreach?.pollIntervalMinutes || 5);
  autoPilotInterval = setInterval(runAutoPilotCycle, minutes * 60 * 1000);
  storageService.addLog('info', `Auto-Pilot engine active: Checking replies and follow-ups every ${minutes} min.`);
}

/* -------------------------------------------------------------
 * IPC Handlers
 * ----------------------------------------------------------- */

// Settings
ipcMain.handle('settings:get', async () => storageService.getSettings());
ipcMain.handle('settings:save', async (e, settings) => {
  const saved = storageService.saveSettings(settings);
  startAutoPilot();
  storageService.addLog('success', 'Settings successfully updated & reloaded.');
  return saved;
});
ipcMain.handle('settings:testGmail', async (e, creds) => {
  try {
    const smtpRes = await emailService.testSmtp(creds?.email, creds?.appPassword);
    const imapRes = await emailService.testImap(creds?.email, creds?.appPassword);
    return {
      success: true,
      message: `Gmail Connected Successfully! (SMTP & IMAP verified). ${imapRes.message}`
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
ipcMain.handle('settings:testGemini', async (e, { apiKey, model }) => {
  try {
    const result = await geminiService.testApiKey(apiKey, model);
    return result;
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// Leads & Prospecting
ipcMain.handle('leads:get', async () => storageService.getLeads());
ipcMain.handle('leads:add', async (e, lead) => storageService.addLead(lead));
ipcMain.handle('leads:update', async (e, id, updates) => storageService.updateLead(id, updates));
ipcMain.handle('leads:delete', async (e, id) => storageService.deleteLead(id));
ipcMain.handle('leads:discover', async (e, params) => {
  try {
    const leads = await prospectorService.discoverAndEnrichProspects(params);
    return { success: true, leads };
  } catch (err) {
    storageService.addLog('error', `Prospecting failed: ${err.message}`);
    return { success: false, message: err.message };
  }
});
ipcMain.handle('leads:inspectWebsite', async (e, url) => {
  return prospectorService.inspectWebsite(url);
});

// Email Pitch Generation, Sending, and Follow-ups
ipcMain.handle('email:generatePitch', async (e, params) => {
  try {
    const result = await geminiService.generatePersonalizedEmail(params);
    return { success: true, email: result };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
ipcMain.handle('email:send', async (e, params) => {
  try {
    const info = await emailService.sendEmail(params);
    if (params.leadId) {
      storageService.updateLead(params.leadId, { lastSubject: params.subject });
    }
    return { success: true, info };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// Manual 1-Click Follow-Up Trigger
ipcMain.handle('email:triggerFollowUp', async (e, leadId) => {
  try {
    const lead = storageService.getLeads().find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const nextStage = (lead.followUpCount || 0) + 1;
    const followUp = await geminiService.generateFollowUpEmail({
      prospect: lead,
      previousSubject: lead.lastSubject || `Collaboration with ${lead.companyName}`,
      followUpStage: nextStage
    });

    await emailService.sendEmail({
      to: lead.contactEmail,
      subject: followUp.subject,
      text: followUp.body,
      html: followUp.html,
      leadId: lead.id
    });

    storageService.updateLead(lead.id, {
      followUpCount: nextStage,
      lastFollowUpAt: new Date().toISOString()
    });

    storageService.addLog('success', `Stage ${nextStage} follow-up sent to ${lead.companyName}!`);
    return { success: true, followUp };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// Inbox & Auto-reply
ipcMain.handle('inbox:check', async () => {
  try {
    const result = await emailService.checkInboxForReplies({ sinceHours: 72 });
    return { success: true, ...result, inbox: storageService.getInbox() };
  } catch (err) {
    return { success: false, message: err.message, inbox: storageService.getInbox() };
  }
});
ipcMain.handle('inbox:get', async () => storageService.getInbox());
ipcMain.handle('inbox:analyze', async (e, params) => {
  try {
    const analysis = await geminiService.analyzeIncomingReply(params);
    return { success: true, analysis };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
ipcMain.handle('inbox:generateReply', async (e, params) => {
  try {
    const reply = await geminiService.generateConversionReply(params);
    return { success: true, reply };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
ipcMain.handle('inbox:sendReply', async (e, params) => {
  try {
    const info = await emailService.sendEmail(params);
    const inbox = storageService.getInbox();
    const item = inbox.find(m => m.messageId === params.inReplyTo || m.from === params.to);
    if (item) {
      item.repliedByAi = true;
      storageService.saveInbox(inbox);
    }
    return { success: true, info };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// Logs & Stats
ipcMain.handle('logs:get', async () => storageService.getLogs(200));
ipcMain.handle('logs:clear', async () => storageService.clearLogs());
ipcMain.handle('stats:get', async () => storageService.getStats());
ipcMain.handle('knowledge:get', async () => CODESPAZIO_KNOWLEDGE);

// Shell
ipcMain.handle('shell:openExternal', async (e, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:'))) {
    shell.openExternal(url);
  }
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();
  startAutoPilot();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (autoPilotInterval) clearInterval(autoPilotInterval);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
