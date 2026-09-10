/* ==========================================================
   CoalGuard – Shared JS Utilities (api.js)
   ========================================================== */

const API = {
  BASE: '/api',
  AI:   '',

  async get(path) {
    try {
      const user = (typeof Auth !== 'undefined' && Auth.getName) ? Auth.getName() : 'Ranjan Kumar';
      const r = await fetch(this.BASE + path, {
        headers: { 'x-user': user }
      });
      if (!r.ok) throw new Error(r.statusText);
      return await r.json();
    } catch(e) {
      console.warn('[API GET] Failed:', path, e.message);
      return null;
    }
  },

  async post(path, body) {
    try {
      const user = (typeof Auth !== 'undefined' && Auth.getName) ? Auth.getName() : 'Ranjan Kumar';
      const r = await fetch(this.BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user },
        body: JSON.stringify(body)
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        const errMsg = (data && data.error) ? data.error : r.statusText;
        const err = new Error(errMsg);
        err.status = r.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch(e) {
      console.warn('[API POST] Failed:', path, e.message);
      throw e;
    }
  },

  async patch(path, body) {
    try {
      const user = (typeof Auth !== 'undefined' && Auth.getName) ? Auth.getName() : 'Ranjan Kumar';
      const r = await fetch(this.BASE + path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user': user },
        body: JSON.stringify(body)
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        const errMsg = (data && data.error) ? data.error : r.statusText;
        const err = new Error(errMsg);
        err.status = r.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch(e) {
      console.warn('[API PATCH] Failed:', path, e.message);
      throw e;
    }
  },

  async getInspections(status) {
    return this.get('/inspections' + (status ? '?status=' + encodeURIComponent(status) : ''));
  },

  async createInspection(data) {
    return this.post('/inspections', data);
  },

  async updateInspection(id, data) {
    return this.patch('/inspections/' + id, data);
  },

  async aiGet(path) {
    try {
      const r = await fetch(this.AI + path);
      if (!r.ok) throw new Error(r.statusText);
      return await r.json();
    } catch(e) {
      console.warn('[AI GET] Failed:', path, e.message);
      return null;
    }
  }
};

/* ── Mock Data (fallback when backend offline) ────────── */
const MOCK = {
  kpis: {
    activeMines: 24,
    openViolations: 47,
    pendingInspections: 18,
    complianceScore: 73
  },

  mines: [
    { id:'M001', name:'Jharia Main', location:'Dhanbad, Jharkhand', lat:23.79, lng:86.41, risk:'high',   production:4200, compliance:58 },
    { id:'M002', name:'Singareni Block-II', location:'Kothagudem, Telangana', lat:17.55, lng:80.62, risk:'medium', production:3800, compliance:72 },
    { id:'M003', name:'SECL Gevra', location:'Korba, Chhattisgarh', lat:22.36, lng:82.64, risk:'low',    production:5600, compliance:91 },
    { id:'M004', name:'ECL Rajmahal', location:'Sahibganj, Jharkhand', lat:24.98, lng:87.83, risk:'high',   production:2900, compliance:61 },
    { id:'M005', name:'WCL Wardha', location:'Wardha, Maharashtra', lat:20.71, lng:78.60, risk:'medium', production:3100, compliance:76 },
    { id:'M006', name:'BCCL Moonidih', location:'Dhanbad, Jharkhand', lat:23.81, lng:86.44, risk:'low',    production:4800, compliance:88 },
    { id:'M007', name:'CCL Piparwar', location:'Chatra, Jharkhand', lat:23.85, lng:85.13, risk:'medium', production:4100, compliance:69 },
    { id:'M008', name:'MCL Bharatpur', location:'Angul, Odisha', lat:20.84, lng:85.10, risk:'low',    production:5100, compliance:93 },
  ],

  complianceItems: [
    { id:'C001', category:'Safety', regulation:'Mines Act 1952 – Sec 45', mine:'Jharia Main', status:'non-compliant', dueDate:'2026-08-15', daysOverdue:23 },
    { id:'C002', category:'Environment', regulation:'EP Act – Air Quality', mine:'ECL Rajmahal', status:'at-risk', dueDate:'2026-09-10', daysOverdue:0 },
    { id:'C003', category:'Labour', regulation:'CLRA 1970 – Contractor Workers', mine:'Singareni Block-II', status:'compliant', dueDate:'2026-10-01', daysOverdue:0 },
    { id:'C004', category:'Production', regulation:'Monthly Output Report', mine:'WCL Wardha', status:'compliant', dueDate:'2026-09-07', daysOverdue:0 },
    { id:'C005', category:'Safety', regulation:'DGMS Circular 2023-09', mine:'CCL Piparwar', status:'non-compliant', dueDate:'2026-07-30', daysOverdue:39 },
    { id:'C006', category:'Environment', regulation:'Water Consent – SPCB', mine:'SECL Gevra', status:'compliant', dueDate:'2026-12-31', daysOverdue:0 },
    { id:'C007', category:'Safety', regulation:'Explosives Act – Quarterly', mine:'BCCL Moonidih', status:'at-risk', dueDate:'2026-09-15', daysOverdue:0 },
    { id:'C008', category:'Labour', regulation:'PF Compliance Return', mine:'MCL Bharatpur', status:'compliant', dueDate:'2026-09-15', daysOverdue:0 },
  ],

  inspections: [
    { id:'I001', type:'Safety Audit', mine:'Jharia Main', inspector:'Rajesh Kumar', date:'2026-09-05', status:'completed', findings:7, critical:3 },
    { id:'I002', type:'Environmental Check', mine:'SECL Gevra', inspector:'Priya Singh', date:'2026-09-06', status:'completed', findings:2, critical:0 },
    { id:'I003', type:'DGMS Inspection', mine:'ECL Rajmahal', inspector:'AK Sharma', date:'2026-09-10', status:'scheduled', findings:0, critical:0 },
    { id:'I004', type:'Labour Inspection', mine:'WCL Wardha', inspector:'MV Rao', date:'2026-09-08', status:'in-progress', findings:4, critical:1 },
    { id:'I005', type:'Fire Safety', mine:'CCL Piparwar', inspector:'Sunita Devi', date:'2026-09-12', status:'scheduled', findings:0, critical:0 },
    { id:'I006', type:'Statutory Audit', mine:'Singareni Block-II', inspector:'BK Patel', date:'2026-09-01', status:'completed', findings:3, critical:1 },
  ],

  contractors: [
    { id:'CT001', name:'Jai Bharat Mining Co.', type:'Drilling', mines:['Jharia Main','ECL Rajmahal'], workers:340, complianceScore:58, status:'active', contract:'2027-03-31' },
    { id:'CT002', name:'Vishwakarma Infra Ltd.', type:'Civil Works', mines:['SECL Gevra'], workers:180, complianceScore:89, status:'active', contract:'2026-12-31' },
    { id:'CT003', name:'SureSafe Systems', type:'Safety Equipment', mines:['WCL Wardha','CCL Piparwar'], workers:75, complianceScore:94, status:'active', contract:'2027-06-30' },
    { id:'CT004', name:'Rawat Explosives', type:'Blasting', mines:['BCCL Moonidih'], workers:60, complianceScore:77, status:'expiring', contract:'2026-10-15' },
    { id:'CT005', name:'Bharat Labour Corp', type:'Manpower', mines:['MCL Bharatpur'], workers:820, complianceScore:65, status:'active', contract:'2027-01-01' },
    { id:'CT006', name:'GreenTech Env.', type:'Environmental', mines:['Singareni Block-II'], workers:45, complianceScore:91, status:'active', contract:'2028-01-01' },
  ],

  incidents: [
    { id:'IN001', type:'Near Miss', mine:'Jharia Main', date:'2026-09-04', severity:'high', description:'Roof fall narrowly avoided in Seam 5', status:'open' },
    { id:'IN002', type:'Equipment Failure', mine:'SECL Gevra', date:'2026-09-03', severity:'medium', description:'Conveyor belt malfunction on Belt-7', status:'resolved' },
    { id:'IN003', type:'Environmental', mine:'ECL Rajmahal', date:'2026-09-02', severity:'high', description:'Effluent discharge exceedance detected', status:'open' },
    { id:'IN004', type:'Labour Dispute', mine:'WCL Wardha', date:'2026-08-30', severity:'low', description:'Worker grievance on overtime payment', status:'resolved' },
    { id:'IN005', type:'Fire', mine:'CCL Piparwar', date:'2026-09-01', severity:'critical', description:'Underground fire detected in Panel C2', status:'open' },
  ],

  alerts: [
    { id:'A001', type:'critical', message:'Underground fire reported at CCL Piparwar – Panel C2', time:'2h ago' },
    { id:'A002', type:'danger',   message:'Jharia Main: 3 safety compliance items overdue by 23 days', time:'4h ago' },
    { id:'A003', type:'warning',  message:'Contractor Rawat Explosives contract expiring in 38 days', time:'6h ago' },
    { id:'A004', type:'info',     message:'DGMS Inspection scheduled at ECL Rajmahal on Sep 10', time:'8h ago' },
    { id:'A005', type:'warning',  message:'ECL Rajmahal: Effluent discharge exceedance – corrective action required', time:'1d ago' },
  ],

  auditLog: [
    { id:'AU001', action:'Compliance Updated', user:'Priya Singh', mine:'SECL Gevra', timestamp:'2026-09-07 08:15:32', hash:'a3f9b2c1' },
    { id:'AU002', action:'Inspection Filed',   user:'Rajesh Kumar', mine:'Jharia Main', timestamp:'2026-09-06 17:42:11', hash:'d7e8a5f0' },
    { id:'AU003', action:'Contractor Added',   user:'BK Patel', mine:'System', timestamp:'2026-09-05 10:00:00', hash:'f1c4e9b3' },
    { id:'AU004', action:'Alert Escalated',    user:'System AI', mine:'CCL Piparwar', timestamp:'2026-09-05 02:17:45', hash:'9a2b7c6d' },
    { id:'AU005', action:'Report Generated',   user:'AK Sharma', mine:'ECL Rajmahal', timestamp:'2026-09-04 15:30:00', hash:'b5d3a8e2' },
  ],

  riskScores: {
    'Jharia Main': { score: 82, factors: ['Roof stability', 'Fire hazard', 'Compliance overdue'] },
    'ECL Rajmahal': { score: 76, factors: ['Effluent discharge', 'Safety violations'] },
    'CCL Piparwar': { score: 71, factors: ['Underground fire', 'Equipment age'] },
    'WCL Wardha': { score: 55, factors: ['Labour disputes', 'Minor violations'] },
    'Singareni Block-II': { score: 45, factors: ['Audit findings'] },
    'BCCL Moonidih': { score: 28, factors: ['Expiring contractor'] },
    'SECL Gevra': { score: 22, factors: ['Low risk profile'] },
    'MCL Bharatpur': { score: 18, factors: ['Minimal issues'] },
  },

  productionTrend: {
    labels: ['Apr','May','Jun','Jul','Aug','Sep'],
    datasets: [
      { mine: 'Jharia Main', data: [4100,4050,4200,4180,4220,4200] },
      { mine: 'SECL Gevra',  data: [5200,5400,5600,5500,5650,5600] },
      { mine: 'MCL Bharatpur', data: [4900,5000,5100,5080,5120,5100] },
    ]
  }
};

/* ── Local Storage Auth ─────────────────────────────────── */
const Auth = {
  ROLES: {
    'mine-official': { label: 'Mine Official', initials: 'MO', mines: ['Jharia Main', 'BCCL Moonidih'] },
    'corporate':     { label: 'Corporate Management', initials: 'CM', mines: [] },
    'regulator':     { label: 'Regulatory Authority', initials: 'RA', mines: [] },
    'field':         { label: 'Field Inspector', initials: 'FI', mines: ['Jharia Main', 'ECL Rajmahal', 'CCL Piparwar'] },
  },

  login(role, name) {
    localStorage.setItem('cg_role', role);
    localStorage.setItem('cg_name', name);
    localStorage.setItem('cg_ts', Date.now());
  },

  logout() {
    localStorage.removeItem('cg_role');
    localStorage.removeItem('cg_name');
    localStorage.removeItem('cg_ts');
    localStorage.removeItem('auth_user');
    window.location.href = 'index.html';
  },

  getRole()   { return localStorage.getItem('cg_role') || 'corporate'; },
  getName()   { return localStorage.getItem('cg_name') || 'Demo User'; },
  getRoleInfo() { return this.ROLES[this.getRole()] || this.ROLES.corporate; },
  isLoggedIn(){ return !!localStorage.getItem('cg_role'); },

  guard() {
    if (!this.isLoggedIn()) window.location.href = 'index.html';
  }
};

/* ── Notification Toast ─────────────────────────────────── */
function showToast(msg, type = 'info', duration = 3500) {
  const icons = { info: '💡', success: '✅', warning: '⚠️', danger: '🚨' };
  const colors = { info: '#3b82f6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: #1a2438; border: 1px solid ${colors[type]}44;
    border-left: 3px solid ${colors[type]};
    border-radius: 10px; padding: 14px 18px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    max-width: 380px; min-width: 260px;
    animation: slideInDown 0.3s ease;
    font-family: 'Inter', sans-serif;
    color: #f1f5f9; font-size: 14px;
  `;
  toast.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Populate Sidebar User Card ─────────────────────────── */
function initSidebar() {
  const role = Auth.getRoleInfo();
  const name = Auth.getName();

  const avatarEl  = document.querySelector('.user-avatar');
  const nameEl    = document.querySelector('.user-info .user-name');
  const roleEl    = document.querySelector('.user-info .user-role');

  if (avatarEl) avatarEl.textContent = role.initials;
  if (nameEl)   nameEl.textContent   = name;
  if (roleEl)   roleEl.textContent   = role.label;

  // Mark active nav
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href === current) item.classList.add('active');
  });

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.querySelector('.sidebar');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

/* ── Format helpers ─────────────────────────────────────── */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function fmtNum(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return n;
}

function riskClass(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function statusBadge(status) {
  const map = {
    'compliant':     'badge-success',
    'at-risk':       'badge-warning',
    'non-compliant': 'badge-danger',
    'completed':     'badge-success',
    'in-progress':   'badge-info',
    'scheduled':     'badge-muted',
    'active':        'badge-success',
    'expiring':      'badge-warning',
    'expired':       'badge-danger',
    'open':          'badge-danger',
    'resolved':      'badge-success',
    'critical':      'badge-danger',
    'high':          'badge-danger',
    'medium':        'badge-warning',
    'low':           'badge-success',
  };
  return map[status] || 'badge-muted';
}

document.addEventListener('DOMContentLoaded', initSidebar);
