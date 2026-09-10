const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function httpRequest(options, bodyBuffer, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, headers: { ...options.headers, ...headers } }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        let parsed = null;
        try {
          parsed = JSON.parse(raw.toString('utf8'));
        } catch (e) {
          parsed = raw.toString('utf8');
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw });
      });
    });
    req.on('error', reject);
    if (bodyBuffer) req.write(bodyBuffer);
    req.end();
  });
}

function buildMultipartBody(fields, fileField, fileName, mimeType, fileBuffer) {
  const boundary = '----CoalGuardBoundary' + Date.now().toString(16);
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
    ));
  }

  if (fileBuffer) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    ));
    parts.push(fileBuffer);
    parts.push(Buffer.from('\r\n'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    buffer: Buffer.concat(parts)
  };
}

async function runTests() {
  console.log('--- RUNNING PHOTO EVIDENCE BACKEND TESTS ---');

  // Create a 1x1 test PNG buffer
  const samplePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  // 1. Multipart POST with valid photo
  console.log('\n1. Testing POST /api/incidents with multipart photo evidence...');
  const fields = {
    mine_name: 'SECL Gevra',
    type: 'Equipment Failure',
    severity: 'critical',
    description: 'Highwall haul truck hydraulic line burst at incline 4. Photo attached.',
    reporter: 'Inspector R. Sen',
    geo_lat: '22.36',
    geo_lng: '82.64'
  };
  const mp = buildMultipartBody(fields, 'photo', 'haul_truck_failure.png', 'image/png', samplePng);

  const res1 = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/incidents',
    method: 'POST',
    headers: { 'Content-Type': mp.contentType }
  }, mp.buffer);

  assert.strictEqual(res1.status, 201, `Expected HTTP 201, got ${res1.status}`);
  assert(res1.body && res1.body.id, 'Response missing incident ID');
  assert(res1.body.photo_url, `Incident response missing photo_url: ${JSON.stringify(res1.body)}`);
  assert.strictEqual(res1.body.photo_attached, 'YES', 'photo_attached must be YES');
  console.log(`✓ Incident created: ID=${res1.body.id}, photo_url=${res1.body.photo_url}`);

  const incidentId = res1.body.id;
  const photoUrl = res1.body.photo_url;

  // 2. Fetch the uploaded photo via HTTP to verify static file serving
  console.log(`\n2. Verifying static serving of photo from http://localhost:3001${photoUrl}...`);
  const resImg = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: photoUrl,
    method: 'GET'
  });
  assert.strictEqual(resImg.status, 200, `Expected HTTP 200 for photo, got ${resImg.status}`);
  assert(resImg.headers['content-type'].includes('image/png'), `Expected image/png content-type, got ${resImg.headers['content-type']}`);
  assert.strictEqual(resImg.raw.length, samplePng.length, 'Served photo size does not match uploaded size');
  console.log(`✓ Static photo verified: size=${resImg.raw.length} bytes, content-type=${resImg.headers['content-type']}`);

  // 3. Verify GET /api/incidents/:id returns photo_url and metadata
  console.log(`\n3. Verifying GET /api/incidents/${incidentId}...`);
  const resDetail = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: `/api/incidents/${incidentId}`,
    method: 'GET'
  });
  assert.strictEqual(resDetail.status, 200, `Expected HTTP 200, got ${resDetail.status}`);
  assert.strictEqual(resDetail.body.id, incidentId, 'Incident ID mismatch in detail endpoint');
  assert.strictEqual(resDetail.body.photo_url, photoUrl, 'photo_url mismatch in detail endpoint');
  assert.strictEqual(resDetail.body.mine_name, 'SECL Gevra', 'mine_name mismatch');
  console.log(`✓ Incident detail endpoint verified with persisted photo_url`);

  // 4. Verify audit trail entry INCIDENT_CREATED
  console.log('\n4. Verifying audit log contains INCIDENT_CREATED with photo details...');
  const resAudit = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/audit',
    method: 'GET'
  });
  assert.strictEqual(resAudit.status, 200, 'Audit log endpoint failed');
  const auditEntries = resAudit.body;
  const matchEntry = auditEntries.find(a => {
    try {
      const p = JSON.parse(a.payload);
      return a.action === 'INCIDENT_CREATED' && (p.id === incidentId || p.incident_id === incidentId);
    } catch(e) { return false; }
  });
  assert(matchEntry, `Audit entry for incident ${incidentId} not found in audit log`);
  const parsedPayload = JSON.parse(matchEntry.payload);
  assert.strictEqual(parsedPayload['Photo Attached'], 'YES', 'Audit payload missing Photo Attached: YES');
  assert.strictEqual(parsedPayload.photo_url, photoUrl, 'Audit payload photo_url mismatch');
  console.log(`✓ Audit entry verified: action=${matchEntry.action}, hash=${matchEntry.hash}, photo_attached=YES`);

  // 5. Test rejection of invalid file types (e.g. text/plain)
  console.log('\n5. Testing rejection of invalid file type (text/plain)...');
  const invalidMp = buildMultipartBody(
    { mine_name: 'Moonidih', description: 'Test invalid file' },
    'photo',
    'exploit.txt',
    'text/plain',
    Buffer.from('not an image')
  );
  const resInvalid = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/incidents',
    method: 'POST',
    headers: { 'Content-Type': invalidMp.contentType }
  }, invalidMp.buffer);
  assert.strictEqual(resInvalid.status, 400, `Expected HTTP 400 for invalid file type, got ${resInvalid.status}`);
  console.log(`✓ Invalid file correctly rejected with HTTP 400: ${JSON.stringify(resInvalid.body)}`);

  // 6. Test JSON POST backwards compatibility
  console.log('\n6. Testing JSON POST backwards compatibility (no photo)...');
  const jsonBody = Buffer.from(JSON.stringify({
    mine_name: 'Jharia Main',
    type: 'Strata Collapse',
    severity: 'medium',
    description: 'Minor roof peeling near shaft gate'
  }));
  const resJson = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/incidents',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, jsonBody);
  assert.strictEqual(resJson.status, 201, `Expected HTTP 201, got ${resJson.status}`);
  assert.strictEqual(resJson.body.photo_attached, 'NO', 'Expected photo_attached to be NO');
  console.log(`✓ JSON POST succeeded: ID=${resJson.body.id}, photo_attached=NO`);

  // 7. Test rejection of oversized file (>10 MB)
  console.log('\n7. Testing rejection of oversized file (>10 MB)...');
  const oversizedBuf = Buffer.alloc(10.5 * 1024 * 1024);
  const oversizedMp = buildMultipartBody(
    { mine_name: 'Moonidih', description: 'Test oversized image' },
    'photo',
    'oversized_capture.jpg',
    'image/jpeg',
    oversizedBuf
  );
  const resOversized = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/incidents',
    method: 'POST',
    headers: { 'Content-Type': oversizedMp.contentType }
  }, oversizedMp.buffer);
  assert.strictEqual(resOversized.status, 400, `Expected HTTP 400 for oversized file, got ${resOversized.status}`);
  assert(resOversized.body && resOversized.body.error && resOversized.body.error.includes('10 MB'), 'Error message should mention 10 MB limit');
  console.log(`✓ Oversized file correctly rejected with HTTP 400: ${JSON.stringify(resOversized.body)}`);

  console.log('\n🎉 ALL BACKEND PHOTO EVIDENCE TESTS PASSED PERFECTLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
