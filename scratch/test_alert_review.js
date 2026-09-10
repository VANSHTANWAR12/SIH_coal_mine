// scratch/test_alert_review.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' COALGUARD ALERT REVIEW WORKFLOW VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // ── TEST 1: Check dashboard.html alert Review buttons pass query params
  console.log('--- TEST 1: Dashboard Alert Review Buttons ---');
  const dashboardHtml = fs.readFileSync(path.join(__dirname, '..', 'dashboard.html'), 'utf8');
  assert(
    dashboardHtml.includes('mine-intelligence.html?mine=') && dashboardHtml.includes('&alert='),
    'Dashboard alert buttons contain targetUrl with ?mine=...&alert=... query parameters'
  );
  assert(
    dashboardHtml.includes('Review') && dashboardHtml.includes('Investigate'),
    'Both Review and Investigate buttons are present for High and Critical risk alerts'
  );

  // ── TEST 2: Load mines-db.js and verify mine definitions
  console.log('\n--- TEST 2: Master Mine Database in mines-db.js ---');
  const minesDbContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'mines-db.js'), 'utf8');
  const sandbox = { window: {}, document: {}, console: console, Math: Math, Date: Date };
  vm.createContext(sandbox);
  vm.runInContext(minesDbContent + '\nwindow.REAL_MINES = REAL_MINES;', sandbox);
  const REAL_MINES = sandbox.window.REAL_MINES || sandbox.REAL_MINES;
  assert(Array.isArray(REAL_MINES) && REAL_MINES.length > 50, `REAL_MINES loaded (${REAL_MINES.length} mines)`);

  const gevra = REAL_MINES.find(m => m.name === 'Gevra OC');
  const kusmunda = REAL_MINES.find(m => m.name === 'Kusmunda OC');
  const dipka = REAL_MINES.find(m => m.name === 'Dipka OC');
  assert(gevra && gevra.id === 'SECL001', 'Gevra OC found with ID SECL001');
  assert(kusmunda && kusmunda.id === 'SECL002', 'Kusmunda OC found with ID SECL002');
  assert(dipka && dipka.id === 'SECL003', 'Dipka OC found with ID SECL003');

  // ── TEST 3: Verify mine-intelligence.html contains required handlers & logic
  console.log('\n--- TEST 3: mine-intelligence.html Script Logic ---');
  const intelHtml = fs.readFileSync(path.join(__dirname, '..', 'mine-intelligence.html'), 'utf8');
  assert(intelHtml.includes('new URLSearchParams(window.location.search)'), 'Parses window.location.search with URLSearchParams');
  assert(intelHtml.includes('function findMine('), 'findMine function exists');
  assert(intelHtml.includes('function selectMine('), 'selectMine function exists');
  assert(intelHtml.includes('function renderMineIntelligence('), 'renderMineIntelligence function exists');
  assert(intelHtml.includes('function renderStateA('), 'renderStateA function exists for no mine selected');
  assert(intelHtml.includes('function renderMineNotFound('), 'renderMineNotFound function exists for invalid mine');
  assert(intelHtml.includes('Alert information unavailable.'), 'Handles missing/invalid alert gracefully');
  assert(intelHtml.includes('AI STRATEGY ENGINE') && intelHtml.includes('Analyzing mine conditions...'), 'Displays progressive 3-step AI loading state');
  assert(intelHtml.includes('AI strategy unavailable.') && intelHtml.includes('Retry'), 'Displays error state with Retry button on API failure');
  assert(intelHtml.includes('http://localhost:8000/prescribe/strategy'), 'Calls FastAPI endpoint /prescribe/strategy');

  // ── TEST 4: Test FastAPI /prescribe/strategy endpoint with Gevra OC
  console.log('\n--- TEST 4: Python FastAPI AI Engine (/prescribe/strategy) ---');
  const payloadGevra = JSON.stringify({
    name: gevra.name,
    sub: gevra.sub,
    type: gevra.type,
    risk: gevra.risk,
    riskScore: gevra.riskScore,
    compliance: gevra.compliance,
    prod: gevra.prod,
    grade: gevra.grade,
    mechanization: gevra.mechanization,
    oms: gevra.oms,
    strippingRatio: gevra.strippingRatio,
    reason: gevra.reason,
    alert: gevra.reason.split(';')[0]
  });

  const apiRes = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/prescribe/strategy',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadGevra)
    }
  }, payloadGevra);

  assert(apiRes.statusCode === 200, `POST /prescribe/strategy returned HTTP 200 OK (${apiRes.statusCode})`);
  const data = JSON.parse(apiRes.body);
  assert(Array.isArray(data.prescriptions) && data.prescriptions.length >= 3, `Returns structured prescriptions list (count: ${data.prescriptions.length})`);
  
  const hasSafety = data.prescriptions.some(p => p.type.toLowerCase().includes('safety'));
  const hasProd = data.prescriptions.some(p => p.type.toLowerCase().includes('production') || p.type.toLowerCase().includes('routing') || p.type.toLowerCase().includes('traffic'));
  const hasGov = data.prescriptions.some(p => p.type.toLowerCase().includes('dgms') || p.type.toLowerCase().includes('compliance') || p.type.toLowerCase().includes('governance'));
  assert(hasSafety, 'Contains structured Safety intervention prescription');
  assert(hasProd, 'Contains structured Production / Fleet routing prescription');
  assert(hasGov, 'Contains structured DGMS Governance prescription');

  // ── TEST 5: Test /prescribe/strategy with Underground mine (Churcha RO)
  console.log('\n--- TEST 5: AI Engine with Underground Mine (Churcha RO) ---');
  const churcha = REAL_MINES.find(m => m.name.includes('Churcha'));
  assert(churcha !== undefined, 'Churcha RO underground mine exists');
  const payloadChurcha = JSON.stringify({
    name: churcha.name,
    sub: churcha.sub,
    type: churcha.type,
    risk: churcha.risk,
    riskScore: churcha.riskScore,
    compliance: churcha.compliance,
    prod: churcha.prod,
    grade: churcha.grade,
    mechanization: churcha.mechanization,
    oms: churcha.oms,
    strippingRatio: churcha.strippingRatio,
    reason: churcha.reason,
    alert: churcha.reason.split(';')[0]
  });

  const apiResChurcha = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/prescribe/strategy',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadChurcha)
    }
  }, payloadChurcha);

  assert(apiResChurcha.statusCode === 200, 'Churcha RO returned HTTP 200 OK');
  const dataChurcha = JSON.parse(apiResChurcha.body);
  const hasVentStrata = dataChurcha.prescriptions.some(p => p.type.includes('Ventilation') || p.type.includes('Strata'));
  assert(hasVentStrata, 'Churcha RO produces underground-specific Ventilation & Strata Control prescription');

  // ── TEST 6: Static server delivery
  console.log('\n--- TEST 6: Static Web Server Delivery ---');
  const staticRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/mine-intelligence.html',
    method: 'GET'
  });
  assert(staticRes.statusCode === 200, 'http://localhost:3000/mine-intelligence.html delivers HTTP 200 OK');

  console.log(`\n====================================================`);
  console.log(` TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
