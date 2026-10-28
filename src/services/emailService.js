const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const storageService = require('./storageService');

class EmailService {
  constructor() {
    this.transporter = null;
    this.imapClient = null;
  }

  getCredentials(overrideEmail = null, overridePassword = null) {
    if (overrideEmail && overridePassword) {
      return {
        email: overrideEmail.trim(),
        appPassword: overridePassword.replace(/\s+/g, '')
      };
    }
    const settings = storageService.getSettings();
    return {
      email: settings.gmail?.address?.trim() || '',
      appPassword: (settings.gmail?.appPassword || '').replace(/\s+/g, '')
    };
  }

  createTransporter(email, appPassword) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: email,
        pass: appPassword
      },
      pool: true,
      maxConnections: 3,
      rateLimit: 14 // Gmail safe rate
    });
  }

  async testSmtp(email = null, appPassword = null) {
    const creds = this.getCredentials(email, appPassword);
    if (!creds.email || !creds.appPassword) {
      throw new Error('Gmail address or App Password is missing.');
    }

    const testTransporter = this.createTransporter(creds.email, creds.appPassword);
    await testTransporter.verify();
    return { success: true, message: `SMTP connection to Gmail verified for ${creds.email}!` };
  }

  async testImap(email = null, appPassword = null) {
    const creds = this.getCredentials(email, appPassword);
    if (!creds.email || !creds.appPassword) {
      throw new Error('Gmail address or App Password is missing.');
    }

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: creds.email,
        pass: creds.appPassword
      },
      logger: false
    });

    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', { messages: true, unseen: true });
      return {
        success: true,
        message: `IMAP connection verified! Total messages: ${status.messages}, Unread: ${status.unseen}`,
        status
      };
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async sendEmail({ to, subject, html, text, inReplyTo = null, references = null, leadId = null }) {
    const creds = this.getCredentials();
    if (!creds.email || !creds.appPassword) {
      throw new Error('Gmail credentials are not configured. Please set them in Settings.');
    }

    const settings = storageService.getSettings();
    const fromName = settings.gmail?.fromName || 'CodeSpazio Solutions Pvt Ltd';
    const fromHeader = `"${fromName}" <${creds.email}>`;

    const transporter = this.createTransporter(creds.email, creds.appPassword);

    const mailOptions = {
      from: fromHeader,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
      replyTo: creds.email
    };

    if (inReplyTo) mailOptions.inReplyTo = inReplyTo;
    if (references) mailOptions.references = references;

    const info = await transporter.sendMail(mailOptions);

    // Record stats and logs
    storageService.incrementStat('emailsSent', 1);
    storageService.addLog('email', `Sent email to ${to}: "${subject}"`, {
      messageId: info.messageId,
      accepted: info.accepted
    });

    // Update lead if leadId provided
    if (leadId) {
      const lead = storageService.getLeads().find(l => l.id === leadId);
      if (lead) {
        const emailThread = lead.emailThread || [];
        emailThread.push({
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          subject,
          body: text || html,
          messageId: info.messageId
        });
        storageService.updateLead(leadId, {
          status: lead.status === 'discovered' ? 'contacted' : lead.status,
          lastContactedAt: new Date().toISOString(),
          emailThread
        });
      }
    }

    return info;
  }

  async checkInboxForReplies({ sinceHours = 72 } = {}) {
    const creds = this.getCredentials();
    if (!creds.email || !creds.appPassword) {
      return { checked: false, reason: 'Credentials missing', newReplies: [] };
    }

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: creds.email,
        pass: creds.appPassword
      },
      logger: false
    });

    const newReplies = [];

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const sinceDate = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
        // Search messages
        const searchCriteria = {
          since: sinceDate
        };

        const existingInbox = storageService.getInbox();
        const existingIds = new Set(existingInbox.map(m => m.messageId));
        const allLeads = storageService.getLeads();

        for await (const message of client.fetch(searchCriteria, { envelope: true, source: true, flags: true, internalDate: true })) {
          const envelope = message.envelope;
          const msgId = envelope.messageId;

          if (existingIds.has(msgId)) {
            continue;
          }

          const parsed = await simpleParser(message.source);
          const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase() || '';
          const fromName = parsed.from?.value?.[0]?.name || fromAddress;

          // Ignore emails sent by self
          if (fromAddress === creds.email.toLowerCase()) {
            continue;
          }

          // Match with known leads
          const matchedLead = allLeads.find(l => l.contactEmail && l.contactEmail.toLowerCase() === fromAddress);

          const inboxItem = {
            messageId: msgId,
            uid: message.uid,
            from: fromAddress,
            fromName,
            subject: parsed.subject || '(No Subject)',
            date: parsed.date || message.internalDate,
            text: parsed.text || '',
            html: parsed.html || parsed.textAsHtml || '',
            inReplyTo: parsed.inReplyTo || null,
            references: parsed.references || null,
            isLeadReply: Boolean(matchedLead),
            leadId: matchedLead?.id || null,
            companyName: matchedLead?.companyName || null,
            repliedByAi: false,
            createdAt: new Date().toISOString()
          };

          storageService.addInboxMessage(inboxItem);
          existingIds.add(msgId);
          newReplies.push(inboxItem);

          if (matchedLead) {
            const thread = matchedLead.emailThread || [];
            thread.push({
              direction: 'inbound',
              timestamp: new Date().toISOString(),
              subject: inboxItem.subject,
              body: inboxItem.text,
              messageId: msgId
            });

            storageService.updateLead(matchedLead.id, {
              status: 'replied',
              lastReplyAt: new Date().toISOString(),
              emailThread: thread
            });

            storageService.addLog('info', `Received reply from lead ${matchedLead.companyName} (${fromAddress}): "${inboxItem.subject}"`);
          }
        }
      } finally {
        lock.release();
        await client.logout();
      }

      return {
        checked: true,
        count: newReplies.length,
        newReplies
      };
    } catch (err) {
      storageService.addLog('error', `IMAP check failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new EmailService();
