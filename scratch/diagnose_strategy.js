const { JSDOM, VirtualConsole } = require('d:/SIH_coal_mine/backend/node_modules/jsdom');
const vc = new VirtualConsole();
vc.on('error', e => console.error('PAGE ERROR:', e));
vc.on('warn', w => console.warn('PAGE WARN:', w));

JSDOM.fromURL('http://localhost:3001/mine-intelligence.html', {
  runScripts: 'dangerously',
  resources: 'usable',
  virtualConsole: vc,
  beforeParse(w) { w.fetch = globalThis.fetch; }
}).then(async dom => {
  await new Promise(r => setTimeout(r, 1000));
  const w = dom.window;
  console.log('Calling selectMine Kusmunda OC');
  await w.selectMine('Kusmunda OC', null, true);

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const container = w.document.getElementById('prescriptions-container');
    const cards = container ? container.querySelectorAll('.prescription-card').length : 0;
    const snippet = container ? container.innerHTML.trim().slice(0, 120).replace(/\s+/g, ' ') : 'null';
    console.log(`Sec ${i+1}: cards=${cards}, snippet=${snippet}`);
    if (cards > 0) {
      console.log('SUCCESS: Rendered prescriptions!');
      process.exit(0);
    }
  }
  console.log('TIMED OUT without cards');
  process.exit(1);
}).catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
