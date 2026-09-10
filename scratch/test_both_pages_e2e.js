const http = require('http');
const { JSDOM, VirtualConsole } = require('d:/SIH_coal_mine/backend/node_modules/jsdom');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  console.log('====================================================');
  console.log(' COALGUARD COMPREHENSIVE VERIFICATION SUITE');
  console.log(' Testing Page 1 (mine-intelligence) & Page 2 (ai-prediction)');
  console.log('====================================================\n');

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: PAGE 1 — AI STRATEGY & PRESCRIPTIONS (mine-intelligence.html)
  // ─────────────────────────────────────────────────────────────
  console.log('--- SUITE 1: Page 1 (mine-intelligence.html) ---');
  {
    const vc = new VirtualConsole();
    vc.on('error', e => console.error('  [DOM ERROR]:', e));
    
    const dom = await JSDOM.fromURL('http://localhost:3001/mine-intelligence.html', {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole: vc,
      beforeParse(w) {
        w.fetch = globalThis.fetch;
      }
    });

    await sleep(1500);
    const win = dom.window;
    const doc = win.document;

    assert(typeof win.selectMine === 'function', 'window.selectMine is exposed globally');
    assert(typeof win.triggerAIStrategy === 'function', 'window.triggerAIStrategy is exposed globally');
    assert(typeof win.analyzeRisk === 'function', 'window.analyzeRisk is exposed globally');
    assert(typeof win.exportStrategyReport === 'function', 'window.exportStrategyReport is exposed globally');

    // Test A: Mine Selection across multiple mines
    console.log('\n  [Testing Mine Selection across multiple mines]');
    await win.selectMine('Bhatdih', null, true);
    await sleep(500);
    assert(win.activeStrategicMine && win.activeStrategicMine.name.includes('Bhatdih'), 'Switched to Bhatdih mine');
    assert(decodeURIComponent(win.location.search).includes('BCCL002') || decodeURIComponent(win.location.search).includes('BCL001') || decodeURIComponent(win.location.search).includes('Bhatdih'), 'URL query parameter synchronized for Bhatdih');
    assert(doc.querySelector('.sp-title')?.textContent.includes('Bhatdih'), 'Header title shows Bhatdih');

    await win.selectMine('Jhanjra UG', null, true);
    await sleep(500);
    assert(win.activeStrategicMine && win.activeStrategicMine.name.includes('Jhanjra'), 'Switched to Jhanjra UG mine');
    assert(decodeURIComponent(win.location.search).includes('ECL001') || decodeURIComponent(win.location.search).includes('Jhanjra'), 'URL query parameter synchronized for Jhanjra');
    assert(doc.querySelector('.sp-title')?.textContent.includes('Jhanjra'), 'Header title shows Jhanjra UG');

    await win.selectMine('Kusmunda OC', null, true);
    await sleep(500);
    assert(win.activeStrategicMine && win.activeStrategicMine.name.includes('Kusmunda'), 'Switched to Kusmunda OC mine');
    assert(decodeURIComponent(win.location.search).includes('Kusmunda') || decodeURIComponent(win.location.search).includes('SECL002') || decodeURIComponent(win.location.search).includes('SECL001'), 'URL query parameter synchronized for Kusmunda');

    // Test B: Generate AI Strategy
    console.log('\n  [Testing Generate AI Strategy]');
    await win.triggerAIStrategy();
    let waited = 0;
    while (waited < 25 && doc.querySelectorAll('#prescriptions-container .prescription-card').length === 0) {
      await sleep(1000);
      waited++;
    }
    const presCards = doc.querySelectorAll('#prescriptions-container .prescription-card');
    assert(presCards.length >= 3, `Prescriptions generated successfully (found ${presCards.length} cards, waited ${waited}s)`);

    // Test C: Analyze Risk
    console.log('\n  [Testing Analyze Risk]');
    await win.analyzeRisk();
    await sleep(800);
    const riskSec = doc.getElementById('risk-analysis-section');
    assert(riskSec && riskSec.textContent.includes('AI EVALUATED'), 'Analyze Risk renders AI EVALUATED status badge');
    const riskBars = riskSec.querySelectorAll('.ra-bar-fill');
    assert(riskBars.length >= 3, `Analyze Risk renders 3 dynamic risk bars (found ${riskBars.length})`);

    // Test D: Export Strategy Report
    console.log('\n  [Testing Export Strategy Report]');
    win.exportStrategyReport();
    await sleep(400);
    const exportModal = doc.getElementById('strategy-export-modal');
    assert(exportModal && exportModal.classList.contains('active'), 'Strategy export modal opened with active class');
    const smTitle = doc.getElementById('sm-title');
    assert(smTitle && smTitle.textContent.includes('Kusmunda OC'), `Export title contains selected mine: "${smTitle?.textContent}"`);
    const presList = doc.querySelectorAll('#sm-prescriptions-list li');
    assert(presList.length >= 3, `Export report contains dynamic AI prescriptions (found ${presList.length} items)`);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: PAGE 2 — AI PREDICTION ENGINE & DIGITAL MINE TWIN (ai-prediction.html)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 2: Page 2 (ai-prediction.html) ---');
  {
    const vc = new VirtualConsole();
    vc.on('error', e => console.error('  [DOM ERROR]:', e));

    const dom = await JSDOM.fromURL('http://localhost:3001/ai-prediction.html', {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole: vc,
      beforeParse(w) {
        w.fetch = globalThis.fetch;
        // Mock standard EventSource
        w.EventSource = class {
          constructor(url) {
            this.url = url;
            setTimeout(() => {
              if (this.onmessage) {
                this.onmessage({
                  data: JSON.stringify({
                    tick: 1,
                    mine: "Kusmunda OC",
                    incident_mode: false,
                    sensors: { CH4: 0.74, CO: 18, C2H4: 0.04, C2H6: 0.6, CO2: 0.35, O2: 20.4, temp: 34.2, humidity: 65, dust: 142 },
                    combustion: { stage: 2, stage_label: "Smoldering", confidence: 88.5 }
                  })
                });
              }
            }, 50);
          }
          close() {}
          set onmessage(fn) { this._msg = fn; }
          get onmessage() { return this._msg; }
          set onerror(fn) { this._err = fn; }
        };
      }
    });

    await sleep(1500);
    const win = dom.window;
    const doc = win.document;

    // A. Mine Selector
    console.log('\n  [Testing Mine Selector]');
    assert(typeof win.changeMine === 'function', 'changeMine function exists');
    win.changeMine('Gevra OC');
    await sleep(600);
    assert(win.currentMine === 'Gevra OC', 'Active mine switched to Gevra OC');
    const dtLat = doc.getElementById('dt-lat');
    assert(dtLat && dtLat.textContent.includes('22'), `Digital Twin footer coordinates updated: ${dtLat?.textContent}`);

    // B. Pit Selector
    console.log('\n  [Testing Pit / Section Selector]');
    assert(typeof win.changePit === 'function', 'changePit function exists');
    const pitSel = doc.getElementById('pit-selector');
    assert(pitSel && pitSel.tagName === 'SELECT', 'Pit selector is interactive HTML <select> element');
    win.changePit('East Dip Panel #2');
    await sleep(400);
    const dtHeader = doc.getElementById('dt-twin-header-text');
    assert(dtHeader && dtHeader.textContent.includes('East Dip Panel #2'), `Digital Twin header synced to pit: "${dtHeader?.textContent}"`);

    // C. Refresh Sensors
    console.log('\n  [Testing Refresh Sensors]');
    assert(typeof win.fetchLiveSensors === 'function', 'fetchLiveSensors function exists');
    await win.fetchLiveSensors();
    await sleep(1200);
    const liveInd = doc.getElementById('live-indicator');
    assert(liveInd && liveInd.textContent.includes('Live'), `Live indicator updated: "${liveInd?.textContent}"`);

    // D & E. Simulate Incident & Reset Simulation
    console.log('\n  [Testing Simulate Incident & Reset Simulation]');
    assert(typeof win.triggerIncident === 'function', 'triggerIncident function exists');
    assert(typeof win.resetSimulation === 'function', 'resetSimulation function exists');

    // Trigger incident
    await win.triggerIncident();
    await sleep(900);
    assert(win.isIncidentActive === true, 'Incident active flag is true');
    const btnSim = doc.getElementById('btn-simulate');
    assert(btnSim && btnSim.textContent.includes('Reset Simulation'), `Button text changed to Reset Simulation: "${btnSim?.textContent}"`);

    // Reset simulation
    win.resetSimulation();
    assert(win.isIncidentActive === false, 'Incident active flag reset to false');
    assert(btnSim && btnSim.textContent.includes('Simulate Incident'), `Button text restored to Simulate Incident: "${btnSim?.textContent}"`);
    const plume = doc.getElementById('dt-plume');
    assert(plume && (plume.getAttribute('rx') === '90' || plume.getAttribute('rx') === '40'), 'Digital Twin plume reset to baseline radius (90)');

    // F. Emergency Dispatch
    console.log('\n  [Testing Emergency Dispatch Integration]');
    assert(typeof win.openEmergencyDispatchModal === 'function', 'openEmergencyDispatchModal exists in window');
    win.openEmergencyDispatchModal('Kusmunda OC');
    await sleep(400);
    const edModal = doc.getElementById('emergency-dispatch-modal');
    assert(edModal && edModal.classList.contains('active'), 'Emergency dispatch modal opened with active class');
    const edMine = doc.getElementById('ed-mine');
    assert(edMine && edMine.value === 'Kusmunda OC', `Mine preselected in dispatch form: "${edMine?.value}"`);
    win.closeModal('emergency-dispatch-modal');

    // G. View Strata Log
    console.log('\n  [Testing View Strata Log]');
    assert(typeof win.openStrataLogModal === 'function', 'openStrataLogModal function exists');
    await win.openStrataLogModal();
    await sleep(400);
    const slModal = doc.getElementById('strata-log-modal');
    assert(slModal && slModal.classList.contains('active'), 'Strata log modal opened with active class');
    const slProb = doc.getElementById('sl-prob');
    assert(slProb && slProb.textContent.includes('%'), `Strata log displays collapse probability: "${slProb?.textContent}"`);
    const slRows = doc.querySelectorAll('#sl-forecast-tbody tr');
    assert(slRows.length >= 5, `Strata log displays chronological 48h forecast rows (found ${slRows.length})`);
    win.closeModal('strata-log-modal');

    // H. Ventilation Optimizer
    console.log('\n  [Testing Ventilation Optimizer]');
    assert(typeof win.applyPrescription === 'function', 'applyPrescription function exists');
    await win.applyPrescription();
    await sleep(600);
    const recFan = doc.getElementById('rec-fan');
    assert(recFan && recFan.textContent.includes('%'), `Ventilation target fan updated: "${recFan?.textContent}"`);
    const fanText = doc.getElementById('fanText');
    assert(fanText && fanText.textContent.includes('m³'), `Fan delivery text updated: "${fanText?.textContent}"`);

    // Manual Ventilation Override
    console.log('\n  [Testing Manual Ventilation Override]');
    assert(typeof win.openManualVentOverride === 'function', 'openManualVentOverride function exists');
    assert(typeof win.applyManualVentOverride === 'function', 'applyManualVentOverride function exists');
    win.openManualVentOverride();
    await sleep(400);
    const mvModal = doc.getElementById('manual-vent-modal');
    assert(mvModal && mvModal.classList.contains('active'), 'Manual ventilation override modal opened with active class');
    await win.applyManualVentOverride();
    await sleep(400);
    assert(!mvModal.classList.contains('active'), 'Manual ventilation override applied and modal closed');

    // I. HEMM Predictive Maintenance Fleet
    console.log('\n  [Testing HEMM Fleet Integration]');
    assert(typeof win.updateHEMMContext === 'function', 'updateHEMMContext function exists');
    await win.updateHEMMContext('Kusmunda OC');
    await sleep(600);
    const hemmCards = doc.querySelectorAll('#hemm-fleet-container .hemm-card');
    assert(hemmCards.length >= 2, `HEMM Fleet maintenance cards rendered (found ${hemmCards.length})`);

    // J & K. Spontaneous Combustion & Digital Twin Toggle
    console.log('\n  [Testing Digital Twin Baseline / Fan Toggle & Action Plan]');
    assert(typeof win.switchDT === 'function', 'switchDT exists');
    win.switchDT('fan');
    assert(doc.getElementById('btnFan')?.classList.contains('active'), 'switchDT("fan") activates fan button');
    win.switchDT('baseline');
    assert(doc.getElementById('btnBaseline')?.classList.contains('active'), 'switchDT("baseline") activates baseline button');

    win.openActionPlanModal();
    await sleep(300);
    const apModal = doc.getElementById('action-plan-modal');
    assert(apModal && apModal.classList.contains('active'), 'Action plan modal opened');
    win.executeActionPlan();
    await sleep(300);
    assert(!apModal.classList.contains('active'), 'Action plan executed and modal dismissed');
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
