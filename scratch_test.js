// test_endpoints.js
const http = require('http');

function req(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user': 'Inspector Sharma',
        ...(data ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing emergency dispatches...');
  const dispatches = await req('/api/emergency-dispatches');
  console.log('Dispatches status:', dispatches.status, 'Count:', dispatches.data.length);

  console.log('Testing audit log...');
  const audit = await req('/api/audit');
  console.log('Audit status:', audit.status, 'Count:', audit.data.length);

  if (audit.data.length > 0) {
    const firstId = audit.data[0].id;
    console.log('Testing audit verify for:', firstId);
    const verify = await req(`/api/audit/verify/${firstId}`, 'POST');
    console.log('Verify result:', verify);
  }

  console.log('Testing compliance items...');
  const comp = await req('/api/compliance');
  console.log('Compliance status:', comp.status, 'Count:', comp.data.length);
}

run().catch(console.error);
