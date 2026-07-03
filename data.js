// Data layer for FreeUp AI Agency CRM — backed by Supabase (shared, synced)
const SERVICES = ['Workflow Automation', 'AI Chatbot Setup', 'CRM Integration', 'Email Automation', 'Lead Gen Automation', 'Reporting Dashboard', 'Website'];
const STAGES = ['Lead', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// ---------- Load everything on startup ----------
async function loadData() {
  const [clientsRes, dealsRes, activityRes, settingsRes] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('deals').select('*').order('created_at', { ascending: false }),
    supabase.from('activity').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('settings').select('*').eq('id', 1).single(),
  ]);

  const clients = (clientsRes.data || []).map(rowToClient);
  const deals = (dealsRes.data || []).map(rowToDeal);
  const activity = (activityRes.data || []).map(rowToActivity);
  const settings = settingsRes.data ? rowToSettings(settingsRes.data) : null;

  return { clients, deals, activity, settings };
}

// ---------- Row <-> app object mapping (keeps components using the same field names) ----------
function rowToClient(r) { return { id: r.id, name: r.name, email: r.email, phone: r.phone, service: r.service, amount: r.amount, status: r.status, date: r.date, notes: r.notes }; }
function clientToRow(c) { return { id: c.id, name: c.name, email: c.email || '', phone: c.phone || '', service: c.service || '', amount: Number(c.amount) || 0, status: c.status || 'Prospect', date: c.date, notes: c.notes || '' }; }

function rowToDeal(r) { return { id: r.id, clientId: r.client_id, clientName: r.client_name, service: r.service, value: r.value, stage: r.stage, daysInStage: r.days_in_stage, createdAt: r.created_at ? r.created_at.slice(0, 10) : '' }; }
function dealToRow(d) { return { id: d.id, client_id: d.clientId, client_name: d.clientName || '', service: d.service || '', value: Number(d.value) || 0, stage: d.stage || 'Lead', days_in_stage: Number(d.daysInStage) || 0 }; }

function rowToActivity(r) { return { id: r.id, text: r.text, time: r.time }; }

function rowToSettings(r) { return { agencyName: r.agency_name, logo: r.logo, primaryColor: r.primary_color, currency: r.currency, emailSignature: r.email_signature, hideClosedDeals: r.hide_closed_deals }; }
function settingsToRow(s) { return { id: 1, agency_name: s.agencyName, logo: s.logo || '', primary_color: s.primaryColor, currency: s.currency, email_signature: s.emailSignature, hide_closed_deals: !!s.hideClosedDeals }; }

// ---------- Clients ----------
async function upsertClient(client) { await supabase.from('clients').upsert(clientToRow(client)); }
async function deleteClientRow(id) { await supabase.from('clients').delete().eq('id', id); }
async function deleteClientRows(ids) { await supabase.from('clients').delete().in('id', ids); }

// ---------- Deals ----------
async function upsertDeal(deal) { await supabase.from('deals').upsert(dealToRow(deal)); }

// ---------- Activity ----------
async function insertActivity(text) {
  const row = { id: uid(), text, time: new Date().toISOString().slice(0, 10) };
  await supabase.from('activity').insert(row);
  return rowToActivity(row);
}

// ---------- Settings ----------
async function saveSettingsRow(settings) { await supabase.from('settings').update(settingsToRow(settings)).eq('id', 1); }

// ---------- Realtime: keep both users' screens in sync live ----------
function subscribeToChanges(onChange) {
  const channel = supabase.channel('crm-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
