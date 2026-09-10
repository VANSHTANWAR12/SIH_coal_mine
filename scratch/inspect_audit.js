const http = require('http');

http.get('http://localhost:3001/api/audit', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    console.log('Total audit records:', list.length);
    console.log('Latest 5 records:');
    list.slice(0, 5).forEach((r, i) => {
      console.log(`[${i}] id: ${r.id}, action: ${r.action}, hash: ${r.hash}, prev_hash: ${r.prev_hash}, created_at: ${r.created_at}`);
    });
  });
});
