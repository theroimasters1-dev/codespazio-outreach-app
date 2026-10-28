/**
 * CodeSpazio Solutions - AI Client Acquisition & Deal Closer Suite
 * Frontend Application Controller
 */

// Application State
const state = {
  activeTab: 'dashboard',
  settings: {},
  leads: [],
  inbox: [],
  stats: {},
  knowledge: null,
  selectedInboxMsg: null,
  isBatchRunning: false
};

// DOM Elements
const elements = {
  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  pageTitle: document.getElementById('pageTitle'),
  pageDesc: document.getElementById('pageDesc'),
  connStatusPill: document.getElementById('connStatusPill'),
  configStatusDot: document.getElementById('configStatusDot'),
  toggleAutoPilotSidebar: document.getElementById('toggleAutoPilotSidebar'),

  // Quick Action Buttons
  btnSyncInbox: document.getElementById('btnSyncInbox'),
  btnQuickProspect: document.getElementById('btnQuickProspect'),
  btnGoToProspector: document.getElementById('btnGoToProspector'),
  btnGoToCampaigns: document.getElementById('btnGoToCampaigns'),

  // Dashboard Stats
  statLeadsCount: document.getElementById('statLeadsCount'),
  statSentCount: document.getElementById('statSentCount'),
  statRepliesCount: document.getElementById('statRepliesCount'),
  statConversionsCount: document.getElementById('statConversionsCount'),
  badgeLeads: document.getElementById('badgeLeads'),
  badgeInbox: document.getElementById('badgeInbox'),

  // Pipeline Bars
  pipeDiscovered: document.getElementById('pipeDiscovered'),
  pipeContacted: document.getElementById('pipeContacted'),
  pipeReplied: document.getElementById('pipeReplied'),
  pipeInterested: document.getElementById('pipeInterested'),
  pipeConverted: document.getElementById('pipeConverted'),
  barDiscovered: document.getElementById('barDiscovered'),
  barContacted: document.getElementById('barContacted'),
  barReplied: document.getElementById('barReplied'),
  barInterested: document.getElementById('barInterested'),
  barConverted: document.getElementById('barConverted'),

  // Live Terminal
  liveTerminal: document.getElementById('liveTerminal'),
  btnClearLogs: document.getElementById('btnClearLogs'),

  // Prospector Tab
  prospectNiche: document.getElementById('prospectNiche'),
  prospectLocation: document.getElementById('prospectLocation'),
  prospectService: document.getElementById('prospectService'),
  prospectCount: document.getElementById('prospectCount'),
  btnStartProspecting: document.getElementById('btnStartProspecting'),
  chkAutoSendAfterDiscovery: document.getElementById('chkAutoSendAfterDiscovery'),
  btnProspectorSendAll: document.getElementById('btnProspectorSendAll'),
  uncontactedCount: document.getElementById('uncontactedCount'),
  leadsTableBody: document.getElementById('leadsTableBody'),
  leadsTableCount: document.getElementById('leadsTableCount'),
  btnExportLeadsCsv: document.getElementById('btnExportLeadsCsv'),
  btnOpenManualLeadModal: document.getElementById('btnOpenManualLeadModal'),

  // Campaigns Tab
  campaignLeadSelect: document.getElementById('campaignLeadSelect'),
  campaignPitchFocus: document.getElementById('campaignPitchFocus'),
  campaignCustomNotes: document.getElementById('campaignCustomNotes'),
  btnGenerateEmailDraft: document.getElementById('btnGenerateEmailDraft'),
  previewRecipientBadge: document.getElementById('previewRecipientBadge'),
  emailToAddress: document.getElementById('emailToAddress'),
  emailSubjectLine: document.getElementById('emailSubjectLine'),
  emailBodyText: document.getElementById('emailBodyText'),
  btnSendSingleEmail: document.getElementById('btnSendSingleEmail'),
  btnStartBatchOutreach: document.getElementById('btnStartBatchOutreach'),

  // Inbox & Deal Closer Tab
  inboxCount: document.getElementById('inboxCount'),
  btnRefreshInboxNow: document.getElementById('btnRefreshInboxNow'),
  inboxThreadList: document.getElementById('inboxThreadList'),
  noMessageSelectedState: document.getElementById('noMessageSelectedState'),
  messageDetailView: document.getElementById('messageDetailView'),
  selectedIntentPill: document.getElementById('selectedIntentPill'),
  viewMsgFrom: document.getElementById('viewMsgFrom'),
  viewMsgAddr: document.getElementById('viewMsgAddr'),
  viewMsgDate: document.getElementById('viewMsgDate'),
  viewMsgSubject: document.getElementById('viewMsgSubject'),
  viewMsgBody: document.getElementById('viewMsgBody'),
  viewConfidenceBadge: document.getElementById('viewConfidenceBadge'),
  viewIntentSummary: document.getElementById('viewIntentSummary'),
  viewRecommendedAction: document.getElementById('viewRecommendedAction'),
  replyBodyText: document.getElementById('replyBodyText'),
  btnRegenerateCloserReply: document.getElementById('btnRegenerateCloserReply'),
  btnSendCloserReply: document.getElementById('btnSendCloserReply'),
  paymentFlagNote: document.getElementById('paymentFlagNote'),

  // Knowledge Tab
  knowledgeServicesList: document.getElementById('knowledgeServicesList'),

  // Settings Tab
  cfgFromName: document.getElementById('cfgFromName'),
  cfgGmailAddress: document.getElementById('cfgGmailAddress'),
  cfgGmailPassword: document.getElementById('cfgGmailPassword'),
  btnToggleGmailPwd: document.getElementById('btnToggleGmailPwd'),
  btnTestGmail: document.getElementById('btnTestGmail'),
  cfgGeminiKey: document.getElementById('cfgGeminiKey'),
  btnToggleGeminiKey: document.getElementById('btnToggleGeminiKey'),
  btnTestGemini: document.getElementById('btnTestGemini'),
  cfgGeminiModel: document.getElementById('cfgGeminiModel'),

  cfgPayAccountName: document.getElementById('cfgPayAccountName'),
  cfgPayBankName: document.getElementById('cfgPayBankName'),
  cfgPayAccountNumber: document.getElementById('cfgPayAccountNumber'),
  cfgPayIfscCode: document.getElementById('cfgPayIfscCode'),
  cfgPaySwiftBic: document.getElementById('cfgPaySwiftBic'),
  cfgPayUpiId: document.getElementById('cfgPayUpiId'),
  cfgPayPaymentUrl: document.getElementById('cfgPayPaymentUrl'),
  cfgPayCurrency: document.getElementById('cfgPayCurrency'),
  cfgPayTerms: document.getElementById('cfgPayTerms'),

  cfgAutoPilotReply: document.getElementById('cfgAutoPilotReply'),
  cfgRequireApproval: document.getElementById('cfgRequireApproval'),
  cfgPollInterval: document.getElementById('cfgPollInterval'),
  cfgSignature: document.getElementById('cfgSignature'),
  btnSaveAllSettings: document.getElementById('btnSaveAllSettings'),

  // Manual Add Modal
  modalAddLead: document.getElementById('modalAddLead'),
  btnCloseAddLeadModal: document.getElementById('btnCloseAddLeadModal'),
  btnCancelAddLead: document.getElementById('btnCancelAddLead'),
  btnSaveManualLead: document.getElementById('btnSaveManualLead'),
  manualCompanyName: document.getElementById('manualCompanyName'),
  manualWebsite: document.getElementById('manualWebsite'),
  manualEmail: document.getElementById('manualEmail'),
  manualContactName: document.getElementById('manualContactName'),
  manualGaps: document.getElementById('manualGaps'),

  // Toast
  toastContainer: document.getElementById('toastContainer'),
  linkGoogleAppPasswords: document.getElementById('linkGoogleAppPasswords'),
  linkAiStudio: document.getElementById('linkAiStudio')
};

// Tab titles and descriptions
const tabMeta = {
  dashboard: {
    title: 'Dashboard & Pipeline',
    desc: 'Autonomous client research, cold outreach, follow-ups, and automated conversion closing.'
  },
  prospector: {
    title: 'Client Prospector & AI Research',
    desc: 'Find 25 daily high-potential clients and businesses needing CodeSpazio IT services.'
  },
  campaigns: {
    title: 'Cold Outreach Campaigns',
    desc: 'Hyper-personalized cold pitches using 5 rotating copywriting frameworks + WhatsApp Direct Connect.'
  },
  inbox: {
    title: 'Inbox & AI Deal Closer',
    desc: 'Real-time IMAP listener, sentiment intent detection, and automated payment delivery.'
  },
  knowledge: {
    title: 'CodeSpazio Official Knowledge Base',
    desc: 'Verified portfolio, services, credentials (500+ deployments), and testimonials from codespazio.com.'
  },
  settings: {
    title: 'Settings & Credentials',
    desc: 'Gmail SMTP/IMAP credentials, Gemini API key, and banking/payment gateway details.'
  }
};

/* --------------------------------------------------------------------------
 * Initialization & Lifecycle
 * ----------------------------------------------------------------------- */
async function init() {
  setupNavigation();
  setupEventListeners();
  setupIPCListeners();

  // Load initial datasets
  await loadSettings();
  await loadKnowledgeBase();
  await refreshLeads();
  await refreshInbox();
  await refreshStats();
  await loadLogs();

  updateConnectionStatus();
}

/* --------------------------------------------------------------------------
 * Navigation
 * ----------------------------------------------------------------------- */
function setupNavigation() {
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      switchTab(targetTab);
    });
  });

  if (elements.btnGoToProspector) {
    elements.btnGoToProspector.addEventListener('click', () => switchTab('prospector'));
  }
  if (elements.btnGoToCampaigns) {
    elements.btnGoToCampaigns.addEventListener('click', () => switchTab('campaigns'));
  }
  if (elements.btnQuickProspect) {
    elements.btnQuickProspect.addEventListener('click', () => {
      switchTab('prospector');
      elements.btnStartProspecting.click();
    });
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  elements.navItems.forEach(i => i.classList.toggle('active', i.dataset.tab === tabId));
  elements.tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === `tab-${tabId}`));

  const meta = tabMeta[tabId] || { title: 'CodeSpazio Suite', desc: '' };
  elements.pageTitle.textContent = meta.title;
  elements.pageDesc.textContent = meta.desc;

  if (tabId === 'campaigns') {
    populateCampaignLeadDropdown();
  }
}

/* --------------------------------------------------------------------------
 * Toast Notifications
 * ----------------------------------------------------------------------- */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* --------------------------------------------------------------------------
 * Settings Management
 * ----------------------------------------------------------------------- */
async function loadSettings() {
  try {
    state.settings = await window.api.getSettings();
    const s = state.settings;

    // Gmail
    elements.cfgFromName.value = s.gmail?.fromName || 'CodeSpazio Solutions Pvt Ltd';
    elements.cfgGmailAddress.value = s.gmail?.address || '';
    elements.cfgGmailPassword.value = s.gmail?.appPassword || '';

    // Gemini
    elements.cfgGeminiKey.value = s.gemini?.apiKey || '';
    elements.cfgGeminiModel.value = s.gemini?.model || 'gemini-2.5-flash';

    // Payment
    elements.cfgPayAccountName.value = s.payment?.accountName || 'CodeSpazio Solutions Pvt Ltd';
    elements.cfgPayBankName.value = s.payment?.bankName || 'HDFC Bank';
    elements.cfgPayAccountNumber.value = s.payment?.accountNumber || '';
    elements.cfgPayIfscCode.value = s.payment?.ifscCode || '';
    elements.cfgPaySwiftBic.value = s.payment?.swiftBic || '';
    elements.cfgPayUpiId.value = s.payment?.upiId || '';
    elements.cfgPayPaymentUrl.value = s.payment?.paymentUrl || 'https://codespazio.com/contact-us';
    elements.cfgPayCurrency.value = s.payment?.currency || 'USD';
    elements.cfgPayTerms.value = s.payment?.paymentTerms || '50% milestone advance upon project kickoff, 50% upon final deployment.';

    // Automation
    elements.cfgAutoPilotReply.checked = s.outreach?.autoPilotReply ?? true;
    elements.toggleAutoPilotSidebar.checked = s.outreach?.autoPilotReply ?? true;
    elements.cfgRequireApproval.checked = s.outreach?.requireApprovalBeforeSendingReply ?? false;
    elements.cfgPollInterval.value = s.outreach?.pollIntervalMinutes || 5;
    elements.cfgSignature.value = s.outreach?.signature || `\n\nBest regards,\nCodeSpazio Solutions Pvt Ltd\nofficial@codespazio.com | +91 8769892429\nhttps://codespazio.com/\nJaipur, Rajasthan, India`;

    updateConnectionStatus();
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

async function saveAllSettings() {
  const newSettings = {
    gmail: {
      fromName: elements.cfgFromName.value.trim(),
      address: elements.cfgGmailAddress.value.trim(),
      appPassword: elements.cfgGmailPassword.value.replace(/\s+/g, '')
    },
    gemini: {
      apiKey: elements.cfgGeminiKey.value.trim(),
      model: elements.cfgGeminiModel.value
    },
    payment: {
      accountName: elements.cfgPayAccountName.value.trim(),
      bankName: elements.cfgPayBankName.value.trim(),
      accountNumber: elements.cfgPayAccountNumber.value.trim(),
      ifscCode: elements.cfgPayIfscCode.value.trim(),
      swiftBic: elements.cfgPaySwiftBic.value.trim(),
      upiId: elements.cfgPayUpiId.value.trim(),
      paymentUrl: elements.cfgPayPaymentUrl.value.trim(),
      currency: elements.cfgPayCurrency.value,
      paymentTerms: elements.cfgPayTerms.value.trim()
    },
    outreach: {
      autoPilotReply: elements.cfgAutoPilotReply.checked,
      requireApprovalBeforeSendingReply: elements.cfgRequireApproval.checked,
      pollIntervalMinutes: parseInt(elements.cfgPollInterval.value, 10) || 5,
      signature: elements.cfgSignature.value
    }
  };

  const saved = await window.api.saveSettings(newSettings);
  state.settings = saved;
  elements.toggleAutoPilotSidebar.checked = saved.outreach.autoPilotReply;
  showToast('All settings & credentials saved successfully!', 'success');
  updateConnectionStatus();
}

function updateConnectionStatus() {
  const hasGmail = Boolean(state.settings.gmail?.address && state.settings.gmail?.appPassword);
  const hasGemini = Boolean(state.settings.gemini?.apiKey);

  if (hasGmail && hasGemini) {
    elements.connStatusPill.className = 'connection-status-pill connected';
    elements.connStatusPill.querySelector('.text').textContent = 'Gmail & Gemini Connected';
    elements.configStatusDot.className = 'status-dot active';
  } else if (!hasGmail && !hasGemini) {
    elements.connStatusPill.className = 'connection-status-pill error';
    elements.connStatusPill.querySelector('.text').textContent = 'Credentials Required';
    elements.configStatusDot.className = 'status-dot';
  } else {
    elements.connStatusPill.className = 'connection-status-pill';
    elements.connStatusPill.querySelector('.text').textContent = hasGmail ? 'Missing Gemini Key' : 'Missing Gmail Password';
    elements.configStatusDot.className = 'status-dot';
  }
}

/* --------------------------------------------------------------------------
 * Leads & Prospector
 * ----------------------------------------------------------------------- */
async function refreshLeads() {
  state.leads = await window.api.getLeads();
  renderLeadsTable();
  elements.badgeLeads.textContent = state.leads.length;
  elements.leadsTableCount.textContent = state.leads.length;

  const uncontacted = state.leads.filter(l => l.status === 'discovered' && l.contactEmail).length;
  if (elements.uncontactedCount) {
    elements.uncontactedCount.textContent = `${uncontacted}`;
  }
  if (elements.btnProspectorSendAll) {
    elements.btnProspectorSendAll.innerHTML = `<span class="btn-icon">🚀</span> Auto-Pitch & Send Emails to All Leads (${uncontacted})`;
    elements.btnProspectorSendAll.style.display = uncontacted > 0 ? 'inline-flex' : 'none';
  }

  populateCampaignLeadDropdown();
}

function renderLeadsTable() {
  if (!state.leads || state.leads.length === 0) {
    elements.leadsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-muted">
          No leads discovered yet. Select your target niche and click "Run AI Research & Discover Leads"!
        </td>
      </tr>`;
    return;
  }

  elements.leadsTableBody.innerHTML = state.leads.map(lead => {
    const statusClass = `status-${lead.status || 'discovered'}`;
    const followUpCount = lead.followUpCount || 0;
    const followUpBadge = followUpCount > 0 
      ? `<span class="badge badge-accent">Stage ${followUpCount}</span>` 
      : `<span class="text-muted small">0 sent</span>`;

    return `
      <tr>
        <td>
          <div class="lead-company-name">${escapeHtml(lead.companyName)}</div>
          ${lead.website ? `<a href="${escapeHtml(lead.website)}" class="lead-website" target="_blank">${escapeHtml(lead.website.replace(/^https?:\/\//, ''))}</a>` : ''}
        </td>
        <td>
          <div>${escapeHtml(lead.contactName || 'Founder')}</div>
          <div class="text-muted small">${escapeHtml(lead.industry || '')}</div>
        </td>
        <td>
          <span class="font-mono">${escapeHtml(lead.contactEmail || 'N/A')}</span>
        </td>
        <td>
          <div class="text-muted small" style="max-width: 260px;" title="${escapeHtml(lead.detectedGaps || '')}">
            ${escapeHtml((lead.detectedGaps || 'Needs modern web / cloud architecture').substring(0, 75))}...
          </div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${lead.status || 'discovered'}</span>
        </td>
        <td>
          ${followUpBadge}
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-xs btn-outline-cyan" onclick="openCampaignForLead('${lead.id}')">Pitch</button>
            ${lead.status === 'contacted' ? `<button class="btn btn-xs btn-secondary" onclick="triggerManualFollowUp('${lead.id}')" title="Send Next Follow-up">Follow-up</button>` : ''}
            <button class="btn btn-xs btn-ghost text-rose" onclick="deleteLead('${lead.id}')">✕</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

window.openCampaignForLead = function(leadId) {
  switchTab('campaigns');
  elements.campaignLeadSelect.value = leadId;
  elements.campaignLeadSelect.dispatchEvent(new Event('change'));
};

window.triggerManualFollowUp = async function(leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;
  showToast(`Generating follow-up for ${lead.companyName}...`, 'info');
  const res = await window.api.triggerFollowUp(leadId);
  if (res.success) {
    showToast(`Follow-up sent successfully to ${lead.contactEmail}!`, 'success');
    await refreshLeads();
    await refreshStats();
  } else {
    showToast(`Follow-up error: ${res.message}`, 'error');
  }
};

window.deleteLead = async function(leadId) {
  if (confirm('Delete this prospect?')) {
    await window.api.deleteLead(leadId);
    await refreshLeads();
    await refreshStats();
    showToast('Lead deleted.', 'info');
  }
};

async function runProspecting() {
  const niche = elements.prospectNiche.value.trim();
  const location = elements.prospectLocation.value.trim();
  const targetService = elements.prospectService.value;
  const count = parseInt(elements.prospectCount.value, 10) || 25;

  if (!state.settings.gemini?.apiKey) {
    showToast('Please enter your Gemini API Key in Settings first.', 'error');
    switchTab('settings');
    return;
  }

  elements.btnStartProspecting.disabled = true;
  elements.btnStartProspecting.innerHTML = `<span class="btn-icon">⏳</span> AI Researching ${count} Diverse Leads...`;
  showToast(`Gemini is researching ${count} prospects for ${targetService}...`, 'info');

  try {
    const res = await window.api.discoverProspects({
      niche,
      location,
      targetService,
      count
    });

    if (res.success) {
      showToast(`Discovered ${res.leads.length} fresh qualified prospects!`, 'success');
      await refreshLeads();
      await refreshStats();

      // If Auto-Email Mode is active, launch outreach sprint immediately!
      if (elements.chkAutoSendAfterDiscovery?.checked) {
        showToast('Auto-Email Mode: Generating unique copy and delivering via Gmail...', 'info');
        setTimeout(() => {
          launchBatchOutreach(false);
        }, 800);
      }
    } else {
      showToast(`Prospecting error: ${res.message}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    elements.btnStartProspecting.disabled = false;
    elements.btnStartProspecting.innerHTML = `<span class="btn-icon">⚡</span> Run AI Research & Discover Leads`;
  }
}

/* --------------------------------------------------------------------------
 * Campaigns & Cold Outreach
 * ----------------------------------------------------------------------- */
function populateCampaignLeadDropdown() {
  const currentVal = elements.campaignLeadSelect.value;
  elements.campaignLeadSelect.innerHTML = '<option value="">-- Choose a lead --</option>' +
    state.leads.map(lead => `<option value="${lead.id}">${escapeHtml(lead.companyName)} (${escapeHtml(lead.contactEmail || 'No email')}) - [${lead.status}]</option>`).join('');
  
  if (currentVal && state.leads.some(l => l.id === currentVal)) {
    elements.campaignLeadSelect.value = currentVal;
  }
}

elements.campaignLeadSelect.addEventListener('change', () => {
  const leadId = elements.campaignLeadSelect.value;
  const lead = state.leads.find(l => l.id === leadId);
  if (lead) {
    elements.previewRecipientBadge.textContent = `${lead.companyName} (${lead.status})`;
    elements.emailToAddress.value = lead.contactEmail || '';
  } else {
    elements.previewRecipientBadge.textContent = 'No lead selected';
    elements.emailToAddress.value = '';
  }
});

async function generatePitch() {
  const leadId = elements.campaignLeadSelect.value;
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) {
    showToast('Please select a target lead first.', 'error');
    return;
  }

  if (!state.settings.gemini?.apiKey) {
    showToast('Please enter your Gemini API Key in Settings first.', 'error');
    switchTab('settings');
    return;
  }

  elements.btnGenerateEmailDraft.disabled = true;
  elements.btnGenerateEmailDraft.innerHTML = `<span class="btn-icon">⏳</span> AI Crafting Unique Pitch...`;
  showToast(`Generating bespoke pitch for ${lead.companyName}...`, 'info');

  try {
    const pitchIndex = state.leads.indexOf(lead);
    const res = await window.api.generatePitch({
      prospect: lead,
      customInstructions: elements.campaignCustomNotes.value.trim(),
      pitchIndex
    });

    if (res.success && res.email) {
      elements.emailSubjectLine.value = res.email.subject || '';
      elements.emailBodyText.value = res.email.body || '';
      state.generatedHtml = res.email.html || '';
      showToast(`Unique pitch generated using framework: ${res.email.frameworkUsed || 'Micro-Audit'}!`, 'success');
    } else {
      showToast(`Pitch error: ${res.message}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    elements.btnGenerateEmailDraft.disabled = false;
    elements.btnGenerateEmailDraft.innerHTML = `<span class="btn-icon">✨</span> Generate Unique Email with Gemini`;
  }
}

async function sendSingleEmail() {
  const to = elements.emailToAddress.value.trim();
  const subject = elements.emailSubjectLine.value.trim();
  const text = elements.emailBodyText.value.trim();
  const leadId = elements.campaignLeadSelect.value || null;

  if (!to || !subject || !text) {
    showToast('Please provide Recipient, Subject, and Email body.', 'error');
    return;
  }

  elements.btnSendSingleEmail.disabled = true;
  elements.btnSendSingleEmail.innerHTML = `Sending...`;

  try {
    const res = await window.api.sendEmail({
      to,
      subject,
      text,
      html: state.generatedHtml || null,
      leadId
    });

    if (res.success) {
      showToast(`Email delivered successfully to ${to}!`, 'success');
      await refreshLeads();
      await refreshStats();
      elements.emailSubjectLine.value = '';
      elements.emailBodyText.value = '';
      state.generatedHtml = null;
    } else {
      showToast(`Failed to send email: ${res.message}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    elements.btnSendSingleEmail.disabled = false;
    elements.btnSendSingleEmail.innerHTML = `<span class="btn-icon">📨</span> Send Email via Gmail`;
  }
}

async function launchBatchOutreach(needsConfirm = true) {
  const discoveredLeads = state.leads.filter(l => l.status === 'discovered' && l.contactEmail);
  if (discoveredLeads.length === 0) {
    showToast('No uncontacted leads found. All discovered prospects have already been emailed!', 'info');
    return;
  }

  // Check if Gmail credentials are provided
  if (!state.settings.gmail?.address || !state.settings.gmail?.appPassword) {
    showToast('Gmail address or 16-character App Password missing. Please set them in Settings & Keys to send emails.', 'error');
    switchTab('settings');
    return;
  }

  if (state.isBatchRunning) {
    showToast('Outreach sprint is already in progress.', 'warning');
    return;
  }

  const batchCount = Math.min(30, discoveredLeads.length);
  if (needsConfirm) {
    const proceed = confirm(`Launch automated outreach sprint to ${batchCount} discovered prospects? Each client will receive a bespoke AI pitch equipped with CodeSpazio's WhatsApp button.`);
    if (!proceed) return;
  }

  state.isBatchRunning = true;
  if (elements.btnStartBatchOutreach) {
    elements.btnStartBatchOutreach.disabled = true;
    elements.btnStartBatchOutreach.innerHTML = `Running Sprint (0/${batchCount})...`;
  }
  if (elements.btnProspectorSendAll) {
    elements.btnProspectorSendAll.disabled = true;
    elements.btnProspectorSendAll.innerHTML = `Sending (0/${batchCount})...`;
  }

  showToast(`Starting automated outreach sprint to ${batchCount} prospects...`, 'info');

  for (let i = 0; i < batchCount; i++) {
    const lead = discoveredLeads[i];
    const statusText = `Pitching (${i + 1}/${batchCount}) ${lead.companyName}...`;
    if (elements.btnStartBatchOutreach) elements.btnStartBatchOutreach.innerHTML = statusText;
    if (elements.btnProspectorSendAll) elements.btnProspectorSendAll.innerHTML = statusText;

    try {
      const pitchRes = await window.api.generatePitch({
        prospect: lead,
        pitchIndex: i
      });

      if (pitchRes.success && pitchRes.email) {
        const sendRes = await window.api.sendEmail({
          to: lead.contactEmail,
          subject: pitchRes.email.subject,
          text: pitchRes.email.body,
          html: pitchRes.email.html,
          leadId: lead.id
        });

        if (sendRes.success) {
          showToast(`Email delivered to ${lead.companyName} (${lead.contactEmail})!`, 'success');
        } else {
          showToast(`Delivery issue for ${lead.companyName}: ${sendRes.message}`, 'error');
        }
        await refreshLeads();
        await refreshStats();
      } else {
        showToast(`Pitch generation failed for ${lead.companyName}: ${pitchRes.message}`, 'error');
      }
    } catch (err) {
      showToast(`Outreach error for ${lead.companyName}: ${err.message}`, 'error');
    }

    // Delay between sends (except after last)
    if (i < batchCount - 1) {
      const delaySec = Math.floor(Math.random() * (18 - 8 + 1)) + 8; // 8-18 sec deliverability pacing
      showToast(`Pacing: waiting ${delaySec}s before next email...`, 'info');
      await new Promise(r => setTimeout(r, delaySec * 1000));
    }
  }

  state.isBatchRunning = false;
  if (elements.btnStartBatchOutreach) {
    elements.btnStartBatchOutreach.disabled = false;
    elements.btnStartBatchOutreach.innerHTML = `<span class="btn-icon">🚀</span> Launch 25-Lead Outreach Sprint`;
  }
  if (elements.btnProspectorSendAll) {
    elements.btnProspectorSendAll.disabled = false;
  }
  await refreshLeads();
  showToast(`Batch sprint completed! All emails processed.`, 'success');
}

/* --------------------------------------------------------------------------
 * Inbox & Deal Closer
 * ----------------------------------------------------------------------- */
async function refreshInbox() {
  state.inbox = await window.api.getInbox();
  elements.inboxCount.textContent = state.inbox.length;
  elements.badgeInbox.textContent = state.inbox.length;
  renderInboxList();
}

function renderInboxList() {
  if (!state.inbox || state.inbox.length === 0) {
    elements.inboxThreadList.innerHTML = `
      <div class="text-center py-6 text-muted">
        No replies received yet. Once prospects reply to your cold emails, they appear here automatically!
      </div>`;
    return;
  }

  elements.inboxThreadList.innerHTML = state.inbox.map(msg => {
    const isSelected = state.selectedInboxMsg?.messageId === msg.messageId ? 'selected' : '';
    const dateStr = msg.date ? new Date(msg.date).toLocaleDateString() : 'Recent';
    const repliedTag = msg.repliedByAi 
      ? `<span class="badge" style="background:#10b981;color:#000;">Closed / Replied</span>` 
      : `<span class="badge badge-accent">Action Needed</span>`;

    return `
      <div class="inbox-item ${isSelected}" onclick="selectInboxMessage('${escapeHtml(msg.messageId)}')">
        <div class="inbox-item-top">
          <span class="inbox-from">${escapeHtml(msg.fromName || msg.from)}</span>
          <span class="inbox-date">${dateStr}</span>
        </div>
        <div class="inbox-subject">${escapeHtml(msg.subject || '(No Subject)')}</div>
        <div class="inbox-item-bottom">
          ${repliedTag}
          ${msg.isLeadReply ? `<span class="text-cyan small">• Matched Lead: ${escapeHtml(msg.companyName || '')}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

window.selectInboxMessage = async function(messageId) {
  const msg = state.inbox.find(m => m.messageId === messageId);
  if (!msg) return;

  state.selectedInboxMsg = msg;
  renderInboxList();

  elements.noMessageSelectedState.style.display = 'none';
  elements.messageDetailView.style.display = 'block';

  elements.viewMsgFrom.textContent = msg.fromName || msg.from;
  elements.viewMsgAddr.textContent = msg.from;
  elements.viewMsgDate.textContent = msg.date ? new Date(msg.date).toLocaleString() : '';
  elements.viewMsgSubject.textContent = msg.subject || '';
  elements.viewMsgBody.textContent = msg.text || '';

  // Check if intent was already analyzed or analyze on-demand
  if (msg.intentAnalysis && msg.aiDraft) {
    displayIntentAnalysis(msg.intentAnalysis, msg.aiDraft);
  } else {
    elements.viewIntentSummary.textContent = 'Analyzing customer sentiment and intent with Gemini...';
    elements.selectedIntentPill.textContent = 'Analyzing...';
    elements.selectedIntentPill.className = 'intent-pill status-discovered';
    elements.replyBodyText.value = 'Drafting conversion response...';

    const lead = state.leads.find(l => l.contactEmail && l.contactEmail.toLowerCase() === msg.from.toLowerCase());
    
    // Analyze intent
    const analysisRes = await window.api.analyzeReply({
      subject: msg.subject,
      body: msg.text,
      senderEmail: msg.from,
      prospectContext: lead || {}
    });

    if (analysisRes.success) {
      const intent = analysisRes.analysis;
      msg.intentAnalysis = intent;

      // Generate Deal Closer reply
      const replyRes = await window.api.generateConversionReply({
        subject: msg.subject,
        incomingBody: msg.text,
        senderEmail: msg.from,
        intentAnalysis: intent,
        prospectContext: lead || {}
      });

      if (replyRes.success) {
        msg.aiDraft = replyRes.reply;
        displayIntentAnalysis(intent, replyRes.reply);
      }
    }
  }
};

function displayIntentAnalysis(intent, draft) {
  elements.selectedIntentPill.textContent = intent.intent.replace(/_/g, ' ');
  let pillClass = 'status-contacted';
  if (intent.intent === 'READY_TO_CONVERT') pillClass = 'status-converted';
  if (intent.intent === 'INTERESTED_WANTS_CALL' || intent.intent === 'INTERESTED_WANTS_PRICING') pillClass = 'status-interested';
  if (intent.intent === 'NOT_INTERESTED') pillClass = 'status-opt-out';
  elements.selectedIntentPill.className = `status-pill ${pillClass}`;

  elements.viewConfidenceBadge.textContent = `${Math.round((intent.confidenceScore || 0.95) * 100)}% Confidence (${intent.sentiment || 'Positive'})`;
  elements.viewIntentSummary.textContent = intent.summary || 'Client is inquiring about technical implementation.';
  elements.viewRecommendedAction.textContent = intent.recommendedAction || 'Send proposal and onboard.';

  elements.replyBodyText.value = draft.body || '';
  state.currentCloserHtml = draft.html || '';

  if (intent.intent === 'READY_TO_CONVERT' || intent.intent === 'INTERESTED_WANTS_PRICING') {
    elements.paymentFlagNote.style.display = 'block';
  } else {
    elements.paymentFlagNote.style.display = 'none';
  }
}

async function sendCloserReply() {
  if (!state.selectedInboxMsg) return;
  const msg = state.selectedInboxMsg;
  const bodyText = elements.replyBodyText.value.trim();

  if (!bodyText) {
    showToast('Reply text cannot be empty.', 'error');
    return;
  }

  elements.btnSendCloserReply.disabled = true;
  elements.btnSendCloserReply.innerHTML = `Sending Response...`;

  try {
    const res = await window.api.sendReply({
      to: msg.from,
      subject: `Re: ${msg.subject.replace(/^Re:\s*/i, '')}`,
      text: bodyText,
      html: state.currentCloserHtml || null,
      inReplyTo: msg.messageId,
      leadId: msg.leadId
    });

    if (res.success) {
      showToast(`Deal Closer reply delivered to ${msg.from}!`, 'success');
      msg.repliedByAi = true;
      await refreshInbox();
      await refreshLeads();
      await refreshStats();
    } else {
      showToast(`Reply error: ${res.message}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    elements.btnSendCloserReply.disabled = false;
    elements.btnSendCloserReply.innerHTML = `<span class="btn-icon">🚀</span> Approve & Send Reply via Gmail`;
  }
}

/* --------------------------------------------------------------------------
 * Knowledge Base Tab
 * ----------------------------------------------------------------------- */
async function loadKnowledgeBase() {
  state.knowledge = await window.api.getKnowledge();
  if (!state.knowledge) return;

  const services = state.knowledge.services || [];
  elements.knowledgeServicesList.innerHTML = services.map(s => {
    return `
      <div class="service-card">
        <div class="service-category">${escapeHtml(s.category)}</div>
        <h4 class="service-title">${escapeHtml(s.title)}</h4>
        <p class="service-desc">${escapeHtml(s.description)}</p>
        <ul class="service-deliverables">
          ${(s.deliverables || []).map(d => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>
      </div>`;
  }).join('');
}

/* --------------------------------------------------------------------------
 * Stats & Pipeline Visualizer
 * ----------------------------------------------------------------------- */
async function refreshStats() {
  const stats = await window.api.getStats();
  state.stats = stats;

  elements.statLeadsCount.textContent = stats.totalLeads || 0;
  elements.statSentCount.textContent = stats.emailsSent || 0;
  elements.statRepliesCount.textContent = stats.repliesReceived || 0;
  elements.statConversionsCount.textContent = stats.conversions || 0;

  // Pipeline numbers
  elements.pipeDiscovered.textContent = stats.discovered || 0;
  elements.pipeContacted.textContent = stats.contacted || 0;
  elements.pipeReplied.textContent = stats.replied || 0;
  elements.pipeInterested.textContent = stats.interested || 0;
  elements.pipeConverted.textContent = stats.conversions || 0;

  const total = Math.max(1, stats.totalLeads || 1);
  elements.barDiscovered.style.width = `${Math.min(100, (stats.discovered / total) * 100)}%`;
  elements.barContacted.style.width = `${Math.min(100, (stats.contacted / total) * 100)}%`;
  elements.barReplied.style.width = `${Math.min(100, (stats.replied / total) * 100)}%`;
  elements.barInterested.style.width = `${Math.min(100, (stats.interested / total) * 100)}%`;
  elements.barConverted.style.width = `${Math.min(100, (stats.conversions / total) * 100)}%`;
}

/* --------------------------------------------------------------------------
 * Live Logs
 * ----------------------------------------------------------------------- */
async function loadLogs() {
  const logs = await window.api.getLogs();
  elements.liveTerminal.innerHTML = '';
  logs.forEach(log => appendLogToTerminal(log));
}

function appendLogToTerminal(log) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
  const typeClass = `t-${log.type || 'info'}`;
  line.innerHTML = `<span class="t-time">[${time}]</span> <span class="${typeClass}">[${(log.type || 'info').toUpperCase()}]</span> ${escapeHtml(log.message)}`;
  elements.liveTerminal.insertBefore(line, elements.liveTerminal.firstChild);
}

/* --------------------------------------------------------------------------
 * Event Listeners
 * ----------------------------------------------------------------------- */
function setupEventListeners() {
  // Save Settings
  elements.btnSaveAllSettings.addEventListener('click', saveAllSettings);

  // Toggle Passwords
  elements.btnToggleGmailPwd.addEventListener('click', () => {
    elements.cfgGmailPassword.type = elements.cfgGmailPassword.type === 'password' ? 'text' : 'password';
  });
  elements.btnToggleGeminiKey.addEventListener('click', () => {
    elements.cfgGeminiKey.type = elements.cfgGeminiKey.type === 'password' ? 'text' : 'password';
  });

  // Test Gmail Connection
  elements.btnTestGmail.addEventListener('click', async () => {
    const email = elements.cfgGmailAddress.value.trim();
    const appPassword = elements.cfgGmailPassword.value.replace(/\s+/g, '');

    if (!email || !appPassword) {
      showToast('Enter your Gmail address and 16-char App Password first.', 'error');
      return;
    }

    elements.btnTestGmail.disabled = true;
    elements.btnTestGmail.innerHTML = 'Testing...';
    showToast('Testing Gmail SMTP and IMAP connections...', 'info');

    const res = await window.api.testGmail({ email, appPassword });
    elements.btnTestGmail.disabled = false;
    elements.btnTestGmail.innerHTML = 'Test Gmail Connection';

    if (res.success) {
      showToast(res.message, 'success');
      updateConnectionStatus();
    } else {
      showToast(`Gmail Test Failed: ${res.message}`, 'error');
    }
  });

  // Test Gemini Key
  elements.btnTestGemini.addEventListener('click', async () => {
    const apiKey = elements.cfgGeminiKey.value.trim();
    const model = elements.cfgGeminiModel.value;

    if (!apiKey) {
      showToast('Please enter your Gemini API Key first.', 'error');
      return;
    }

    elements.btnTestGemini.disabled = true;
    elements.btnTestGemini.innerHTML = 'Testing...';
    showToast('Testing Gemini API Key...', 'info');

    const res = await window.api.testGemini({ apiKey, model });
    elements.btnTestGemini.disabled = false;
    elements.btnTestGemini.innerHTML = 'Test Gemini Key';

    if (res.success) {
      if (res.activeModel) {
        elements.cfgGeminiModel.value = res.activeModel;
      }
      showToast(res.message, 'success');
      updateConnectionStatus();
    } else {
      showToast(`Gemini Test Failed: ${res.message}`, 'error');
    }
  });

  // Prospector Actions
  elements.btnStartProspecting.addEventListener('click', runProspecting);
  elements.btnProspectorSendAll?.addEventListener('click', () => launchBatchOutreach(false));

  // Campaigns Actions
  elements.btnGenerateEmailDraft.addEventListener('click', generatePitch);
  elements.btnSendSingleEmail.addEventListener('click', sendSingleEmail);
  elements.btnStartBatchOutreach.addEventListener('click', launchBatchOutreach);

  // Inbox Actions
  elements.btnRefreshInboxNow.addEventListener('click', async () => {
    showToast('Checking Gmail for recent prospect replies...', 'info');
    await window.api.checkInbox();
    await refreshInbox();
    await refreshLeads();
    await refreshStats();
    showToast('Inbox sync complete!', 'success');
  });

  elements.btnSyncInbox.addEventListener('click', () => {
    elements.btnRefreshInboxNow.click();
  });

  elements.btnSendCloserReply.addEventListener('click', sendCloserReply);

  // Terminal Clear
  elements.btnClearLogs.addEventListener('click', async () => {
    await window.api.clearLogs();
    elements.liveTerminal.innerHTML = '<div class="terminal-line"><span class="t-time">[System]</span> Terminal logs cleared.</div>';
  });

  // Export CSV
  elements.btnExportLeadsCsv.addEventListener('click', () => {
    if (!state.leads || state.leads.length === 0) {
      showToast('No leads to export.', 'warning');
      return;
    }
    const headers = ['Company', 'Website', 'Email', 'Contact', 'Status', 'Gaps', 'Created'];
    const rows = state.leads.map(l => [
      `"${(l.companyName || '').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      `"${(l.contactEmail || '').replace(/"/g, '""')}"`,
      `"${(l.contactName || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.detectedGaps || '').replace(/"/g, '""')}"`,
      `"${l.createdAt || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CodeSpazio_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Leads exported to CSV!', 'success');
  });

  // Manual Add Modal
  elements.btnOpenManualLeadModal.addEventListener('click', () => {
    elements.modalAddLead.classList.add('open');
  });
  elements.btnCloseAddLeadModal.addEventListener('click', () => {
    elements.modalAddLead.classList.remove('open');
  });
  elements.btnCancelAddLead.addEventListener('click', () => {
    elements.modalAddLead.classList.remove('open');
  });
  elements.btnSaveManualLead.addEventListener('click', async () => {
    const company = elements.manualCompanyName.value.trim();
    const email = elements.manualEmail.value.trim();
    if (!company || !email) {
      showToast('Company Name and Email are required.', 'error');
      return;
    }
    await window.api.addLead({
      companyName: company,
      website: elements.manualWebsite.value.trim(),
      contactEmail: email,
      contactName: elements.manualContactName.value.trim() || 'Founder',
      detectedGaps: elements.manualGaps.value.trim() || 'Custom digital transformation & web development',
      status: 'discovered'
    });
    elements.modalAddLead.classList.remove('open');
    elements.manualCompanyName.value = '';
    elements.manualWebsite.value = '';
    elements.manualEmail.value = '';
    elements.manualContactName.value = '';
    elements.manualGaps.value = '';
    await refreshLeads();
    await refreshStats();
    showToast(`Added prospect ${company}!`, 'success');
  });

  // External Links
  elements.linkGoogleAppPasswords.addEventListener('click', (e) => {
    e.preventDefault();
    window.api.openExternal('https://myaccount.google.com/apppasswords');
  });
  elements.linkAiStudio.addEventListener('click', (e) => {
    e.preventDefault();
    window.api.openExternal('https://aistudio.google.com/');
  });

  // AutoPilot Toggles
  elements.toggleAutoPilotSidebar.addEventListener('change', () => {
    elements.cfgAutoPilotReply.checked = elements.toggleAutoPilotSidebar.checked;
    saveAllSettings();
  });
}

function setupIPCListeners() {
  window.api.onLogAdded((log) => {
    appendLogToTerminal(log);
  });

  window.api.onInboxUpdated((inbox) => {
    state.inbox = inbox;
    elements.inboxCount.textContent = inbox.length;
    elements.badgeInbox.textContent = inbox.length;
    renderInboxList();
  });

  window.api.onStatsUpdated((stats) => {
    state.stats = stats;
    refreshStats();
  });
}

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Boot application
window.addEventListener('DOMContentLoaded', init);
