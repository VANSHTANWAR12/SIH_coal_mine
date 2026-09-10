const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('COALGUARD COMPREHENSIVE END-TO-END WORKFLOW VERIFICATION');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check all frontend HTML pages served on port 3000
  console.log('1. Verifying Frontend Static Web Server (Port 3000)...');
  const pages = [
    'index.html',
    'dashboard.html',
    'ai-prediction.html',
    'mine-intelligence.html',
    'gis-map.html',
    'reports.html',
    'contractors.html',
    'analytics.html',
    'inspections.html',
    'compliance.html',
    'field-reports.html'
  ];

  for (const p of pages) {
    const res = await request({ host: 'localhost', port: 3000, path: `/${p}`, method: 'GET' });
    assert(res.status === 200, `Page /${p} returned HTTP 200`);
  }

  // 2. Test Emergency Dispatch Endpoint & Tamper-Evident Ledger
  console.log('\n2. Verifying Emergency Dispatch Workflow (Port 3001)...');
  const dispatchPayload = {
    mineId: 'Moonidih',
    affectedZone: 'Shaft #2 Seam VII',
    severity: 'Critical',
    incidentType: 'Gas',
    situation: 'Methane level spike at 1.45% during seam heading. Auto-cutoff activated.',
    responseTeams: ['Mine Rescue Team', 'Safety Officer', 'Medical Team'],
    personnelRequired: 16,
    instructions: 'Evacuate level 4 gallery immediately.',
    dispatchedBy: 'Ranjan Kumar (Safety Officer)'
  };

  const edRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/emergency-dispatch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, dispatchPayload);

  assert(edRes.status === 201, `POST /api/emergency-dispatch returned HTTP 201`);
  assert(edRes.body && (edRes.body.success === true || edRes.body.id), `Response body contains success confirmation`);
  const edId = edRes.body.id || (edRes.body.dispatch && edRes.body.dispatch.id);
  assert(edId && edId.startsWith('ED-'), `Generated sequential emergency dispatch ID: ${edId}`);
  assert(edRes.body.auditId, `Created linked audit event ID: ${edRes.body.auditId}`);

  // 3. Test Compliance Review Workflow & In-Place Updates
  console.log('\n3. Verifying Compliance Review Workflow...');
  const compListRes = await request({ host: 'localhost', port: 3001, path: '/api/compliance', method: 'GET' });
  assert(compListRes.status === 200 && Array.isArray(compListRes.body), `GET /api/compliance returned items array`);

  const firstComp = compListRes.body[0];
  assert(firstComp && firstComp.id, `Target compliance record found: ${firstComp ? firstComp.id : 'none'}`);

  const reviewPayload = {
    notes: 'DGMS Statutory review completed on-site. Form IV verification passed.',
    status: 'COMPLIANT',
    next_review: '2026-12-15',
    officer: 'A. Sharma (DGMS)'
  };

  const compPatchRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/compliance/${firstComp.id}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, reviewPayload);

  assert(compPatchRes.status === 200 && compPatchRes.body.item, `PATCH /api/compliance/${firstComp.id} succeeded`);
  assert(compPatchRes.body.item.status === 'COMPLIANT', `Status updated to COMPLIANT`);
  assert(compPatchRes.body.item.days_overdue === 0, `Days overdue automatically reset to 0 for compliant status`);
  assert(compPatchRes.body.item.notes === reviewPayload.notes, `Reviewer notes persisted accurately`);

  // 4. Test Audit Trail & Cryptographic Verification
  console.log('\n4. Verifying Audit Trail & SHA-256 Ledger Integrity...');
  const auditRes = await request({ host: 'localhost', port: 3001, path: '/api/audit', method: 'GET' });
  assert(auditRes.status === 200 && Array.isArray(auditRes.body), `GET /api/audit returned audit trail`);
  
  const latestAudit = auditRes.body[0];
  assert(latestAudit && latestAudit.id, `Latest audit entry retrieved: ${latestAudit ? latestAudit.id : 'none'}`);
  assert(latestAudit.hash && /^[0-9a-f]{8,64}$/i.test(latestAudit.hash), `Audit block contains valid SHA-256 hex hash (${latestAudit.hash})`);

  const verifyRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/audit/verify/${latestAudit.id}`,
    method: 'POST'
  });

  assert(verifyRes.status === 200, `POST /api/audit/verify/${latestAudit.id} returned HTTP 200`);
  assert(verifyRes.body && (verifyRes.body.verified === true || verifyRes.body.valid === true), `Cryptographic hash chain verified unbroken`);

  // 5. Test Contractor Registration & Update
  console.log('\n5. Verifying Contractor Management Workflow...');
  const newContractorPayload = {
    name: 'TATA Mine Support Services Ltd',
    subsidiary: 'BCCL',
    mine_id: 'Moonidih',
    workers: 320,
    compliance_pct: 95,
    status: 'ACTIVE',
    risk_score: 18,
    work_order: 'WO-BCCL-2026-908',
    safety_rating: 'A+'
  };

  const addContRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/contractors',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newContractorPayload);

  assert(addContRes.status === 201 && addContRes.body.id, `POST /api/contractors registered contractor ID: ${addContRes.body ? addContRes.body.id : 'none'}`);

  const updateContRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/contractors/${addContRes.body.id}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, { workers: 345, compliance_pct: 98 });

  assert(updateContRes.status === 200 && updateContRes.body.item, `PATCH /api/contractors/${addContRes.body.id} updated record`);
  assert(updateContRes.body.item.workers === 345, `Updated worker count persisted (345)`);

  // 6. Test Incident Management Submission
  console.log('\n6. Verifying Field Incident Submission Workflow...');
  const incidentPayload = {
    mine: 'Dipka OC',
    type: 'Near Miss / Hazard',
    severity: 'Medium',
    location: 'Haul Road Section 4',
    description: 'Minor hydraulic oil seep from dumper #14 steering unit, isolated immediately.',
    reporter: 'Field Officer V. Patel'
  };

  const incRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/incidents',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, incidentPayload);

  assert(incRes.status === 201 && incRes.body.id, `POST /api/incidents registered incident ID: ${incRes.body ? incRes.body.id : 'none'}`);

  // 7. Verify SQLite File Persistence
  console.log('\n7. Verifying SQLite Database Disk Persistence...');
  const dbFile = path.resolve(__dirname, '../backend/db/coalguard.db');
  assert(fs.existsSync(dbFile), `Database file exists at ${dbFile}`);
  const dbStat = fs.statSync(dbFile);
  assert(dbStat.size > 20000, `Database file has content (${dbStat.size} bytes)`);

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
