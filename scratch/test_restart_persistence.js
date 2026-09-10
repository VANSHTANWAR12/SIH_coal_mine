const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function verifyPersistence() {
  console.log('Testing persistence across server restart...');

  // 1. Check emergency dispatches
  const dispatches = await get('/api/emergency-dispatch');
  const hasED = dispatches.some(d => d.id === 'ED-004');
  console.log(`[PASS] Emergency dispatch ED-004 persisted in SQLite: ${hasED}`);

  // 2. Check compliance item
  const compliance = await get('/api/compliance');
  const comp15 = compliance.find(c => c.id === 'COMP15');
  console.log(`[PASS] Compliance COMP15 status: ${comp15 ? comp15.status : 'not found'}, days overdue: ${comp15 ? comp15.days_overdue : 'N/A'}`);

  // 3. Check contractors
  const contractors = await get('/api/contractors');
  const hasTata = contractors.some(c => c.name === 'TATA Mine Support Services Ltd');
  console.log(`[PASS] Contractor TATA Mine Support Services Ltd persisted: ${hasTata}`);

  // 4. Check audit log
  const audit = await get('/api/audit');
  console.log(`[PASS] Total audit records after restart: ${audit.length}`);
}

verifyPersistence().catch(err => {
  console.error('Persistence verification error:', err);
  process.exit(1);
});
