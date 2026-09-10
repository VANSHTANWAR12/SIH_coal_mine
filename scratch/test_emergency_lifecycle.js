const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
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

async function testLifecycle() {
  console.log('========================================================');
  console.log('TESTING EMERGENCY DISPATCH FEEDBACK & PERSISTENT STATUS');
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

  // 1. Test validation failure / error handling (no fake success on failure)
  console.log('1. Verifying Failure State (no success record on invalid input)...');
  const failRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/emergency-dispatch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { mine_name: '', situation: '' });

  assert(failRes.status === 400, `Rejects missing fields with HTTP 400`);
  assert(failRes.body.error, `Returns error message: ${failRes.body.error}`);

  // 2. Test successful Emergency Dispatch creation
  console.log('\n2. Verifying Emergency Dispatch Creation & Initial Status...');
  const newDispatch = {
    mineId: 'Adriyala Shaft',
    mine_name: 'Adriyala Shaft',
    affectedZone: 'Longwall Panel #1',
    severity: 'Critical',
    incidentType: 'Strata',
    situation: 'Roof convergence exceeding safety threshold (45mm). Power tripped automatically.',
    responseTeams: ['Mine Rescue Team', 'Safety Officer'],
    personnelRequired: 14,
    instructions: 'Evacuate face to intake air gallery.',
    dispatchedBy: 'DGMS Regional Inspector'
  };

  const createRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/emergency-dispatch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newDispatch);

  assert(createRes.status === 201, `POST /api/emergency-dispatch returned HTTP 201`);
  const ed = createRes.body;
  assert(ed && ed.id && ed.id.startsWith('ED-'), `Generated Dispatch ID: ${ed.id}`);
  assert(ed.status === 'DISPATCHED', `Initial lifecycle status is DISPATCHED (got ${ed.status})`);
  assert(ed.mine_name === 'Adriyala Shaft', `Mine site accurately recorded: ${ed.mine_name}`);
  assert(ed.severity === 'Critical', `Severity accurately recorded: ${ed.severity}`);

  // 3. Test Lifecycle Advancement: DISPATCHED -> ACKNOWLEDGED
  console.log('\n3. Verifying Lifecycle Transition: DISPATCHED -> ACKNOWLEDGED...');
  const ackRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/emergency-dispatch/${ed.id}/status`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, { status: 'ACKNOWLEDGED', notes: 'Mine control room acknowledged. Surface sirens activated.' });

  assert(ackRes.status === 200, `PATCH returned HTTP 200`);
  assert(ackRes.body.dispatch && ackRes.body.dispatch.status === 'ACKNOWLEDGED', `Status advanced to ACKNOWLEDGED`);

  // 4. Test Lifecycle Advancement: ACKNOWLEDGED -> RESPONSE IN PROGRESS
  console.log('\n4. Verifying Lifecycle Transition: ACKNOWLEDGED -> RESPONSE IN PROGRESS...');
  const progRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/emergency-dispatch/${ed.id}/status`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, { status: 'RESPONSE IN PROGRESS', notes: 'Mine Rescue Team deployed underground with oxygen rebreathers.' });

  assert(progRes.status === 200, `PATCH returned HTTP 200`);
  assert(progRes.body.dispatch && progRes.body.dispatch.status === 'RESPONSE IN PROGRESS', `Status advanced to RESPONSE IN PROGRESS`);

  // 5. Test Lifecycle Advancement: RESPONSE IN PROGRESS -> RESOLVED
  console.log('\n5. Verifying Lifecycle Transition: RESPONSE IN PROGRESS -> RESOLVED...');
  const resRes = await request({
    host: 'localhost',
    port: 3001,
    path: `/api/emergency-dispatch/${ed.id}/status`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, { status: 'RESOLVED', notes: 'Roof supports re-pressurized. All personnel accounted for.' });

  assert(resRes.status === 200, `PATCH returned HTTP 200`);
  assert(resRes.body.dispatch && resRes.body.dispatch.status === 'RESOLVED', `Status finalized to RESOLVED`);

  // 6. Test Audit Trail Events
  console.log('\n6. Verifying Audit Trail Events...');
  const auditRes = await request({ host: 'localhost', port: 3001, path: '/api/audit', method: 'GET' });
  assert(auditRes.status === 200, `GET /api/audit returned HTTP 200`);

  const createdAudit = auditRes.body.find(a => a.action === 'EMERGENCY_DISPATCH_CREATED' && a.payload.includes(ed.id));
  assert(createdAudit, `EMERGENCY_DISPATCH_CREATED logged for ${ed.id}`);

  const updatedAudit = auditRes.body.find(a => a.action === 'EMERGENCY_DISPATCH_STATUS_UPDATED' && a.payload.includes(ed.id));
  assert(updatedAudit, `EMERGENCY_DISPATCH_STATUS_UPDATED logged for ${ed.id}`);

  // 7. Verify Emergency Dispatches List
  console.log('\n7. Verifying Persistent Active & Historical Emergency Dispatches List...');
  const listRes = await request({ host: 'localhost', port: 3001, path: '/api/emergency-dispatches', method: 'GET' });
  assert(listRes.status === 200 && Array.isArray(listRes.body), `GET /api/emergency-dispatches returned dispatches array`);
  const foundInList = listRes.body.find(d => d.id === ed.id);
  assert(foundInList && foundInList.status === 'RESOLVED', `Persisted record found with status RESOLVED`);

  // 8. Verify Stats calculation
  const statsRes = await request({ host: 'localhost', port: 3001, path: '/api/emergency-dispatches/stats', method: 'GET' });
  assert(statsRes.status === 200 && statsRes.body.resolved >= 1, `Stats endpoint computes resolved count (${statsRes.body.resolved})`);

  console.log('\n========================================================');
  console.log(`LIFECYCLE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  process.exit(failed > 0 ? 1 : 0);
}

testLifecycle().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
