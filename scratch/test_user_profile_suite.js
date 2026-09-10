// scratch/test_user_profile_suite.js
const { JSDOM, VirtualConsole } = require('../backend/node_modules/jsdom');

async function runUserProfileTestSuite() {
  console.log('========================================================');
  console.log(' RUNNING COALGUARD USER PROFILE & SETTINGS TEST SUITE');
  console.log('========================================================\n');

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
        // Mock matchMedia
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
    // ── TEST 1: Dashboard Profile Mount & Structure
    console.log('--- TEST 1: Top-Right Profile Control Mount on Dashboard ---');
    const page1 = await loadPage('http://localhost:3000/dashboard.html');
    const doc1 = page1.window.document;
    const win1 = page1.window;

    const wrapper = doc1.getElementById('header-profile-wrapper');
    assert(wrapper !== null, 'Header profile wrapper exists in .top-header');

    const card = doc1.getElementById('header-profile-card');
    assert(card !== null, 'Header profile card exists');
    assert(card.textContent.includes('Mine Official'), 'Card displays Role: Mine Official');
    assert(card.textContent.includes('Ranjan Kumar'), 'Card displays Name: Ranjan Kumar');
    assert(card.textContent.includes('SECL'), 'Card displays Org: SECL');
    assert(card.textContent.includes('RK'), 'Card displays Avatar initials: RK');

    const gearBtn = doc1.getElementById('header-profile-gear-btn');
    assert(gearBtn !== null, 'Independent gear button exists inside profile card');

    const dropdown = doc1.getElementById('profile-dropdown-menu');
    assert(dropdown !== null, 'Profile dropdown menu element is present');
    assert(!dropdown.classList.contains('open'), 'Profile dropdown is closed initially');

    // ── TEST 2: Toggle Dropdown on Profile Click
    console.log('\n--- TEST 2: Profile Click & Toggle Behavior ---');
    card.click();
    assert(dropdown.classList.contains('open'), 'Dropdown opens after clicking profile card');
    assert(card.getAttribute('aria-expanded') === 'true', 'aria-expanded is true when open');

    card.click();
    assert(!dropdown.classList.contains('open'), 'Dropdown closes after clicking profile card again (OPEN ↔ CLOSED)');
    assert(card.getAttribute('aria-expanded') === 'false', 'aria-expanded is false when closed');

    // ── TEST 3: Click Outside and Escape Key
    console.log('\n--- TEST 3: Click Outside & Escape Key ---');
    win1.openProfileDropdown();
    assert(dropdown.classList.contains('open'), 'Dropdown opened via openProfileDropdown()');

    // Click outside on main content
    doc1.querySelector('.page-wrapper').click();
    assert(!dropdown.classList.contains('open'), 'Dropdown closed after clicking outside');

    // Open and press Escape
    win1.openProfileDropdown();
    assert(dropdown.classList.contains('open'), 'Dropdown re-opened');
    doc1.dispatchEvent(new win1.KeyboardEvent('keydown', { key: 'Escape' }));
    assert(!dropdown.classList.contains('open'), 'Dropdown closed after pressing Escape');

    // ── TEST 4: Gear Button Independence (stopPropagation)
    console.log('\n--- TEST 4: Gear Button Opens Settings Directly Without Dropdown ---');
    const settingsModal = doc1.getElementById('coalguard-settings-modal');
    assert(settingsModal !== null, 'CoalGuard Settings modal element exists in DOM');

    gearBtn.click();
    assert(settingsModal.classList.contains('open'), 'Settings modal opened directly on gear click');
    assert(!dropdown.classList.contains('open'), 'Profile dropdown remained CLOSED when gear was clicked');
    win1.closeModal('coalguard-settings-modal');
    assert(!settingsModal.classList.contains('open'), 'Settings modal closed cleanly');

    // ── TEST 5: Sidebar User Card and Gear
    console.log('\n--- TEST 5: Sidebar User Card & Independent Gear ---');
    const sidebarCard = doc1.getElementById('sidebar-user-card');
    assert(sidebarCard !== null, 'Sidebar user card exists');
    const sidebarGear = sidebarCard.querySelector('.profile-gear-btn');
    assert(sidebarGear !== null, 'Sidebar gear button exists');

    sidebarGear.click();
    assert(settingsModal.classList.contains('open'), 'Sidebar gear opens settings modal directly without logout');
    win1.closeModal('coalguard-settings-modal');

    // ── TEST 6: My Profile View / Modal
    console.log('\n--- TEST 6: "My Profile" Modal & Dynamic Fields ---');
    const upModal = doc1.getElementById('user-profile-modal');
    assert(upModal !== null, 'User Profile modal element exists in DOM');

    win1.openProfileDropdown();
    const myProfileBtn = doc1.getElementById('pdm-btn-profile');
    assert(myProfileBtn !== null, 'Dropdown has "My Profile" item');

    myProfileBtn.click();
    assert(upModal.classList.contains('open'), 'User Profile modal opened upon clicking "My Profile"');
    assert(!dropdown.classList.contains('open'), 'Dropdown closed upon opening modal');

    const upName = doc1.getElementById('up-field-name').textContent.trim();
    const upRole = doc1.getElementById('up-field-role').textContent.trim();
    const upOrg = doc1.getElementById('up-field-org').textContent.trim();
    const upStatus = upModal.textContent;

    assert(upName === 'Ranjan Kumar', 'Profile modal Name: Ranjan Kumar');
    assert(upRole === 'Mine Official', 'Profile modal Role: Mine Official');
    assert(upOrg === 'SECL', 'Profile modal Org: SECL');
    assert(upStatus.includes('ACTIVE'), 'Profile modal displays ACCOUNT STATUS: ACTIVE');

    win1.closeModal('user-profile-modal');
    assert(!upModal.classList.contains('open'), 'User Profile modal closed cleanly');

    // ── TEST 7: Settings Form, Save & Persistence
    console.log('\n--- TEST 7: Settings Form, Persistence & Dark Theme ---');
    win1.openSettingsModal();
    assert(settingsModal.classList.contains('open'), 'Settings modal open');

    const themeSelect = doc1.getElementById('cg-set-theme');
    const notifSelect = doc1.getElementById('cg-set-notifs');
    const defaultMineSelect = doc1.getElementById('cg-set-defaultmine');
    const telemSelect = doc1.getElementById('cg-set-telem');

    assert(themeSelect !== null, 'Theme select input exists');
    assert(notifSelect !== null, 'Notifications select input exists');
    assert(defaultMineSelect !== null, 'Default mine select input exists');
    assert(telemSelect !== null, 'Telemetry select input exists');

    // Set settings values
    themeSelect.value = 'dark';
    notifSelect.value = '0'; // OFF
    defaultMineSelect.value = 'Gevra OC';
    telemSelect.value = '10s';

    // Submit settings form
    const form = settingsModal.querySelector('form');
    form.dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));

    assert(!settingsModal.classList.contains('open'), 'Settings modal closed after save');

    // Verify localStorage
    const savedRaw = win1.localStorage.getItem('coalguard_settings');
    assert(savedRaw !== null, 'coalguard_settings persisted to localStorage');
    const saved = JSON.parse(savedRaw);
    assert(saved.theme === 'dark', 'Persisted theme is dark');
    assert(saved.notifications === false, 'Persisted notifications is false (OFF)');
    assert(saved.defaultMine === 'Gevra OC', 'Persisted defaultMine is Gevra OC');
    assert(saved.telemetryRefresh === '10s', 'Persisted telemetryRefresh is 10s');

    // Verify immediate theme application
    assert(doc1.documentElement.getAttribute('data-theme') === 'dark', 'document[data-theme="dark"] applied immediately');

    // ── TEST 8: Page Reload with Saved Settings
    console.log('\n--- TEST 8: Reloading Page with Saved Settings ---');
    const page2 = await loadPage('http://localhost:3000/dashboard.html', {
      coalguard_settings: JSON.stringify(saved)
    });
    const doc2 = page2.window.document;

    assert(doc2.documentElement.getAttribute('data-theme') === 'dark', 'Dark theme persists on fresh page load');

    // ── TEST 9: Sign Out Action
    console.log('\n--- TEST 9: Sign Out Clears Authentication & Redirects ---');
    page2.window.localStorage.setItem('auth_user', JSON.stringify({ name: 'Ranjan Kumar', role: 'Mine Official' }));
    page2.window.localStorage.setItem('cg_role', 'Mine Official');
    page2.window.localStorage.setItem('cg_name', 'Ranjan Kumar');
    page2.window.localStorage.setItem('cg_ts', '123456789');

    page2.window.signOutCoalGuard();
    assert(page2.window.localStorage.getItem('auth_user') === null, 'auth_user cleared on sign out');
    assert(page2.window.localStorage.getItem('cg_role') === null, 'cg_role cleared on sign out');
    assert(page2.window.localStorage.getItem('cg_name') === null, 'cg_name cleared on sign out');
    assert(page2.window.localStorage.getItem('cg_ts') === null, 'cg_ts cleared on sign out');

    // ── TEST 10: Cross-Page Header Verification
    console.log('\n--- TEST 10: Verifying Profile Control Across All Major Pages ---');
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
      const hdrProfile = d.getElementById('header-profile-wrapper');
      const sideCard = d.getElementById('sidebar-user-card');
      const upM = d.getElementById('user-profile-modal');
      const setM = d.getElementById('coalguard-settings-modal');

      const ok = (hdrProfile !== null) && (sideCard !== null) && (upM !== null) && (setM !== null);
      assert(ok, `Page ${pg} has top profile control, sidebar card, and injected modals`);
    }

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log('\n========================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runUserProfileTestSuite();
