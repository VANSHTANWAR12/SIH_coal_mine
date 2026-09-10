/* =========================================================
   CoalGuard – Shared Javascript (Light Enterprise)
   ========================================================= */

const NAV_ITEMS = [
  { section:'COMMAND CENTER' },
  { href:'dashboard.html',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>', label:'Dashboard' },
  
  { section:'GOVERNANCE' },
  { href:'compliance.html',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>', label:'Compliance Monitoring' },
  { href:'inspections.html',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>', label:'Inspection Management',  badge:'2' },
  { href:'contractors.html',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label:'Contractor Management' },
  
  { section:'FIELD OPERATIONS' },
  { href:'field-reports.html', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>', label:'Field Reports' },
  
  { section:'INTELLIGENCE' },
  { href:'analytics.html',     icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>', label:'AI Risk Analytics' },
  { href:'ai-prediction.html', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', label:'AI Prediction Engine', badge:'LIVE', badgePulse:true },
  { href:'mine-intelligence.html', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', label:'Strategy & Prescriptions', badge:'NEW', badgePulse:true },
  
  { section:'GEOSPATIAL' },
  { href:'gis-map.html',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>', label:'National Mine Map' },

  { section:'REPORTING' },
  { href:'reports.html',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', label:'Reports & Audit Trail' },
];

window.mockAction = function(btnElement, successMessage = 'Action completed successfully') {
  if(btnElement.disabled) return;
  const originalHtml = btnElement.innerHTML;
  btnElement.disabled = true;
  btnElement.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Processing...`;
  
  setTimeout(() => {
    btnElement.innerHTML = originalHtml;
    btnElement.disabled = false;
    window.showToast(successMessage, 'success');
  }, 1500);
}

function setupTableFilters(tableSelector, searchInputSelector, selectSelectors = []) {
  const table = document.querySelector(tableSelector);
  const searchInput = document.querySelector(searchInputSelector);
  const selects = selectSelectors.map(sel => document.querySelector(sel));
  
  if(!table || (!searchInput && selects.length === 0)) return;

  const filterTable = () => {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectVals = selects.map(s => s ? s.value.toLowerCase() : '');
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchesSearch = text.includes(searchTerm);
      
      // Simple dropdown logic (if value is "all" or matches text)
      let matchesSelects = true;
      selectVals.forEach(val => {
        if(val && !val.includes('all') && !text.includes(val)) matchesSelects = false;
      });
      
      row.style.display = (matchesSearch && matchesSelects) ? '' : 'none';
    });
  };

  if(searchInput) searchInput.addEventListener('input', filterTable);
  selects.forEach(s => { if(s) s.addEventListener('change', filterTable); });
}

function populateKPIs() {
  if (typeof DB_STATS === 'undefined') return;
  const kpiTotal = document.getElementById('kpi-total');
  if (!kpiTotal) return; // not on dashboard

  document.getElementById('kpi-total').innerText = DB_STATS.total;
  document.getElementById('kpi-critical').innerText = DB_STATS.critical;
  document.getElementById('kpi-high').innerText = DB_STATS.high;
  document.getElementById('kpi-ug').innerText = DB_STATS.underground;
  document.getElementById('kpi-ug-pct').innerText = Math.round((DB_STATS.underground / DB_STATS.total) * 100) + '% of total';
}

function injectSidebar() {
  const placeholder = document.getElementById('sidebar-mount');
  if (!placeholder) return;

  const currentPage = location.pathname.split('/').pop() || 'dashboard.html';
  // Use simple mocking if Auth isn't fully defined yet on a page
  const roleLabel = (typeof Auth !== 'undefined' && Auth.currentUser) ? Auth.currentUser.role : 'Mine Official';
  const roleDesc  = (typeof Auth !== 'undefined' && Auth.currentUser) ? Auth.currentUser.name + ' • SECL' : 'Ranjan Kumar • SECL';
  const initials  = roleDesc.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const navHTML = NAV_ITEMS.map(item => {
    if (item.section) return `<div class="nav-section-label">${item.section}</div>`;
    const active = currentPage === item.href ? 'active' : '';
    let badgeHTML = '';
    if (item.badge) {
      const pulse = item.badgePulse ? 'live animate-pulse' : '';
      badgeHTML = `<span class="nav-badge ${pulse}">${item.badge}</span>`;
    }
    return `<a class="nav-item ${active}" href="${item.href}"><span class="nav-icon" style="width:18px;height:18px;display:inline-block">${item.icon}</span>${item.label}${badgeHTML}</a>`;
  }).join('\n');

  placeholder.innerHTML = `
<div class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
    </div>
    <div class="logo-text">
      <span class="logo-name">CoalGuard</span>
      <span class="logo-sub">National Mining Operations</span>
    </div>
  </div>
  <nav class="sidebar-nav">${navHTML}</nav>
  <div class="sidebar-footer">
    <div class="user-card">
      <div class="user-avatar" style="background:var(--brand-teal)">${initials}</div>
      <div class="user-info">
        <div class="user-name">${roleLabel}</div>
        <div class="user-role">${roleDesc}</div>
      </div>
      <button onclick="(typeof Auth!=='undefined')&&Auth.logout()" title="System Settings"
        style="margin-left:auto;background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>
  </div>
</div>`;
}

/* ── Toast notification ────────────────────────────────── */
window.showToast = function(msg, type, duration) {
  type = type || 'info'; duration = duration || 3000;
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div'); container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  const colors = { success:'#16834B', danger:'#C9362B', warning:'#C58A00', info:'#177EAF' };
  const icons  = { 
    success:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', 
    danger:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', 
    warning:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', 
    info:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' 
  };
  
  if (!document.getElementById('toast-anim')) {
    const s = document.createElement('style'); s.id = 'toast-anim';
    s.textContent = '@keyframes slideInT{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(s);
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = `pointer-events:auto;padding:12px 16px;border-radius:4px;font-size:12px;font-weight:600;
    background:#FFFFFF;border:1px solid ${colors[type]};color:#17221C;
    max-width:380px;line-height:1.4;box-shadow:0 4px 12px rgba(0,0,0,0.1);
    display:flex;align-items:flex-start;gap:10px;animation:slideInT 0.3s ease-out;border-left:4px solid ${colors[type]};`;
  toast.innerHTML = `<span style="flex-shrink:0;color:${colors[type]}">${icons[type]}</span><span style="flex:1;">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { try { toast.remove(); } catch(e){} }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  injectSidebar();

  // ── Global Search Shortcut (Cmd+K / Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.header-search input');
      if (searchInput) searchInput.focus();
    }
  });

  // Setup generic table filters if they exist on the page
  setupTableFilters('table', '.filter-bar input[type="text"]', ['.filter-bar select']);
  
  // Populate dynamic DB stats
  populateKPIs();

  // ── Emergency Dispatch Mock
  const emBtn = document.querySelector('.btn-emergency');
  if (emBtn) {
    emBtn.addEventListener('click', () => {
      window.showToast('EMERGENCY DISPATCH ACTIVATED. Alerting all SECL field units and DGMS HQ.', 'danger', 5000);
    });
  }

  // ── Live Clock (replaces all hardcoded header times)
  startLiveClock();
});

/* ── Live Clock ─────────────────────────────────────────── */
function startLiveClock() {
  const el = document.querySelector('.header-time');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', timeZone:'Asia/Kolkata' });
    const time = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata', hour12:false });
    el.innerHTML = `${date}<br>${time} IST`;
  };
  tick();
  setInterval(tick, 1000);
}
