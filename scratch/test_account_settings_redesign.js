// scratch/test_account_settings_redesign.js
const { JSDOM, VirtualConsole } = require('../backend/node_modules/jsdom');

async function runAccountSettingsRedesignTestSuite() {
  console.log('========================================================================');
  console.log(' RUNNING COALGUARD ENTERPRISE ACCOUNT SETTINGS REDESIGN TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, name, detail = '') {
    if (cond) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  async function loadPage(urlStr, initialLocalStorage = {}) {
    const consoleLogs = [];
    const consoleErrors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('log', (...args) => consoleLogs.push(args.join(' ')));
    virtualConsole.on('error', (...args) => consoleErrors.push(args.join(' ')));
    virtualConsole.on('jsdomError', (err) => consoleErrors.push(err.message || String(err)));

    const dom = await JSDOM.fromURL(urlStr, {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole,
      beforeParse(window) {
        window.matchMedia = window.matchMedia || function() {
          return {
            matches: false,
            addListener: function() {},
            removeListener: function() {},
            addEventListener: function() {},
            removeEventListener: function() {}
          };
        };

        // Populate initial localStorage if provided
        for (const [k, v] of Object.entries(initialLocalStorage)) {
          window.localStorage.setItem(k, v);
        }
      }
    });

    dom.window.fetch = globalThis.fetch;
    await new Promise(r => setTimeout(r, 600));

    return { dom, window: dom.window, consoleLogs, consoleErrors };
  }

  try {
    // ── TEST 1: Settings Modal Presence & 6-Tab Left Navigation Structure
    console.log('--- TEST 1: Tabbed Left-Navigation Structure in Modal ---');
    const page1 = await loadPage('http://localhost:3000/dashboard.html');
    const doc1 = page1.window.document;
    const win1 = page1.window;

    const settingsModal = doc1.getElementById('coalguard-settings-modal');
    assert(settingsModal !== null, 'CoalGuard Settings modal element exists');

    const navItems = settingsModal.querySelectorAll('.settings-nav-item');
    assert(navItems.length === 6, 'Settings navigation contains exactly 6 sections');

    const expectedTabs = ['profile', 'security', 'notifications', 'preferences', 'operational', 'about'];
    const actualTabs = Array.from(navItems).map(el => el.getAttribute('data-tab'));
    assert(
      JSON.stringify(actualTabs) === JSON.stringify(expectedTabs),
      'Navigation tabs match required order: Profile, Security, Notifications, Preferences, Operational, About',
      `Found: ${actualTabs.join(', ')}`
    );

    // Verify default active tab is 'profile'
    const activeNav = settingsModal.querySelector('.settings-nav-item.active');
    assert(activeNav && activeNav.getAttribute('data-tab') === 'profile', 'Default active navigation tab is "profile"');
    const activePane = settingsModal.querySelector('.settings-pane.active');
    assert(activePane && activePane.id === 'settings-pane-profile', 'Default active content pane is #settings-pane-profile');

    // ── TEST 2: Tab Switching Behavior
    console.log('\n--- TEST 2: Switching Between Tabs ---');
    win1.switchSettingsTab('security');
    assert(
      doc1.querySelector('.settings-nav-item.active').getAttribute('data-tab') === 'security' &&
      doc1.getElementById('settings-pane-security').classList.contains('active') &&
      !doc1.getElementById('settings-pane-profile').classList.contains('active'),
      'switchSettingsTab("security") switches nav and pane'
    );

    win1.switchSettingsTab('operational');
    assert(
      doc1.querySelector('.settings-nav-item.active').getAttribute('data-tab') === 'operational' &&
      doc1.getElementById('settings-pane-operational').classList.contains('active'),
      'switchSettingsTab("operational") switches nav and pane'
    );

    // ── TEST 3: Top-Right Profile Dropdown Triggers Deep-Linking
    console.log('\n--- TEST 3: Profile Dropdown Deep-Linking to Tabs ---');
    const profileCard = doc1.getElementById('header-profile-card');
    const dropdown = doc1.getElementById('profile-dropdown-menu');

    // Click profile to open dropdown
    profileCard.click();
    assert(dropdown.classList.contains('open'), 'Profile dropdown opens on profile card click');

    // Click "My Profile"
    const myProfileBtn = doc1.getElementById('pdm-btn-profile');
    assert(myProfileBtn !== null, 'Dropdown has "My Profile" option');
    myProfileBtn.click();
    assert(settingsModal.classList.contains('open'), 'Settings modal opens when "My Profile" is clicked');
    assert(
      doc1.querySelector('.settings-nav-item.active').getAttribute('data-tab') === 'profile' &&
      doc1.getElementById('settings-pane-profile').classList.contains('active'),
      '"My Profile" deep-links directly to "profile" tab'
    );
    assert(!dropdown.classList.contains('open'), 'Dropdown closes when modal opens');
    win1.closeModal('coalguard-settings-modal');

    // Click "Notifications" from dropdown
    profileCard.click();
    const notifBtn = doc1.getElementById('pdm-btn-notifs');
    assert(notifBtn !== null, 'Dropdown has "Notifications" option');
    notifBtn.click();
    assert(settingsModal.classList.contains('open'), 'Settings modal opens from dropdown Notifications');
    assert(
      doc1.querySelector('.settings-nav-item.active').getAttribute('data-tab') === 'notifications' &&
      doc1.getElementById('settings-pane-notifications').classList.contains('active'),
      '"Notifications" deep-links directly to "notifications" tab'
    );
    win1.closeModal('coalguard-settings-modal');

    // Click "Settings" from dropdown
    profileCard.click();
    const settingsBtn = doc1.getElementById('pdm-btn-settings');
    assert(settingsBtn !== null, 'Dropdown has "Settings" option');
    settingsBtn.click();
    assert(settingsModal.classList.contains('open'), 'Settings modal opens from dropdown Settings');
    assert(
      doc1.querySelector('.settings-nav-item.active').getAttribute('data-tab') === 'preferences' &&
      doc1.getElementById('settings-pane-preferences').classList.contains('active'),
      '"Settings" deep-links to "preferences" tab'
    );
    win1.closeModal('coalguard-settings-modal');

    // ── TEST 4: Direct Gear Button Click
    console.log('\n--- TEST 4: Direct Gear Button Click Opens Settings Directly ---');
    const gearBtn = doc1.getElementById('header-profile-gear-btn');
    gearBtn.click();
    assert(settingsModal.classList.contains('open'), 'Gear button opens Settings modal directly');
    assert(!dropdown.classList.contains('open'), 'Dropdown did NOT open when clicking gear');
    win1.closeModal('coalguard-settings-modal');

    // ── TEST 5: Profile Section: Form Fields, Read-Only Role & RBAC Note
    console.log('\n--- TEST 5: Profile Section Form Fields & RBAC Read-Only Role ---');
    win1.openSettingsModal('profile');

    const nameInput = doc1.getElementById('cg-prof-name');
    const emailInput = doc1.getElementById('cg-prof-email');
    const phoneInput = doc1.getElementById('cg-prof-phone');
    const orgInput = doc1.getElementById('cg-prof-org');
    const roleInput = doc1.getElementById('cg-prof-role');
    const idInput = doc1.getElementById('cg-prof-id');

    assert(nameInput !== null && nameInput.value === 'Ranjan Kumar', 'Full Name field is populated');
    assert(emailInput !== null && emailInput.value === 'ranjan.kumar@secl.gov.in', 'Email field is populated');
    assert(phoneInput !== null && phoneInput.value === '+91 7752 246300', 'Phone field is populated');
    assert(orgInput !== null && orgInput.readOnly && orgInput.value === 'SECL', 'Organization is SECL and read-only');
    assert(roleInput !== null && roleInput.readOnly && roleInput.value === 'Mine Official', 'Role is Mine Official and read-only');
    assert(idInput !== null && idInput.value === 'SECL-HQ-DIR-2024-089', 'Employee/Officer ID is populated');

    // Statutory RBAC explanation
    const profilePane = doc1.getElementById('settings-pane-profile');
    assert(
      profilePane.textContent.includes('Role and access permissions are managed by the CoalGuard authorization system'),
      'Statutory note present explaining role is managed by CoalGuard authorization system'
    );

    // ── TEST 6: Profile Editing, Save & Immediate Header Synchronization
    console.log('\n--- TEST 6: Profile Save & Immediate Header Synchronization ---');
    nameInput.value = 'Ranjan K. Verma';
    emailInput.value = 'r.verma@secl.gov.in';
    phoneInput.value = '+91 7752 999888';
    idInput.value = 'SECL-HQ-OFFICER-999';

    // Submit profile form
    const profForm = profilePane.querySelector('form');
    profForm.dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));

    // Check localStorage persistence
    const savedUser = JSON.parse(win1.localStorage.getItem('auth_user'));
    assert(savedUser.name === 'Ranjan K. Verma', 'localStorage.auth_user name updated to "Ranjan K. Verma"');
    assert(savedUser.email === 'r.verma@secl.gov.in', 'localStorage.auth_user email updated');
    assert(savedUser.officerId === 'SECL-HQ-OFFICER-999', 'localStorage.auth_user officerId updated');
    assert(win1.localStorage.getItem('cg_name') === 'Ranjan K. Verma', 'localStorage.cg_name updated');

    // Check immediate live update of top-right header and sidebar
    const updatedHeader = doc1.getElementById('header-profile-card');
    assert(
      updatedHeader.textContent.includes('Ranjan K. Verma'),
      'Top-right header immediately displays updated name without browser reload'
    );
    assert(
      updatedHeader.textContent.includes('RV'),
      'Top-right avatar initials immediately reflect new initials "RV"'
    );

    const updatedSidebar = doc1.getElementById('sidebar-user-card');
    assert(
      updatedSidebar.textContent.includes('Ranjan K. Verma'),
      'Sidebar card immediately displays updated name'
    );

    // ── TEST 7: Security Section: Password Change & Truthful 2FA
    console.log('\n--- TEST 7: Security Section & Truthful 2FA ---');
    win1.switchSettingsTab('security');

    // Check 2FA truthfulness
    const secPane = doc1.getElementById('settings-pane-security');
    assert(
      secPane.textContent.includes('Two-factor authentication is not available in this prototype'),
      '2FA truthfully states it is not available in this prototype (no fake toggles)'
    );

    // Active session details
    assert(
      secPane.textContent.includes('Windows • Chrome') && secPane.textContent.includes('Active now'),
      'Active session indicates Windows • Chrome • Active now'
    );

    // Password change box toggle
    const pwBox = doc1.getElementById('cg-password-change-box');
    assert(pwBox.style.display === 'none', 'Password change accordion is initially hidden');
    win1.togglePasswordChangeBox();
    assert(pwBox.style.display === 'block', 'togglePasswordChangeBox() expands password change form');

    // Password validation - mismatch
    doc1.getElementById('cg-pwd-current').value = 'password123';
    doc1.getElementById('cg-pwd-new').value = 'NewPassword456!';
    doc1.getElementById('cg-pwd-confirm').value = 'MismatchPassword';
    
    // We can spy on showToast
    let lastToast = null;
    const origToast = win1.showToast;
    win1.showToast = (msg, type) => { lastToast = { msg, type }; origToast(msg, type); };

    win1.handlePasswordChange();
    assert(
      lastToast && lastToast.msg.includes('do not match'),
      'Password mismatch correctly triggers warning/error feedback'
    );

    // Password validation - valid match
    doc1.getElementById('cg-pwd-confirm').value = 'NewPassword456!';
    win1.handlePasswordChange();
    assert(
      lastToast && lastToast.msg.includes('updated successfully'),
      'Matching valid password triggers success feedback'
    );
    assert(pwBox.style.display === 'none', 'Password box automatically closes on success');
    win1.showToast = origToast; // restore

    // ── TEST 8: Notifications Section: Granular Toggles & showToast Behavior
    console.log('\n--- TEST 8: Granular Notification Toggles & Real showToast Filtering ---');
    win1.switchSettingsTab('notifications');

    const notifPane = doc1.getElementById('settings-pane-notifications');
    const notifForm = notifPane.querySelector('form');
    assert(notifForm !== null, 'Notifications form exists');

    const chkOper = doc1.getElementById('cg-notif-operational');
    const chkSafety = doc1.getElementById('cg-notif-critical');
    const chkCompliance = doc1.getElementById('cg-notif-compliance');
    const chkInspection = doc1.getElementById('cg-notif-inspections');
    const chkContract = doc1.getElementById('cg-notif-contracts');
    const chkBrowser = doc1.getElementById('cg-notif-browser');

    assert(chkOper !== null && chkSafety !== null && chkCompliance !== null, 'Granular category checkboxes exist');
    assert(chkInspection !== null && chkContract !== null && chkBrowser !== null, 'Inspection, contract, and browser checkboxes exist');

    // Turn OFF operational alerts, keep safety ON
    chkOper.checked = false;
    chkSafety.checked = true;
    notifForm.dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));

    // Verify persistence
    const savedSettings = JSON.parse(win1.localStorage.getItem('coalguard_settings'));
    assert(savedSettings.notifications.operational === false, 'Operational notifications saved as false (OFF)');
    assert(savedSettings.notifications.critical === true, 'Critical safety notifications saved as true (ON)');

    // Test showToast filtering behavior
    const initialToasts = doc1.querySelectorAll('.toast, #toast-container > div').length;
    win1.showToast('Test operational message', 'info'); // should be silenced because operational is false
    const toastsAfterInfo = doc1.querySelectorAll('.toast, #toast-container > div').length;
    assert(toastsAfterInfo === initialToasts, 'Operational/info toast was silenced because operational toggle is OFF');

    win1.showToast('Test critical safety alert', 'danger'); // should display because critical is true
    const toastsAfterSafety = doc1.querySelectorAll('.toast, #toast-container > div').length;
    assert(toastsAfterSafety === initialToasts + 1, 'Safety/danger toast was shown because safety toggle is ON');

    // ── TEST 9: Preferences Section: Theme & Compact Mode Application
    console.log('\n--- TEST 9: Preferences: Theme & Compact Mode Application ---');
    win1.switchSettingsTab('preferences');

    const prefPane = doc1.getElementById('settings-pane-preferences');
    const prefForm = prefPane.querySelector('form');
    const themeSel = doc1.getElementById('cg-pref-theme');
    const langSel = doc1.getElementById('cg-pref-lang');
    const compactChk = doc1.getElementById('cg-pref-compact');
    const confirmChk = doc1.getElementById('cg-pref-confirm');

    assert(themeSel !== null && langSel !== null && compactChk !== null && confirmChk !== null, 'Preferences controls exist');

    // Enable Dark Command Mode and Compact Mode
    themeSel.value = 'dark';
    compactChk.checked = true;
    prefForm.dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));

    // Verify attribute on documentElement and body
    assert(doc1.documentElement.getAttribute('data-theme') === 'dark', 'Dark theme applied to documentElement');
    assert(doc1.body.classList.contains('compact-mode'), 'body.compact-mode class applied for dense command desk view');

    // Verify persistence
    const savedSettings2 = JSON.parse(win1.localStorage.getItem('coalguard_settings'));
    assert(savedSettings2.theme === 'dark', 'Theme saved as "dark"');
    assert(savedSettings2.compactMode === true, 'Compact Mode saved as true');

    // ── TEST 10: Operational Settings Section
    console.log('\n--- TEST 10: Operational Settings Section ---');
    win1.switchSettingsTab('operational');

    const operPane = doc1.getElementById('settings-pane-operational');
    const operForm = operPane.querySelector('form');
    const defMine = doc1.getElementById('cg-op-mine');
    const defDash = doc1.getElementById('cg-op-dash');
    const telem = doc1.getElementById('cg-op-telem');
    const autoRef = doc1.getElementById('cg-op-autorefresh');
    const sounds = doc1.getElementById('cg-op-sounds');

    assert(defMine !== null && defDash !== null && telem !== null && autoRef !== null && sounds !== null, 'All operational controls exist');

    defMine.value = 'Kusmunda OC';
    defDash.value = 'secl-zone.html';
    telem.value = '10s';
    autoRef.checked = true;
    sounds.checked = false;
    operForm.dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));

    const savedSettings3 = JSON.parse(win1.localStorage.getItem('coalguard_settings'));
    assert(savedSettings3.defaultMine === 'Kusmunda OC', 'Default mine saved as "Kusmunda OC"');
    assert(savedSettings3.defaultDashboard === 'secl-zone.html', 'Default dashboard saved as "secl-zone.html"');
    assert(savedSettings3.telemetryRefresh === '10s', 'Telemetry refresh saved as "10s"');
    assert(savedSettings3.alertSounds === false, 'Alert sounds saved as false');

    // ── TEST 11: About Section: Truthful Specifications & Diagnostics Toggle
    console.log('\n--- TEST 11: About Section Specifications & Diagnostics ---');
    win1.switchSettingsTab('about');
    const aboutPane = doc1.getElementById('settings-pane-about');

    assert(aboutPane.textContent.includes('0.1.0 Prototype'), 'Version 0.1.0 Prototype is listed');
    assert(aboutPane.textContent.includes('SIH 2026 Demonstration'), 'Environment SIH 2026 Demo is listed');
    assert(aboutPane.textContent.includes('LangGraph + NVIDIA Llama'), 'AI Engine LangGraph + NVIDIA Llama is listed');
    assert(aboutPane.textContent.includes('Node.js (3001) + FastAPI (8000)'), 'Backend Node.js + Python FastAPI is listed');
    assert(aboutPane.textContent.includes('DGMS Statutory Simulation Dataset'), 'Simulation / Prototype Dataset is listed');

    const diagBox = doc1.getElementById('cg-sysinfo-box');
    assert(diagBox.style.display === 'none', 'System diagnostics box is initially hidden');
    win1.toggleSystemInfoBox();
    assert(diagBox.style.display === 'block', 'toggleSystemInfoBox() reveals detailed diagnostics');

    // ── TEST 12: Sign Out Flow: Visual Separation, Confirmation Dialog & Session Termination
    console.log('\n--- TEST 12: Sign Out Confirmation & Session Termination ---');
    const signOutBtn = settingsModal.querySelector('.btn-danger-outline');
    assert(signOutBtn !== null, 'Sign Out button exists in Settings modal footer with danger styling');

    // Click Sign Out
    signOutBtn.click();
    const signoutModal = doc1.getElementById('signout-confirm-modal');
    assert(signoutModal !== null, 'Sign out confirmation modal exists');
    assert(signoutModal.classList.contains('open'), 'Confirmation modal opens on clicking Sign Out');
    assert(signoutModal.textContent.includes('Are you sure you want to sign out?'), 'Confirmation dialog prompts: "Are you sure you want to sign out?"');

    // Cancel confirmation
    const cancelBtn = signoutModal.querySelector('.btn-outline');
    cancelBtn.click();
    assert(!signoutModal.classList.contains('open'), 'Clicking Cancel closes confirmation modal without logging out');
    assert(win1.localStorage.getItem('auth_user') !== null, 'Session remains active after cancelling');

    // Confirm Sign Out
    win1.confirmSignOut();
    assert(signoutModal.classList.contains('open'), 'Confirmation modal re-opened');
    win1.signOutCoalGuard();

    assert(win1.localStorage.getItem('auth_user') === null, 'auth_user cleared from localStorage');
    assert(win1.localStorage.getItem('cg_role') === null, 'cg_role cleared from localStorage');
    assert(win1.localStorage.getItem('cg_name') === null, 'cg_name cleared from localStorage');
    assert(win1.localStorage.getItem('cg_ts') === null, 'cg_ts session timestamp cleared');

    // ── TEST 13: Cross-Page Modal Verification Across All 12 CoalGuard Pages
    console.log('\n--- TEST 13: Cross-Page Modal Verification Across All 12 Pages ---');
    const pagesToTest = [
      'dashboard.html',
      'secl-zone.html',
      'dgms-portal.html',
      'mine-intelligence.html',
      'analytics.html',
      'gis-map.html',
      'reports.html',
      'contractors.html',
      'inspections.html',
      'compliance.html',
      'field-reports.html',
      'ai-prediction.html'
    ];

    for (const pg of pagesToTest) {
      const p = await loadPage(`http://localhost:3000/${pg}`);
      const d = p.window.document;
      const hdr = d.getElementById('header-profile-wrapper');
      const setM = d.getElementById('coalguard-settings-modal');
      const soM = d.getElementById('signout-confirm-modal');
      const navs = setM ? setM.querySelectorAll('.settings-nav-item').length : 0;

      const ok = (hdr !== null) && (setM !== null) && (soM !== null) && (navs === 6);
      assert(ok, `Page ${pg} has top profile control, 6-tab enterprise settings modal, and signout confirmation dialog`);
    }

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAccountSettingsRedesignTestSuite();
