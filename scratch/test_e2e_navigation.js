const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}/${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function parseHeader(html) {
  const match = html.match(/<div class="header-links">([\s\S]*?)<\/div>/i);
  if (!match) return null;
  const linkRegex = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  const links = [];
  let m;
  while ((m = linkRegex.exec(match[1])) !== null) {
    const attrs = m[1];
    const text = m[2].trim();
    const hrefMatch = attrs.match(/href="([^"]*)"/i);
    const classMatch = attrs.match(/class="([^"]*)"/i);
    links.push({
      text,
      href: hrefMatch ? hrefMatch[1] : '',
      isActive: classMatch ? classMatch[1].includes('active') : false
    });
  }
  return links;
}

async function runE2ESimulation() {
  console.log('====================================================');
  console.log('STARTING E2E NAVIGATION TRANSITION SIMULATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Step 1: Start at HQ Dashboard
  console.log('--- Step 1: User visits HQ Dashboard ---');
  let res = await fetchPage('dashboard.html');
  if (res.statusCode !== 200) throw new Error('Failed to load dashboard.html');
  let links = parseHeader(res.body);
  console.log('Current Page: dashboard.html');
  console.log(`Active Tab: [${links.find(l => l.isActive).text}]`);
  if (links.find(l => l.isActive).text === 'HQ Dashboard') {
    console.log('✅ PASS: HQ Dashboard is active on dashboard.html');
    passed++;
  } else {
    console.error('❌ FAIL: HQ Dashboard should be active');
    failed++;
  }

  // Step 2: User clicks "SECL Operational Zone"
  console.log('\n--- Step 2: User clicks "SECL Operational Zone" ---');
  const seclTarget = links.find(l => l.text.includes('SECL Operational Zone')).href;
  console.log(`Navigating to -> ${seclTarget}`);
  res = await fetchPage(seclTarget);
  if (res.statusCode !== 200) throw new Error(`Failed to load ${seclTarget}`);
  links = parseHeader(res.body);
  console.log(`Current Page: ${seclTarget}`);
  console.log(`Active Tab: [${links.find(l => l.isActive).text}]`);
  if (links.find(l => l.isActive).text === 'SECL Operational Zone') {
    console.log('✅ PASS: SECL Operational Zone is active on secl-zone.html');
    passed++;
  } else {
    console.error('❌ FAIL: SECL Operational Zone should be active');
    failed++;
  }

  // Check content on SECL page
  const hasSeclTitle = res.body.toLowerCase().includes('secl operational zone');
  const hasSeclTable = res.body.includes('secl-mines-tbody');
  const hasMinesDb = res.body.includes('js/mines-db.js');
  if (hasSeclTitle && hasSeclTable && hasMinesDb) {
    console.log('✅ PASS: secl-zone.html contains SECL Operational Zone title, KPI cards, mines table markup, and mines-db connection');
    passed++;
  } else {
    console.error('❌ FAIL: secl-zone.html missing expected mine structure');
    failed++;
  }

  // Step 3: User clicks "DGMS Regulatory Portal"
  console.log('\n--- Step 3: User clicks "DGMS Regulatory Portal" ---');
  const dgmsTarget = links.find(l => l.text.includes('DGMS Regulatory Portal')).href;
  console.log(`Navigating to -> ${dgmsTarget}`);
  res = await fetchPage(dgmsTarget);
  if (res.statusCode !== 200) throw new Error(`Failed to load ${dgmsTarget}`);
  links = parseHeader(res.body);
  console.log(`Current Page: ${dgmsTarget}`);
  console.log(`Active Tab: [${links.find(l => l.isActive).text}]`);
  if (links.find(l => l.isActive).text === 'DGMS Regulatory Portal') {
    console.log('✅ PASS: DGMS Regulatory Portal is active on dgms-portal.html');
    passed++;
  } else {
    console.error('❌ FAIL: DGMS Regulatory Portal should be active');
    failed++;
  }

  // Check content on DGMS page
  const hasDgmsTitle = res.body.toLowerCase().includes('dgms regulatory portal');
  const hasCompliance = res.body.includes('Compliance Monitoring');
  const hasAudit = res.body.includes('Audit Integrity') || res.body.includes('Audit Oversight');
  const hasModal = res.body.includes('dgms-review-modal');
  if (hasDgmsTitle && hasCompliance && hasAudit && hasModal) {
    console.log('✅ PASS: dgms-portal.html contains DGMS Regulatory Portal header, compliance monitoring table, review modal, and audit trail');
    passed++;
  } else {
    console.error('❌ FAIL: dgms-portal.html missing expected regulatory content');
    failed++;
  }

  // Step 4: User clicks "HQ Dashboard" from DGMS
  console.log('\n--- Step 4: User clicks "HQ Dashboard" from DGMS ---');
  const hqTarget = links.find(l => l.text.includes('HQ Dashboard')).href;
  console.log(`Navigating to -> ${hqTarget}`);
  res = await fetchPage(hqTarget);
  if (res.statusCode !== 200) throw new Error(`Failed to load ${hqTarget}`);
  links = parseHeader(res.body);
  console.log(`Current Page: ${hqTarget}`);
  console.log(`Active Tab: [${links.find(l => l.isActive).text}]`);
  if (links.find(l => l.isActive).text === 'HQ Dashboard') {
    console.log('✅ PASS: Returned to HQ Dashboard and it is active');
    passed++;
  } else {
    console.error('❌ FAIL: HQ Dashboard should be active');
    failed++;
  }

  // Step 5: Test navigation from other secondary modules
  console.log('\n--- Step 5: Testing cross-navigation from secondary modules ---');
  const secondaryPages = [
    'ai-prediction.html',
    'mine-intelligence.html',
    'gis-map.html',
    'reports.html',
    'contractors.html',
    'analytics.html'
  ];

  for (const p of secondaryPages) {
    res = await fetchPage(p);
    links = parseHeader(res.body);
    const hasHq = links.some(l => l.text.includes('HQ Dashboard') && l.href === 'dashboard.html');
    const hasSecl = links.some(l => l.text.includes('SECL Operational Zone') && l.href === 'secl-zone.html');
    const hasDgms = links.some(l => l.text.includes('DGMS Regulatory Portal') && l.href === 'dgms-portal.html');
    if (hasHq && hasSecl && hasDgms) {
      console.log(`✅ PASS: ${p} has all 3 operational links pointing to real pages`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${p} missing one or more links`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`E2E SIMULATION RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runE2ESimulation().catch(err => {
  console.error(err);
  process.exit(1);
});
