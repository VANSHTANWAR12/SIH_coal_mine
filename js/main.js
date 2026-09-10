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

window.mockAction = function(btnElement, successMessage = 'Action completed') {
  if (btnElement.disabled) return;
  window.showToast(successMessage, 'info');
};

/* ── Centralized Modal System ────────────────────────────── */
window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector('input:not([type=hidden]), select, textarea');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  modal.classList.remove('active');
  const anyOpen = document.querySelector('.modal-overlay.open, .modal-overlay.active');
  if (!anyOpen) document.body.style.overflow = '';
};

// Global Escape key and Backdrop click listener
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal-overlay.open, .modal-overlay.active');
    openModals.forEach(m => window.closeModal(m.id));
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    window.closeModal(e.target.id);
  }
});

/* ── Global Emergency Dispatch Modal ────────────────────── */
window.injectEmergencyDispatchModal = function() {
  if (document.getElementById('emergency-dispatch-modal')) return;

  const modalEl = document.createElement('div');
  modalEl.id = 'emergency-dispatch-modal';
  modalEl.className = 'modal-overlay';
  modalEl.innerHTML = `
    <div class="modal-card modal-lg" role="dialog" aria-modal="true" aria-labelledby="ed-modal-title">
      <div class="modal-header danger-header">
        <div>
          <div class="modal-title" id="ed-modal-title" style="color:var(--danger);display:flex;align-items:center;gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            EMERGENCY DISPATCH
          </div>
          <div class="modal-subtitle">Statutory DGMS incident escalation & rapid field mobilization protocol</div>
        </div>
        <button class="modal-close" onclick="window.closeModal('emergency-dispatch-modal')" aria-label="Close modal">&times;</button>
      </div>

      <div class="modal-body">
        <div id="ed-error-box" style="display:none; background:#FEE2E2; border:1px solid #FCA5A5; color:#991B1B; padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:14px; font-size:12px; font-weight:600;"></div>
        <form id="emergency-dispatch-form" onsubmit="event.preventDefault(); window.submitEmergencyDispatch();">
          <div class="form-group">
            <label class="form-label" for="ed-reason">Incident / Reason <span class="req">*</span></label>
            <textarea class="form-textarea" id="ed-reason" rows="2" placeholder="e.g. Methane outburst exceeding 1.25% at Level 5 with ventilation stall" required></textarea>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="ed-mine">Mine <span class="req">*</span></label>
              <select class="form-select" id="ed-mine" required>
                <option value="">Select Affected Mine...</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="ed-zone">Affected Zone <span class="req">*</span></label>
              <input type="text" class="form-input" id="ed-zone" placeholder="e.g. Seam IV Incline / Pit Section 3B" required>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="ed-severity">Severity <span class="req">*</span></label>
              <select class="form-select" id="ed-severity" style="border-color:var(--danger);color:var(--danger);font-weight:700;">
                <option value="Critical" selected>Critical (Immediate Evacuation & Mobilization)</option>
                <option value="High">High (Urgent DGMS Response)</option>
                <option value="Medium">Medium (Controlled Hazard Standby)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="ed-incident-type">Incident Type <span class="req">*</span></label>
              <select class="form-select" id="ed-incident-type" required>
                <option value="Gas">Gas / Methane Leakage</option>
                <option value="Strata">Strata Instability / Roof Fall</option>
                <option value="Fire">Fire / Spontaneous Combustion</option>
                <option value="Safety">Safety / Equipment Failure</option>
                <option value="Environmental">Environmental Breach</option>
                <option value="Other">Other Hazardous Condition</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="ed-situation">Current Situation <span class="req">*</span></label>
            <textarea class="form-textarea" id="ed-situation" rows="3" placeholder="Describe underground or surface conditions, trapped personnel or atmospheric readings..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="ed-response">Recommended Response</label>
            <textarea class="form-textarea" id="ed-response" rows="2" placeholder="Immediate operational directive, power cut-off, or auxiliary fan speed adjustment"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Dispatch To <span class="req">*</span></label>
            <div class="form-checkbox-group">
              <label class="form-checkbox-label">
                <input type="checkbox" id="ed-team-rescue" checked> Mine Rescue Team
              </label>
              <label class="form-checkbox-label">
                <input type="checkbox" id="ed-team-safety" checked> Safety Officer
              </label>
              <label class="form-checkbox-label">
                <input type="checkbox" id="ed-team-medical" checked> Medical Team
              </label>
              <label class="form-checkbox-label">
                <input type="checkbox" id="ed-team-mgmt" checked> Mine Management
              </label>
              <label class="form-checkbox-label">
                <input type="checkbox" id="ed-team-reg" checked> Regulatory Authority (DGMS)
              </label>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="ed-personnel">Estimated Personnel Required</label>
              <input type="number" class="form-input" id="ed-personnel" value="12" min="1" max="500">
            </div>
            <div class="form-group">
              <label class="form-label" for="ed-instructions">Additional Instructions</label>
              <input type="text" class="form-input" id="ed-instructions" placeholder="e.g. Assemble at Shaft #2 fresh air base">
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal('emergency-dispatch-modal')">CANCEL</button>
        <button type="button" class="btn btn-emergency" id="ed-submit-btn" onclick="window.submitEmergencyDispatch()" style="padding:10px 24px;font-weight:700;">
          DISPATCH EMERGENCY
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);

  // Inject Dedicated Success Confirmation Modal
  if (!document.getElementById('emergency-dispatch-success-modal')) {
    const successModal = document.createElement('div');
    successModal.id = 'emergency-dispatch-success-modal';
    successModal.className = 'modal-overlay';
    successModal.innerHTML = `
      <div class="modal-card" style="max-width: 580px; border-top: 5px solid var(--success);" role="dialog" aria-modal="true" aria-labelledby="eds-modal-title">
        <div class="modal-header" style="background: #F0FDF4; border-bottom: 1px solid #BBF7D0;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:#DCFCE7; color:#166534; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:900;">
              ✓
            </div>
            <div>
              <div class="modal-title" id="eds-modal-title" style="color:#166534; font-size:16px;">Emergency Dispatch Created</div>
              <div class="modal-subtitle" style="color:#15803D; font-size:12px;" id="eds-headline">Emergency Dispatch successfully created.</div>
            </div>
          </div>
          <button class="modal-close" onclick="window.closeModal('emergency-dispatch-success-modal')" aria-label="Close modal">&times;</button>
        </div>

        <div class="modal-body" style="padding: 20px;">
          <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
              <div>
                <span style="font-size:10px; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Dispatch ID</span>
                <div style="font-size:20px; font-weight:900; color:var(--danger);" id="eds-id">ED-001</div>
              </div>
              <div style="text-align:right;">
                <span style="font-size:10px; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Current Status</span>
                <div id="eds-status-badge" style="margin-top:2px;"><span class="badge badge-dispatched">DISPATCHED</span></div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Mine</div>
                <div style="font-weight:700; color:var(--text-primary); margin-top:2px;" id="eds-mine">-</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Affected Zone</div>
                <div style="font-weight:700; color:var(--text-primary); margin-top:2px;" id="eds-zone">-</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Incident Type</div>
                <div style="font-weight:700; color:var(--text-primary); margin-top:2px;" id="eds-type">-</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Severity</div>
                <div id="eds-severity-badge" style="margin-top:2px;"><span class="badge badge-danger">Critical</span></div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Response Teams Mobilized</div>
                <div id="eds-teams" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Dispatch Timestamp</div>
                <div style="font-weight:600; color:var(--text-secondary); font-size:12px; margin-top:2px;" id="eds-time">-</div>
              </div>
            </div>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:8px; background:#EFF6FF; border:1px solid #BFDBFE; padding:10px 14px; border-radius:var(--radius-sm);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Chained to tamper-evident audit ledger (<strong style="color:#1D4ED8;">EMERGENCY_DISPATCH_CREATED</strong>).</span>
          </div>
        </div>

        <div class="modal-footer" style="justify-content:space-between;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal('emergency-dispatch-success-modal')">Close</button>
          <button type="button" class="btn btn-primary" id="eds-view-btn" onclick="window.openEmergencyDispatchDetails(window._lastCreatedDispatchId)" style="padding:10px 22px; font-weight:700; display:flex; align-items:center; gap:8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            View Dispatch Details
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(successModal);
  }

  // Inject Emergency Dispatch Details & Lifecycle Modal
  if (!document.getElementById('emergency-dispatch-details-modal')) {
    const detailsModal = document.createElement('div');
    detailsModal.id = 'emergency-dispatch-details-modal';
    detailsModal.className = 'modal-overlay';
    detailsModal.innerHTML = `
      <div class="modal-card modal-lg" style="border-top: 5px solid var(--danger);" role="dialog" aria-modal="true" aria-labelledby="edd-modal-title">
        <div class="modal-header danger-header">
          <div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="modal-title" id="edd-title" style="color:var(--danger);">Emergency Dispatch Details</span>
              <span id="edd-status-badge" class="badge badge-dispatched">DISPATCHED</span>
            </div>
            <div class="modal-subtitle" id="edd-subtitle">Statutory incident command & response lifecycle management</div>
          </div>
          <button class="modal-close" onclick="window.closeModal('emergency-dispatch-details-modal')" aria-label="Close modal">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Visual Lifecycle Stepper -->
          <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:var(--radius-md); padding:16px 20px; margin-bottom:20px;">
            <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.5px;">Emergency Lifecycle State</div>
            <div class="lifecycle-stepper" id="edd-stepper">
              <div class="lifecycle-step" id="step-dispatched">
                <div class="lifecycle-dot">1</div>
                <div class="lifecycle-label">Dispatched</div>
              </div>
              <div class="lifecycle-step" id="step-acknowledged">
                <div class="lifecycle-dot">2</div>
                <div class="lifecycle-label">Acknowledged</div>
              </div>
              <div class="lifecycle-step" id="step-in-progress">
                <div class="lifecycle-dot">3</div>
                <div class="lifecycle-label">In Progress</div>
              </div>
              <div class="lifecycle-step" id="step-resolved">
                <div class="lifecycle-dot">4</div>
                <div class="lifecycle-label">Resolved</div>
              </div>
            </div>
          </div>

          <!-- Metadata Grid -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; margin-bottom:18px;">
            <div style="background:#F9FAFB; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
              <div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Dispatch ID</div>
              <div style="font-size:16px; font-weight:900; color:var(--danger);" id="edd-id">-</div>
            </div>
            <div style="background:#F9FAFB; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
              <div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Mine Site</div>
              <div style="font-size:14px; font-weight:800; color:var(--text-primary);" id="edd-mine">-</div>
            </div>
            <div style="background:#F9FAFB; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border);">
              <div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Severity & Type</div>
              <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                <span id="edd-severity" class="badge badge-danger">Critical</span>
                <span id="edd-type" style="font-weight:700; font-size:12px; color:var(--text-primary);">Gas</span>
              </div>
            </div>
          </div>

          <div class="form-row-2" style="margin-bottom:14px;">
            <div>
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Affected Zone</div>
              <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-top:2px;" id="edd-zone">-</div>
            </div>
            <div>
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Dispatched By & Time</div>
              <div style="font-size:13px; font-weight:600; color:var(--text-primary); margin-top:2px;" id="edd-dispatched-meta">-</div>
            </div>
          </div>

          <div style="margin-bottom:14px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Response Teams Mobilized</div>
            <div id="edd-teams" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
          </div>

          <div style="margin-bottom:14px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Situation / Incident Narrative</div>
            <div style="background:#FFFFFF; border:1px solid var(--border); padding:10px 14px; border-radius:var(--radius-sm); font-size:13px; line-height:1.5; color:var(--text-primary);" id="edd-situation">-</div>
          </div>

          <div style="margin-bottom:18px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Directives & Additional Instructions</div>
            <div style="background:#FFFFFF; border:1px solid var(--border); padding:10px 14px; border-radius:var(--radius-sm); font-size:13px; line-height:1.5; color:var(--text-primary);" id="edd-instructions">-</div>
          </div>

          <!-- Lifecycle Action Panel -->
          <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:var(--radius-md); padding:16px;" id="edd-action-panel">
            <div style="font-size:12px; font-weight:800; color:#92400E; text-transform:uppercase; margin-bottom:8px;">Advance Emergency Lifecycle State</div>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="color:#92400E;">Commander Action Notes (Optional)</label>
              <input type="text" class="form-input" id="edd-action-notes" placeholder="e.g. Evacuation completed, ventilation fan accelerated">
            </div>
            <div id="edd-action-buttons" style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;"></div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal('emergency-dispatch-details-modal')">CLOSE</button>
        </div>
      </div>
    `;
    document.body.appendChild(detailsModal);
  }

  // Populate mines
  const mineSelect = document.getElementById('ed-mine');
  if (mineSelect && mineSelect.options.length <= 1) {
    if (typeof REAL_MINES !== 'undefined' && Array.isArray(REAL_MINES)) {
      REAL_MINES.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = `${m.name} (${m.sub}) - ${m.risk} Risk`;
        mineSelect.appendChild(opt);
      });
    } else {
      fetch('/api/mines')
        .then(r => r.json())
        .then(mines => {
          mines.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.name;
            opt.textContent = `${m.name} (${m.subsidiary}) - ${m.risk} Risk`;
            mineSelect.appendChild(opt);
          });
        })
        .catch(() => {});
    }
  }
};

window.openEmergencyDispatchModal = function(preselectedMine = '') {
  window.injectEmergencyDispatchModal();
  const errorBox = document.getElementById('ed-error-box');
  if (errorBox) { errorBox.style.display = 'none'; errorBox.textContent = ''; }
  if (preselectedMine) {
    const sel = document.getElementById('ed-mine');
    if (sel) sel.value = preselectedMine;
  }
  window.openModal('emergency-dispatch-modal');
};

window.submitEmergencyDispatch = async function() {
  const errorBox = document.getElementById('ed-error-box');
  if (errorBox) { errorBox.style.display = 'none'; errorBox.textContent = ''; }

  const mineSelect = document.getElementById('ed-mine');
  const mine = mineSelect ? mineSelect.value.trim() : '';
  const zone = (document.getElementById('ed-zone')?.value || '').trim();
  const severity = document.getElementById('ed-severity')?.value || 'Critical';
  const incidentType = document.getElementById('ed-incident-type')?.value || 'Safety';
  const reason = (document.getElementById('ed-reason')?.value || '').trim();
  const situation = (document.getElementById('ed-situation')?.value || '').trim() || reason;
  const response = (document.getElementById('ed-response')?.value || '').trim();
  const personnel = parseInt(document.getElementById('ed-personnel')?.value || '10', 10);
  const instructions = (document.getElementById('ed-instructions')?.value || '').trim();

  const teams = [];
  if (document.getElementById('ed-team-rescue')?.checked) teams.push('Mine Rescue Team');
  if (document.getElementById('ed-team-safety')?.checked) teams.push('Safety Officer');
  if (document.getElementById('ed-team-medical')?.checked) teams.push('Medical Team');
  if (document.getElementById('ed-team-mgmt')?.checked) teams.push('Mine Management');
  if (document.getElementById('ed-team-reg')?.checked) teams.push('Regulatory Authority');

  // Validation
  if (!mine) {
    if (errorBox) {
      errorBox.textContent = 'Please select the affected Mine site.';
      errorBox.style.display = 'block';
    }
    window.showToast('Please select the affected Mine site.', 'warning');
    if (mineSelect) mineSelect.focus();
    return;
  }
  if (!situation) {
    if (errorBox) {
      errorBox.textContent = 'Please describe the Current Situation.';
      errorBox.style.display = 'block';
    }
    window.showToast('Please describe the Current Situation.', 'warning');
    document.getElementById('ed-situation')?.focus();
    return;
  }

  const submitBtn = document.getElementById('ed-submit-btn');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'DISPATCH EMERGENCY';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin" style="margin-right:6px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Dispatching...`;
  }

  const payload = {
    mine_name: mine,
    mineId: mine,
    affected_zone: zone || 'Active Underground Face',
    severity,
    incident_type: incidentType,
    situation: reason ? `${reason}. ${situation}` : situation,
    response_teams: teams,
    personnel_required: personnel,
    instructions: response ? `${response}. ${instructions}` : instructions,
    dispatched_by: 'DGMS Incident Commander',
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/emergency-dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user': 'DGMS Incident Commander'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const created = await res.json();
    const dispatchObj = created.dispatch || created;

    // Close form modal & reset
    window.closeModal('emergency-dispatch-modal');
    document.getElementById('emergency-dispatch-form')?.reset();

    // Show Dedicated Success Confirmation Modal
    window.showEmergencySuccessModal(dispatchObj);

    // Update active emergencies list and counters across page
    if (typeof window.fetchAndRenderEmergencyDispatches === 'function') {
      window.fetchAndRenderEmergencyDispatches();
    }

    const emCounter = document.getElementById('kpi-emergency-count') || document.querySelector('.emergency-counter');
    if (emCounter) {
      const cur = parseInt(emCounter.textContent, 10) || 0;
      emCounter.textContent = cur + 1;
    }
  } catch (err) {
    console.error('Emergency dispatch failed:', err);
    if (errorBox) {
      errorBox.textContent = `Unable to create emergency dispatch: ${err.message}. Form preserved.`;
      errorBox.style.display = 'block';
    }
    window.showToast(`Unable to create emergency dispatch: ${err.message}. Form preserved.`, 'danger', 5000);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
};

window.showEmergencySuccessModal = function(dispatch) {
  window.injectEmergencyDispatchModal();
  const d = dispatch.dispatch || dispatch;
  window._lastCreatedDispatchId = d.id;

  const headlineEl = document.getElementById('eds-headline');
  if (headlineEl) headlineEl.textContent = `Emergency Dispatch ${d.id} successfully created.`;

  const idEl = document.getElementById('eds-id');
  if (idEl) idEl.textContent = d.id;

  const mineEl = document.getElementById('eds-mine');
  if (mineEl) mineEl.textContent = d.mine_name || d.mineId || 'Unknown Mine';

  const zoneEl = document.getElementById('eds-zone');
  if (zoneEl) zoneEl.textContent = d.affected_zone || 'Active Underground Face';

  const typeEl = document.getElementById('eds-type');
  if (typeEl) typeEl.textContent = d.incident_type || 'Safety';

  const sevBadge = document.getElementById('eds-severity-badge');
  if (sevBadge) {
    const sev = d.severity || 'Critical';
    const badgeClass = sev.toLowerCase() === 'critical' ? 'badge-danger' : 'badge-warning';
    sevBadge.innerHTML = `<span class="badge ${badgeClass}">${sev}</span>`;
  }

  const teamsEl = document.getElementById('eds-teams');
  if (teamsEl) {
    let teams = d.response_teams || [];
    if (typeof teams === 'string') {
      try { teams = JSON.parse(teams); } catch { teams = [teams]; }
    }
    teamsEl.innerHTML = Array.isArray(teams) && teams.length > 0
      ? teams.map(t => `<span class="badge" style="background:#E2E8F0;color:#334155;font-size:11px;">${t}</span>`).join('')
      : `<span style="color:var(--text-muted);font-size:12px;">Standard Rapid Deployment</span>`;
  }

  const timeEl = document.getElementById('eds-time');
  if (timeEl) {
    const dt = d.created_at ? new Date(d.created_at.includes('T') ? d.created_at : d.created_at.replace(' ', 'T')) : new Date();
    timeEl.textContent = isNaN(dt.getTime()) ? d.created_at : dt.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
  }

  const statusBadge = document.getElementById('eds-status-badge');
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="badge badge-dispatched">${d.status || 'DISPATCHED'}</span>`;
  }

  const viewBtn = document.getElementById('eds-view-btn');
  if (viewBtn) {
    viewBtn.onclick = () => {
      window.closeModal('emergency-dispatch-success-modal');
      window.openEmergencyDispatchDetails(d.id);
    };
  }

  window.openModal('emergency-dispatch-success-modal');
};

window.openEmergencyDispatchDetails = async function(dispatchId) {
  window.injectEmergencyDispatchModal();
  if (!dispatchId) return;

  try {
    const res = await fetch(`/api/emergency-dispatch/${dispatchId}`);
    if (!res.ok) throw new Error(`Could not load details for ${dispatchId}`);
    const d = await res.json();

    document.getElementById('edd-title').textContent = `Emergency Dispatch ${d.id}`;
    document.getElementById('edd-subtitle').textContent = `${d.mine_name} • ${d.affected_zone}`;
    document.getElementById('edd-id').textContent = d.id;
    document.getElementById('edd-mine').textContent = d.mine_name;
    document.getElementById('edd-zone').textContent = d.affected_zone;
    document.getElementById('edd-type').textContent = d.incident_type;

    const sevEl = document.getElementById('edd-severity');
    if (sevEl) {
      sevEl.textContent = d.severity;
      sevEl.className = `badge ${d.severity.toLowerCase() === 'critical' ? 'badge-danger' : 'badge-warning'}`;
    }

    const statusBadge = document.getElementById('edd-status-badge');
    const status = (d.status || 'DISPATCHED').toUpperCase();
    if (statusBadge) {
      const cls = status === 'RESOLVED' ? 'badge-resolved' : status === 'RESPONSE IN PROGRESS' ? 'badge-in-progress' : status === 'ACKNOWLEDGED' ? 'badge-acknowledged' : 'badge-dispatched';
      statusBadge.className = `badge ${cls}`;
      statusBadge.textContent = status;
    }

    // Lifecycle Stepper Update
    const steps = ['dispatched', 'acknowledged', 'in-progress', 'resolved'];
    const statusMap = {
      'DISPATCHED': 0,
      'ACKNOWLEDGED': 1,
      'RESPONSE IN PROGRESS': 2,
      'RESOLVED': 3
    };
    const currentStepIdx = statusMap[status] ?? 0;

    steps.forEach((stepName, idx) => {
      const stepEl = document.getElementById(`step-${stepName}`);
      if (!stepEl) return;
      stepEl.className = 'lifecycle-step';
      if (idx < currentStepIdx) {
        stepEl.classList.add('completed');
        stepEl.querySelector('.lifecycle-dot').innerHTML = '✓';
      } else if (idx === currentStepIdx) {
        stepEl.classList.add('active');
        if (stepName === 'in-progress') stepEl.classList.add('in-progress-step');
        if (stepName === 'resolved') stepEl.classList.add('resolved-step');
        stepEl.querySelector('.lifecycle-dot').innerHTML = idx === 3 ? '✓' : String(idx + 1);
      } else {
        stepEl.querySelector('.lifecycle-dot').innerHTML = String(idx + 1);
      }
    });

    const dt = d.created_at ? new Date(d.created_at.includes('T') ? d.created_at : d.created_at.replace(' ', 'T')) : new Date();
    const timeStr = isNaN(dt.getTime()) ? d.created_at : dt.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
    document.getElementById('edd-dispatched-meta').textContent = `${d.dispatched_by || 'Incident Commander'} (${timeStr})`;

    const teamsEl = document.getElementById('edd-teams');
    if (teamsEl) {
      let teams = d.response_teams || [];
      if (typeof teams === 'string') {
        try { teams = JSON.parse(teams); } catch { teams = [teams]; }
      }
      teamsEl.innerHTML = Array.isArray(teams) && teams.length > 0
        ? teams.map(t => `<span class="badge" style="background:#F1F5F9;color:#334155;font-weight:700;">${t}</span>`).join('')
        : `<span style="color:var(--text-muted);font-size:12px;">Standard Rapid Deployment</span>`;
    }

    document.getElementById('edd-situation').textContent = d.situation || 'No narrative provided.';
    document.getElementById('edd-instructions').textContent = d.instructions || 'Standard statutory emergency guidelines apply.';

    // Action Panel & Buttons
    const actionButtons = document.getElementById('edd-action-buttons');
    const notesInput = document.getElementById('edd-action-notes');
    if (notesInput) notesInput.value = '';

    if (actionButtons) {
      if (status === 'DISPATCHED') {
        actionButtons.innerHTML = `
          <button type="button" class="btn btn-primary" onclick="window.updateEmergencyDispatchStatus('${d.id}', 'ACKNOWLEDGED')" style="padding:8px 18px; font-weight:700; background:#2563EB; border-color:#1D4ED8;">
            ✓ Acknowledge Dispatch
          </button>
        `;
      } else if (status === 'ACKNOWLEDGED') {
        actionButtons.innerHTML = `
          <button type="button" class="btn btn-primary" onclick="window.updateEmergencyDispatchStatus('${d.id}', 'RESPONSE IN PROGRESS')" style="padding:8px 18px; font-weight:700; background:#7C3AED; border-color:#6D28D9;">
            ▶ Mobilize: Response In Progress
          </button>
        `;
      } else if (status === 'RESPONSE IN PROGRESS') {
        actionButtons.innerHTML = `
          <button type="button" class="btn btn-primary" onclick="window.updateEmergencyDispatchStatus('${d.id}', 'RESOLVED')" style="padding:8px 18px; font-weight:700; background:var(--success); border-color:#15803D;">
            ✓ Mark Emergency Resolved
          </button>
        `;
      } else {
        actionButtons.innerHTML = `
          <div style="color:#166534; font-weight:800; font-size:13px; display:flex; align-items:center; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            This emergency event is fully resolved and archived in the immutable DGMS audit trail.
          </div>
        `;
      }
    }

    window.openModal('emergency-dispatch-details-modal');
  } catch (err) {
    console.error('Failed to load dispatch details:', err);
    window.showToast(`Unable to load dispatch details: ${err.message}`, 'warning');
  }
};

window.updateEmergencyDispatchStatus = async function(dispatchId, newStatus) {
  const notes = (document.getElementById('edd-action-notes')?.value || '').trim();
  try {
    const res = await fetch(`/api/emergency-dispatch/${dispatchId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user': 'DGMS Incident Commander'
      },
      body: JSON.stringify({ status: newStatus, notes })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status update failed (${res.status})`);
    }

    const updated = await res.json();
    window.showToast(`Emergency dispatch ${dispatchId} updated to ${newStatus}.`, 'success', 4000);

    // Refresh details modal view
    window.openEmergencyDispatchDetails(dispatchId);

    // Refresh active emergencies list if present
    if (typeof window.fetchAndRenderEmergencyDispatches === 'function') {
      window.fetchAndRenderEmergencyDispatches();
    }
  } catch (err) {
    console.error('Status update failed:', err);
    window.showToast(`Failed to update status: ${err.message}`, 'danger', 4500);
  }
};

window.fetchAndRenderEmergencyDispatches = async function() {
  const tbody = document.getElementById('emergency-dispatches-tbody');
  const counter = document.getElementById('ed-live-counter');
  const badge = document.getElementById('ed-live-badge');

  try {
    const res = await fetch('/api/emergency-dispatches');
    if (!res.ok) return;
    const dispatches = await res.json();

    const activeCount = dispatches.filter(d => (d.status || '').toUpperCase() !== 'RESOLVED').length;
    if (counter) counter.textContent = `${activeCount} ACTIVE`;
    if (badge) badge.textContent = `${activeCount} ACTIVE`;

    if (!tbody) return;

    if (!dispatches || dispatches.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted);">No active or recorded emergency dispatches.</td></tr>`;
      return;
    }

    tbody.innerHTML = dispatches.map(d => {
      const status = (d.status || 'DISPATCHED').toUpperCase();
      const statusCls = status === 'RESOLVED' ? 'badge-resolved' : status === 'RESPONSE IN PROGRESS' ? 'badge-in-progress' : status === 'ACKNOWLEDGED' ? 'badge-acknowledged' : 'badge-dispatched';
      const sevCls = d.severity.toLowerCase() === 'critical' ? 'badge-danger' : 'badge-warning';

      let teams = d.response_teams || [];
      if (typeof teams === 'string') {
        try { teams = JSON.parse(teams); } catch { teams = [teams]; }
      }
      const teamsText = Array.isArray(teams) ? teams.join(', ') : String(teams);

      const dt = d.created_at ? new Date(d.created_at.includes('T') ? d.created_at : d.created_at.replace(' ', 'T')) : new Date();
      const timeStr = isNaN(dt.getTime()) ? d.created_at : dt.toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' });

      return `
        <tr>
          <td><strong style="color:var(--danger);font-size:13px;">${d.id}</strong></td>
          <td><strong>${d.mine_name}</strong></td>
          <td>${d.affected_zone || 'Active Zone'}</td>
          <td>${d.incident_type || 'Safety'}</td>
          <td><span class="badge ${sevCls}">${d.severity}</span></td>
          <td style="max-width:200px;font-size:11px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${teamsText}">${teamsText}</td>
          <td style="font-size:11px;color:var(--text-secondary);white-space:nowrap;">${timeStr}</td>
          <td><span class="badge ${statusCls}">${status}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.openEmergencyDispatchDetails('${d.id}')">
              View Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load emergency dispatches:', err);
  }
};

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
  const u = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : {
    role: 'Mine Official', name: 'Ranjan Kumar', org: 'SECL', initials: 'RK'
  };
  const roleLabel = u.role;
  const roleDesc  = `${u.name} • ${u.org}`;
  const initials  = u.initials;

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
  <div class="sidebar-logo" style="justify-content: center; padding: 24px 0; background: transparent; border-bottom: none;">
    <img src="logo/logo.png" alt="CoalGuard Logo" style="width: 160px; height: auto; object-fit: contain; background: transparent;">
  </div>
  <nav class="sidebar-nav">${navHTML}</nav>
  <div class="sidebar-footer" style="position:relative;">
    <div class="user-card" id="sidebar-user-card" role="button" tabindex="0" title="Account & Profile Control" style="cursor:pointer;" onclick="window.toggleSidebarProfileDropdown(event)">
      <div class="user-avatar" style="background:var(--brand-teal)">${initials}</div>
      <div class="user-info">
        <div class="user-name">${roleLabel}</div>
        <div class="user-role">${roleDesc}</div>
      </div>
      <button type="button" class="profile-gear-btn" onclick="event.stopPropagation(); window.openSettingsModal();" title="System Settings" aria-label="Open Settings"
        style="margin-left:auto;background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>
    <div class="profile-dropdown-menu" id="sidebar-profile-dropdown" role="menu" aria-label="User Account Menu" style="bottom:calc(100% + 8px);top:auto;left:10px;right:10px;width:auto;">
      <div class="pdm-header">
        <div class="pdm-avatar">${initials}</div>
        <div class="pdm-user-meta">
          <div class="pdm-name">${u.name}</div>
          <div class="pdm-role">${u.role}</div>
          <div class="pdm-org">${u.org}</div>
        </div>
      </div>
      <div class="pdm-divider"></div>
      <div class="pdm-body">
        <button type="button" class="pdm-item" onclick="window.openUserProfileModal()" role="menuitem">
          <span class="pdm-icon">👤</span>
          <span>My Profile</span>
        </button>
        <button type="button" class="pdm-item" onclick="window.openUserProfileModal()" role="menuitem">
          <span class="pdm-icon">🏢</span>
          <span>Organization / Role</span>
          <span class="pdm-badge">${u.org}</span>
        </button>
        <button type="button" class="pdm-item" onclick="window.openSettingsModal()" role="menuitem">
          <span class="pdm-icon">🔔</span>
          <span>Notifications</span>
          <span class="pdm-badge pdm-notif-badge">Active</span>
        </button>
        <button type="button" class="pdm-item" onclick="window.openSettingsModal()" role="menuitem">
          <span class="pdm-icon">⚙</span>
          <span>Settings</span>
        </button>
      </div>
      <div class="pdm-divider"></div>
      <div class="pdm-footer">
        <button type="button" class="pdm-item pdm-signout" onclick="window.signOutCoalGuard()" role="menuitem">
          <span class="pdm-icon">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  </div>
</div>`;

  const sCard = document.getElementById('sidebar-user-card');
  if (sCard) {
    sCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.toggleSidebarProfileDropdown(e);
      }
    });
  }
}

/* ── Toast notification ────────────────────────────────── */
window.showToast = function(msg, type, duration) {
  const settings = (typeof window.getCoalGuardSettings === 'function') ? window.getCoalGuardSettings() : null;
  if (settings) {
    if (typeof settings.notifications === 'object' && settings.notifications !== null) {
      if (type === 'info' && settings.notifications.operational === false) return;
      if (type === 'danger' && settings.notifications.critical === false) return;
      if (type === 'warning' && settings.notifications.compliance === false) return;
    } else if (settings.notifications === false && (type === 'info' || type === 'warning')) {
      return; // Respect muted notification setting
    }
  }
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
  setupHeaderNavigation();
  setupUserProfileControl();

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

  // ── Global Emergency Dispatch Handler
  window.injectEmergencyDispatchModal();
  document.querySelectorAll('.btn-emergency').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openEmergencyDispatchModal();
    });
  });

  // ── Live Clock (replaces all hardcoded header times)
  startLiveClock();
});

/* ── Global Top Header Navigation ──────────────────────── */
function setupHeaderNavigation() {
  const container = document.querySelector('.header-links');
  if (!container) return;

  const currentPath = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
  const currentParams = new URLSearchParams(window.location.search);
  const mineParam = currentParams.get('mine') || currentParams.get('mineId');

  // Build target query strings where appropriate (preserve mine context)
  const mineQuery = mineParam ? `?mine=${encodeURIComponent(mineParam)}` : '';

  // Determine active perspective based on page route
  let activeTab = 'hq'; // default
  if (currentPath === 'secl-zone.html' || currentPath === 'field-reports.html' || currentPath === 'contractors.html') {
    activeTab = 'secl';
  } else if (currentPath === 'dgms-portal.html' || currentPath === 'compliance.html' || currentPath === 'inspections.html') {
    activeTab = 'dgms';
  } else if (currentPath === 'dashboard.html' || currentPath === '' || currentPath === 'index.html' || currentPath === 'analytics.html' || currentPath === 'ai-prediction.html' || currentPath === 'mine-intelligence.html' || currentPath === 'gis-map.html' || currentPath === 'reports.html') {
    activeTab = 'hq';
  }

  // Preserve manual override if specified
  if (window._activeHeaderTab) {
    activeTab = window._activeHeaderTab;
  }

  // Target links with preserved mine parameter if present
  const hqHref = mineParam && currentPath !== 'dashboard.html' ? `dashboard.html${mineQuery}` : 'dashboard.html';
  const seclHref = mineParam ? `secl-zone.html${mineQuery}` : 'secl-zone.html';
  const dgmsHref = mineParam ? `dgms-portal.html${mineQuery}` : 'dgms-portal.html';

  // Render the three canonical working navigation items
  container.innerHTML = `
    <a href="${hqHref}" class="header-link ${activeTab === 'hq' ? 'active' : ''}">HQ Dashboard</a>
    <a href="${seclHref}" class="header-link ${activeTab === 'secl' ? 'active' : ''}">SECL Operational Zone</a>
    <a href="${dgmsHref}" class="header-link ${activeTab === 'dgms' ? 'active' : ''}">DGMS Regulatory Portal</a>
  `;
}

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

/* ==========================================================
   COALGUARD ENTERPRISE USER ACCOUNT SETTINGS & PROFILE SYSTEM
   ========================================================== */

/* ── 1. Current Authenticated Identity ───────────────────── */
window.getCurrentUser = function() {
  let u = null;
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) u = JSON.parse(raw);
  } catch(e) {}

  if (!u && typeof Auth !== 'undefined' && Auth.currentUser) {
    u = Auth.currentUser;
  }

  const role = (u && u.role) || localStorage.getItem('cg_role') || 'Mine Official';
  const name = (u && u.name) || localStorage.getItem('cg_name') || 'Ranjan Kumar';
  const org  = (u && u.org) || 'SECL';
  const email = (u && u.email) || 'ranjan.kumar@secl.gov.in';
  const phone = (u && u.phone) || '+91 7752 246300';
  const officerId = (u && u.officerId) || 'SECL-HQ-DIR-2024-089';
  const avatarUrl = (u && u.avatarUrl) || null;
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = (words.length > 1
    ? (words[0][0] + words[words.length - 1][0])
    : (words[0] ? words[0].slice(0, 2) : 'RK')).toUpperCase();
  
  let accessLevel = 'Operational Command';
  if (role === 'Regulatory' || role === 'DGMS Inspector' || role === 'regulator') {
    accessLevel = 'Regulatory / Statutory Audit';
  } else if (role === 'Corp Mgmt' || role === 'Director Tech' || role === 'corporate') {
    accessLevel = 'Executive Headquarters';
  }

  const assignedZone = 'SECL - Bilaspur Operational Command';
  let lastLogin = '';
  const storedTs = localStorage.getItem('cg_ts');
  if (storedTs && !isNaN(parseInt(storedTs))) {
    lastLogin = new Date(parseInt(storedTs)).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } else {
    lastLogin = new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  return {
    name,
    role,
    org,
    email,
    phone,
    officerId,
    avatarUrl,
    initials,
    accessLevel,
    assignedZone,
    lastLogin,
    status: 'ACTIVE'
  };
};

/* ── 2. Settings Persistence & Application ──────────────── */
const CG_DEFAULT_SETTINGS = {
  theme: 'system',
  language: 'en',
  compactMode: false,
  confirmCritical: true,
  notifications: {
    operational: true,
    critical: true,
    compliance: true,
    inspections: true,
    contracts: true,
    browser: false
  },
  alertSounds: true,
  autoRefresh: true,
  defaultMine: '',
  defaultDashboard: 'dashboard.html',
  telemetryRefresh: '5s'
};

window.getCoalGuardSettings = function() {
  try {
    const raw = localStorage.getItem('coalguard_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure notifications structure is backwards compatible
      if (typeof parsed.notifications === 'boolean') {
        parsed.notifications = {
          operational: parsed.notifications,
          critical: true,
          compliance: parsed.notifications,
          inspections: parsed.notifications,
          contracts: parsed.notifications,
          browser: false
        };
      }
      return Object.assign({}, CG_DEFAULT_SETTINGS, parsed);
    }
  } catch(e) {}
  return Object.assign({}, CG_DEFAULT_SETTINGS);
};

window.applyCoalGuardSettings = function(settings) {
  if (!settings) settings = window.getCoalGuardSettings();

  // 1. Theme application
  if (settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (settings.theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    // system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // 2. Compact Mode application
  if (settings.compactMode) {
    document.body.classList.add('compact-mode');
  } else {
    document.body.classList.remove('compact-mode');
  }

  // 3. Notification indicator updates
  const notifs = typeof settings.notifications === 'object' ? settings.notifications : { operational: settings.notifications };
  const anyActive = Object.values(notifs).some(v => v === true);
  const badges = document.querySelectorAll('.pdm-notif-badge');
  badges.forEach(b => {
    b.textContent = anyActive ? 'Active' : 'Muted';
    b.style.background = anyActive ? 'var(--success-bg)' : '#E5E7EB';
    b.style.color = anyActive ? 'var(--success)' : 'var(--text-muted)';
  });
  const bellBtns = document.querySelectorAll('.top-header button[title*="Alerts"], .top-header button[title*="alerts"]');
  bellBtns.forEach(b => {
    b.style.opacity = anyActive ? '1' : '0.4';
    b.title = anyActive ? 'View Active Alerts (Notifications Enabled)' : 'View Active Alerts (Notifications Muted)';
  });

  // 4. Default Mine application (respects explicit query params)
  const currentParams = new URLSearchParams(window.location.search);
  const explicitMine = currentParams.get('mine') || currentParams.get('mineId');
  if (!explicitMine && settings.defaultMine) {
    const mineSelects = document.querySelectorAll('#mine-select, select[name="mine"], .mine-filter-select');
    mineSelects.forEach(select => {
      if (!select.dataset.userExplicit) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value === settings.defaultMine || select.options[i].text.includes(settings.defaultMine)) {
            select.selectedIndex = i;
            select.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
    });
  }
};

// Listen for OS color scheme change when theme is set to 'system'
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const s = window.getCoalGuardSettings();
    if (s.theme === 'system') window.applyCoalGuardSettings(s);
  });
}

/* ── 3. Profile UI Synchronization ──────────────────────── */
window.updateGlobalProfileUI = function() {
  const u = window.getCurrentUser();

  const getAvatarHTML = (size = 28, fontSize = 11) => {
    if (u.avatarUrl) {
      return `<img src="${u.avatarUrl}" alt="${u.name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
    }
    return `<div class="user-avatar" style="width:${size}px;height:${size}px;border-radius:50%;background:var(--brand-teal);color:#FFFFFF;font-size:${fontSize}px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${u.initials}</div>`;
  };

  // Header profile card
  const hdrCard = document.getElementById('header-profile-card');
  if (hdrCard) {
    const avContainer = hdrCard.querySelector('.user-avatar, img');
    if (avContainer) avContainer.outerHTML = getAvatarHTML(28, 11);
    const roleEl = hdrCard.querySelector('#hdr-user-role');
    const descEl = hdrCard.querySelector('#hdr-user-desc');
    if (roleEl) roleEl.textContent = u.role;
    if (descEl) descEl.textContent = `${u.name} • ${u.org}`;
  }

  // Sidebar card
  const sCard = document.getElementById('sidebar-user-card');
  if (sCard) {
    const sAv = sCard.querySelector('.user-avatar, img');
    if (sAv) sAv.outerHTML = getAvatarHTML(32, 12);
    const sName = sCard.querySelector('.user-name');
    const sRole = sCard.querySelector('.user-role');
    if (sName) sName.textContent = u.role;
    if (sRole) sRole.textContent = `${u.name} • ${u.org}`;
  }

  // Dropdown menus
  const pdms = document.querySelectorAll('.profile-dropdown-menu');
  pdms.forEach(menu => {
    const av = menu.querySelector('.pdm-avatar');
    if (av) {
      if (u.avatarUrl) {
        av.innerHTML = `<img src="${u.avatarUrl}" alt="${u.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        av.textContent = u.initials;
      }
    }
    const nameEl = menu.querySelector('.pdm-name');
    const roleEl = menu.querySelector('.pdm-role');
    const orgEl  = menu.querySelector('.pdm-org');
    if (nameEl) nameEl.textContent = u.name;
    if (roleEl) roleEl.textContent = u.role;
    if (orgEl)  orgEl.textContent  = u.org;
  });

  // In Settings Modal
  const profAvBox = document.getElementById('cg-prof-avatar-box');
  if (profAvBox) {
    if (u.avatarUrl) {
      profAvBox.innerHTML = `<img src="${u.avatarUrl}" alt="${u.name}" class="settings-avatar-img">`;
    } else {
      profAvBox.innerHTML = `<div class="settings-avatar-initials">${u.initials}</div>`;
    }
  }
  const profDisplayName = document.getElementById('cg-prof-display-name');
  const profDisplayRole = document.getElementById('cg-prof-display-role');
  const profDisplayOrg  = document.getElementById('cg-prof-display-org');
  if (profDisplayName) profDisplayName.textContent = u.name;
  if (profDisplayRole) profDisplayRole.textContent = u.role;
  if (profDisplayOrg)  profDisplayOrg.textContent  = `${u.org} • Operational Command`;

  const profNameInput = document.getElementById('cg-prof-name');
  if (profNameInput && document.activeElement !== profNameInput) {
    profNameInput.value = u.name;
  }
};

/* ── 4. Profile Editing & Photo Upload ───────────────────── */
window.saveUserProfile = function(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('cg-prof-name');
  const emailInput = document.getElementById('cg-prof-email');
  const phoneInput = document.getElementById('cg-prof-phone');
  const idInput = document.getElementById('cg-prof-id');

  const cur = window.getCurrentUser();
  const updatedUser = {
    ...cur,
    name: nameInput ? nameInput.value.trim() || cur.name : cur.name,
    email: emailInput ? emailInput.value.trim() || cur.email : cur.email,
    phone: phoneInput ? phoneInput.value.trim() || cur.phone : cur.phone,
    officerId: idInput ? idInput.value.trim() || cur.officerId : cur.officerId,
    avatarUrl: cur.avatarUrl
  };

  localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  localStorage.setItem('cg_name', updatedUser.name);

  window.updateGlobalProfileUI();
  window.showToast('✓ Profile updated successfully.', 'success');
};

window.handleAvatarPhotoUpload = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    window.showToast('Photo size exceeds 2MB limit.', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    const cur = window.getCurrentUser();
    cur.avatarUrl = dataUrl;
    localStorage.setItem('auth_user', JSON.stringify(cur));
    window.updateGlobalProfileUI();
    window.showToast('✓ Profile photo updated.', 'success');
  };
  reader.readAsDataURL(file);
};

window.removeAvatarPhoto = function() {
  const cur = window.getCurrentUser();
  cur.avatarUrl = null;
  localStorage.setItem('auth_user', JSON.stringify(cur));
  window.updateGlobalProfileUI();
  window.showToast('Profile photo removed.', 'info');
};

/* ── 5. Enterprise Settings Tab Navigation ───────────────── */
window.switchSettingsTab = function(tabName) {
  const modal = document.getElementById('coalguard-settings-modal');
  if (!modal) return;

  const navItems = modal.querySelectorAll('.settings-nav-item');
  navItems.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const panes = modal.querySelectorAll('.settings-pane');
  panes.forEach(pane => {
    if (pane.id === `settings-pane-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  const contentArea = modal.querySelector('.settings-content');
  if (contentArea) contentArea.scrollTop = 0;
};

window.openSettingsModal = function(initialTab = 'profile') {
  window.closeProfileDropdown();
  const u = window.getCurrentUser();
  const s = window.getCoalGuardSettings();

  // Populate Profile Inputs
  const nameField = document.getElementById('cg-prof-name');
  const emailField = document.getElementById('cg-prof-email');
  const phoneField = document.getElementById('cg-prof-phone');
  const idField = document.getElementById('cg-prof-id');
  const roleField = document.getElementById('cg-prof-role');
  const orgField = document.getElementById('cg-prof-org');

  if (nameField) nameField.value = u.name;
  if (emailField) emailField.value = u.email;
  if (phoneField) phoneField.value = u.phone;
  if (idField) idField.value = u.officerId;
  if (roleField) roleField.value = u.role;
  if (orgField) orgField.value = u.org;

  // Populate Notifications
  const notifs = s.notifications || {};
  const isNotifsOn = typeof notifs === 'boolean' ? notifs : true;
  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };
  setCheck('cg-notif-operational', notifs.operational !== undefined ? notifs.operational : isNotifsOn);
  setCheck('cg-notif-critical', notifs.critical !== undefined ? notifs.critical : true);
  setCheck('cg-notif-compliance', notifs.compliance !== undefined ? notifs.compliance : isNotifsOn);
  setCheck('cg-notif-inspections', notifs.inspections !== undefined ? notifs.inspections : isNotifsOn);
  setCheck('cg-notif-contracts', notifs.contracts !== undefined ? notifs.contracts : isNotifsOn);
  setCheck('cg-notif-browser', notifs.browser !== undefined ? notifs.browser : false);

  // Populate Preferences
  const themeField = document.getElementById('cg-pref-theme');
  const langField = document.getElementById('cg-pref-lang');
  const compactField = document.getElementById('cg-pref-compact');
  const confirmField = document.getElementById('cg-pref-confirm');

  if (themeField) themeField.value = s.theme || 'system';
  if (langField) langField.value = s.language || 'en';
  if (compactField) compactField.checked = !!s.compactMode;
  if (confirmField) confirmField.checked = s.confirmCritical !== undefined ? !!s.confirmCritical : true;

  // Populate Operational
  const mineField = document.getElementById('cg-op-mine');
  const dashField = document.getElementById('cg-op-dash');
  const telemField = document.getElementById('cg-op-telem');
  const autoField = document.getElementById('cg-op-autorefresh');
  const soundsField = document.getElementById('cg-op-sounds');

  if (mineField) mineField.value = s.defaultMine || '';
  if (dashField) dashField.value = s.defaultDashboard || 'dashboard.html';
  if (telemField) telemField.value = s.telemetryRefresh || '5s';
  if (autoField) autoField.checked = s.autoRefresh !== undefined ? !!s.autoRefresh : true;
  if (soundsField) soundsField.checked = s.alertSounds !== undefined ? !!s.alertSounds : true;

  window.updateGlobalProfileUI();
  window.switchSettingsTab(initialTab);
  window.openModal('coalguard-settings-modal');
};

// Aliased for seamless backwards compatibility
window.openUserProfileModal = function() {
  window.openSettingsModal('profile');
};

/* ── 6. Section Specific Save Handlers ───────────────────── */
window.saveNotificationPreferences = function(e) {
  if (e) e.preventDefault();
  const s = window.getCoalGuardSettings();
  const getCheck = (id) => {
    const el = document.getElementById(id);
    return el ? el.checked : true;
  };

  s.notifications = {
    operational: getCheck('cg-notif-operational'),
    critical: getCheck('cg-notif-critical'),
    compliance: getCheck('cg-notif-compliance'),
    inspections: getCheck('cg-notif-inspections'),
    contracts: getCheck('cg-notif-contracts'),
    browser: getCheck('cg-notif-browser')
  };

  localStorage.setItem('coalguard_settings', JSON.stringify(s));
  window.applyCoalGuardSettings(s);
  window.showToast('✓ Notification preferences saved.', 'success');
};

window.saveApplicationPreferences = function(e) {
  if (e) e.preventDefault();
  const s = window.getCoalGuardSettings();
  const themeField = document.getElementById('cg-pref-theme');
  const langField = document.getElementById('cg-pref-lang');
  const compactField = document.getElementById('cg-pref-compact');
  const confirmField = document.getElementById('cg-pref-confirm');

  s.theme = themeField ? themeField.value : 'system';
  s.language = langField ? langField.value : 'en';
  s.compactMode = compactField ? compactField.checked : false;
  s.confirmCritical = confirmField ? confirmField.checked : true;

  localStorage.setItem('coalguard_settings', JSON.stringify(s));
  window.applyCoalGuardSettings(s);
  window.showToast('✓ Preferences saved successfully.', 'success');
};

window.saveOperationalSettings = function(e) {
  if (e) e.preventDefault();
  const s = window.getCoalGuardSettings();
  const mineField = document.getElementById('cg-op-mine');
  const dashField = document.getElementById('cg-op-dash');
  const telemField = document.getElementById('cg-op-telem');
  const autoField = document.getElementById('cg-op-autorefresh');
  const soundsField = document.getElementById('cg-op-sounds');

  s.defaultMine = mineField ? mineField.value : '';
  s.defaultDashboard = dashField ? dashField.value : 'dashboard.html';
  s.telemetryRefresh = telemField ? telemField.value : '5s';
  s.autoRefresh = autoField ? autoField.checked : true;
  s.alertSounds = soundsField ? soundsField.checked : true;

  localStorage.setItem('coalguard_settings', JSON.stringify(s));
  window.applyCoalGuardSettings(s);
  window.showToast('✓ Operational settings saved.', 'success');
};

/* ── 7. Security Helpers ─────────────────────────────────── */
window.togglePasswordChangeBox = function(force) {
  const box = document.getElementById('cg-password-change-box');
  if (!box) return;
  const isShown = box.style.display !== 'none';
  const shouldShow = (force !== undefined) ? force : !isShown;
  box.style.display = shouldShow ? 'block' : 'none';
  if (shouldShow) {
    const firstIn = box.querySelector('input');
    if (firstIn) setTimeout(() => firstIn.focus(), 100);
  }
};

window.handlePasswordChange = function(e) {
  if (e) e.preventDefault();
  const currentP = document.getElementById('cg-pwd-current')?.value;
  const newP = document.getElementById('cg-pwd-new')?.value;
  const confirmP = document.getElementById('cg-pwd-confirm')?.value;

  if (!newP || newP.length < 6) {
    window.showToast('Password must be at least 6 characters.', 'warning');
    return;
  }
  if (newP !== confirmP) {
    window.showToast('New passwords do not match.', 'danger');
    return;
  }

  // Clear form & close
  document.getElementById('cg-pwd-current').value = '';
  document.getElementById('cg-pwd-new').value = '';
  document.getElementById('cg-pwd-confirm').value = '';
  window.togglePasswordChangeBox(false);

  window.showToast('✓ Password updated successfully.', 'success');
};

window.toggleSystemInfoBox = function() {
  const box = document.getElementById('cg-sysinfo-box');
  if (!box) return;
  const isShown = box.style.display !== 'none';
  if (!isShown) {
    document.getElementById('cg-si-ua').textContent = navigator.userAgent;
    document.getElementById('cg-si-res').textContent = `${window.innerWidth} x ${window.innerHeight} (Screen: ${window.screen.width} x ${window.screen.height})`;
    document.getElementById('cg-si-time').textContent = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
};

/* ── 8. Statutory Sign Out with Confirmation ────────────── */
window.confirmSignOut = function() {
  window.closeProfileDropdown();
  window.closeModal('coalguard-settings-modal');
  window.openModal('signout-confirm-modal');
};

window.signOutCoalGuard = function() {
  window.closeModal('signout-confirm-modal');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('cg_role');
  localStorage.removeItem('cg_name');
  localStorage.removeItem('cg_ts');

  if (typeof Auth !== 'undefined') {
    if (Auth.currentUser) delete Auth.currentUser;
    if (typeof Auth.logout === 'function') {
      Auth.logout();
      return;
    }
  }
  window.location.href = 'index.html';
};

/* ── 9. Profile Dropdown Toggle Logic ───────────────────── */
window.toggleProfileDropdown = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const menu = document.getElementById('profile-dropdown-menu');
  if (!menu) return;

  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    window.closeProfileDropdown();
  } else {
    window.openProfileDropdown();
  }
};

window.toggleSidebarProfileDropdown = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const menu = document.getElementById('sidebar-profile-dropdown');
  if (!menu) return;

  const isOpen = menu.classList.contains('open');
  window.closeProfileDropdown();
  if (isOpen) {
    menu.classList.remove('open');
  } else {
    menu.classList.add('open');
  }
};

window.openProfileDropdown = function() {
  const sidebarMenu = document.getElementById('sidebar-profile-dropdown');
  if (sidebarMenu) sidebarMenu.classList.remove('open');

  const menu = document.getElementById('profile-dropdown-menu');
  const trigger = document.getElementById('header-profile-card');
  if (!menu) return;

  window.updateGlobalProfileUI();

  menu.classList.add('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
};

window.closeProfileDropdown = function() {
  const menu = document.getElementById('profile-dropdown-menu');
  const sidebarMenu = document.getElementById('sidebar-profile-dropdown');
  const trigger = document.getElementById('header-profile-card');
  if (menu) menu.classList.remove('open');
  if (sidebarMenu) sidebarMenu.classList.remove('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
};

/* ── 10. Modals Injection (Enterprise Settings) ──────────── */
function injectUserProfileModals() {
  const u = window.getCurrentUser();

  // Sign Out Confirmation Modal
  if (!document.getElementById('signout-confirm-modal')) {
    const soModal = document.createElement('div');
    soModal.id = 'signout-confirm-modal';
    soModal.className = 'modal-overlay';
    soModal.setAttribute('role', 'dialog');
    soModal.setAttribute('aria-modal', 'true');
    soModal.setAttribute('aria-labelledby', 'so-modal-title');
    soModal.innerHTML = `
      <div class="modal-card" style="max-width:440px;">
        <div class="modal-header danger-header">
          <div class="modal-title" id="so-modal-title" style="color:var(--danger);display:flex;align-items:center;gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out Confirmation
          </div>
          <button type="button" class="modal-close" onclick="window.closeModal('signout-confirm-modal')" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div style="font-size:14px;color:var(--text-primary);font-weight:700;line-height:1.4;">
            Are you sure you want to sign out?
          </div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:8px;line-height:1.5;">
            Signing out will end your current CoalGuard session and clear your active authentication tokens. You will be redirected to the secure login gateway.
          </div>
        </div>
        <div class="modal-footer" style="gap:10px;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal('signout-confirm-modal')">Cancel</button>
          <button type="button" class="btn" style="background:var(--danger);color:#FFFFFF;" onclick="window.signOutCoalGuard()">Sign Out</button>
        </div>
      </div>
    `;
    document.body.appendChild(soModal);
  }

  // Redesigned Enterprise Settings Modal (Left Nav + Right Panes)
  if (!document.getElementById('coalguard-settings-modal')) {
    const sModal = document.createElement('div');
    sModal.id = 'coalguard-settings-modal';
    sModal.className = 'modal-overlay';
    sModal.setAttribute('role', 'dialog');
    sModal.setAttribute('aria-modal', 'true');
    sModal.setAttribute('aria-labelledby', 'cg-settings-title');
    sModal.innerHTML = `
      <div class="modal-card settings-modal-card">
        <div class="modal-header">
          <div>
            <div class="modal-title" id="cg-settings-title" style="display:flex;align-items:center;gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              COALGUARD SETTINGS
            </div>
            <div class="modal-subtitle">Enterprise account credentials, user preferences & statutory operational parameters</div>
          </div>
          <button type="button" class="modal-close" onclick="window.closeModal('coalguard-settings-modal')" aria-label="Close modal">&times;</button>
        </div>

        <div class="settings-layout">
          <!-- Left-Side Navigation Sidebar -->
          <nav class="settings-nav" aria-label="Settings categories">
            <button type="button" class="settings-nav-item active" data-tab="profile" onclick="window.switchSettingsTab('profile')">
              <span class="nav-icon">👤</span> Profile
            </button>
            <button type="button" class="settings-nav-item" data-tab="security" onclick="window.switchSettingsTab('security')">
              <span class="nav-icon">🔒</span> Security
            </button>
            <button type="button" class="settings-nav-item" data-tab="notifications" onclick="window.switchSettingsTab('notifications')">
              <span class="nav-icon">🔔</span> Notifications
            </button>
            <button type="button" class="settings-nav-item" data-tab="preferences" onclick="window.switchSettingsTab('preferences')">
              <span class="nav-icon">⚙</span> Preferences
            </button>
            <button type="button" class="settings-nav-item" data-tab="operational" onclick="window.switchSettingsTab('operational')">
              <span class="nav-icon">🏭</span> Operational
            </button>
            <button type="button" class="settings-nav-item" data-tab="about" onclick="window.switchSettingsTab('about')">
              <span class="nav-icon">ℹ️</span> About
            </button>
          </nav>

          <!-- Right-Side Content Container -->
          <div class="settings-content">
            <!-- 1. PROFILE PANE -->
            <div class="settings-pane active" id="settings-pane-profile">
              <div class="settings-pane-header">
                <div class="settings-pane-title">User Profile</div>
                <div class="settings-pane-subtitle">Manage personal identity, contact details and official designation</div>
              </div>

              <!-- Avatar Row with Photo Upload -->
              <div class="settings-avatar-row">
                <div id="cg-prof-avatar-box">
                  <div class="settings-avatar-initials">${u.initials}</div>
                </div>
                <div>
                  <div id="cg-prof-display-name" style="font-size:15px;font-weight:800;color:var(--text-primary);line-height:1.2;">${u.name}</div>
                  <div id="cg-prof-display-role" style="font-size:12px;font-weight:700;color:var(--brand-primary);">${u.role}</div>
                  <div id="cg-prof-display-org" style="font-size:11px;color:var(--text-secondary);">${u.org} • Operational Command</div>
                  <div style="display:flex;gap:8px;margin-top:10px;">
                    <input type="file" id="cg-avatar-file-input" accept="image/*" style="display:none;" onchange="window.handleAvatarPhotoUpload(event)">
                    <button type="button" class="btn btn-outline" style="padding:4px 10px;font-size:11px;" onclick="document.getElementById('cg-avatar-file-input').click()">Change Photo</button>
                    <button type="button" class="btn btn-outline" style="padding:4px 10px;font-size:11px;" onclick="window.removeAvatarPhoto()">Remove</button>
                  </div>
                </div>
              </div>

              <!-- Form Fields -->
              <form onsubmit="window.saveUserProfile(event)">
                <div class="settings-section-title">
                  <span>Personal Information</span>
                </div>
                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label" for="cg-prof-name">Full Name</label>
                    <input type="text" id="cg-prof-name" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="cg-prof-email">Email Address</label>
                    <input type="email" id="cg-prof-email" class="form-input" required>
                  </div>
                </div>
                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label" for="cg-prof-phone">Phone Number</label>
                    <input type="tel" id="cg-prof-phone" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="cg-prof-id">Officer / Employee ID</label>
                    <input type="text" id="cg-prof-id" class="form-input">
                  </div>
                </div>
                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label">Organization</label>
                    <input type="text" id="cg-prof-org" class="form-input" readonly style="background:var(--bg-primary);cursor:not-allowed;color:var(--text-secondary);">
                  </div>
                  <div class="form-group">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                      <label class="form-label" style="margin-bottom:0;">Designated Role</label>
                      <span class="settings-read-only-badge">Statutory RBAC</span>
                    </div>
                    <input type="text" id="cg-prof-role" class="form-input" readonly style="background:var(--bg-primary);cursor:not-allowed;color:var(--brand-primary);font-weight:700;">
                  </div>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:16px;">
                  ℹ️ Role and access permissions are managed by the CoalGuard authorization system and DGMS statutory clearance policies.
                </div>
                <div style="display:flex;justify-content:flex-end;">
                  <button type="submit" class="btn btn-primary" style="background:var(--brand-primary);color:#FFFFFF;">Save Profile</button>
                </div>
              </form>
            </div>

            <!-- 2. SECURITY PANE -->
            <div class="settings-pane" id="settings-pane-security">
              <div class="settings-pane-header">
                <div class="settings-pane-title">Account Security</div>
                <div class="settings-pane-subtitle">Authentication credentials, active sessions and security enforcement</div>
              </div>

              <div class="settings-section-title">
                <span>Password</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--text-primary);letter-spacing:2px;">••••••••••••</div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">Last updated: 30 days ago</div>
                </div>
                <button type="button" class="btn btn-outline" onclick="window.togglePasswordChangeBox()">Change Password</button>
              </div>

              <div id="cg-password-change-box" style="display:none;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);margin-top:8px;">
                <form onsubmit="window.handlePasswordChange(event)">
                  <div class="form-group">
                    <label class="form-label" for="cg-pwd-current">Current Password</label>
                    <input type="password" id="cg-pwd-current" class="form-input" required placeholder="Enter current password">
                  </div>
                  <div class="form-row-2">
                    <div class="form-group">
                      <label class="form-label" for="cg-pwd-new">New Password</label>
                      <input type="password" id="cg-pwd-new" class="form-input" required minlength="6" placeholder="Min 6 characters">
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="cg-pwd-confirm">Confirm New Password</label>
                      <input type="password" id="cg-pwd-confirm" class="form-input" required minlength="6" placeholder="Repeat new password">
                    </div>
                  </div>
                  <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button type="button" class="btn btn-outline" onclick="window.togglePasswordChangeBox(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="background:var(--brand-primary);color:#FFFFFF;">Update Password</button>
                  </div>
                </form>
              </div>

              <div class="settings-section-title">
                <span>Two-Factor Authentication (2FA)</span>
              </div>
              <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);display:flex;align-items:flex-start;gap:12px;">
                <span style="font-size:18px;">🛡️</span>
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Hardware Security Key / TOTP</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Two-factor authentication is not available in this prototype.</div>
                </div>
              </div>

              <div class="settings-section-title">
                <span>Active Sessions</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:18px;">💻</span>
                  <div>
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                      Windows • Chrome
                      <span style="font-size:10px;font-weight:800;color:var(--success);background:var(--success-bg);padding:1px 6px;border-radius:10px;">Active now</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">Kolkata, India • IP: 127.0.0.1 (Localhost)</div>
                  </div>
                </div>
                <button type="button" class="btn btn-outline" onclick="window.showToast('No other active sessions detected.', 'info')">Sign Out Other Sessions</button>
              </div>
            </div>

            <!-- 3. NOTIFICATIONS PANE -->
            <div class="settings-pane" id="settings-pane-notifications">
              <div class="settings-pane-header">
                <div class="settings-pane-title">Notification Channels & Alerts</div>
                <div class="settings-pane-subtitle">Configure real-time statutory, operational and ground event notifications</div>
              </div>

              <form onsubmit="window.saveNotificationPreferences(event)">
                <div class="settings-section-title">
                  <span>Alert Subscriptions</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                  <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                    <div>
                      <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Operational Alerts</div>
                      <div style="font-size:11px;color:var(--text-secondary);">Production pacing, conveyor flow & shift telemetry thresholds</div>
                    </div>
                    <input type="checkbox" id="cg-notif-operational" checked style="width:18px;height:18px;cursor:pointer;">
                  </label>
                  <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                    <div>
                      <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Critical Safety Alerts</div>
                      <div style="font-size:11px;color:var(--text-secondary);">Strata slope instability, gas hazard surges & proximity radar breaches</div>
                    </div>
                    <input type="checkbox" id="cg-notif-critical" checked style="width:18px;height:18px;cursor:pointer;">
                  </label>
                  <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                    <div>
                      <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Compliance Alerts</div>
                      <div style="font-size:11px;color:var(--text-secondary);">Statutory DGMS return deadlines, environmental violations & notices</div>
                    </div>
                    <input type="checkbox" id="cg-notif-compliance" checked style="width:18px;height:18px;cursor:pointer;">
                  </label>
                  <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                    <div>
                      <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Inspection Reminders</div>
                      <div style="font-size:11px;color:var(--text-secondary);">Upcoming regional inspector rosters & statutory audit schedules</div>
                    </div>
                    <input type="checkbox" id="cg-notif-inspections" checked style="width:18px;height:18px;cursor:pointer;">
                  </label>
                  <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                    <div>
                      <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Contract Expiry Alerts</div>
                      <div style="font-size:11px;color:var(--text-secondary);">Contractor SLA milestones, insurance expiries & safety clearances</div>
                    </div>
                    <input type="checkbox" id="cg-notif-contracts" checked style="width:18px;height:18px;cursor:pointer;">
                  </label>
                </div>

                <div class="settings-section-title">
                  <span>Browser Push Notifications</span>
                </div>
                <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Desktop Browser Notifications</div>
                    <div style="font-size:11px;color:var(--text-secondary);">Receive desktop popups for critical dispatches when tab is in background</div>
                  </div>
                  <input type="checkbox" id="cg-notif-browser" style="width:18px;height:18px;cursor:pointer;">
                </label>

                <div style="display:flex;justify-content:flex-end;margin-top:16px;">
                  <button type="submit" class="btn btn-primary" style="background:var(--brand-primary);color:#FFFFFF;">Save Notifications</button>
                </div>
              </form>
            </div>

            <!-- 4. PREFERENCES PANE -->
            <div class="settings-pane" id="settings-pane-preferences">
              <div class="settings-pane-header">
                <div class="settings-pane-title">User Preferences</div>
                <div class="settings-pane-subtitle">Display aesthetics, interface density and interaction controls</div>
              </div>

              <form onsubmit="window.saveApplicationPreferences(event)">
                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label" for="cg-pref-theme">Visual Theme</label>
                    <select id="cg-pref-theme" class="form-select">
                      <option value="system">System Default (OS Synced)</option>
                      <option value="light">Light Mode (Classic Enterprise)</option>
                      <option value="dark">Dark Command Mode (High Contrast)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="cg-pref-lang">Interface Language</label>
                    <select id="cg-pref-lang" class="form-select">
                      <option value="en">English (Official)</option>
                      <option value="hi">हिन्दी (Hindi - Preview)</option>
                    </select>
                  </div>
                </div>

                <div class="settings-section-title">
                  <span>Layout & Density</span>
                </div>
                <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Compact Mode</div>
                    <div style="font-size:11px;color:var(--text-secondary);">Reduces header height and table padding for multi-monitor command desks</div>
                  </div>
                  <input type="checkbox" id="cg-pref-compact" style="width:18px;height:18px;cursor:pointer;">
                </label>

                <label class="form-checkbox-label" style="justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary);">Confirm Before Critical Actions</div>
                    <div style="font-size:11px;color:var(--text-secondary);">Requires confirmation for emergency dispatches and statutory status changes</div>
                  </div>
                  <input type="checkbox" id="cg-pref-confirm" checked style="width:18px;height:18px;cursor:pointer;">
                </label>

                <div style="display:flex;justify-content:flex-end;margin-top:16px;">
                  <button type="submit" class="btn btn-primary" style="background:var(--brand-primary);color:#FFFFFF;">Save Preferences</button>
                </div>
              </form>
            </div>

            <!-- 5. OPERATIONAL PANE -->
            <div class="settings-pane" id="settings-pane-operational">
              <div class="settings-pane-header">
                <div class="settings-pane-title">Operational Defaults</div>
                <div class="settings-pane-subtitle">Telemetry polling rates, default mine scope and dashboard routing</div>
              </div>

              <form onsubmit="window.saveOperationalSettings(event)">
                <div class="form-group">
                  <label class="form-label" for="cg-op-mine">Default Mine Scope</label>
                  <select id="cg-op-mine" class="form-select">
                    <option value="">-- No Default (Headquarters Overview) --</option>
                    <option value="Gevra OC">Gevra OC (SECL)</option>
                    <option value="Kusmunda OC">Kusmunda OC (SECL)</option>
                    <option value="Dipka OC">Dipka OC (SECL)</option>
                    <option value="Jharia Main">Jharia Main (BCCL)</option>
                    <option value="Moonidih">BCCL Moonidih (BCCL)</option>
                    <option value="Rajmahal">ECL Rajmahal (ECL)</option>
                  </select>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label" for="cg-op-dash">Default Landing Dashboard</label>
                    <select id="cg-op-dash" class="form-select">
                      <option value="dashboard.html">HQ Dashboard</option>
                      <option value="secl-zone.html">SECL Operational Zone</option>
                      <option value="dgms-portal.html">DGMS Regulatory Portal</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="cg-op-telem">Telemetry Polling Rate</label>
                    <select id="cg-op-telem" class="form-select">
                      <option value="5s">5 sec (Real-time)</option>
                      <option value="10s">10 sec</option>
                      <option value="30s">30 sec</option>
                      <option value="60s">60 sec</option>
                    </select>
                  </div>
                </div>

                <div class="settings-section-title">
                  <span>Streaming & Audio</span>
                </div>
                <div class="form-row-2">
                  <label class="form-checkbox-label" style="padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);justify-content:space-between;">
                    <div>
                      <div style="font-size:12px;font-weight:700;">Continuous Live Streaming</div>
                      <div style="font-size:10px;color:var(--text-secondary);">Auto-refresh dashboard charts</div>
                    </div>
                    <input type="checkbox" id="cg-op-autorefresh" checked style="width:16px;height:16px;cursor:pointer;">
                  </label>
                  <label class="form-checkbox-label" style="padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);justify-content:space-between;">
                    <div>
                      <div style="font-size:12px;font-weight:700;">Audible Alert Sounds</div>
                      <div style="font-size:10px;color:var(--text-secondary);">Audio cues on critical alerts</div>
                    </div>
                    <input type="checkbox" id="cg-op-sounds" checked style="width:16px;height:16px;cursor:pointer;">
                  </label>
                </div>

                <div style="display:flex;justify-content:flex-end;margin-top:16px;">
                  <button type="submit" class="btn btn-primary" style="background:var(--brand-primary);color:#FFFFFF;">Save Operational Settings</button>
                </div>
              </form>
            </div>

            <!-- 6. ABOUT PANE -->
            <div class="settings-pane" id="settings-pane-about">
              <div class="settings-pane-header">
                <div class="settings-pane-title">About CoalGuard</div>
                <div class="settings-pane-subtitle">Platform version, architecture specifications & statutory system disclosures</div>
              </div>

              <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:36px;height:36px;background:var(--brand-primary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:#FFF;font-weight:800;">CG</div>
                  <div>
                    <div style="font-size:15px;font-weight:800;color:var(--text-primary);">CoalGuard Platform</div>
                    <div style="font-size:12px;color:var(--brand-primary);font-weight:600;">Smart Mining Governance & Safety Intelligence</div>
                  </div>
                </div>
                <div class="up-detail-grid" style="margin-top:8px;">
                  <div class="up-detail-item">
                    <div class="up-detail-label">Platform Version</div>
                    <div class="up-detail-val">0.1.0 Prototype</div>
                  </div>
                  <div class="up-detail-item">
                    <div class="up-detail-label">Deployment Scope</div>
                    <div class="up-detail-val">SIH 2026 Demonstration</div>
                  </div>
                  <div class="up-detail-item">
                    <div class="up-detail-label">AI Engine</div>
                    <div class="up-detail-val">LangGraph + NVIDIA Llama</div>
                  </div>
                  <div class="up-detail-item">
                    <div class="up-detail-label">Backend Architecture</div>
                    <div class="up-detail-val">Node.js (3001) + FastAPI (8000)</div>
                  </div>
                  <div class="up-detail-item" style="grid-column:span 2;">
                    <div class="up-detail-label">Dataset Verification</div>
                    <div class="up-detail-val">DGMS Statutory Simulation Dataset (13 SECL Production Units)</div>
                  </div>
                </div>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                <div style="font-size:11px;color:var(--text-muted);">
                  ⚠️ Prototype demonstration build. Not certified for solitary statutory field clearance.
                </div>
                <button type="button" class="btn btn-outline" onclick="window.toggleSystemInfoBox()">View System Information</button>
              </div>

              <div id="cg-sysinfo-box" style="display:none;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);font-family:monospace;font-size:11px;line-height:1.6;color:var(--text-secondary);margin-top:10px;">
                <div><strong>User Agent:</strong> <span id="cg-si-ua">-</span></div>
                <div><strong>Resolution:</strong> <span id="cg-si-res">-</span></div>
                <div><strong>Local Time:</strong> <span id="cg-si-time">-</span></div>
                <div><strong>API Gateway:</strong> <span style="color:var(--success);">Connected ()</span></div>
                <div><strong>AI Analytics:</strong> <span style="color:var(--success);">Online ()</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer with Destructive Sign Out & Close -->
        <div class="settings-footer">
          <div>
            <button type="button" class="btn-danger-outline" onclick="window.confirmSignOut()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-outline" onclick="window.closeModal('coalguard-settings-modal')">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(sModal);
  }
}

/* ── 11. Mount Top-Right Profile Control ─────────────────── */
window.setupUserProfileControl = function() {
  injectUserProfileModals();

  const u = window.getCurrentUser();
  const topHeader = document.querySelector('.top-header');

  if (topHeader && !document.getElementById('header-profile-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'header-profile-wrapper';
    wrapper.id = 'header-profile-wrapper';
    wrapper.innerHTML = `
      <div class="header-profile-card" id="header-profile-card" role="button" tabindex="0" aria-haspopup="menu" aria-expanded="false" title="Account & Profile Control">
        <div class="user-avatar" style="background:var(--brand-teal)">${u.initials}</div>
        <div class="user-info">
          <div class="user-name" id="hdr-user-role">${u.role}</div>
          <div class="user-role" id="hdr-user-desc">${u.name} • ${u.org}</div>
        </div>
        <button type="button" class="profile-gear-btn" id="header-profile-gear-btn" title="System Settings" aria-label="Open Settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div class="profile-dropdown-menu" id="profile-dropdown-menu" role="menu" aria-label="User Account Menu">
        <div class="pdm-header">
          <div class="pdm-avatar">${u.initials}</div>
          <div class="pdm-user-meta">
            <div class="pdm-name">${u.name}</div>
            <div class="pdm-role">${u.role}</div>
            <div class="pdm-org">${u.org}</div>
          </div>
        </div>
        <div class="pdm-divider"></div>
        <div class="pdm-body">
          <button type="button" class="pdm-item" id="pdm-btn-profile" role="menuitem">
            <span class="pdm-icon">👤</span>
            <span>My Profile</span>
          </button>
          <button type="button" class="pdm-item" id="pdm-btn-notifs" role="menuitem">
            <span class="pdm-icon">🔔</span>
            <span>Notifications</span>
            <span class="pdm-badge pdm-notif-badge">Active</span>
          </button>
          <button type="button" class="pdm-item" id="pdm-btn-settings" role="menuitem">
            <span class="pdm-icon">⚙</span>
            <span>Settings</span>
          </button>
        </div>
        <div class="pdm-divider"></div>
        <div class="pdm-footer">
          <button type="button" class="pdm-item pdm-signout" id="pdm-btn-signout" role="menuitem">
            <span class="pdm-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;

    const emergencyBtn = topHeader.querySelector('.btn-emergency');
    if (emergencyBtn) {
      topHeader.insertBefore(wrapper, emergencyBtn);
    } else {
      topHeader.appendChild(wrapper);
    }

    const card = wrapper.querySelector('#header-profile-card');
    const gear = wrapper.querySelector('#header-profile-gear-btn');

    if (card) {
      card.addEventListener('click', (e) => {
        window.toggleProfileDropdown(e);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.toggleProfileDropdown(e);
        }
      });
    }

    if (gear) {
      gear.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.openSettingsModal();
      });
    }

    wrapper.querySelector('#pdm-btn-profile')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.openSettingsModal('profile');
    });
    wrapper.querySelector('#pdm-btn-notifs')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.openSettingsModal('notifications');
    });
    wrapper.querySelector('#pdm-btn-settings')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.openSettingsModal('preferences');
    });
    wrapper.querySelector('#pdm-btn-signout')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.confirmSignOut();
    });
  }

  // Global Outside Click and Escape Handlers
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('profile-dropdown-menu');
    const sidebarMenu = document.getElementById('sidebar-profile-dropdown');
    const wrapper = document.getElementById('header-profile-wrapper');
    const sidebarCard = document.getElementById('sidebar-user-card');

    if (menu && menu.classList.contains('open')) {
      if (!wrapper || !wrapper.contains(e.target)) {
        window.closeProfileDropdown();
      }
    }

    if (sidebarMenu && sidebarMenu.classList.contains('open')) {
      if (!sidebarCard || !sidebarCard.contains(e.target)) {
        sidebarMenu.classList.remove('open');
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeProfileDropdown();
      window.closeModal('signout-confirm-modal');
    }
  });

  // Apply persisted preferences & update UI
  window.applyCoalGuardSettings();
  window.updateGlobalProfileUI();
};

// Immediate application of theme before full DOM rendering completes
try {
  window.applyCoalGuardSettings();
} catch(e) {}


