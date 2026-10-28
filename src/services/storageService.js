const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class StorageService {
  constructor() {
    this.storagePath = this.getStoragePath();
    this.ensureInitialized();
  }

  getStoragePath() {
    try {
      const userData = app ? app.getPath('userData') : path.join(process.cwd(), 'data');
      if (!fs.existsSync(userData)) {
        fs.mkdirSync(userData, { recursive: true });
      }
      return path.join(userData, 'codespazio_outreach_data.json');
    } catch {
      const fallbackDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      return path.join(fallbackDir, 'codespazio_outreach_data.json');
    }
  }

  getDefaultData() {
    return {
      settings: {
        gmail: {
          address: '',
          appPassword: '',
          fromName: 'CodeSpazio Solutions Pvt Ltd'
        },
        gemini: {
          apiKey: '',
          model: 'gemini-2.5-flash',
          temperature: 0.7
        },
        payment: {
          accountName: 'CodeSpazio Solutions Pvt Ltd',
          bankName: 'HDFC Bank',
          accountNumber: '',
          ifscCode: '',
          swiftBic: '',
          upiId: '',
          paymentUrl: '',
          currency: 'USD',
          paymentTerms: '50% milestone advance upon project kickoff, 50% upon staging approval and code deployment. All IP & source code belongs 100% to client.'
        },
        outreach: {
          dailyLimit: 30,
          delaySecondsMin: 40,
          delaySecondsMax: 100,
          autoPilotOutreach: false,
          autoPilotReply: true, // auto reply enabled by default to secure conversions
          pollIntervalMinutes: 5,
          requireApprovalBeforeSendingReply: false,
          signature: '\n\nBest regards,\nCodeSpazio Solutions Pvt Ltd\nOfficial: official@codespazio.com | Phone: +91 8769892429\nhttps://codespazio.com/\nJaipur, Rajasthan, India'
        }
      },
      leads: [],
      inbox: [],
      campaigns: [],
      logs: [],
      stats: {
        leadsDiscovered: 0,
        emailsSent: 0,
        repliesReceived: 0,
        conversions: 0
      }
    };
  }

  ensureInitialized() {
    if (!fs.existsSync(this.storagePath)) {
      this.saveData(this.getDefaultData());
    }
  }

  loadData() {
    try {
      this.ensureInitialized();
      const content = fs.readFileSync(this.storagePath, 'utf8');
      const data = JSON.parse(content);
      const defaults = this.getDefaultData();
      return {
        ...defaults,
        ...data,
        settings: {
          ...defaults.settings,
          ...(data.settings || {}),
          gmail: { ...defaults.settings.gmail, ...(data.settings?.gmail || {}) },
          gemini: { ...defaults.settings.gemini, ...(data.settings?.gemini || {}) },
          payment: { ...defaults.settings.payment, ...(data.settings?.payment || {}) },
          outreach: { ...defaults.settings.outreach, ...(data.settings?.outreach || {}) }
        },
        stats: { ...defaults.stats, ...(data.stats || {}) }
      };
    } catch (err) {
      console.error('Error loading data, resetting to defaults:', err);
      return this.getDefaultData();
    }
  }

  saveData(data) {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error saving data:', err);
      return false;
    }
  }

  getSettings() {
    return this.loadData().settings;
  }

  saveSettings(newSettings) {
    const data = this.loadData();
    data.settings = {
      ...data.settings,
      ...newSettings,
      gmail: { ...data.settings.gmail, ...(newSettings.gmail || {}) },
      gemini: { ...data.settings.gemini, ...(newSettings.gemini || {}) },
      payment: { ...data.settings.payment, ...(newSettings.payment || {}) },
      outreach: { ...data.settings.outreach, ...(newSettings.outreach || {}) }
    };
    this.saveData(data);
    return data.settings;
  }

  getLeads() {
    return this.loadData().leads || [];
  }

  saveLeads(leads) {
    const data = this.loadData();
    data.leads = leads;
    data.stats.leadsDiscovered = leads.length;
    this.saveData(data);
    return data.leads;
  }

  addLead(lead) {
    const data = this.loadData();
    const existingIndex = data.leads.findIndex(l => (l.contactEmail && l.contactEmail.toLowerCase() === lead.contactEmail.toLowerCase()) || (l.website && l.website.toLowerCase() === lead.website.toLowerCase()));
    
    if (existingIndex >= 0) {
      data.leads[existingIndex] = { ...data.leads[existingIndex], ...lead, updatedAt: new Date().toISOString() };
    } else {
      data.leads.unshift({
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        status: 'discovered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailThread: [],
        ...lead
      });
      data.stats.leadsDiscovered = (data.stats.leadsDiscovered || 0) + 1;
    }
    this.saveData(data);
    return data.leads;
  }

  updateLead(id, updates) {
    const data = this.loadData();
    const index = data.leads.findIndex(l => l.id === id);
    if (index >= 0) {
      data.leads[index] = { ...data.leads[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
      return data.leads[index];
    }
    return null;
  }

  deleteLead(id) {
    const data = this.loadData();
    data.leads = data.leads.filter(l => l.id !== id);
    this.saveData(data);
    return true;
  }

  getInbox() {
    return this.loadData().inbox || [];
  }

  saveInbox(inbox) {
    const data = this.loadData();
    data.inbox = inbox;
    this.saveData(data);
    return data.inbox;
  }

  addInboxMessage(msg) {
    const data = this.loadData();
    const exists = data.inbox.some(m => m.messageId === msg.messageId);
    if (!exists) {
      data.inbox.unshift(msg);
      data.stats.repliesReceived = (data.stats.repliesReceived || 0) + 1;
      this.saveData(data);
    }
    return data.inbox;
  }

  addLog(type, message, details = null) {
    const data = this.loadData();
    const logItem = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      type, // 'info', 'success', 'warning', 'error', 'ai', 'email'
      message,
      details
    };
    if (!data.logs) data.logs = [];
    data.logs.unshift(logItem);
    // Keep last 300 logs
    if (data.logs.length > 300) {
      data.logs = data.logs.slice(0, 300);
    }
    this.saveData(data);
    return logItem;
  }

  getLogs(limit = 100) {
    const data = this.loadData();
    return (data.logs || []).slice(0, limit);
  }

  clearLogs() {
    const data = this.loadData();
    data.logs = [];
    this.saveData(data);
    return true;
  }

  incrementStat(statKey, count = 1) {
    const data = this.loadData();
    if (!data.stats) data.stats = { leadsDiscovered: 0, emailsSent: 0, repliesReceived: 0, conversions: 0 };
    data.stats[statKey] = (data.stats[statKey] || 0) + count;
    this.saveData(data);
    return data.stats;
  }

  getStats() {
    const data = this.loadData();
    const leads = data.leads || [];
    return {
      totalLeads: leads.length,
      discovered: leads.filter(l => l.status === 'discovered').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      replied: leads.filter(l => l.status === 'replied').length,
      interested: leads.filter(l => l.status === 'interested').length,
      conversions: leads.filter(l => l.status === 'converted').length,
      emailsSent: data.stats?.emailsSent || 0,
      repliesReceived: data.stats?.repliesReceived || 0
    };
  }
}

module.exports = new StorageService();
