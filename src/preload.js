const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  testGmail: (creds) => ipcRenderer.invoke('settings:testGmail', creds),
  testGemini: (data) => ipcRenderer.invoke('settings:testGemini', data),

  // Leads & Prospecting
  getLeads: () => ipcRenderer.invoke('leads:get'),
  addLead: (lead) => ipcRenderer.invoke('leads:add', lead),
  updateLead: (id, updates) => ipcRenderer.invoke('leads:update', id, updates),
  deleteLead: (id) => ipcRenderer.invoke('leads:delete', id),
  discoverProspects: (params) => ipcRenderer.invoke('leads:discover', params),
  inspectWebsite: (url) => ipcRenderer.invoke('leads:inspectWebsite', url),

  // Email Campaigns, Pitching & Follow-ups
  generatePitch: (params) => ipcRenderer.invoke('email:generatePitch', params),
  sendEmail: (params) => ipcRenderer.invoke('email:send', params),
  triggerFollowUp: (leadId) => ipcRenderer.invoke('email:triggerFollowUp', leadId),

  // Inbox & Auto-reply & Conversions
  checkInbox: () => ipcRenderer.invoke('inbox:check'),
  getInbox: () => ipcRenderer.invoke('inbox:get'),
  analyzeReply: (params) => ipcRenderer.invoke('inbox:analyze', params),
  generateConversionReply: (params) => ipcRenderer.invoke('inbox:generateReply', params),
  sendReply: (params) => ipcRenderer.invoke('inbox:sendReply', params),

  // Logs & Analytics
  getLogs: () => ipcRenderer.invoke('logs:get'),
  clearLogs: () => ipcRenderer.invoke('logs:clear'),
  getStats: () => ipcRenderer.invoke('stats:get'),
  getKnowledge: () => ipcRenderer.invoke('knowledge:get'),

  // Shell
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Events / Push notifications from Main process
  onLogAdded: (callback) => {
    ipcRenderer.on('log:added', (event, data) => callback(data));
  },
  onInboxUpdated: (callback) => {
    ipcRenderer.on('inbox:updated', (event, data) => callback(data));
  },
  onStatsUpdated: (callback) => {
    ipcRenderer.on('stats:updated', (event, data) => callback(data));
  }
});
