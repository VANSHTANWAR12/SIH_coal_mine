/* ==========================================================
   CoalGuard Backend – server.js
   Main Express API Server (using sql.js – pure JS SQLite)
   ========================================================== */

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');
const initSqlJs = require('sql.js');

const app  = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || './db/coalguard.sqlite';

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'] }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

/* ── In-memory DB reference ─────────────────────────────── */
let db;

/* ── Helper: persist DB to disk ─────────────────────────── */
function saveDb() {
  const data = db.export();
  const buf  = Buffer.from(data);
  const dir  = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, buf);
}

/* ── Helper: query ──────────────────────────────────────── */
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

/* ── Audit Helper ───────────────────────────────────────── */
function addAuditEntry(action, user, mine, payload = {}) {
  const prev = queryOne('SELECT hash FROM audit_log ORDER BY created_at DESC LIMIT 1');
  const prevHash = prev ? prev.hash : '0000000000000000';
  const data = JSON.stringify({ action, user, mine, payload, ts: Date.now() });
  const hash = crypto.createHash('sha256').update(prevHash + data).digest('hex').slice(0, 16);
  run(
    `INSERT INTO audit_log (id,action,user_name,mine,payload,hash,prev_hash,created_at)
     VALUES (?,?,?,?,?,?,?,datetime('now'))`,
    ['AU' + Date.now(), action, user, mine, JSON.stringify(payload), hash, prevHash]
  );
  return hash;
}

/* ── Initialize & Start ─────────────────────────────────── */
async function initServer() {
  const SQL = await initSqlJs();

  // Load from disk if exists, else create fresh
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Loaded existing database from disk.');
  } else {
    db = new SQL.Database();
    console.log('🆕 Creating fresh in-memory database...');
  }

  /* ── Create Tables ────────────────────────────────────── */
  db.run(`
    CREATE TABLE IF NOT EXISTS mines (
      id TEXT PRIMARY KEY, name TEXT, location TEXT,
      lat REAL, lng REAL, risk TEXT, production REAL,
      compliance INTEGER, subsidiary TEXT,
      mine_type TEXT DEFAULT 'Opencast',
      gcv_kcal INTEGER DEFAULT 3500,
      gcv_band TEXT DEFAULT 'Thermal',
      gassiness TEXT DEFAULT 'N/A',
      grade_label TEXT DEFAULT 'Thermal Grade',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS compliance_items (
      id TEXT PRIMARY KEY, category TEXT, regulation TEXT,
      mine_name TEXT, status TEXT, due_date TEXT,
      days_overdue INTEGER DEFAULT 0, responsible TEXT, notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY, type TEXT, mine_name TEXT,
      inspector TEXT, date TEXT, status TEXT,
      findings INTEGER DEFAULT 0, critical INTEGER DEFAULT 0,
      notes TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contractors (
      id TEXT PRIMARY KEY, name TEXT, type TEXT, workers INTEGER,
      compliance_score INTEGER, status TEXT, contract_expiry TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY, type TEXT, mine_name TEXT,
      date TEXT, severity TEXT, description TEXT, status TEXT,
      reporter TEXT, geo_lat REAL, geo_lng REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY, action TEXT, user_name TEXT,
      mine TEXT, payload TEXT, hash TEXT, prev_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY, type TEXT, message TEXT,
      mine TEXT, resolved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed if empty
  const mineCount = queryOne('SELECT COUNT(*) as c FROM mines');
  if (!mineCount || mineCount.c === 0) {
    console.log('🌱 Seeding database...');
    require('./db/seed')(db, run, saveDb);
    console.log('✅ Seeded.');
  }

  /* ════════════════════════════════════════════════════════
     ROUTES
     ════════════════════════════════════════════════════════ */

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0', uptime: process.uptime(), db: 'connected (sql.js)' });
  });

  app.get('/api/dashboard/kpis', (req, res) => {
    const activeMines        = queryOne('SELECT COUNT(*) as c FROM mines').c;
    const openViolations     = queryOne("SELECT COUNT(*) as c FROM compliance_items WHERE status='non-compliant'").c;
    const pendingInspections = queryOne("SELECT COUNT(*) as c FROM inspections WHERE status='scheduled'").c;
    const compItems          = query('SELECT status FROM compliance_items');
    const compliant          = compItems.filter(i => i.status === 'compliant').length;
    const complianceScore    = compItems.length ? Math.round(compliant / compItems.length * 100) : 0;
    res.json({ activeMines, openViolations, pendingInspections, complianceScore });
  });

  app.get('/api/mines', (req, res) => {
    res.json(query('SELECT * FROM mines ORDER BY compliance ASC'));
  });

  app.get('/api/mines/:id', (req, res) => {
    const mine = queryOne('SELECT * FROM mines WHERE id=?', [req.params.id]);
    if (!mine) return res.status(404).json({ error: 'Mine not found' });
    res.json(mine);
  });

  app.get('/api/compliance', (req, res) => {
    const { status, category } = req.query;
    let sql = 'SELECT * FROM compliance_items WHERE 1=1';
    const params = [];
    if (status)   { sql += ' AND status=?';   params.push(status); }
    if (category) { sql += ' AND category=?'; params.push(category); }
    sql += ' ORDER BY days_overdue DESC, due_date ASC';
    res.json(query(sql, params));
  });

  app.post('/api/compliance', (req, res) => {
    const { category, regulation, mine_name, due_date, responsible = 'TBD', notes = '' } = req.body;
    if (!regulation || !mine_name) return res.status(400).json({ error: 'regulation and mine_name are required' });
    const id   = 'C' + Date.now();
    const hash = addAuditEntry('Compliance Item Added', req.headers['x-user'] || 'system', mine_name, { id, regulation });
    run(`INSERT INTO compliance_items (id,category,regulation,mine_name,status,due_date,responsible,notes)
         VALUES (?,?,?,?,?,?,?,?)`,
      [id, category || 'Safety', regulation, mine_name, 'at-risk', due_date || '', responsible, notes]);
    res.status(201).json({ id, hash });
  });

  app.patch('/api/compliance/:id', (req, res) => {
    const item = queryOne('SELECT * FROM compliance_items WHERE id=?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const { status = item.status, notes = item.notes } = req.body;
    run('UPDATE compliance_items SET status=?, notes=?, updated_at=datetime(\'now\') WHERE id=?',
      [status, notes, req.params.id]);
    addAuditEntry('Compliance Updated', req.headers['x-user'] || 'system', item.mine_name, { id: req.params.id, status });
    res.json({ success: true });
  });

  app.get('/api/inspections', (req, res) => {
    const { status } = req.query;
    const sql = status
      ? 'SELECT * FROM inspections WHERE status=? ORDER BY date DESC'
      : 'SELECT * FROM inspections ORDER BY date DESC';
    res.json(query(sql, status ? [status] : []));
  });

  app.post('/api/inspections', (req, res) => {
    const { type, mine_name, inspector, date, notes = '' } = req.body;
    if (!type || !mine_name || !inspector) return res.status(400).json({ error: 'type, mine_name, inspector required' });
    const id = 'I' + Date.now();
    run(`INSERT INTO inspections (id,type,mine_name,inspector,date,status,notes) VALUES (?,?,?,?,?,?,?)`,
      [id, type, mine_name, inspector, date || new Date().toISOString().split('T')[0], 'scheduled', notes]);
    addAuditEntry('Inspection Scheduled', req.headers['x-user'] || 'system', mine_name, { id, type });
    res.status(201).json({ id });
  });

  app.get('/api/contractors', (req, res) => {
    res.json(query('SELECT * FROM contractors ORDER BY compliance_score ASC'));
  });

  app.post('/api/contractors', (req, res) => {
    const { name, type, workers, contract_expiry } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const id = 'CT' + Date.now();
    run(`INSERT INTO contractors (id,name,type,workers,compliance_score,status,contract_expiry)
         VALUES (?,?,?,?,?,?,?)`,
      [id, name, type || 'General', workers || 0, 75, 'active', contract_expiry || '']);
    addAuditEntry('Contractor Added', req.headers['x-user'] || 'system', 'System', { id, name });
    res.status(201).json({ id });
  });

  app.get('/api/incidents', (req, res) => {
    const { status, severity } = req.query;
    let sql = 'SELECT * FROM incidents WHERE 1=1';
    const params = [];
    if (status)   { sql += ' AND status=?';   params.push(status); }
    if (severity) { sql += ' AND severity=?'; params.push(severity); }
    sql += ' ORDER BY created_at DESC';
    res.json(query(sql, params));
  });

  app.post('/api/incidents', (req, res) => {
    const { type, mine_name, severity, description, reporter = 'Field Inspector', geo_lat = 0, geo_lng = 0 } = req.body;
    if (!description) return res.status(400).json({ error: 'description required' });
    const id = 'IN' + Date.now();
    run(`INSERT INTO incidents (id,type,mine_name,date,severity,description,status,reporter,geo_lat,geo_lng)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, type || 'Other', mine_name || 'Unknown', new Date().toISOString().split('T')[0],
       severity || 'medium', description, 'open', reporter, geo_lat, geo_lng]);
    addAuditEntry('Incident Reported', reporter, mine_name || 'Unknown', { id, type, severity });
    res.status(201).json({ id });
  });

  app.get('/api/alerts', (req, res) => {
    res.json(query("SELECT * FROM alerts WHERE resolved=0 ORDER BY created_at DESC LIMIT 20"));
  });

  app.post('/api/alerts/:id/resolve', (req, res) => {
    run('UPDATE alerts SET resolved=1 WHERE id=?', [req.params.id]);
    res.json({ success: true });
  });

  app.get('/api/audit', (req, res) => {
    res.json(query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50'));
  });

  app.get('/api/ai/risk-scores', (req, res) => {
    res.json({
      'Jharia Main':       { score: 82, factors: ['Roof stability', 'Fire hazard', 'Compliance overdue'], trend: 'up' },
      'ECL Rajmahal':      { score: 76, factors: ['Effluent discharge', 'Safety violations'],             trend: 'up' },
      'CCL Piparwar':      { score: 71, factors: ['Underground fire', 'Equipment age'],                   trend: 'up' },
      'WCL Wardha':        { score: 55, factors: ['Labour disputes', 'Minor violations'],                 trend: 'stable' },
      'Singareni Block-II':{ score: 45, factors: ['Audit findings'],                                      trend: 'down' },
      'BCCL Moonidih':     { score: 28, factors: ['Expiring contractor'],                                 trend: 'stable' },
      'SECL Gevra':        { score: 22, factors: ['Low risk profile'],                                    trend: 'down' },
      'MCL Bharatpur':     { score: 18, factors: ['Minimal issues'],                                      trend: 'down' },
    });
  });

  /* ── 404 ─────────────────────────────────────────────── */
  app.use((req, res) => res.status(404).json({ error: 'Endpoint not found', path: req.path }));

  /* ── Error ───────────────────────────────────────────── */
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  /* ── Listen ──────────────────────────────────────────── */
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   ⛏️  CoalGuard API Server               ║
  ║   🚀  http://localhost:${PORT}              ║
  ║   📦  Database: ${DB_PATH}  ║
  ╚══════════════════════════════════════════╝
    `);
  });
}

initServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
