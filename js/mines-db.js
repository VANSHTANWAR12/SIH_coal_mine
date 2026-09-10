/* ==========================================================
   CoalGuard – Real Mine Database (from database.txt)
   79 Indian coal mines across 7 CIL subsidiaries
   ========================================================== */

/* ── Coordinates lookup (approx. regional centroids) ───── */
const SUBSIDIARY_HQ = {
  SECL: { lat:22.36, lng:82.64, state:'Chhattisgarh/MP' },
  MCL:  { lat:20.84, lng:85.10, state:'Odisha' },
  NCL:  { lat:24.10, lng:82.77, state:'MP/UP' },
  BCCL: { lat:23.79, lng:86.43, state:'Jharkhand' },
  CCL:  { lat:23.65, lng:85.51, state:'Jharkhand' },
  SCCL: { lat:17.55, lng:80.62, state:'Telangana' },
  WCL:  { lat:20.71, lng:78.60, state:'Maharashtra/MP' },
  ECL:  { lat:23.67, lng:87.07, state:'West Bengal/Jharkhand' },
};

/* Slight random offset to spread pins within subsidiary region */
function jitter(base, idx, range=1.2) {
  const angle = (idx * 137.5) * Math.PI / 180;
  const r = (idx % 7) * (range / 7);
  return { lat: +(base.lat + r * Math.sin(angle)).toFixed(4),
           lng: +(base.lng + r * Math.cos(angle)).toFixed(4) };
}

/* GCV band → numeric Kcal/kg midpoint */
function gcvMidpoint(grade) {
  const map = {
    G1:7100,G2:6700,G3:6400,G4:6100,G5:5800,G6:5500,
    G7:5200,G8:4900,G9:4600,G10:4200,G11:3900,G12:3600,
    G13:3250,G14:3000,G15:2750,G16:2500,G17:2350,
  };
  // parse first grade band from strings like "G10/G11" or "G4"
  const m = grade.match(/G(\d+)/);
  return m ? (map['G'+m[1]] || 3500) : 3500;
}

/* Risk severity → numeric 0-100 for AI engine */
function riskToScore(sev) {
  return { Critical:88, High:68, Medium:42, Low:18 }[sev] || 42;
}

/* ── Master Mine List ────────────────────────────────────── */
const REAL_MINES_RAW = [
  /* SECL */
  { name:'Gevra OC',           sub:'SECL', type:'Opencast',    prod:'>50 MT/year',              grade:'GCV ~4372 (G10)',     risk:'High',     reason:'Unprecedented scale requires extreme HEMM traffic control via OITDS; high particulate matter (dust) emission risks affecting regional AQI.' },
  { name:'Kusmunda OC',        sub:'SECL', type:'Opencast',    prod:'>50 MT/year',              grade:'GCV ~3948 (G11/G12)',  risk:'High',     reason:'Massive overburden removal and heavy blasting operations present severe slope stability and localized environmental risks.' },
  { name:'Dipka OC',           sub:'SECL', type:'Opencast',    prod:'~35-40 MT/year',           grade:'GCV ~4722 (G9)',       risk:'High',     reason:'Expansive footprint requires constant GIS monitoring for overburden dump stability and heavy machinery proximity hazards.' },
  { name:'Manikpur OC',        sub:'SECL', type:'Opencast',    prod:'~2.2 MT/year',             grade:'GCV ~3753 (G12/G13)', risk:'Medium',   reason:'Continuous monitoring of overburden removal required to prevent localized groundwater impacts in the Korba field.' },
  { name:'Chhal OC',           sub:'SECL', type:'Opencast',    prod:'~2.85 MT/year',            grade:'GCV ~2968 (G14/G15)', risk:'Medium',   reason:'Lower grade extraction; primary risks involve dust generation, requiring strict adherence to wet drilling and water spraying.' },
  { name:'Baroud OC',          sub:'SECL', type:'Opencast',    prod:'~2.46 MT/year',            grade:'GCV ~2812 (G14/G15)', risk:'Medium',   reason:'Standard opencast hazards; requires continuous environmental telemetry for compliance with quarterly air quality sampling.' },
  { name:'Churcha RO',         sub:'SECL', type:'Underground', prod:'<1.0 MT/year',             grade:'GCV ~6268 (G4)',       risk:'Critical', reason:'Deep underground operations facing severe strata control challenges, requiring mechanized resin roof bolting and vigilant ventilation tracking.' },
  { name:'Surakachhar',        sub:'SECL', type:'Underground', prod:'<1.0 MT/year',             grade:'GCV ~4830 (G9)',       risk:'High',     reason:'Complex underground environment necessitating continuous monitoring for gas emissions and equipment failure in confined spaces.' },
  { name:'Amadand OC',         sub:'SECL', type:'Opencast',    prod:'~1.85 MT/year',            grade:'GCV ~3303 (G13)',      risk:'Medium',   reason:'Routine opencast risks; requires automated gate entry logs to manage contractor dispatch and weighbridge compliance.' },
  { name:'Jampali OC',         sub:'SECL', type:'Opencast',    prod:'~1.15 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Focus on automated tracking of HEMM fatigue and proper maintenance of surface miners to minimize operational downtime.' },
  { name:'Saraipalli OC',      sub:'SECL', type:'Opencast',    prod:'~0.81 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Requires integration of basic environmental sensors to ensure compliance with DGMS dust and noise limits.' },
  { name:'Rampur Batura OC',   sub:'SECL', type:'Opencast',    prod:'~1.15 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Needs rigorous contractor management protocols to ensure workforce adherence to PPE and shift limits.' },
  { name:'Amlai OC',           sub:'SECL', type:'Opencast',    prod:'~0.58 MT/year',            grade:'GCV ~4133 (G11)',      risk:'Medium',   reason:'Standard slope and traffic management risks; AI to monitor optimal fleet utilization against production targets.' },
  /* MCL */
  { name:'Bhubaneswari OC',    sub:'MCL',  type:'Opencast',    prod:'~30 MT/year',              grade:'Thermal Grade',        risk:'High',     reason:'Record daily extraction rates (over 86,000 tonnes/day) pose extreme logistical, truck dispatch, and dust suppression risks.' },
  { name:'Lakhanpur OC',       sub:'MCL',  type:'Opencast',    prod:'>15 MT/year',              grade:'Thermal Grade',        risk:'High',     reason:'Massive integrated project scale demands vast water management and continuous overburden dump slope monitoring to prevent landslides.' },
  { name:'Lingaraj OC',        sub:'MCL',  type:'Opencast',    prod:'~7.75 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Ongoing expansion requires strict AI-driven adherence to environmental clearance limits and heavy vehicle fleet proximity tracking.' },
  { name:'Ananta OC',          sub:'MCL',  type:'Opencast',    prod:'~7.48 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'High volume dispatch necessitates active suppression of respirable airborne dust to protect worker respiratory health.' },
  { name:'Sairmal OCP',        sub:'MCL',  type:'Opencast',    prod:'~7.16 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'AI must focus on predictive maintenance of surface miners to ensure continuous blast-free extraction.' },
  { name:'Kulda OC',           sub:'MCL',  type:'Opencast',    prod:'~5.29 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Extremely high volumes of truck dispatch require strict gate automation and RFID tracking to prevent collisions and overloading.' },
  { name:'Samleswari OC',      sub:'MCL',  type:'Opencast',    prod:'~5.38 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Located in the Ib Valley; requires vigilant surface water runoff management to prevent aquatic ecosystem degradation.' },
  { name:'Hingula OC',         sub:'MCL',  type:'Opencast',    prod:'~4.86 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Operations require continuous real-time telemetry monitoring of noise and vibration limits generated by heavy machinery.' },
  { name:'Garjanbahal OC',     sub:'MCL',  type:'Opencast',    prod:'~6.05 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Contractor management is critical here to ensure adequate safety training and grievance handling for a large contractual workforce.' },
  { name:'Bharathpur OC',      sub:'MCL',  type:'Opencast',    prod:'~3.12 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Routine opencast hazards requiring continuous updating of the Site-Specific Risk Assessment based Safety Management Plans.' },
  { name:'Kanhia OC',          sub:'MCL',  type:'Opencast',    prod:'~3.4 MT/year',             grade:'Thermal Grade',        risk:'Medium',   reason:'Expansion activities must be mapped via GIS to ensure operations do not encroach upon restricted environmental buffer zones.' },
  { name:'Jagannath OC',       sub:'MCL',  type:'Opencast',    prod:'~0.53 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Lower current production but historical footprint requires monitoring of old voids and proper backfilling procedures.' },
  { name:'Lajkura OC',         sub:'MCL',  type:'Opencast',    prod:'~1.46 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Focus on automated daily inspection logging via mobile applications to track minor slip-and-trip hazards and machinery defects.' },
  { name:'Balram OC',          sub:'MCL',  type:'Opencast',    prod:'~0.39 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Requires basic integration into the centralized dashboard for production tracking and worker attendance verification.' },
  /* NCL */
  { name:'Jayant OC',          sub:'NCL',  type:'Opencast',    prod:'~12.02 MT/year',           grade:'Thermal Grade',        risk:'High',     reason:'Intense blasting operations and the deployment of massive draglines necessitate strict vibration and equipment proximity safety protocols.' },
  { name:'Dudhichua OC',       sub:'NCL',  type:'Opencast',    prod:'~11.24 MT/year',           grade:'Thermal Grade',        risk:'High',     reason:'Vast geographical scale requires OITDS and precise geo-fencing to orchestrate the safe movement of hundreds of high-capacity haul trucks.' },
  { name:'Nigahi OC',          sub:'NCL',  type:'Opencast',    prod:'~8.52 MT/year',            grade:'Thermal Grade',        risk:'High',     reason:'High stripping ratios demand critical slope stability analysis and the mandatory use of automatic fire detection/suppression systems on dumpers.' },
  { name:'Amlohri OC',         sub:'NCL',  type:'Opencast',    prod:'~6.67 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Requires strict adherence to DGMS safety management plans regarding the structural integrity and maintenance of draglines.' },
  { name:'Khadia OC',          sub:'NCL',  type:'Opencast',    prod:'~6.7 MT/year',             grade:'Thermal Grade',        risk:'Medium',   reason:'Inter-state operational boundaries require a robust, unified digital reporting framework for environmental and statutory data.' },
  { name:'Bina OC',            sub:'NCL',  type:'Opencast',    prod:'~5.42 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Standard large-scale opencast risks; AI monitoring must focus on fatigue monitoring systems for HEMM operators working long shifts.' },
  { name:'Block-B OC',         sub:'NCL',  type:'Opencast',    prod:'~3.59 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Ongoing expansion requires meticulous monitoring of capital equipment deployment, land acquisition compliance, and environmental clearances.' },
  { name:'Krishnashila OC',    sub:'NCL',  type:'Opencast',    prod:'~3.12 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'High volume dispatch to adjacent power plants requires seamless integration between digital weighbridges and the central governance dashboard.' },
  { name:'Jhingurda OC',       sub:'NCL',  type:'Opencast',    prod:'~2.0 MT/year',             grade:'Thermal Grade',        risk:'Medium',   reason:'Needs AI-driven predictive maintenance scheduling to prevent breakdowns in material handling plants and conveyors.' },
  /* BCCL */
  { name:'Moonidih',           sub:'BCCL', type:'Underground', prod:'~1.2 MT/year',             grade:'Prime Coking Coal',    risk:'Critical', reason:'Deep, highly mechanized longwall mine; extreme heat, high humidity, and severe Degree III gassiness require continuous telemetric methane monitoring.' },
  { name:'Bhatdih',            sub:'BCCL', type:'Underground', prod:'Non-producing',            grade:'Coking Coal',          risk:'Critical', reason:'Steep gradients and Degree III gassiness; site of a 2006 firedamp explosion killing 50. Extreme explosion risk necessitating prior degasification.' },
  { name:'Murlidih',           sub:'BCCL', type:'Underground', prod:'Minimal/Suspended',        grade:'GCV Grade B/C',        risk:'Critical', reason:'Severe history of spontaneous combustion (2009 belt incline fire) resulting in water inundation through fissure zones; requires stringent sealing protocols.' },
  { name:'Pootkee Balihari',   sub:'BCCL', type:'Underground', prod:'~0.68 MT/year',            grade:'Coking Coal',          risk:'Critical', reason:'Plagued by geological faults and both active and dormant fires; highly susceptible to sudden surface subsidence over densely inhabited areas.' },
  { name:'Gopalichak',         sub:'BCCL', type:'Mixed',       prod:'Variable',                 grade:'Coking Coal',          risk:'Critical', reason:'Multiple seams (XI to XVI) are actively burning; demands advanced thermal GIS mapping to continuously redefine safe extraction boundaries.' },
  { name:'Kenduadih',          sub:'BCCL', type:'Mixed',       prod:'Variable',                 grade:'Coking Coal',          risk:'Critical', reason:'Dormant and active fires across multiple seams; presents constant severe risk of lethal gas emissions (CO, H2S) and sudden sinkhole formation.' },
  { name:'Amalgamated NTST Kujama', sub:'BCCL', type:'Opencast', prod:'~3.01 MT/year',          grade:'Coking Coal',          risk:'High',     reason:'Opencast operations specifically designed to excavate and isolate burning coal seams, requiring specialized heat-resistant equipment.' },
  { name:'Amalgamated Block II', sub:'BCCL', type:'Opencast',  prod:'~2.14 MT/year',            grade:'Coking Coal',          risk:'High',     reason:'Intense surface mining to control legacy fires; extreme risk of exposing HEMM operators to sudden thermal flare-ups and toxic smoke.' },
  { name:'Bhowra',             sub:'BCCL', type:'Mixed',       prod:'~0.85 MT/year',            grade:'Coking Coal',          risk:'High',     reason:'Site of the first recorded Jharia fire (1916); continuous environmental and gas emission monitoring critical to prevent secondary explosions.' },
  { name:'Sudamdih',           sub:'BCCL', type:'Underground', prod:'~0.35 MT/year',            grade:'GCV ~4293/5075',        risk:'High',     reason:'Deep shaft operations require strict monitoring of the main mechanical ventilator (MMV) and continuous logging of the Ventilation Efficiency Quotient (VEQ).' },
  { name:'Patherdih',          sub:'BCCL', type:'Mixed',       prod:'~0.35 MT/year',            grade:'Coking Coal',          risk:'High',     reason:'Ongoing ecological restoration and biological reclamation require drone-based GIS verification to ensure environmental compliance.' },
  { name:'Bastacolla',         sub:'BCCL', type:'Opencast',    prod:'~0.97 MT/year',            grade:'Coking Coal',          risk:'High',     reason:'Working in fire-prone zones; AI must track historical void data to prevent heavy machinery from collapsing into unmapped galleries.' },
  { name:'Cluster-III Group',  sub:'BCCL', type:'Opencast',    prod:'~0.62 MT/year',            grade:'Coking Coal',          risk:'High',     reason:'Aggregated small patches requiring uniform contractor safety standards and digitized grievance tracking to ensure equitable labor practices.' },
  { name:'Ena Colliery',       sub:'BCCL', type:'Opencast',    prod:'~1.27 MT/year',            grade:'Coking Coal',          risk:'High',     reason:'Proximity to urban areas demands strict AI monitoring of blasting-induced ground vibration and acoustic emissions to protect civilian infrastructure.' },
  /* CCL */
  { name:'Amrapali OC',        sub:'CCL',  type:'Opencast',    prod:'~8.75 MT/year',            grade:'GCV ~G10/G11',         risk:'High',     reason:'Massive scale requires stringent monitoring of heavy truck traffic, coal dust dispersion, and risk of spontaneous heating in massive stockpiles.' },
  { name:'Magadh OC',          sub:'CCL',  type:'Opencast',    prod:'~8.57 MT/year',            grade:'GCV ~G10/G11',         risk:'High',     reason:'Expansive operational footprint; requires continuous drone-based survey monitoring and automated weighbridge validation to prevent overloading.' },
  { name:'Ashoka OC',          sub:'CCL',  type:'Opencast',    prod:'~2.43 MT/year',            grade:'GCV ~4526 (G10)',      risk:'Medium',   reason:'Extensive concurrent backfilling and plantation efforts must be monitored via satellite imagery to maintain statutory environmental clearance.' },
  { name:'Piparwar OC',        sub:'CCL',  type:'Opencast',    prod:'High volume integrated',   grade:'GCV ~4763 (G9)',       risk:'Medium',   reason:'Features integrated washeries and CPPs; the AI platform must track complex water management systems and effluent discharge quality.' },
  { name:'North Urimari OC',   sub:'CCL',  type:'Opencast',    prod:'~1.89 MT/year',            grade:'GCV ~4100 (G11)',      risk:'Medium',   reason:'Proximity to river systems demands continuous telemetric monitoring of surface water run-off and potential heavy metal contamination.' },
  { name:'Amalgamated Konar',  sub:'CCL',  type:'Opencast',    prod:'~1.78 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Requires strict monitoring of blasting parameters to prevent projectile damage and ensure slope stability in deepening quarries.' },
  { name:'Karo OC',            sub:'CCL',  type:'Opencast',    prod:'~1.43 MT/year',            grade:'GCV ~4620 (G9)',       risk:'Medium',   reason:'Complex geological structures require continuous updating of Principal Hazards Management Plans (PHMPs) to prevent highwall failures.' },
  { name:'KBP OC',             sub:'CCL',  type:'Opencast',    prod:'~1.25 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Focus on automated equipment maintenance logs to reduce downtime and ensure continuous safe operation of earth-moving fleets.' },
  { name:'Aadocm OC',          sub:'CCL',  type:'Opencast',    prod:'~2.61 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Standard operational hazards necessitating daily digital inspection reporting via the multilingual mobile application.' },
  /* SCCL */
  { name:'Adriyala Shaft',     sub:'SCCL', type:'Underground', prod:'~1.47 MT/year',            grade:'GCV ~G11',             risk:'Critical', reason:"One of India's deepest, highly mechanized longwall mines; faces extreme strata stress, complex ventilation requirements, and significant methane risks." },
  { name:'KTK OCP-II',         sub:'SCCL', type:'Opencast',    prod:'High volume',              grade:'GCV G5 to G11',        risk:'Medium',   reason:'Extensive multi-seam extraction requires vigilant slope monitoring, digital traffic control, and advanced dust suppression protocols.' },
  { name:'Shantikhani',        sub:'SCCL', type:'Underground', prod:'Moderate',                 grade:'GCV ~G10',             risk:'High',     reason:'Prone to strata instability; requires continuous roof support monitoring using resin capsules and digital strata convergence sensors.' },
  { name:'RG OCP-3 Extn',      sub:'SCCL', type:'Opencast',    prod:'High volume',              grade:'GCV ~G7/G11',          risk:'Medium',   reason:'High volume dispatch necessitates automated gate entry logs, RFID verification, and real-time fatigue monitoring for equipment operators.' },
  { name:'VK OC Mine',         sub:'SCCL', type:'Opencast',    prod:'Moderate',                 grade:'GCV G4/G8',            risk:'Medium',   reason:'Extraction of higher quality (G4) coal requires precise grade control and blending management to prevent spontaneous heating during transit.' },
  /* WCL */
  { name:'Amalgamated Yekona', sub:'WCL',  type:'Opencast',    prod:'~2.75 MT/year',            grade:'Thermal Grade',        risk:'High',     reason:'The scale of amalgamation requires careful management of old voids, altered hydrology, and complex heavy equipment routing.' },
  { name:'Mungoli Nirguda OC', sub:'WCL',  type:'Opencast',    prod:'~1.84 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Requires continuous ambient air quality monitoring and strict noise regulation compliance to mitigate impacts on surrounding communities.' },
  { name:'Neeljay Deep OC',    sub:'WCL',  type:'Opencast',    prod:'~1.58 MT/year',            grade:'Thermal Grade',        risk:'High',     reason:'Deep opencast classification dictates acute slope stability risks, highwall management, and complex groundwater pumping requirements.' },
  { name:'Adasa Mixed',        sub:'WCL',  type:'Mixed',       prod:'~0.71 MT/year',            grade:'Thermal Grade',        risk:'High',     reason:'Conversion projects face severe risk of excavating into unknown historical underground voids, leading to sudden sinkholes and machinery entrapment.' },
  { name:'Sasti OC',           sub:'WCL',  type:'Opencast',    prod:'~0.88 MT/year',            grade:'GCV ~3392 (G13/G14)', risk:'Medium',   reason:'Proximity to water bodies requires strict management of effluent discharge via Oil & Grease Traps and continuous water quality sampling.' },
  { name:'Durgapur OC',        sub:'WCL',  type:'Opencast',    prod:'~0.7 MT/year',             grade:'Thermal Grade',        risk:'Medium',   reason:'Standard operational risks; platform focus should be on digital worker attendance and contractor grievance tracking.' },
  { name:'Bhatadi Extension OC', sub:'WCL', type:'Opencast',   prod:'~0.7 MT/year',             grade:'Thermal Grade',        risk:'Medium',   reason:'Expansion requires automated tracking of land acquisition, environmental clearance thresholds, and rehabilitation metrics.' },
  { name:'Gokul OC',           sub:'WCL',  type:'Opencast',    prod:'~0.66 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Focus on basic digital workflow integration for statutory safety reporting and equipment maintenance logs.' },
  { name:'Dhankasa & Jamunia', sub:'WCL',  type:'Opencast',    prod:'Variable',                 grade:'Thermal Grade',        risk:'Medium',   reason:'Aggregated smaller operations needing centralized digital oversight to ensure uniform safety compliance across scattered sites.' },
  /* ECL */
  { name:'Jhanjra UG',         sub:'ECL',  type:'Underground', prod:'~1.54 MT/year',            grade:'High Grade Non-Coking', risk:'Critical', reason:"India's largest highly mechanized underground mine (extended to 225m depth); faces severe ventilation complexities, methane risks, and strata collapse hazards." },
  { name:'Rajmahal OC',        sub:'ECL',  type:'Opencast',    prod:'~5.24 MT/year',            grade:'Thermal Grade',        risk:'High',     reason:'Massive scale requires strict telemetric monitoring of blasting vibrations and particulate matter dispersion to protect local habitations.' },
  { name:'Sonepur Bazari OC',  sub:'ECL',  type:'Opencast',    prod:'~3.68 MT/year',            grade:'Thermal Grade',        risk:'High',     reason:'Extensive open-pit geometry requires 24/7 monitoring of highwall stability, groundwater management, and automated truck dispatch systems.' },
  { name:'Chitra OC',          sub:'ECL',  type:'Opencast',    prod:'~0.54 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Lower extraction rates but requires vigilant environmental monitoring and digitized safety inspection logs to maintain statutory compliance.' },
  { name:'G/Begunia OC',       sub:'ECL',  type:'Opencast',    prod:'~0.53 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Standard opencast hazards; requires integration of RFID vehicle tracking and automated weighbridge data into the central dashboard.' },
  { name:'Hura C OC',          sub:'ECL',  type:'Opencast',    prod:'~0.97 MT/year',            grade:'Thermal Grade',        risk:'Medium',   reason:'Focus on ensuring contractor labor compliance, utilizing biometric attendance, and monitoring shift durations via the mobile application.' },
];

/* ── Build enriched mine objects with IDs + coords ─────── */
const subCounts = {};
const REAL_MINES = REAL_MINES_RAW.map((m, idx) => {
  const sub = m.sub;
  subCounts[sub] = (subCounts[sub] || 0) + 1;
  const hq    = SUBSIDIARY_HQ[sub];
  const coord = jitter(hq, subCounts[sub]);
  const id    = `${sub}${String(subCounts[sub]).padStart(3,'0')}`;

  // Parse production number for charts
  const prodMatch = m.prod.match(/([\d.]+)/);
  const prodMT    = prodMatch ? parseFloat(prodMatch[1]) : 0.5;

  // Compliance score: inverse of risk with some variation
  const baseComp = { Critical:32, High:58, Medium:76 }[m.risk] || 60;
  const compliance = Math.max(20, Math.min(95, baseComp + (idx % 11) - 5));

  // Risk score for AI
  const riskScore = riskToScore(m.risk) + (idx % 15) - 7;

  // GCV
  const gcvM = m.grade.match(/G(\d+)/);
  const gcvBand = gcvM ? 'G'+gcvM[1] : 'Thermal';
  const gcvKcal = gcvMidpoint(m.grade);

  // Degree of gassiness (underground mines)
  let gassiness = null;
  if (m.type === 'Underground' || m.type === 'Mixed') {
    if (m.risk === 'Critical') gassiness = 'Degree III';
    else if (m.risk === 'High') gassiness = 'Degree II';
    else gassiness = 'Degree I';
  }

  // --- Efficiency Metrics Generators ---
  let oms, strippingRatio, mechanization;
  if (m.type === 'Opencast') {
    if (prodMT > 15) {
      mechanization = 'Surface Miner + Shovel-Dumper';
      oms = (18 + (idx % 6) * 0.5).toFixed(2);
      strippingRatio = (1.5 + (idx % 4) * 0.2).toFixed(2);
    } else {
      mechanization = 'Dragline / Shovel-Dumper';
      oms = (10 + (idx % 8) * 0.8).toFixed(2);
      strippingRatio = (2.2 + (idx % 6) * 0.4).toFixed(2);
    }
  } else {
    // Underground
    if (m.risk === 'Critical') {
       mechanization = 'Continuous Miner';
       oms = (2.5 + (idx % 3) * 0.2).toFixed(2);
       strippingRatio = 'N/A';
    } else {
       mechanization = 'LHD / SDL / Bord & Pillar';
       oms = (0.8 + (idx % 4) * 0.1).toFixed(2);
       strippingRatio = 'N/A';
    }
  }

  return {
    id, name: m.name, sub: sub, subsidiary: sub,
    type: m.type,
    state: hq.state,
    lat: coord.lat, lng: coord.lng,
    risk: m.risk, // keep original casing (Critical/High/Medium/Low)
    riskScore: Math.min(100, Math.max(10, riskScore)),
    production: prodMT,
    prod: m.prod, // alias for mine-intelligence.html
    productionLabel: m.prod,
    grade: m.grade,
    gcvBand, gcvKcal,
    compliance,
    gassiness,
    oms, strippingRatio, mechanization,
    reason: m.reason,
  };
});

/* ── Summary stats ──────────────────────────────────────── */
const DB_STATS = {
  total:    REAL_MINES.length,
  critical: REAL_MINES.filter(m=>m.risk==='Critical').length,
  high:     REAL_MINES.filter(m=>m.risk==='High').length,
  medium:   REAL_MINES.filter(m=>m.risk==='Medium').length,
  underground: REAL_MINES.filter(m=>m.type==='Underground').length,
  opencast:    REAL_MINES.filter(m=>m.type==='Opencast').length,
  mixed:       REAL_MINES.filter(m=>m.type==='Mixed').length,
  subsidiaries: [...new Set(REAL_MINES.map(m=>m.subsidiary))],
};

/* ── By subsidiary ──────────────────────────────────────── */
const MINES_BY_SUB = {};
DB_STATS.subsidiaries.forEach(s => {
  MINES_BY_SUB[s] = REAL_MINES.filter(m => m.subsidiary === s);
});

/* ── Contractor Companies Pool ───────────────────────────── */
const _CONTRACTOR_POOL = [
  { name:'Jai Bharat Mining Co.',          type:'Heavy Earth Moving',     baseComp:82 },
  { name:'Vishwakarma Infrastructure Ltd.',type:'Civil & Structural',     baseComp:88 },
  { name:'SureSafe Systems Pvt. Ltd.',     type:'Safety Equipment',       baseComp:94 },
  { name:'Rawat Explosives Services',      type:'Blasting & Drilling',    baseComp:77 },
  { name:'Bharat Labour Corp',             type:'Manpower Supply',        baseComp:65 },
  { name:'GreenTech Environmental',        type:'Environmental Services', baseComp:91 },
  { name:'National Conveyor Systems',      type:'Material Handling',      baseComp:79 },
  { name:'Eastern Mining Contractors',     type:'Coal Extraction',        baseComp:71 },
  { name:'Singareni Heavy Equipment Co.',  type:'HEMM Operations',        baseComp:85 },
  { name:'Central Coal Transport Ltd.',    type:'Coal Transport',         baseComp:69 },
  { name:'Odisha Bulk Carriers',           type:'Bulk Transport',         baseComp:76 },
  { name:'Apex Surface Miners India',      type:'Surface Mining',         baseComp:89 },
  { name:'Deccan Mining Services',         type:'Mining Operations',      baseComp:84 },
  { name:'Jharkhand Drilling Corp',        type:'Exploration & Drilling', baseComp:68 },
  { name:'MP Coal Handlers Pvt. Ltd.',     type:'Coal Handling',          baseComp:73 },
  { name:'Bengal Mining Infrastructure',   type:'Infrastructure Works',   baseComp:81 },
];

/* ── Contractors DB (generated from real mines) ──────────── */
const CONTRACTORS_DB = (() => {
  const today = new Date();
  const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
  const fmtDate = d => d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  const result = [];
  let poolIdx = 0;

  DB_STATS.subsidiaries.forEach(sub => {
    const mines = MINES_BY_SUB[sub];
    const numContractors = mines.length > 5 ? 2 : 1;

    for (let i = 0; i < numContractors; i++) {
      const co = _CONTRACTOR_POOL[poolIdx % _CONTRACTOR_POOL.length];
      poolIdx++;

      const assignedMines = mines.slice(i * 4, i * 4 + 4);
      if (assignedMines.length === 0) continue;

      const avgMineComp = Math.round(assignedMines.reduce((a, m) => a + m.compliance, 0) / assignedMines.length);
      const comp = Math.max(30, Math.min(98, Math.round((co.baseComp + avgMineComp) / 2)));

      // Workers scale with total production of assigned mines
      const totalProd = assignedMines.reduce((a, m) => a + m.production, 0);
      const workers = Math.max(60, Math.round(totalProd * 75 + 80));

      // Expiry: vary across contractors
      const expDays = (poolIdx % 5 === 0) ? 12 : (poolIdx % 3 === 0) ? 38 : 60 + (poolIdx * 41 % 280);
      const expiry = fmtDate(addDays(today, expDays));
      const status = expDays <= 30 ? 'expiring' : 'active';
      const violations = comp < 65 ? (Math.floor(poolIdx * 3 % 10) + 5)
                       : comp < 80 ? (Math.floor(poolIdx % 5))
                       : (Math.floor(poolIdx % 3));

      result.push({
        id: `CT${String(result.length + 1).padStart(3,'0')}`,
        name: co.name,
        type: co.type,
        subsidiary: sub,
        mines: assignedMines.map(m => m.name),
        primaryMine: assignedMines[0].name,
        workers,
        compliance: comp,
        expiry,
        status,
        violations,
      });
    }
  });
  return result;
})();

/* ── Inspections DB (generated from real mines) ──────────── */
const _INSP_TYPES    = ['Safety (DGMS)', 'Environmental', 'Production Audit', 'Labour', 'Statutory', 'Fire Safety', 'Ventilation Check'];
const _INSP_NAMES    = ['V. Kumar', 'S. Reddy', 'A. Patel', 'R. Sharma', 'M. Singh', 'P. Rao', 'K. Nair', 'B. Joshi', 'L. Verma', 'N. Das'];

const INSPECTIONS_DB = (() => {
  const today = new Date();
  const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
  const fmtDate  = d => d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  const selected = [
    ...REAL_MINES.filter(m => m.risk === 'Critical').slice(0, 5),
    ...REAL_MINES.filter(m => m.risk === 'High').slice(0, 9),
    ...REAL_MINES.filter(m => m.risk === 'Medium').slice(0, 6),
  ];

  return selected.map((mine, idx) => {
    const daysOffset = 6 - idx * 2; // ranges from +6 to -34 days
    const date = addDays(today, daysOffset);

    let status, findings, critical;
    if (daysOffset > 1) {
      status = 'Scheduled'; findings = 0; critical = 0;
    } else if (daysOffset === 0 || daysOffset === 1) {
      status = 'In Progress'; findings = 0; critical = 0;
    } else if (mine.compliance < 60 && daysOffset < -10) {
      status = 'Overdue'; findings = 3 + (idx % 5); critical = 1 + (idx % 2);
    } else {
      status = 'Completed';
      findings = mine.risk === 'Critical' ? 8 + (idx % 6) : mine.risk === 'High' ? 3 + (idx % 5) : idx % 4;
      critical = mine.risk === 'Critical' ? 1 + (idx % 3) : mine.risk === 'High' ? idx % 2 : 0;
    }

    return {
      id: `INS-2026-${String(900 + idx).padStart(4,'0')}`,
      type: _INSP_TYPES[idx % _INSP_TYPES.length],
      mine: mine.name,
      subsidiary: mine.sub,
      inspector: _INSP_NAMES[idx % _INSP_NAMES.length],
      date: fmtDate(date),
      dateRaw: date,
      daysOffset,
      status,
      findings,
      critical,
      compliance: mine.compliance,
      risk: mine.risk,
      reason: mine.reason,
    };
  });
})();

/* ── Live Time Helper ────────────────────────────────────── */
function getLiveTimeString() {
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', timeZone:'Asia/Kolkata' });
  const time = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata', hour12:false });
  return `${date}<br>${time} IST`;
}
