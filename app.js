const { useState, useEffect, useMemo, useRef } = React;

// ---------- GitHub sync ----------
const GH_REPO = 'Zayaan777/freeup-crm';
const GH_FILE = 'leads.csv';

async function appendToLeadsCSV(client) {
  const token = localStorage.getItem('freeup_gh_token');
  if (!token) return;
  try {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    const data = await res.json();
    const current = atob(data.content.replace(/\n/g, ''));
    const notes = (client.notes || '').replace(/,/g, ';');
    const newRow = `\n${client.name},${client.email || ''},${client.phone || ''},${client.service || ''},${client.amount || 0},${client.status || 'Prospect'},${notes}`;
    const updated = btoa(unescape(encodeURIComponent(current + newRow)));
    await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Add client: ${client.name}`, content: updated, sha: data.sha })
    });
  } catch(e) { console.error('GitHub sync failed', e); }
}
const {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} = Recharts;

// ---------- Icons (inline SVG, no deps) ----------
const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);
const ICONS = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  clients: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M13 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  deals: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12',
  analytics: 'M3 3v18h18M7 14l3-3 3 3 5-6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  search: 'M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
  plus: 'M12 5v14M5 12h14',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2',
  close: 'M18 6L6 18M6 6l12 12',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  revenue: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  trend: 'M23 6l-9.5 9.5-5-5L1 18',
  pct: 'M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  bag: 'M6 2l1.5 4h9L18 2M3 7h18l-1.5 13.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 7zM8 11v4M16 11v4',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
};
const STATUS_COLORS = {
  Prospect: 'bg-amber-100 text-amber-700 ring-amber-200',
  Active: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Closed: 'bg-slate-200 text-slate-600 ring-slate-300',
  Lost: 'bg-red-100 text-red-600 ring-red-200',
};
const STAGE_COLORS = ['#94A3B8', '#3B82F6', '#F59E0B', '#14B8A6', '#EF4444'];

function fmtMoney(n, cur) { return `${cur}${Number(n || 0).toLocaleString()}`; }

// ---------- Sidebar ----------
function Sidebar({ page, setPage, agencyName, logo }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { key: 'clients', label: 'Clients', icon: ICONS.clients },
    { key: 'deals', label: 'Deals / Pipeline', icon: ICONS.deals },
    { key: 'analytics', label: 'Analytics', icon: ICONS.analytics },
    { key: 'settings', label: 'Settings', icon: ICONS.settings },
  ];
  return (
    <div className="h-screen w-64 bg-navy-900 text-slate-300 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        {logo ? <img src={logo} className="w-9 h-9 rounded-lg object-cover" /> : (
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-bold text-white">F</div>
        )}
        <div>
          <div className="text-white font-semibold leading-tight">{agencyName}</div>
          <div className="text-xs text-slate-500">CRM Dashboard</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(it => (
          <button key={it.key} onClick={() => setPage(it.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${page === it.key ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'hover:bg-white/5 hover:text-white text-slate-400'}`}>
            <Icon path={it.icon} className="w-5 h-5" />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="px-6 py-4 text-xs text-slate-500 border-t border-white/10">
        Leicester, UK · AI Automation
      </div>
    </div>
  );
}

// ---------- Stat Card ----------
function StatCard({ label, value, icon, positive }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <Icon path={icon} className="w-4 h-4" />
        </div>
      </div>
      <div className={`text-2xl font-bold ${positive ? 'text-teal' : 'text-slate-800'}`}>{value}</div>
    </div>
  );
}

// ---------- Dashboard Page ----------
function Dashboard({ clients, deals, activity, settings }) {
  const cur = settings.currency;
  const totalRevenue = clients.filter(c => c.status === 'Active' || c.status === 'Closed').reduce((s, c) => s + Number(c.amount), 0);
  const totalClients = clients.length;
  const activeDeals = deals.filter(d => !d.stage.startsWith('Closed')).length;
  const avgDealValue = deals.length ? Math.round(deals.reduce((s, d) => s + Number(d.value), 0) / deals.length) : 0;
  const won = deals.filter(d => d.stage === 'Closed Won').length;
  const lost = deals.filter(d => d.stage === 'Closed Lost').length;
  const winRate = won + lost ? Math.round((won / (won + lost)) * 100) : 0;
  const now = new Date();
  const closedThisMonth = deals.filter(d => d.stage === 'Closed Won' && new Date(d.createdAt).getMonth() === now.getMonth()).length;

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-GB', { month: 'short' }) };
  });
  const revenueByMonth = months.map(m => {
    const rev = clients.filter(c => {
      const cd = new Date(c.date);
      return `${cd.getFullYear()}-${cd.getMonth()}` === m.key && (c.status === 'Active' || c.status === 'Closed');
    }).reduce((s, c) => s + Number(c.amount), 0);
    return { month: m.label, revenue: rev };
  });
  const clientsByMonth = months.map(m => {
    const count = clients.filter(c => {
      const cd = new Date(c.date);
      return `${cd.getFullYear()}-${cd.getMonth()}` === m.key;
    }).length;
    return { month: m.label, clients: count };
  });
  const stageData = ['Lead', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].map((s, i) => ({
    name: s, value: deals.filter(d => d.stage === s).length, color: STAGE_COLORS[i],
  }));

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of FreeUp AI Agency performance</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Revenue" value={fmtMoney(totalRevenue, cur)} icon={ICONS.revenue} positive />
        <StatCard label="Total Clients" value={totalClients} icon={ICONS.clients} />
        <StatCard label="Active Deals" value={activeDeals} icon={ICONS.deals} />
        <StatCard label="Avg Deal Value" value={fmtMoney(avgDealValue, cur)} icon={ICONS.bag} />
        <StatCard label="Win Rate" value={`${winRate}%`} icon={ICONS.pct} positive={winRate >= 50} />
        <StatCard label="Closed This Month" value={closedThisMonth} icon={ICONS.trend} positive />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Revenue over last 12 months</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => fmtMoney(v, cur)} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">New clients per month</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={clientsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="clients" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Pipeline stages</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stageData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {stageData.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              {stageData.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>{s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Recent activity</h3>
            <ul className="space-y-3">
              {activity.slice(0, 5).map(a => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-accent flex-shrink-0"></span>
                  <div>
                    <div className="text-slate-700">{a.text}</div>
                    <div className="text-xs text-slate-400">{a.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Clients Page ----------
function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(client || { name: '', email: '', phone: '', service: SERVICES[0], amount: '', status: 'Prospect', date: new Date().toISOString().slice(0, 10), notes: '' });
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{client ? 'Edit Client' : 'Add Client'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><Icon path={ICONS.close} className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Business Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
            {SERVICES.map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Deal Value (£)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['Prospect', 'Active', 'Closed', 'Lost'].map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <textarea className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Notes" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={() => onSave({ ...form, id: form.id || uid(), amount: Number(form.amount) || 0 })} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-light">Save Client</button>
        </div>
      </div>
    </div>
  );
}

function Clients({ clients, setClients, addActivity }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    let list = clients.filter(c =>
      (statusFilter === 'All' || c.status === statusFilter) &&
      (c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()))
    );
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'amount') { va = Number(va); vb = Number(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [clients, query, statusFilter, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function saveClient(c) {
    const exists = clients.some(x => x.id === c.id);
    let next;
    if (exists) next = clients.map(x => x.id === c.id ? c : x);
    else { next = [c, ...clients]; addActivity(`Added new client: ${c.name}`); appendToLeadsCSV(c); }
    setClients(next);
    setModal(null);
  }
  function deleteClient(id) {
    setClients(clients.filter(c => c.id !== id));
    setSelected(selected.filter(s => s !== id));
  }
  function bulkDelete() {
    setClients(clients.filter(c => !selected.includes(c.id)));
    setSelected([]);
  }
  function exportCSV() {
    const headers = ['Business Name', 'Email', 'Phone', 'Service', 'Deal Value', 'Status', 'Date Added', 'Notes'];
    const rows = filtered.map(c => [c.name, c.email, c.phone, c.service, c.amount, c.status, c.date, (c.notes || '').replace(/,/g, ';')]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'freeup_clients.csv';
    a.click();
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} total clients</p>
        </div>
        <button onClick={() => setModal({})} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors">
          <Icon path={ICONS.plus} className="w-4 h-4" /> Add Client
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Icon path={ICONS.search} className="w-4 h-4 text-slate-400" />
          <input className="bg-transparent outline-none text-sm w-full" placeholder="Search clients..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {['All', 'Prospect', 'Active', 'Closed', 'Lost'].map(s => <option key={s}>{s}</option>)}
        </select>
        {selected.length > 0 && (
          <button onClick={bulkDelete} className="flex items-center gap-1.5 text-red-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50">
            <Icon path={ICONS.trash} className="w-4 h-4" /> Delete ({selected.length})
          </button>
        )}
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-slate-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 ml-auto">
          <Icon path={ICONS.download} className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(c => c.id) : [])} /></th>
              {[['name', 'Business Name'], ['email', 'Email'], ['phone', 'Phone'], ['service', 'Service'], ['amount', 'Deal Value'], ['status', 'Status'], ['date', 'Date Added']].map(([k, label]) => (
                <th key={k} className="px-4 py-3 cursor-pointer hover:text-slate-700 whitespace-nowrap" onClick={() => toggleSort(k)}>
                  {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(c.id)} onChange={e => setSelected(e.target.checked ? [...selected, c.id] : selected.filter(s => s !== c.id))} /></td>
                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-3 text-slate-500">{c.email}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.phone}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.service}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">£{Number(c.amount).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.date}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{c.notes}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setModal(c)} className="text-slate-400 hover:text-accent"><Icon path={ICONS.edit} className="w-4 h-4" /></button>
                    <button onClick={() => deleteClient(c.id)} className="text-slate-400 hover:text-red-500"><Icon path={ICONS.trash} className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-slate-400">No clients found</td></tr>}
          </tbody>
        </table>
      </div>
      {modal !== null && <ClientModal client={modal.id ? modal : null} onClose={() => setModal(null)} onSave={saveClient} />}
    </div>
  );
}

// ---------- Deals / Pipeline Page ----------
function DealModal({ deal, onClose, onSave, clients }) {
  const [form, setForm] = useState(deal || { clientId: clients[0]?.id || '', service: SERVICES[0], value: '', stage: STAGES[0], daysInStage: 0, createdAt: new Date().toISOString().slice(0, 10) });
  function clientName(id) { return clients.find(c => c.id === id)?.name || ''; }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{deal ? 'Deal Details' : 'Add Deal'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><Icon path={ICONS.close} className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
            {SERVICES.map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Deal Value (£)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={() => onSave({ ...form, id: form.id || uid(), value: Number(form.value) || 0, clientName: clientName(form.clientId) })} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-light">Save Deal</button>
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, onClick, onDragStart }) {
  return (
    <div draggable onDragStart={onDragStart} onClick={onClick}
      className="bg-white rounded-lg p-3 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer">
      <div className="font-medium text-slate-700 text-sm">{deal.clientName}</div>
      <div className="text-xs text-slate-400 mt-0.5">{deal.service}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-semibold text-accent">£{Number(deal.value).toLocaleString()}</span>
        <span className="text-xs text-slate-400">{deal.daysInStage}d in stage</span>
      </div>
    </div>
  );
}

function Pipeline({ deals, setDeals, clients, addActivity, hideClosedDeals }) {
  const [modal, setModal] = useState(null);
  const [dragId, setDragId] = useState(null);
  const stages = hideClosedDeals ? STAGES.filter(s => !s.startsWith('Closed')) : STAGES;

  function moveDeal(id, stage) {
    setDeals(deals.map(d => d.id === id ? { ...d, stage, daysInStage: 0 } : d));
    const moved = deals.find(d => d.id === id);
    if (moved && stage === 'Closed Won') addActivity(`Deal closed won with ${moved.clientName}`);
  }
  function saveDeal(d) {
    const exists = deals.some(x => x.id === d.id);
    if (exists) setDeals(deals.map(x => x.id === d.id ? d : x));
    else { setDeals([d, ...deals]); addActivity(`New deal created for ${d.clientName}`); }
    setModal(null);
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deals / Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">{deals.length} total deals</p>
        </div>
        <button onClick={() => setModal({})} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors">
          <Icon path={ICONS.plus} className="w-4 h-4" /> Add Deal
        </button>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(220px, 1fr))` }}>
        {stages.map(stage => {
          const items = deals.filter(d => d.stage === stage);
          const total = items.reduce((s, d) => s + Number(d.value), 0);
          return (
            <div key={stage}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragId && moveDeal(dragId, stage)}
              className="bg-slate-50 rounded-xl p-3 min-h-[400px]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-600">{stage}</h3>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-slate-500 ring-1 ring-slate-200">{items.length}</span>
              </div>
              <div className="text-xs text-slate-400 mb-3">£{total.toLocaleString()}</div>
              <div className="space-y-2">
                {items.map(d => (
                  <DealCard key={d.id} deal={d} onClick={() => setModal(d)} onDragStart={() => setDragId(d.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {modal !== null && <DealModal deal={modal.id ? modal : null} clients={clients} onClose={() => setModal(null)} onSave={saveDeal} />}
    </div>
  );
}

// ---------- Analytics Page ----------
function Analytics({ clients, deals, settings }) {
  const cur = settings.currency;
  const revenueByService = SERVICES.map(s => ({
    service: s.replace(' Automation', '').replace(' Setup', '').replace(' Integration', ''),
    revenue: clients.filter(c => c.service === s && (c.status === 'Active' || c.status === 'Closed')).reduce((sum, c) => sum + Number(c.amount), 0),
  }));
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-GB', { month: 'short' }) };
  });
  const acquisition = months.map(m => ({
    month: m.label,
    clients: clients.filter(c => { const cd = new Date(c.date); return `${cd.getFullYear()}-${cd.getMonth()}` === m.key; }).length,
  }));
  const won = deals.filter(d => d.stage === 'Closed Won').length;
  const lost = deals.filter(d => d.stage === 'Closed Lost').length;
  const winLoss = [{ name: 'Won', value: won, color: '#14B8A6' }, { name: 'Lost', value: lost, color: '#EF4444' }];
  const topClients = [...clients].sort((a, b) => b.amount - a.amount).slice(0, 5).map(c => ({ name: c.name.split(' ').slice(0, 2).join(' '), revenue: c.amount }));
  const avgDaysToClose = deals.filter(d => d.stage === 'Closed Won').length
    ? Math.round(deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.daysInStage, 0) / Math.max(1, deals.filter(d => d.stage === 'Closed Won').length))
    : 0;
  const thisMonthRev = revenueByService.reduce((s, r) => s + r.revenue, 0);
  const lastMonthIdx = months.length - 2;
  const lastMonthRev = clients.filter(c => { const cd = new Date(c.date); return `${cd.getFullYear()}-${cd.getMonth()}` === months[lastMonthIdx].key; }).reduce((s, c) => s + c.amount, 0);
  const thisMonthOnlyRev = clients.filter(c => { const cd = new Date(c.date); return `${cd.getFullYear()}-${cd.getMonth()}` === months[months.length - 1].key; }).reduce((s, c) => s + c.amount, 0);
  const momGrowth = lastMonthRev ? Math.round(((thisMonthOnlyRev - lastMonthRev) / lastMonthRev) * 100) : 0;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Deeper insight into agency performance</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Days to Close" value={`${avgDaysToClose}d`} icon={ICONS.trend} />
        <StatCard label="MoM Revenue Growth" value={`${momGrowth}%`} icon={ICONS.pct} positive={momGrowth >= 0} />
        <StatCard label="Won Deals" value={won} icon={ICONS.deals} positive />
        <StatCard label="Lost Deals" value={lost} icon={ICONS.deals} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Revenue by service type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByService}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="service" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip formatter={v => fmtMoney(v, cur)} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Client acquisition over time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={acquisition}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="clients" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Win vs Loss rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={winLoss} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {winLoss.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Top 5 clients by revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topClients} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
              <Tooltip formatter={v => fmtMoney(v, cur)} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---------- Settings Page ----------
function Settings({ settings, setSettings }) {
  const [form, setForm] = useState(settings);
  const [ghToken, setGhToken] = useState(localStorage.getItem('freeup_gh_token') || '');
  const fileRef = useRef();
  function save() {
    setSettings(form);
    if (ghToken) localStorage.setItem('freeup_gh_token', ghToken);
    else localStorage.removeItem('freeup_gh_token');
  }
  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, logo: reader.result });
    reader.readAsDataURL(file);
  }
  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your agency profile and preferences</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600">Agency Name</label>
          <input className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" value={form.agencyName} onChange={e => setForm({ ...form, agencyName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Logo</label>
          <div className="flex items-center gap-3 mt-1">
            {form.logo && <img src={form.logo} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200" />}
            <button onClick={() => fileRef.current.click()} className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50">
              <Icon path={ICONS.upload} className="w-4 h-4" /> Upload logo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Primary Colour</label>
            <input type="color" className="mt-1 w-full h-10 border border-slate-200 rounded-lg cursor-pointer" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Default Currency</label>
            <select className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              <option value="£">£ GBP</option>
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Email Signature Template</label>
          <textarea rows={4} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" value={form.emailSignature} onChange={e => setForm({ ...form, emailSignature: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">GitHub Token (for leads.csv sync)</label>
          <p className="text-xs text-slate-400 mt-0.5">Paste your GitHub personal access token here. Stored locally in your browser only — never sent to any server except GitHub.</p>
          <input type="password" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent font-mono" placeholder="ghp_..." value={ghToken} onChange={e => setGhToken(e.target.value)} />
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="text-sm font-medium text-slate-700">Show closed deals in pipeline</div>
            <div className="text-xs text-slate-400">Toggle whether Closed Won/Lost columns appear on the Pipeline page</div>
          </div>
          <button onClick={() => setForm({ ...form, hideClosedDeals: !form.hideClosedDeals })}
            className={`w-11 h-6 rounded-full relative transition-colors ${!form.hideClosedDeals ? 'bg-accent' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!form.hideClosedDeals ? 'translate-x-5' : ''}`}></span>
          </button>
        </div>
        <div className="pt-2">
          <button onClick={save} className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

// ---------- App Root ----------
function parseLeadsCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim());
    const row = {};
    headers.forEach((h, i) => row[h] = cells[i] || '');
    return row;
  });
}

function App() {
  const init = loadData();
  const [page, setPage] = useState('dashboard');
  const [clients, setClientsState] = useState(init.clients);
  const [deals, setDealsState] = useState(init.deals);
  const [activity, setActivityState] = useState(init.activity);
  const [settings, setSettingsState] = useState(init.settings);

  function setClients(next) { setClientsState(next); saveClients(next); }
  function setDeals(next) { setDealsState(next); saveDeals(next); }
  function setSettings(next) { setSettingsState(next); saveSettings(next); }
  function addActivity(text) {
    const next = [{ id: uid(), text, time: new Date().toISOString().slice(0, 10) }, ...activity].slice(0, 20);
    setActivityState(next); saveActivity(next);
  }

  useEffect(() => {
    fetch('./leads.csv')
      .then(r => r.ok ? r.text() : null)
      .then(text => {
        if (!text) return;
        const rows = parseLeadsCSV(text);
        const existingNames = new Set(clients.map(c => c.name.toLowerCase()));
        const newClients = rows
          .filter(r => r.name && !existingNames.has(r.name.toLowerCase()))
          .map(r => ({
            id: uid(),
            name: r.name,
            email: r.email || '',
            phone: r.phone || '',
            service: r.service || SERVICES[0],
            amount: Number(r.amount) || 0,
            status: r.status || 'Prospect',
            date: new Date().toISOString().slice(0, 10),
            notes: r.notes || '',
          }));
        if (newClients.length) {
          const merged = [...newClients, ...clients];
          setClients(merged);
          newClients.forEach(c => addActivity(`Added new client from leads sheet: ${c.name}`));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex">
      <Sidebar page={page} setPage={setPage} agencyName={settings.agencyName} logo={settings.logo} />
      <main className="flex-1 ml-64 p-8">
        {page === 'dashboard' && <Dashboard clients={clients} deals={deals} activity={activity} settings={settings} />}
        {page === 'clients' && <Clients clients={clients} setClients={setClients} addActivity={addActivity} />}
        {page === 'deals' && <Pipeline deals={deals} setDeals={setDeals} clients={clients} addActivity={addActivity} hideClosedDeals={settings.hideClosedDeals} />}
        {page === 'analytics' && <Analytics clients={clients} deals={deals} settings={settings} />}
        {page === 'settings' && <Settings settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
