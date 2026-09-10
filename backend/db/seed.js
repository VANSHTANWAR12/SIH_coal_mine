/* ==========================================================
   CoalGuard DB Seed – seed.js
   Real data: 79 Indian coal mines from database.txt
   ========================================================== */

/* ── Coordinate jitter per subsidiary ───────────────────── */
const HQ = {
  SECL: { lat:22.36, lng:82.64 }, MCL:  { lat:20.84, lng:85.10 },
  NCL:  { lat:24.10, lng:82.77 }, BCCL: { lat:23.79, lng:86.43 },
  CCL:  { lat:23.65, lng:85.51 }, SCCL: { lat:17.55, lng:80.62 },
  WCL:  { lat:20.71, lng:78.60 }, ECL:  { lat:23.67, lng:87.07 },
};

function jitter(base, idx, range=1.2) {
  const angle = (idx * 137.5) * Math.PI / 180;
  const r = (idx % 7) * (range / 7);
  return { lat: +(base.lat + r * Math.sin(angle)).toFixed(4),
           lng: +(base.lng + r * Math.cos(angle)).toFixed(4) };
}

function riskToScore(risk) {
  return { Critical:88, High:68, Medium:42 }[risk] || 42;
}

function gcvMidpoint(grade) {
  const map = { G1:7100,G2:6700,G3:6400,G4:6100,G5:5800,G6:5500,G7:5200,G8:4900,G9:4600,G10:4200,G11:3900,G12:3600,G13:3250,G14:3000,G15:2750,G16:2500,G17:2350 };
  const m = grade.match(/G(\d+)/);
  return m ? (map['G'+m[1]] || 3500) : 3500;
}

const RAW = [
  // SECL
  { name:'Gevra OC',           sub:'SECL', type:'Opencast',    prod:50,   grade:'GCV ~4372 (G10)',     risk:'High' },
  { name:'Kusmunda OC',        sub:'SECL', type:'Opencast',    prod:50,   grade:'GCV ~3948 (G11/G12)', risk:'High' },
  { name:'Dipka OC',           sub:'SECL', type:'Opencast',    prod:37,   grade:'GCV ~4722 (G9)',      risk:'High' },
  { name:'Manikpur OC',        sub:'SECL', type:'Opencast',    prod:2.2,  grade:'GCV ~3753 (G12/G13)', risk:'Medium' },
  { name:'Chhal OC',           sub:'SECL', type:'Opencast',    prod:2.85, grade:'GCV ~2968 (G14/G15)', risk:'Medium' },
  { name:'Baroud OC',          sub:'SECL', type:'Opencast',    prod:2.46, grade:'GCV ~2812 (G14/G15)', risk:'Medium' },
  { name:'Churcha RO',         sub:'SECL', type:'Underground', prod:0.8,  grade:'GCV ~6268 (G4)',      risk:'Critical' },
  { name:'Surakachhar',        sub:'SECL', type:'Underground', prod:0.7,  grade:'GCV ~4830 (G9)',      risk:'High' },
  { name:'Amadand OC',         sub:'SECL', type:'Opencast',    prod:1.85, grade:'GCV ~3303 (G13)',     risk:'Medium' },
  { name:'Jampali OC',         sub:'SECL', type:'Opencast',    prod:1.15, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Saraipalli OC',      sub:'SECL', type:'Opencast',    prod:0.81, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Rampur Batura OC',   sub:'SECL', type:'Opencast',    prod:1.15, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Amlai OC',           sub:'SECL', type:'Opencast',    prod:0.58, grade:'GCV ~4133 (G11)',     risk:'Medium' },
  // MCL
  { name:'Bhubaneswari OC',    sub:'MCL',  type:'Opencast',    prod:30,   grade:'Thermal Grade',       risk:'High' },
  { name:'Lakhanpur OC',       sub:'MCL',  type:'Opencast',    prod:15,   grade:'Thermal Grade',       risk:'High' },
  { name:'Lingaraj OC',        sub:'MCL',  type:'Opencast',    prod:7.75, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Ananta OC',          sub:'MCL',  type:'Opencast',    prod:7.48, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Sairmal OCP',        sub:'MCL',  type:'Opencast',    prod:7.16, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Kulda OC',           sub:'MCL',  type:'Opencast',    prod:5.29, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Samleswari OC',      sub:'MCL',  type:'Opencast',    prod:5.38, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Hingula OC',         sub:'MCL',  type:'Opencast',    prod:4.86, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Garjanbahal OC',     sub:'MCL',  type:'Opencast',    prod:6.05, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Bharathpur OC',      sub:'MCL',  type:'Opencast',    prod:3.12, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Kanhia OC',          sub:'MCL',  type:'Opencast',    prod:3.4,  grade:'Thermal Grade',       risk:'Medium' },
  { name:'Jagannath OC',       sub:'MCL',  type:'Opencast',    prod:0.53, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Lajkura OC',         sub:'MCL',  type:'Opencast',    prod:1.46, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Balram OC',          sub:'MCL',  type:'Opencast',    prod:0.39, grade:'Thermal Grade',       risk:'Medium' },
  // NCL
  { name:'Jayant OC',          sub:'NCL',  type:'Opencast',    prod:12.02,grade:'Thermal Grade',       risk:'High' },
  { name:'Dudhichua OC',       sub:'NCL',  type:'Opencast',    prod:11.24,grade:'Thermal Grade',       risk:'High' },
  { name:'Nigahi OC',          sub:'NCL',  type:'Opencast',    prod:8.52, grade:'Thermal Grade',       risk:'High' },
  { name:'Amlohri OC',         sub:'NCL',  type:'Opencast',    prod:6.67, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Khadia OC',          sub:'NCL',  type:'Opencast',    prod:6.7,  grade:'Thermal Grade',       risk:'Medium' },
  { name:'Bina OC',            sub:'NCL',  type:'Opencast',    prod:5.42, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Block-B OC',         sub:'NCL',  type:'Opencast',    prod:3.59, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Krishnashila OC',    sub:'NCL',  type:'Opencast',    prod:3.12, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Jhingurda OC',       sub:'NCL',  type:'Opencast',    prod:2.0,  grade:'Thermal Grade',       risk:'Medium' },
  // BCCL
  { name:'Moonidih',           sub:'BCCL', type:'Underground', prod:1.2,  grade:'Prime Coking Coal',   risk:'Critical' },
  { name:'Bhatdih',            sub:'BCCL', type:'Underground', prod:0,    grade:'Coking Coal',         risk:'Critical' },
  { name:'Murlidih',           sub:'BCCL', type:'Underground', prod:0.1,  grade:'GCV Grade B/C',       risk:'Critical' },
  { name:'Pootkee Balihari',   sub:'BCCL', type:'Underground', prod:0.68, grade:'Coking Coal',         risk:'Critical' },
  { name:'Gopalichak',         sub:'BCCL', type:'Mixed',       prod:0.5,  grade:'Coking Coal',         risk:'Critical' },
  { name:'Kenduadih',          sub:'BCCL', type:'Mixed',       prod:0.5,  grade:'Coking Coal',         risk:'Critical' },
  { name:'Amalgamated NTST Kujama', sub:'BCCL', type:'Opencast', prod:3.01, grade:'Coking Coal',       risk:'High' },
  { name:'Amalgamated Block II', sub:'BCCL', type:'Opencast',  prod:2.14, grade:'Coking Coal',         risk:'High' },
  { name:'Bhowra',             sub:'BCCL', type:'Mixed',       prod:0.85, grade:'Coking Coal',         risk:'High' },
  { name:'Sudamdih',           sub:'BCCL', type:'Underground', prod:0.35, grade:'GCV ~4293 (G10)',     risk:'High' },
  { name:'Patherdih',          sub:'BCCL', type:'Mixed',       prod:0.35, grade:'Coking Coal',         risk:'High' },
  { name:'Bastacolla',         sub:'BCCL', type:'Opencast',    prod:0.97, grade:'Coking Coal',         risk:'High' },
  { name:'Cluster-III Group',  sub:'BCCL', type:'Opencast',    prod:0.62, grade:'Coking Coal',         risk:'High' },
  { name:'Ena Colliery',       sub:'BCCL', type:'Opencast',    prod:1.27, grade:'Coking Coal',         risk:'High' },
  // CCL
  { name:'Amrapali OC',        sub:'CCL',  type:'Opencast',    prod:8.75, grade:'GCV ~G10/G11',        risk:'High' },
  { name:'Magadh OC',          sub:'CCL',  type:'Opencast',    prod:8.57, grade:'GCV ~G10/G11',        risk:'High' },
  { name:'Ashoka OC',          sub:'CCL',  type:'Opencast',    prod:2.43, grade:'GCV ~4526 (G10)',     risk:'Medium' },
  { name:'Piparwar OC',        sub:'CCL',  type:'Opencast',    prod:5.0,  grade:'GCV ~4763 (G9)',      risk:'Medium' },
  { name:'North Urimari OC',   sub:'CCL',  type:'Opencast',    prod:1.89, grade:'GCV ~4100 (G11)',     risk:'Medium' },
  { name:'Amalgamated Konar',  sub:'CCL',  type:'Opencast',    prod:1.78, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Karo OC',            sub:'CCL',  type:'Opencast',    prod:1.43, grade:'GCV ~4620 (G9)',      risk:'Medium' },
  { name:'KBP OC',             sub:'CCL',  type:'Opencast',    prod:1.25, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Aadocm OC',          sub:'CCL',  type:'Opencast',    prod:2.61, grade:'Thermal Grade',       risk:'Medium' },
  // SCCL
  { name:'Adriyala Shaft',     sub:'SCCL', type:'Underground', prod:1.47, grade:'GCV ~G11',            risk:'Critical' },
  { name:'KTK OCP-II',         sub:'SCCL', type:'Opencast',    prod:8.0,  grade:'GCV G5 to G11',      risk:'Medium' },
  { name:'Shantikhani',        sub:'SCCL', type:'Underground', prod:2.0,  grade:'GCV ~G10',            risk:'High' },
  { name:'RG OCP-3 Extn',      sub:'SCCL', type:'Opencast',    prod:7.0,  grade:'GCV ~G7/G11',        risk:'Medium' },
  { name:'VK OC Mine',         sub:'SCCL', type:'Opencast',    prod:3.5,  grade:'GCV G4/G8',           risk:'Medium' },
  // WCL
  { name:'Amalgamated Yekona', sub:'WCL',  type:'Opencast',    prod:2.75, grade:'Thermal Grade',       risk:'High' },
  { name:'Mungoli Nirguda OC', sub:'WCL',  type:'Opencast',    prod:1.84, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Neeljay Deep OC',    sub:'WCL',  type:'Opencast',    prod:1.58, grade:'Thermal Grade',       risk:'High' },
  { name:'Adasa Mixed',        sub:'WCL',  type:'Mixed',       prod:0.71, grade:'Thermal Grade',       risk:'High' },
  { name:'Sasti OC',           sub:'WCL',  type:'Opencast',    prod:0.88, grade:'GCV ~3392 (G13/G14)', risk:'Medium' },
  { name:'Durgapur OC',        sub:'WCL',  type:'Opencast',    prod:0.7,  grade:'Thermal Grade',       risk:'Medium' },
  { name:'Bhatadi Extension OC', sub:'WCL', type:'Opencast',   prod:0.7,  grade:'Thermal Grade',       risk:'Medium' },
  { name:'Gokul OC',           sub:'WCL',  type:'Opencast',    prod:0.66, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Dhankasa & Jamunia', sub:'WCL',  type:'Opencast',    prod:0.5,  grade:'Thermal Grade',       risk:'Medium' },
  // ECL
  { name:'Jhanjra UG',         sub:'ECL',  type:'Underground', prod:1.54, grade:'High Grade Non-Coking', risk:'Critical' },
  { name:'Rajmahal OC',        sub:'ECL',  type:'Opencast',    prod:5.24, grade:'Thermal Grade',       risk:'High' },
  { name:'Sonepur Bazari OC',  sub:'ECL',  type:'Opencast',    prod:3.68, grade:'Thermal Grade',       risk:'High' },
  { name:'Chitra OC',          sub:'ECL',  type:'Opencast',    prod:0.54, grade:'Thermal Grade',       risk:'Medium' },
  { name:'G/Begunia OC',       sub:'ECL',  type:'Opencast',    prod:0.53, grade:'Thermal Grade',       risk:'Medium' },
  { name:'Hura C OC',          sub:'ECL',  type:'Opencast',    prod:0.97, grade:'Thermal Grade',       risk:'Medium' },
];

module.exports = function seed(db, run, saveDb) {
  const subCount = {};

  RAW.forEach((m, idx) => {
    subCount[m.sub] = (subCount[m.sub] || 0) + 1;
    const hq   = HQ[m.sub];
    const coord= jitter(hq, subCount[m.sub]);
    const id   = `${m.sub}${String(subCount[m.sub]).padStart(3,'0')}`;
    const base = { Critical:32, High:55, Medium:74 }[m.risk] || 60;
    const compliance = Math.max(18, Math.min(96, base + (idx % 11) - 5));
    const gcvKcal = gcvMidpoint(m.grade);
    const gcvBand = (m.grade.match(/G(\d+)/) || [,'T'])[1];
    const gassiness = (m.type === 'Underground' || m.type === 'Mixed')
      ? ({ Critical:'Degree III', High:'Degree II', Medium:'Degree I' }[m.risk] || 'Degree I')
      : null;

    run(
      `INSERT INTO mines (id,name,location,lat,lng,risk,production,compliance,subsidiary,mine_type,gcv_kcal,gcv_band,gassiness,grade_label)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, m.name, HQ[m.sub] ? `${['Korba','Sambalpur','Singrauli','Dhanbad','Ranchi','Kothagudem','Nagpur','Asansol'][['SECL','MCL','NCL','BCCL','CCL','SCCL','WCL','ECL'].indexOf(m.sub)]}, India` : 'India',
        coord.lat, coord.lng,
        m.risk.toLowerCase(),
        m.prod,
        compliance,
        m.sub,
        m.type,
        gcvKcal,
        gcvBand === 'T' ? 'Thermal' : 'G'+gcvBand,
        gassiness || 'N/A',
        m.grade
      ]
    );
  });

  /* ── Compliance items (one per real mine for critical/high) ── */
  const critHigh = RAW.filter(m => m.risk === 'Critical' || m.risk === 'High');
  subCount2 = {};
  critHigh.forEach((m, i) => {
    subCount2[m.sub] = (subCount2[m.sub] || 0) + 1;
    const id2 = `${m.sub}${String(subCount2[m.sub]).padStart(3,'0')}`;
    const cats = ['Safety','Environment','Labour','Production'];
    const cat = cats[i % 4];
    const regs = {
      Safety: 'Mines Act 1952 – Sec 45 / CMR 2017',
      Environment: 'EP Act – Air/Water Quality & EIA Compliance',
      Labour: 'CLRA 1970 – Contractor Worker Safety',
      Production: 'Monthly GCV-band Dispatch Report – MoC',
    };
    run(
      `INSERT INTO compliance_items (id,category,regulation,mine_name,status,due_date,days_overdue,responsible)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        `COMP${i+1}`, cat, regs[cat], m.name,
        m.risk === 'Critical' ? 'non-compliant' : 'at-risk',
        '2026-09-15',
        m.risk === 'Critical' ? 20 + (i % 20) : 0,
        `${cat} Officer`
      ]
    );
  });

  /* ── Inspections ─────────────────────────────────────────── */
  const inspSamples = [
    // Overdue (4 items)
    { id:'INS-070', type:'Safety (DGMS)', mine:'Dudhichua OC', insp:'A. Patel', date:'2026-08-23', time:'10:00 AM', priority:'High', status:'overdue', f:5, c:0, desc:'Overburden dump edge stability and haul road barrier check.' },
    { id:'INS-071', type:'Statutory', mine:'Jayant OC', insp:'S. Reddy', date:'2026-08-25', time:'11:30 AM', priority:'Medium', status:'overdue', f:4, c:0, desc:'Dragline operator logbook and statutory DGMS register inspection.' },
    { id:'INS-072', type:'Labour / Workforce', mine:'Lakhanpur OC', insp:'V. Kumar', date:'2026-08-27', time:'02:00 PM', priority:'Medium', status:'overdue', f:3, c:0, desc:'Contractor workforce PPE compliance and shift hour monitoring.' },
    { id:'INS-073', type:'Production', mine:'Bhubaneswari OC', insp:'N. Das', date:'2026-08-29', time:'09:00 AM', priority:'Low', status:'overdue', f:7, c:0, desc:'Surface extraction velocity and in-pit crusher output verification.' },

    // Completed in August (5 items)
    { id:'INS-074', type:'Safety (DGMS)', mine:'Baroud OC', insp:'K. Nair', date:'2026-08-15', time:'09:30 AM', priority:'Low', status:'completed', f:0, c:0, desc:'Standard opencast bench geometry and berm height compliance check.' },
    { id:'INS-075', type:'Environmental', mine:'Chhal OC', insp:'P. Rao', date:'2026-08-17', time:'11:00 AM', priority:'Medium', status:'completed', f:3, c:0, desc:'Wet drilling suppression effectiveness and water tanker dispatch.' },
    { id:'INS-076', type:'Production', mine:'Manikpur OC', insp:'M. Singh', date:'2026-08-19', time:'01:30 PM', priority:'Low', status:'completed', f:2, c:0, desc:'Overburden removal reconciliation with monthly mine plan.' },
    { id:'INS-077', type:'Safety (DGMS)', mine:'Nigahi OC', insp:'R. Sharma', date:'2026-08-21', time:'10:00 AM', priority:'High', status:'completed', f:6, c:1, desc:'Automated fire detection & suppression system (AFDSS) audit on dumpers.' },
    { id:'INS-078', type:'Environmental', mine:'Surakachhar', insp:'L. Verma', date:'2026-08-31', time:'03:00 PM', priority:'Medium', status:'completed', f:6, c:0, desc:'Underground water sump telemetry and effluent treatment monitoring.' },

    // Scheduled in September (3 items: INS-079, INS-080, INS-089)
    { id:'INS-079', type:'Compliance', mine:'Kusmunda OC', insp:'V. Kumar', date:'2026-09-15', time:'10:00 AM', priority:'Medium', status:'scheduled', f:0, c:0, desc:'Statutory compliance verification and environmental clearance renewal audit.' },
    { id:'INS-080', type:'Safety (DGMS)', mine:'Pootkee Balihari', insp:'S.K. Mishra', date:'2026-09-16', time:'11:30 AM', priority:'Critical', status:'scheduled', f:0, c:0, desc:'Subsidence risk analysis and surface fissure monitoring near inhabited perimeter.' },

    // September 2026 Calendar items (INS-081 to INS-089)
    { id:'INS-081', type:'Safety (DGMS)', mine:'Churcha RO', insp:'G.S. Mehta', date:'2026-09-01', time:'09:30 AM', priority:'Critical', status:'completed', f:9, c:4, desc:'Deep underground strata control and mechanized resin roof bolting audit.' },
    { id:'INS-082', type:'Environmental', mine:'Moonidih', insp:'R.K. Tripathi', date:'2026-09-01', time:'02:00 PM', priority:'High', status:'completed', f:6, c:3, desc:'Continuous telemetric methane monitoring and drainage exhaust analysis.' },
    { id:'INS-083', type:'Production', mine:'SECL Gevra', insp:'D.N. Sharma', date:'2026-09-02', time:'10:00 AM', priority:'Low', status:'completed', f:0, c:0, desc:'High-capacity surface miner deployment and truck dispatch optimization.' },
    { id:'INS-084', type:'Safety (DGMS)', mine:'Adriyala Shaft', insp:'K.V. Rao', date:'2026-09-04', time:'11:00 AM', priority:'Critical', status:'completed', f:5, c:2, desc:'Longwall face strata convergence and powered roof support pressure audit.' },
    { id:'INS-085', type:'Labour / Workforce', mine:'WCL Wardha', insp:'S. Patel', date:'2026-09-07', time:'09:00 AM', priority:'Medium', status:'completed', f:0, c:0, desc:'Workforce statutory safety induction and emergency evacuation protocol.' },
    { id:'INS-086', type:'Safety (DGMS)', mine:'Jayant OC', insp:'A. Kumar', date:'2026-09-08', time:'01:30 PM', priority:'High', status:'completed', f:3, c:1, desc:'Dragline electrical and mechanical fail-safe audit and fatigue monitoring.' },
    { id:'INS-087', type:'Environmental', mine:'Bhubaneswari OC', insp:'P. Singh', date:'2026-09-09', time:'10:30 AM', priority:'Medium', status:'completed', f:4, c:0, desc:'Haul road continuous misting and ambient PM10 telemetry check.' },
    { id:'INS-088', type:'Safety (DGMS)', mine:'Rajmahal OC', insp:'M.L. Gupta', date:'2026-09-09', time:'03:00 PM', priority:'High', status:'in-progress', f:0, c:0, desc:'Controlled blasting vibration seismograph verification and danger zone isolation.' },
    { id:'INS-089', type:'Production', mine:'Dipka OC', insp:'B.N. Tiwari', date:'2026-09-11', time:'11:00 AM', priority:'Low', status:'scheduled', f:0, c:0, desc:'Overburden dump sequencing and coal evacuation logistics review.' }
  ];

  inspSamples.forEach(ins => run(
    `INSERT INTO inspections (id,type,mine_name,inspector,date,time,priority,description,status,findings,critical,notes,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
    [ins.id, ins.type, ins.mine, ins.insp, ins.date, ins.time || '10:00 AM', ins.priority || 'Medium', ins.desc || '', ins.status, ins.f || 0, ins.c || 0, '']
  ));

  /* ── Contractors ─────────────────────────────────────────── */
  const contractors = [
    { id: 'CT001', name: 'Jai Bharat Mining Co.',           type: 'Heavy Earth Moving',     workers: 10370, sc: 71, status: 'active',   exp: '2026-12-20', mine: 'Gevra OC',             areas: 'North Pit Quarry 3, Overburden Bench 4A-4D', role: 'Continuous Overburden Stripping & HEMM Haulage', viol: 1, officer: 'Er. R. K. Mishra (GM Mining Ops, SECL)', start: '2023-12-21', ctype: 'Turnkey HEMM Deployment & Overburden SLA', renewal: 'Active in Good Standing (Eligible for 2-Yr Extension)' },
    { id: 'CT002', name: 'Vishwakarma Infrastructure Ltd.',  type: 'Infrastructure Works',   workers: 628,   sc: 75, status: 'active',   exp: '2027-05-15', mine: 'Chhal OC',             areas: 'Coal Handling Plant Haul Loop, Workshop Bay 2', role: 'Civil Haul Road Construction & Sump Dewatering', viol: 2, officer: 'Sri P. K. Dash (Area Engineer, SECL)', start: '2024-05-16', ctype: 'Mine Infrastructure & Road Works', renewal: 'Active in Good Standing' },
    { id: 'CT003', name: 'SureSafe Systems Pvt. Ltd.',      type: 'Safety & Ventilation',   workers: 4597,  sc: 80, status: 'active',   exp: '2027-08-31', mine: 'Bhubaneswari OC',      areas: 'Sensor Grid Substation 1-6, Main Ventilation Shaft', role: 'Gas Telemetry & Flameproof Electrical Monitoring', viol: 0, officer: 'Dr. V. Rao (Chief Safety Officer, MCL)', start: '2024-09-01', ctype: 'Statutory Safety & Environmental SLA', renewal: 'DGMS Excellence Certified' },
    { id: 'CT004', name: 'Rawat Explosives Services',       type: 'Blasting & Explosives',  workers: 1782,  sc: 78, status: 'expiring', exp: '2026-10-30', mine: 'Sairmal OCP',          areas: 'Magazines 1 & 2, Production Benches 12-16', role: 'Deep Hole Controlled Blasting & Vibration Mitigation', viol: 4, officer: 'Sri S. Rawat (Explosives Liaison Head)', start: '2023-11-01', ctype: 'Bulk Emulsion Supply & Blast Execution', renewal: 'Renewal Due (Statutory Clearance Pending)' },
    { id: 'CT005', name: 'Bharat Labour Corp',               type: 'Manpower Services',      workers: 2964,  sc: 65, status: 'active',   exp: '2027-01-01', mine: 'Jayant OC',            areas: 'Siding A & B, Surface Coal Stockyard', role: 'Statutory Mining Labour & Conveyor Attendants', viol: 0, officer: 'Sri K. Sen (Labour Welfare Commissioner)', start: '2024-01-02', ctype: 'Manpower Supply Contract under CLRA 1970', renewal: 'Annual Review Scheduled' },
    { id: 'CT006', name: 'GreenTech Environmental',         type: 'Dust & Water Control',   workers: 1492,  sc: 84, status: 'active',   exp: '2028-06-30', mine: 'Khadia OC',            areas: 'Boundary Mist Cannons, Settling Ponds 1-4', role: 'Ambient Dust Suppression & Zero Discharge Treatment', viol: 0, officer: 'Ms. A. Sen (Environmental Officer, NCL)', start: '2025-07-01', ctype: 'Environmental Statutory SLA', renewal: 'Active - CPCB Benchmark Compliant' },
    { id: 'CT007', name: 'National Conveyor Systems',       type: 'Coal Handling',          workers: 296,   sc: 56, status: 'active',   exp: '2027-03-31', mine: 'Moonidih',             areas: 'Longwall Trunk Conveyor Belt Line 1-3', role: 'Overland Conveyor Operation & Belt Vulcanizing Maintenance', viol: 6, officer: 'Sri M. Gupta (Mechanical Engineer, BCCL)', start: '2024-04-01', ctype: 'Conveyor Handling Maintenance SLA', renewal: 'Under DGMS Special Supervision' },
    { id: 'CT008', name: 'Eastern Mining Contractors',      type: 'Opencast Mining',        workers: 541,   sc: 60, status: 'active',   exp: '2026-11-30', mine: 'Gopalichak',           areas: 'West Pit Overburden Sector C', role: 'Excavation & Rock Truck Haulage', viol: 9, officer: 'Sri B. Roy (Project Officer, BCCL)', start: '2023-12-01', ctype: 'Mining Excavation Contract', renewal: 'Under DGMS Section 22 Improvement Notice' },
    { id: 'CT009', name: 'Singareni Heavy Equipment Co.',   type: 'Equipment Lease',        workers: 1599,  sc: 78, status: 'active',   exp: '2027-09-30', mine: 'Amrapali OC',          areas: 'Overburden Bench Sector 5, Central Maintenance Yard', role: 'HEMM Fleet Lease (240T Dumpers & 42m³ Shovels)', viol: 4, officer: 'Sri T. Reddy (Chief of HEMM Operations, CCL)', start: '2024-10-01', ctype: 'Heavy Equipment Lease & Maintenance SLA', renewal: 'Active in Good Standing' },
    { id: 'CT010', name: 'Central Coal Transport Ltd.',     type: 'Transport & Logistics',  workers: 556,   sc: 72, status: 'active',   exp: '2027-04-15', mine: 'North Urimari OC',     areas: 'Railway Siding Loading Point 1-4', role: 'Bulk Coal Rake Dispatch & GPS Fleet Tracking', viol: 0, officer: 'Sri D. Verma (Traffic Manager, CCL)', start: '2024-04-16', ctype: 'Dispatch & Rail Loading Contract', renewal: 'Active' },
    { id: 'CT011', name: 'Odisha Bulk Carriers',            type: 'Coal Transport',         workers: 303,   sc: 69, status: 'active',   exp: '2026-12-15', mine: 'Adriyala Shaft',       areas: 'Surface Coal Bunkers & Evacuation Highway', role: 'Specialized High-Capacity Tipping Trailer Fleet', viol: 1, officer: 'Sri N. Mohanty (Logistics Head, SCCL)', start: '2023-12-16', ctype: 'Road Haulage & Dispatch Agreement', renewal: 'Renewal Due' },
    { id: 'CT012', name: 'Apex Surface Miners India',       type: 'Surface Mining',         workers: 596,   sc: 76, status: 'active',   exp: '2027-07-31', mine: 'Amalgamated Yekona',   areas: 'Seam III Continuous Surface Miner Panel', role: 'Vibration-Free Precision Coal Milling & Direct Loading', viol: 2, officer: 'Sri S. Deshmukh (Production Manager, WCL)', start: '2024-08-01', ctype: 'Continuous Surface Miner SLA', renewal: 'Active' },
    { id: 'CT013', name: 'Deccan Mining Services',          type: 'Manpower Services',      workers: 301,   sc: 80, status: 'active',   exp: '2028-01-31', mine: 'Sasti OC',             areas: 'Pit Incline & Safety Muster Station', role: 'Statutory Mining Sirdars & First Aid Station Attendants', viol: 1, officer: 'Sri R. Patil (Safety In-Charge, WCL)', start: '2025-02-01', ctype: 'Technical Manpower & Safety Support', renewal: 'Active' },
    { id: 'CT014', name: 'Jharkhand Drilling Corp',         type: 'Drilling & Exploration', workers: 905,   sc: 64, status: 'active',   exp: '2026-10-15', mine: 'Jhanjra UG',           areas: 'Longwall Panel LW-8 Methane Drainage Bores', role: 'In-Seam Directional Drilling & Degasification Holes', viol: 7, officer: 'Dr. A. Ghosh (GM Underground, ECL)', start: '2023-10-16', ctype: 'Exploration & Gas Drainage Drilling SLA', renewal: 'Improvement Directive Active' },
    { id: 'CT015', name: 'MP Coal Handlers Pvt. Ltd.',      type: 'Coal Handling',          workers: 193,   sc: 73, status: 'active',   exp: '2027-02-28', mine: 'G/Begunia OC',         areas: 'Primary Crusher Hopper & Sizing Screen Bay', role: 'Screening Plant Operation & Chute Maintenance', viol: 0, officer: 'Sri J. P. Singh (Plant Superintendent, ECL)', start: '2024-03-01', ctype: 'Coal Beneficiation & Crushing Agreement', renewal: 'Active' },
  ];
  contractors.forEach(c => run(
    `INSERT INTO contractors (id,name,type,workers,compliance_score,status,contract_expiry,primary_mine,assigned_areas,operational_role,violations_count,responsible_officer,contract_start,contract_type,renewal_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [c.id, c.name, c.type, c.workers, c.sc, c.status, c.exp, c.mine, c.areas, c.role, c.viol, c.officer, c.start, c.ctype, c.renewal]
  ));

  /* ── Incidents ───────────────────────────────────────────── */
  const incidents = [
    { id:'IN001', type:'Firedamp Alert',       mine:'Moonidih',         date:'2026-09-08', sev:'critical', desc:'CH₄ concentration exceeded 1.25% TLV at Level 5 – emergency evacuation triggered', status:'open',     rep:'Shift Sirdar', lat:23.79, lng:86.43 },
    { id:'IN002', type:'Spontaneous Combustion',mine:'Kenduadih',       date:'2026-09-07', sev:'critical', desc:'CO levels 450 ppm detected in Seam VIII; active fire front advancing', status:'open',     rep:'Safety Officer', lat:23.79, lng:86.43 },
    { id:'IN003', type:'Roof Fall',            mine:'Jhanjra UG',       date:'2026-09-06', sev:'high',     desc:'2-metre roof fall in Section C gate road; 1 worker injured, area sealed', status:'open',     rep:'Overman', lat:23.67, lng:87.07 },
    { id:'IN004', type:'HEMM Collision',        mine:'Gevra OC',        date:'2026-09-05', sev:'high',     desc:'220T dumper collided with drillrig; driver injured, AQI spike', status:'resolved', rep:'HEMM Operator', lat:22.36, lng:82.64 },
    { id:'IN005', type:'Overloading',           mine:'Jayant OC',       date:'2026-09-04', sev:'medium',   desc:'Dragline bucket overloaded 18% above rated capacity – DGMS Form 6 issued', status:'open',     rep:'Site Engineer', lat:24.10, lng:82.77 },
    { id:'IN006', type:'Environmental Breach',  mine:'Rajmahal OC',     date:'2026-09-03', sev:'high',     desc:'PM₁₀ reading 380 µg/m³ – 3x CPCB limit during blasting operations', status:'open',     rep:'Env. Officer', lat:23.67, lng:87.07 },
    { id:'IN007', type:'Strata Instability',    mine:'Adriyala Shaft',  date:'2026-09-02', sev:'critical', desc:'Convergence sensor reading 48mm/day in LW-8; immediate panel withdrawal ordered', status:'open',     rep:'Mining Sirdar', lat:17.55, lng:80.62 },
    { id:'IN008', type:'Water Inundation Risk', mine:'Murlidih',        date:'2026-09-01', sev:'critical', desc:'Fissure zone expanding toward inundated goaf; pumping capacity insufficient', status:'open',     rep:'Mine Manager', lat:23.79, lng:86.43 },
  ];
  incidents.forEach(i => run(
    `INSERT INTO incidents (id,type,mine_name,date,severity,description,status,reporter,geo_lat,geo_lng) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [i.id, i.type, i.mine, i.date, i.sev, i.desc, i.status, i.rep, i.lat, i.lng]
  ));

  /* ── Alerts ──────────────────────────────────────────────── */
  const alerts = [
    { id:'A001', type:'critical', msg:'CRITICAL: CH₄ >1.25% at Moonidih Level 5 – Evacuation in progress', mine:'Moonidih' },
    { id:'A002', type:'critical', msg:'CRITICAL: Strata convergence 48mm/day at Adriyala Shaft LW-8 – Withdraw panel', mine:'Adriyala Shaft' },
    { id:'A003', type:'critical', msg:'Active fire front advancing in Kenduadih Seam VIII – CO 450 ppm', mine:'Kenduadih' },
    { id:'A004', type:'danger',   msg:'Jhanjra UG: Roof fall in Section C – 1 injury, DGMS notification required', mine:'Jhanjra UG' },
    { id:'A005', type:'danger',   msg:'Rajmahal OC: PM₁₀ = 380 µg/m³ during blasting – halt operations', mine:'Rajmahal OC' },
    { id:'A006', type:'warning',  msg:'Churcha RO: 4 critical inspection findings pending corrective action (overdue 20d)', mine:'Churcha RO' },
    { id:'A007', type:'warning',  msg:'Rawat Explosives Ltd. contract expiring in 51 days – renewal required', mine:'System' },
    { id:'A008', type:'info',     msg:'DGMS Ventilation Inspection scheduled at Jhanjra UG on Sep 10', mine:'Jhanjra UG' },
    { id:'A009', type:'info',     msg:'Moonidih: Monthly methane degasification report due Sep 15', mine:'Moonidih' },
  ];
  alerts.forEach(a => run(
    `INSERT INTO alerts (id,type,message,mine,resolved) VALUES (?,?,?,?,0)`,
    [a.id, a.type, a.msg, a.mine]
  ));

  /* ── Audit Log ───────────────────────────────────────────── */
  const auditEntries = [
    { id:'AU001', action:'System Initialized',         user:'System',        mine:'System',         hash:'0000seed1', prev:'0000000000000000' },
    { id:'AU002', action:'79 Mines Database Seeded',    user:'System',        mine:'System',         hash:'0000seed2', prev:'0000seed1' },
    { id:'AU003', action:'CH₄ Alert Escalated',         user:'AI Engine',     mine:'Moonidih',       hash:'a3f9b2c1',  prev:'0000seed2' },
    { id:'AU004', action:'DGMS Form 4-A Filed',         user:'R.K. Tripathi', mine:'Moonidih',       hash:'d7e8a5f0',  prev:'a3f9b2c1' },
    { id:'AU005', action:'Inspection Completed',        user:'G.S. Mehta',    mine:'Churcha RO',     hash:'f1c4e9b3',  prev:'d7e8a5f0' },
    { id:'AU006', action:'Strata Alert Escalated',      user:'AI Engine',     mine:'Adriyala Shaft', hash:'9a2b7c6d',  prev:'f1c4e9b3' },
    { id:'AU007', action:'Environmental Breach Logged', user:'Env. Officer',  mine:'Rajmahal OC',    hash:'b5d3a8e2',  prev:'9a2b7c6d' },
  ];
  auditEntries.forEach(a => run(
    `INSERT INTO audit_log (id,action,user_name,mine,payload,hash,prev_hash) VALUES (?,?,?,?,?,?,?)`,
    [a.id, a.action, a.user, a.mine, '{}', a.hash, a.prev]
  ));

  saveDb();
};

module.exports.seedInspections = function(db, run, saveDb) {
  const inspSamples = [
    // Overdue (4 items)
    { id:'INS-070', type:'Safety (DGMS)', mine:'Dudhichua OC', insp:'A. Patel', date:'2026-08-23', time:'10:00 AM', priority:'High', status:'overdue', f:5, c:0, desc:'Overburden dump edge stability and haul road barrier check.' },
    { id:'INS-071', type:'Statutory', mine:'Jayant OC', insp:'S. Reddy', date:'2026-08-25', time:'11:30 AM', priority:'Medium', status:'overdue', f:4, c:0, desc:'Dragline operator logbook and statutory DGMS register inspection.' },
    { id:'INS-072', type:'Labour / Workforce', mine:'Lakhanpur OC', insp:'V. Kumar', date:'2026-08-27', time:'02:00 PM', priority:'Medium', status:'overdue', f:3, c:0, desc:'Contractor workforce PPE compliance and shift hour monitoring.' },
    { id:'INS-073', type:'Production', mine:'Bhubaneswari OC', insp:'N. Das', date:'2026-08-29', time:'09:00 AM', priority:'Low', status:'overdue', f:7, c:0, desc:'Surface extraction velocity and in-pit crusher output verification.' },

    // Completed in August (5 items)
    { id:'INS-074', type:'Safety (DGMS)', mine:'Baroud OC', insp:'K. Nair', date:'2026-08-15', time:'09:30 AM', priority:'Low', status:'completed', f:0, c:0, desc:'Standard opencast bench geometry and berm height compliance check.' },
    { id:'INS-075', type:'Environmental', mine:'Chhal OC', insp:'P. Rao', date:'2026-08-17', time:'11:00 AM', priority:'Medium', status:'completed', f:3, c:0, desc:'Wet drilling suppression effectiveness and water tanker dispatch.' },
    { id:'INS-076', type:'Production', mine:'Manikpur OC', insp:'M. Singh', date:'2026-08-19', time:'01:30 PM', priority:'Low', status:'completed', f:2, c:0, desc:'Overburden removal reconciliation with monthly mine plan.' },
    { id:'INS-077', type:'Safety (DGMS)', mine:'Nigahi OC', insp:'R. Sharma', date:'2026-08-21', time:'10:00 AM', priority:'High', status:'completed', f:6, c:1, desc:'Automated fire detection & suppression system (AFDSS) audit on dumpers.' },
    { id:'INS-078', type:'Environmental', mine:'Surakachhar', insp:'L. Verma', date:'2026-08-31', time:'03:00 PM', priority:'Medium', status:'completed', f:6, c:0, desc:'Underground water sump telemetry and effluent treatment monitoring.' },

    // Scheduled in September (3 items: INS-079, INS-080, INS-089)
    { id:'INS-079', type:'Compliance', mine:'Kusmunda OC', insp:'V. Kumar', date:'2026-09-15', time:'10:00 AM', priority:'Medium', status:'scheduled', f:0, c:0, desc:'Statutory compliance verification and environmental clearance renewal audit.' },
    { id:'INS-080', type:'Safety (DGMS)', mine:'Pootkee Balihari', insp:'S.K. Mishra', date:'2026-09-16', time:'11:30 AM', priority:'Critical', status:'scheduled', f:0, c:0, desc:'Subsidence risk analysis and surface fissure monitoring near inhabited perimeter.' },

    // September 2026 Calendar items (INS-081 to INS-089)
    { id:'INS-081', type:'Safety (DGMS)', mine:'Churcha RO', insp:'G.S. Mehta', date:'2026-09-01', time:'09:30 AM', priority:'Critical', status:'completed', f:9, c:4, desc:'Deep underground strata control and mechanized resin roof bolting audit.' },
    { id:'INS-082', type:'Environmental', mine:'Moonidih', insp:'R.K. Tripathi', date:'2026-09-01', time:'02:00 PM', priority:'High', status:'completed', f:6, c:3, desc:'Continuous telemetric methane monitoring and drainage exhaust analysis.' },
    { id:'INS-083', type:'Production', mine:'SECL Gevra', insp:'D.N. Sharma', date:'2026-09-02', time:'10:00 AM', priority:'Low', status:'completed', f:0, c:0, desc:'High-capacity surface miner deployment and truck dispatch optimization.' },
    { id:'INS-084', type:'Safety (DGMS)', mine:'Adriyala Shaft', insp:'K.V. Rao', date:'2026-09-04', time:'11:00 AM', priority:'Critical', status:'completed', f:5, c:2, desc:'Longwall face strata convergence and powered roof support pressure audit.' },
    { id:'INS-085', type:'Labour / Workforce', mine:'WCL Wardha', insp:'S. Patel', date:'2026-09-07', time:'09:00 AM', priority:'Medium', status:'completed', f:0, c:0, desc:'Workforce statutory safety induction and emergency evacuation protocol.' },
    { id:'INS-086', type:'Safety (DGMS)', mine:'Jayant OC', insp:'A. Kumar', date:'2026-09-08', time:'01:30 PM', priority:'High', status:'completed', f:3, c:1, desc:'Dragline electrical and mechanical fail-safe audit and fatigue monitoring.' },
    { id:'INS-087', type:'Environmental', mine:'Bhubaneswari OC', insp:'P. Singh', date:'2026-09-09', time:'10:30 AM', priority:'Medium', status:'completed', f:4, c:0, desc:'Haul road continuous misting and ambient PM10 telemetry check.' },
    { id:'INS-088', type:'Safety (DGMS)', mine:'Rajmahal OC', insp:'M.L. Gupta', date:'2026-09-09', time:'03:00 PM', priority:'High', status:'in-progress', f:0, c:0, desc:'Controlled blasting vibration seismograph verification and danger zone isolation.' },
    { id:'INS-089', type:'Production', mine:'Dipka OC', insp:'B.N. Tiwari', date:'2026-09-11', time:'11:00 AM', priority:'Low', status:'scheduled', f:0, c:0, desc:'Overburden dump sequencing and coal evacuation logistics review.' }
  ];

  inspSamples.forEach(ins => run(
    `INSERT INTO inspections (id,type,mine_name,inspector,date,time,priority,description,status,findings,critical,notes,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
    [ins.id, ins.type, ins.mine, ins.insp, ins.date, ins.time || '10:00 AM', ins.priority || 'Medium', ins.desc || '', ins.status, ins.f || 0, ins.c || 0, '']
  ));
  saveDb();
};
