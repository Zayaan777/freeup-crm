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

const SEED_CLIENTS = [
  { id: uid(), name: 'Charnwood & Hart Accountants', email: 'info@charnwoodhart.co.uk', phone: '0116 254 1122', service: 'Workflow Automation', amount: 4200, status: 'Active', date: daysAgo(120), notes: 'Automated month-end reporting workflow.' },
  { id: uid(), name: 'Leicester Lock Solicitors', email: 'contact@leicesterlock.co.uk', phone: '0116 255 7890', service: 'Email Automation', amount: 2800, status: 'Active', date: daysAgo(95), notes: 'Client onboarding email sequences.' },
  { id: uid(), name: 'Belgrave Estate Agents', email: 'hello@belgraveestates.co.uk', phone: '0116 266 3344', service: 'Lead Gen Automation', amount: 3500, status: 'Prospect', date: daysAgo(14), notes: 'Interested in property lead automation.' },
  { id: uid(), name: 'Highcross Marketing Group', email: 'team@highcrossmarketing.co.uk', phone: '0116 277 9012', service: 'Reporting Dashboard', amount: 5200, status: 'Active', date: daysAgo(60), notes: 'Built client reporting dashboard.' },
  { id: uid(), name: 'Wigston HR Recruitment', email: 'info@wigstonhr.co.uk', phone: '0116 288 4455', service: 'CRM Integration', amount: 3100, status: 'Closed', date: daysAgo(200), notes: 'Integrated CRM with applicant tracking.' },
  { id: uid(), name: 'Oadby Financial Advisors', email: 'contact@oadbyfinancial.co.uk', phone: '0116 299 5566', service: 'AI Chatbot Setup', amount: 1800, status: 'Prospect', date: daysAgo(7), notes: 'Wants chatbot for FAQ handling.' },
  { id: uid(), name: 'Knighton Park Solicitors', email: 'admin@knightonpark.co.uk', phone: '0116 211 6677', service: 'Workflow Automation', amount: 4700, status: 'Active', date: daysAgo(45), notes: 'Document automation for conveyancing.' },
  { id: uid(), name: 'Stoneygate Recruitment Partners', email: 'hello@stoneygaterp.co.uk', phone: '0116 222 7788', service: 'Lead Gen Automation', amount: 2950, status: 'Lost', date: daysAgo(180), notes: 'Went with a competitor.' },
  { id: uid(), name: 'Evington Digital Agency', email: 'studio@evingtondigital.co.uk', phone: '0116 233 8899', service: 'Email Automation', amount: 2200, status: 'Active', date: daysAgo(30), notes: 'Automated client drip campaigns.' },
  { id: uid(), name: 'Aylestone Property Management', email: 'office@aylestonepm.co.uk', phone: '0116 244 9900', service: 'CRM Integration', amount: 3800, status: 'Prospect', date: daysAgo(3), notes: 'Evaluating CRM integration scope.' },
];

function buildSeedDeals(clients) {
  const stageMap = { Prospect: 'Proposal Sent', Active: 'Closed Won', Closed: 'Closed Won', Lost: 'Closed Lost' };
  return clients.map((c, i) => ({
    id: uid(),
    clientId: c.id,
    clientName: c.name,
    service: c.service,
    value: c.amount,
    stage: stageMap[c.status] || STAGES[i % STAGES.length],
    daysInStage: Math.floor(Math.random() * 20) + 1,
    createdAt: c.date,
  }));
}

const SEED_ACTIVITY = [
  { id: uid(), text: 'Added new client: Aylestone Property Management', time: daysAgo(0) },
  { id: uid(), text: 'Deal closed won with Charnwood & Hart Accountants', time: daysAgo(2) },
  { id: uid(), text: 'Proposal sent to Belgrave Estate Agents', time: daysAgo(5) },
  { id: uid(), text: 'Added new client: Oadby Financial Advisors', time: daysAgo(7) },
  { id: uid(), text: 'Negotiation started with Knighton Park Solicitors', time: daysAgo(10) },
];

const DEFAULT_SETTINGS = {
  agencyName: 'FreeUp AI Agency',
  logo: '',
  primaryColor: '#2563EB',
  currency: '£',
  emailSignature: 'Best regards,\nThe FreeUp AI Agency Team\nAutomating Leicester businesses, one workflow at a time.\nwww.freeupaiagency.co.uk',
  hideClosedDeals: false,
};

function loadData() {
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
