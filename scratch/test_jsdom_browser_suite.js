// scratch/test_jsdom_browser_suite.js
const { JSDOM, VirtualConsole } = require('../backend/node_modules/jsdom');

async function testJSDOM() {
  console.log('========================================================');
  console.log(' RUNNING FULL JSDOM REAL-PAGE BROWSER VALIDATION SUITE');
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

  async function loadPage(urlStr) {
    const consoleLogs = [];
    const consoleErrors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('log', (...args) => consoleLogs.push(args.join(' ')));
    virtualConsole.on('error', (...args) => consoleErrors.push(args.join(' ')));
    virtualConsole.on('jsdomError', (err) => consoleErrors.push(err.message || String(err)));

    const dom = await JSDOM.fromURL(urlStr, {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole
    });

    // Provide native Node fetch to JSDOM window
    dom.window.fetch = globalThis.fetch;

    // Allow scripts and resources to settle
    await new Promise(r => setTimeout(r, 600));

    return { dom, window: dom.window, consoleLogs, consoleErrors };
  }

  // ── TEST 1: Dashboard Navigation Simulation (Gevra OC Alert -> Review Click)
  console.log('--- TEST 1: Review Click Navigation with Gevra OC ---');
  const page1 = await loadPage('http://localhost:3000/mine-intelligence.html?mine=SECL001&alert=ALT-SECL001');
  const doc1 = page1.window.document;
  const panel1 = doc1.getElementById('strategyPanel');

  assert(panel1 !== null, 'Right-side strategyPanel element exists');
  assert(panel1.innerHTML.trim().length > 100, 'Right-side panel is NOT blank');
  assert(panel1.querySelector('.sp-title')?.textContent.trim() === 'Gevra OC', 'Header displays mine name: Gevra OC');
  assert(panel1.textContent.includes('SECL'), 'Displays subsidiary: SECL');
  assert(panel1.textContent.includes('Opencast'), 'Displays category: Opencast');

  // Active Alert card verification
  const alertCard = panel1.querySelector('.active-alert-card');
  assert(alertCard !== null, 'Active Alert card is rendered prominently');
  assert(alertCard.textContent.includes('HIGH RISK'), 'Alert severity badge is HIGH RISK');
  assert(
    alertCard.textContent.includes('Unprecedented scale requires extreme HEMM traffic control via OITDS'),
    'Alert title contains: "Unprecedented scale requires extreme HEMM traffic control via OITDS"'
  );
  assert(alertCard.textContent.includes('Detected: 46 minutes ago'), 'Alert timestamp is "Detected: 46 minutes ago"');

  // Strategic Profile & Risk Analysis
  assert(panel1.textContent.includes('Strategic Profile'), 'Strategic Profile section is present');
  assert(panel1.textContent.includes('Risk Analysis'), 'Risk Analysis section is present');
  assert(panel1.textContent.includes('Safety Risk') && panel1.textContent.includes('Production Risk') && panel1.textContent.includes('Compliance Risk'), 'Safety, Production, and Compliance risk bars are rendered');
  
  // Key Factors
  assert(panel1.textContent.includes('Key Factors'), 'Key Factors section is present');
  assert(panel1.textContent.includes('🔴') && panel1.textContent.includes('🟠') && panel1.textContent.includes('🟡'), 'Key factors severity markers present');

  // Operational Metrics
  assert(panel1.textContent.includes('Operational Metrics'), 'Operational Metrics grid is present');
  assert(panel1.textContent.includes('Surface Miner + Shovel-Dumper'), 'Displays mechanization type');

  // AI Strategy Section Pre-generation State
  assert(panel1.textContent.includes('AI Strategy: No strategy generated yet.'), 'Pre-generation state shown: "No strategy generated yet."');
  const genBtn = Array.from(panel1.querySelectorAll('button')).find(b => b.textContent.includes('Generate AI Strategy') || b.textContent.includes('Generate Strategy'));
  assert(genBtn !== undefined, 'Generate AI Strategy button is rendered and clickable');

  // Left panel active selection
  const activeMineItem = doc1.querySelector('.mine-item.active');
  assert(activeMineItem !== null && activeMineItem.textContent.includes('Gevra OC'), 'Gevra OC is selected and highlighted in left mine list');

  // Test AI Strategy Generation execution
  console.log('\n--- TEST 2: Invoke Generate AI Strategy (Calling localhost:8000) ---');
  page1.window.triggerAIStrategy();

  // Wait for fetch to complete from uvicorn
  let attempts = 0;
  let hasPrescriptions = false;
  while (attempts < 25) {
    await new Promise(r => setTimeout(r, 200));
    const container = doc1.getElementById('prescriptions-container');
    if (container && container.querySelector('.prescription-card')) {
      hasPrescriptions = true;
      break;
    }
    attempts++;
  }

  assert(hasPrescriptions, 'Real Python FastAPI AI Engine returned prescriptions rendered into UI cards');
  const pCards = doc1.querySelectorAll('.prescription-card');
  assert(pCards.length >= 3, `Prescription cards rendered (count: ${pCards.length})`);
  assert(doc1.getElementById('prescriptions-container').textContent.includes('Statutory Risk Mitigation') || doc1.getElementById('prescriptions-container').textContent.includes('Immediate Safety Protocol'), 'Contains safety mitigation prescription');

  // ── TEST 3: State A - Direct Navigation (No Params)
  console.log('\n--- TEST 3: State A Direct Navigation (No Query Params) ---');
  const pageA = await loadPage('http://localhost:3000/mine-intelligence.html');
  const panelA = pageA.window.document.getElementById('strategyPanel');
  assert(panelA.innerHTML.trim().length > 50, 'Right panel is NOT blank in State A');
  assert(
    panelA.textContent.includes('Select a mine to view operational intelligence'),
    'Displays "Select a mine to view operational intelligence"'
  );
  assert(pageA.window.document.querySelector('.mine-item.active') === null, 'No mine selected in left list initially');

  // ── TEST 4: Other Mines (Kusmunda OC & Dipka OC)
  console.log('\n--- TEST 4: Navigation to Kusmunda OC and Dipka OC ---');
  const pageKus = await loadPage('http://localhost:3000/mine-intelligence.html?mine=SECL002&alert=ALT-SECL002');
  assert(pageKus.window.document.getElementById('strategyPanel').textContent.includes('Kusmunda OC'), 'Kusmunda OC loads cleanly via ?mine=SECL002');

  const pageDip = await loadPage('http://localhost:3000/mine-intelligence.html?mine=SECL003&alert=ALT-SECL003');
  assert(pageDip.window.document.getElementById('strategyPanel').textContent.includes('Dipka OC'), 'Dipka OC loads cleanly via ?mine=SECL003');

  // ── TEST 5: Error Handling: Invalid Mine
  console.log('\n--- TEST 5: Error Handling - Invalid Mine ID ---');
  const pageInvalidMine = await loadPage('http://localhost:3000/mine-intelligence.html?mine=INVALID_MINE_404');
  const panelInv = pageInvalidMine.window.document.getElementById('strategyPanel');
  assert(panelInv.textContent.includes('Mine not found'), 'Displays "Mine not found" message');
  assert(panelInv.textContent.includes('Return to Mine Intelligence'), 'Displays return button');
  assert(!panelInv.textContent.includes('undefined'), 'No crash or undefined state');

  // ── TEST 6: Error Handling: Invalid Alert ID
  console.log('\n--- TEST 6: Error Handling - Invalid Alert ID ---');
  const pageInvalidAlert = await loadPage('http://localhost:3000/mine-intelligence.html?mine=SECL001&alert=INVALID_ALERT_999');
  const panelInvAlert = pageInvalidAlert.window.document.getElementById('strategyPanel');
  assert(panelInvAlert.textContent.includes('Alert information unavailable.'), 'Displays "Alert information unavailable."');
  assert(panelInvAlert.textContent.includes('Gevra OC') && panelInvAlert.textContent.includes('Risk Analysis'), 'Still renders Gevra OC operational intelligence below banner');

  // Check console errors across pages
  console.log('\n--- TEST 7: Console Error Audit ---');
  assert(page1.consoleErrors.length === 0, `Page 1 console error count: ${page1.consoleErrors.length}`);
  assert(pageA.consoleErrors.length === 0, `Page A console error count: ${pageA.consoleErrors.length}`);
  assert(pageInvalidMine.consoleErrors.length === 0, `Invalid mine console error count: ${pageInvalidMine.consoleErrors.length}`);

  console.log(`\n========================================================`);
  console.log(` JSDOM TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================================\n`);

  if (failed > 0) process.exit(1);
}

testJSDOM().catch(err => {
  console.error('Fatal error in test:', err);
  process.exit(1);
});
