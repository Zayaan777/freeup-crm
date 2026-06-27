// Seed data + storage helpers for FreeUp AI Agency CRM
const STORAGE_KEYS = {
  clients: 'freeup_clients',
  deals: 'freeup_deals',
  activity: 'freeup_activity',
  settings: 'freeup_settings',
};

const SERVICES = ['Workflow Automation', 'AI Chatbot Setup', 'CRM Integration', 'Email Automation', 'Lead Gen Automation', 'Reporting Dashboard'];
const STAGES = ['Lead', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const SEED_CLIENTS = [];

function buildSeedDeals(clients) {
  return [];
}

const SEED_ACTIVITY = [];

const DEFAULT_SETTINGS = {
  agencyName: 'FreeUp AI Agency',
  logo: '',
  primaryColor: '#2563EB',
  currency: '£',
  emailSignature: 'Best regards,\nThe FreeUp AI Agency Team\nAutomating Leicester businesses, one workflow at a time.\nwww.freeupaiagency.co.uk',
  hideClosedDeals: false,
};

function loadData() {
  const DATA_VERSION = '2';
  if (localStorage.getItem('freeup_data_version') !== DATA_VERSION) {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('freeup_data_version', DATA_VERSION);
  }
  let clients = JSON.parse(localStorage.getItem(STORAGE_KEYS.clients) || 'null');
  let deals = JSON.parse(localStorage.getItem(STORAGE_KEYS.deals) || 'null');
  let activity = JSON.parse(localStorage.getItem(STORAGE_KEYS.activity) || 'null');
  let settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || 'null');

  if (!clients) {
    clients = SEED_CLIENTS;
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }
  if (!deals) {
    deals = buildSeedDeals(clients);
    localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(deals));
  }
  if (!activity) {
    activity = SEED_ACTIVITY;
    localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity));
  }
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }
  return { clients, deals, activity, settings };
}

function saveClients(clients) { localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients)); }
function saveDeals(deals) { localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(deals)); }
function saveActivity(activity) { localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity)); }
function saveSettings(settings) { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); }
