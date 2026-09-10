// scratch/test_mine_intelligence_dom.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createDOMMock(url = 'http://localhost:3000/mine-intelligence.html') {
  const parsedUrl = new URL(url);
  const elements = {};

  class MockElement {
    constructor(tagName, id = '') {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.className = '';
      this.classList = {
        classes: new Set(),
        add: (c) => this.classList.classes.add(c),
        remove: (c) => this.classList.classes.delete(c),
        contains: (c) => this.classList.classes.has(c)
      };
      this.children = [];
      this.innerHTML = '';
      this.textContent = '';
      this.value = '';
      this.dataset = {};
      this.eventListeners = {};
    }

    appendChild(child) {
      this.children.push(child);
      return child;
    }

    addEventListener(event, handler) {
      if (!this.eventListeners[event]) this.eventListeners[event] = [];
      this.eventListeners[event].push(handler);
    }

    dispatchEvent(event, ...args) {
      if (this.eventListeners[event]) {
        this.eventListeners[event].forEach(h => h(...args));
      }
    }

    scrollIntoView() {}
  }

  function getElementById(id) {
    if (!elements[id]) {
      elements[id] = new MockElement('div', id);
    }
    return elements[id];
  }

  // Pre-seed known elements
  getElementById('mineList');
  getElementById('mineSearch');
  const sp = getElementById('strategyPanel');
  const pc = getElementById('prescriptions-container');

  const doc = {
    getElementById,
    createElement: (tag) => new MockElement(tag),
    querySelectorAll: (sel) => {
      if (sel === '.mine-item') {
        const ml = elements['mineList'];
        return ml ? ml.children : [];
      }
      return [];
    },
    addEventListener: (event, handler) => {
      if (event === 'DOMContentLoaded') {
        doc._onReady = handler;
      }
    }
  };

  const win = {
    location: {
      search: parsedUrl.search,
      pathname: parsedUrl.pathname,
      href: url
    },
    history: {
      pushState: () => {},
      replaceState: () => {}
    },
    openModal: () => {},
    closeModal: () => {},
    print: () => {}
  };

  return { doc, win, elements };
}

function runMineIntelligence(url) {
  const { doc, win, elements } = createDOMMock(url);
  const minesDbContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'mines-db.js'), 'utf8');
  const mineIntelHtml = fs.readFileSync(path.join(__dirname, '..', 'mine-intelligence.html'), 'utf8');

  // Extract <script>...</script>
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
  let match;
  let inlineScript = '';
  while ((match = scriptRegex.exec(mineIntelHtml)) !== null) {
    if (match[1].includes('document.addEventListener')) {
      inlineScript = match[1];
    }
  }

  const sandbox = {
    window: win,
    document: doc,
    URLSearchParams: URLSearchParams,
    console: console,
    Math: Math,
    Date: Date,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    fetch: async () => ({
      ok: true,
      json: async () => ({
        prescriptions: [
          { type: 'Immediate Safety Protocol', color: 'var(--danger)', bg: 'var(--danger-bg)', text: 'Mitigate risk.' },
          { type: 'HEMM Traffic & OITDS Routing', color: 'var(--amber)', bg: '#FEF3C7', text: 'Optimize traffic.' },
          { type: 'Production Optimization', color: 'var(--success)', bg: 'var(--success-bg)', text: 'Enhance production.' }
        ]
      })
    })
  };

  vm.createContext(sandbox);
  // 1. Run mines-db.js
  vm.runInContext(minesDbContent + '\nwindow.REAL_MINES = REAL_MINES;', sandbox);
  sandbox.REAL_MINES = sandbox.window.REAL_MINES;

  // 2. Run inline script
  vm.runInContext(inlineScript, sandbox);

  // 3. Trigger DOMContentLoaded
  if (doc._onReady) {
    doc._onReady();
  }

  return { doc, win, elements, sandbox };
}

async function testAllScenarios() {
  console.log('======================================================');
  console.log(' MINE-INTELLIGENCE DOM & QUERY PARAM EXECUTION SUITE');
  console.log('======================================================\n');

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

  // SCENARIO 1: Direct navigation without query params -> State A
  console.log('--- SCENARIO 1: Direct Navigation (No Params) ---');
  const res1 = runMineIntelligence('http://localhost:3000/mine-intelligence.html');
  const panel1 = res1.elements['strategyPanel'].innerHTML;
  assert(
    panel1.includes('Select a mine to view operational intelligence'),
    'State A rendered: Prompts user to select a mine'
  );
  assert(
    !panel1.includes('undefined') && panel1.length > 50,
    'Panel is NOT blank and contains descriptive guidance'
  );

  // SCENARIO 2: Navigate with Gevra OC Alert from Dashboard
  console.log('\n--- SCENARIO 2: Gevra OC (?mine=SECL001&alert=ALT-SECL001) ---');
  const res2 = runMineIntelligence('http://localhost:3000/mine-intelligence.html?mine=SECL001&alert=ALT-SECL001');
  const panel2 = res2.elements['strategyPanel'].innerHTML;
  assert(panel2.includes('Gevra OC'), 'Mine title "Gevra OC" is rendered');
  assert(panel2.includes('HIGH RISK'), 'Alert severity badge HIGH RISK is rendered');
  assert(
    panel2.includes('Unprecedented scale requires extreme HEMM traffic control via OITDS'),
    'Active alert title is rendered correctly'
  );
  assert(panel2.includes('Detected: 46 minutes ago'), 'Alert detected time is rendered');
  assert(panel2.includes('Risk Analysis'), 'Risk Analysis section is rendered');
  assert(panel2.includes('Safety Risk') && panel2.includes('Production Risk') && panel2.includes('Compliance Risk'), 'Risk breakdown bars are rendered');
  assert(panel2.includes('Key Factors'), 'Key Factors section is rendered');
  assert(panel2.includes('🔴') && panel2.includes('🟠') && panel2.includes('🟡'), 'Key factors severity icons rendered');
  assert(panel2.includes('Operational Metrics'), 'Operational Metrics grid is rendered');
  assert(panel2.includes('AI Strategy: No strategy generated yet.'), 'AI Strategy idle state is rendered before generation');
  assert(panel2.includes('Generate AI Strategy'), 'Generate AI Strategy button is available');

  // Trigger AI Strategy Generation
  res2.win.triggerAIStrategy();
  await new Promise(r => setTimeout(r, 20));
  const presHtml = res2.elements['prescriptions-container'].innerHTML;
  assert(
    presHtml.includes('Immediate Safety Protocol') || presHtml.includes('Analyzing mine conditions') || presHtml.includes('AI STRATEGY ENGINE'),
    'AI Strategy generation triggered successfully'
  );

  // SCENARIO 3: Navigate with Kusmunda OC
  console.log('\n--- SCENARIO 3: Kusmunda OC (?mine=SECL002&alert=ALT-SECL002) ---');
  const res3 = runMineIntelligence('http://localhost:3000/mine-intelligence.html?mine=SECL002&alert=ALT-SECL002');
  const panel3 = res3.elements['strategyPanel'].innerHTML;
  assert(panel3.includes('Kusmunda OC'), 'Kusmunda OC title is rendered');
  assert(panel3.includes('Massive overburden removal and heavy blasting operations'), 'Kusmunda alert reason rendered');

  // SCENARIO 4: Navigate with Dipka OC
  console.log('\n--- SCENARIO 4: Dipka OC (?mine=SECL003&alert=ALT-SECL003) ---');
  const res4 = runMineIntelligence('http://localhost:3000/mine-intelligence.html?mine=SECL003&alert=ALT-SECL003');
  const panel4 = res4.elements['strategyPanel'].innerHTML;
  assert(panel4.includes('Dipka OC'), 'Dipka OC title is rendered');
  assert(panel4.includes('Expansive footprint requires constant GIS monitoring'), 'Dipka alert reason rendered');

  // SCENARIO 5: Navigate by Slug (?mine=gevra-oc)
  console.log('\n--- SCENARIO 5: Slug Resolution (?mine=gevra-oc) ---');
  const res5 = runMineIntelligence('http://localhost:3000/mine-intelligence.html?mine=gevra-oc');
  const panel5 = res5.elements['strategyPanel'].innerHTML;
  assert(panel5.includes('Gevra OC'), 'Resolves slug "gevra-oc" to Gevra OC');

  // SCENARIO 6: Invalid Mine ID (?mine=invalid-mine-999)
  console.log('\n--- SCENARIO 6: Invalid Mine Handling (?mine=invalid-mine-999) ---');
  const res6 = runMineIntelligence('http://localhost:3000/mine-intelligence.html?mine=invalid-mine-999');
  const panel6 = res6.elements['strategyPanel'].innerHTML;
  assert(panel6.includes('Mine not found'), 'Displays "Mine not found" message');
  assert(panel6.includes('Return to Mine Intelligence'), 'Provides return button to user');
  assert(!panel6.includes('Uncaught') && panel6.length > 50, 'Page does not crash or leave blank panel');

  // SCENARIO 7: Invalid Alert ID (?mine=SECL001&alert=INVALID-ALERT-999)
  console.log('\n--- SCENARIO 7: Invalid Alert Handling (?mine=SECL001&alert=INVALID-ALERT-999) ---');
  const res7 = runMineIntelligence('http://localhost:3000/mine-intelligence.html?mine=SECL001&alert=INVALID-ALERT-999');
  const panel7 = res7.elements['strategyPanel'].innerHTML;
  assert(panel7.includes('Alert information unavailable.'), 'Displays "Alert information unavailable."');
  assert(panel7.includes('View Mine Intelligence'), 'Provides "View Mine Intelligence" button');
  assert(panel7.includes('Gevra OC') && panel7.includes('Risk Analysis'), 'Continues to render Gevra OC operational intelligence below');

  console.log(`\n======================================================`);
  console.log(` SCENARIOS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

testAllScenarios().catch(err => {
  console.error(err);
  process.exit(1);
});
