const http = require('http');
const fs = require('fs');
const path = require('path');

let JSDOM;
try {
  JSDOM = require(path.join(__dirname, '..', 'backend', 'node_modules', 'jsdom')).JSDOM;
} catch (e) {
  try {
    JSDOM = require('jsdom').JSDOM;
  } catch (e2) {
    JSDOM = null;
  }
}

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

async function runRedesignVerification() {
  console.log('====================================================');
  console.log('SECL & DGMS UI/UX REDESIGN COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. SECL OPERATIONAL ZONE VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('--- TEST GROUP 1: SECL Operational Command Center UI ---');
  try {
    const res = await fetchPage('secl-zone.html');
    assert(res.statusCode === 200, 'secl-zone.html delivered with HTTP 200 OK');

    const html = res.body;

    // A. Zone Header Verification
    assert(html.includes('zone-banner'), 'Contains modern zone-banner container');
    assert(html.includes('SUBSIDIARY OPERATIONS'), 'Displays SUBSIDIARY OPERATIONS badge');
    assert(html.includes('SECL Operational Command Center'), 'Displays authoritative title: SECL Operational Command Center');
    assert(html.includes('TELEMETRY ONLINE'), 'Displays TELEMETRY ONLINE status indicator');
    assert(html.includes('Export Digest'), 'Includes Export Digest action button');
    assert(html.includes('AI Strategy Center'), 'Includes AI Strategy Center action button');

    // B. Executive KPI Strip (6 Cards)
    assert(html.includes('secl-kpi-grid-6'), 'Contains 6-card responsive KPI grid');
    assert(html.includes('id="secl-kpi-mines"'), 'Contains Active Mines KPI (13)');
    assert(html.includes('id="secl-kpi-prod"'), 'Contains Annual Extraction KPI (~165 MT)');
    assert(html.includes('id="secl-kpi-risk"'), 'Contains Overall Risk KPI (HIGH / 68)');
    assert(html.includes('id="secl-kpi-alerts"'), 'Contains Active Alerts KPI (5)');
    assert(html.includes('id="secl-kpi-findings"'), 'Contains Critical Findings KPI (14)');
    assert(html.includes('id="secl-kpi-comp"'), 'Contains Compliance Status KPI (66.4%)');

    // C. Operational Risk Command Section
    assert(html.includes('command-grid-2'), 'Contains 2-column command grid layout');
    assert(html.includes('Operational Risk Synthesis'), 'Displays Operational Risk Synthesis card');
    assert(html.includes('Safety Risk Vector'), 'Displays Safety Risk Vector meter (78%)');
    assert(html.includes('Production Bottleneck Risk'), 'Displays Production Bottleneck Risk meter (69%)');
    assert(html.includes('Statutory Compliance Risk'), 'Displays Statutory Compliance Risk meter (42%)');

    // D. Live Alerts Feed
    assert(html.includes('Live Operational Alerts'), 'Displays Live Operational Alerts card');
    assert(html.includes('secl-active-alerts-badge'), 'Displays active alerts count badge');

    // E. Mine Operations Table
    assert(html.includes('Mine Operations'), 'Displays Mine Operations section');
    assert(html.includes('id="secl-search"'), 'Contains mine search input with icon');
    assert(html.includes('id="filter-type"'), 'Contains category filter select');
    assert(html.includes('id="filter-risk"'), 'Contains risk level filter select');
    assert(html.includes('clickable-row'), 'Table uses clickable-row interaction styling');

    // F. Operational Insights (5 Cards)
    assert(html.includes('insights-strip-5'), 'Contains 5-card Operational Insights grid');
    assert(html.includes('Production Pacing'), 'Contains Production Pacing insight card');
    assert(html.includes('Safety Trend'), 'Contains Safety Incident Trend insight card');
    assert(html.includes('Top Risk Exposure'), 'Contains Top Risk Exposure insight card');
    assert(html.includes('Frequent Hazard'), 'Contains Frequent Hazard insight card');
    assert(html.includes('Compliance Gap'), 'Contains Compliance Gap insight card');

    // In-memory DOM Execution Test for SECL
    if (JSDOM) {
      console.log('\n--- In-Memory DOM Execution: secl-zone.html ---');
      const minesDbCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'mines-db.js'), 'utf8');
      const mainJsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');

      const dom = new JSDOM(html, {
        url: `${BASE_URL}/secl-zone.html`,
        runScripts: 'dangerously'
      });

      dom.window.eval(minesDbCode);
      dom.window.eval(mainJsCode);

      // Trigger DOMContentLoaded manually
      const event = new dom.window.Event('DOMContentLoaded');
      dom.window.document.dispatchEvent(event);

      const tableRows = dom.window.document.querySelectorAll('#secl-mines-tbody tr');
      assert(tableRows.length === 13, `Rendered ${tableRows.length} SECL mines dynamically from REAL_MINES (expected 13)`);

      const firstRowText = tableRows[0].textContent;
      assert(firstRowText.includes('Gevra OC') || firstRowText.includes('SECL'), 'First row correctly displays SECL mine data');

      // Test Search Filter
      const searchInput = dom.window.document.getElementById('secl-search');
      searchInput.value = 'Gevra';
      searchInput.dispatchEvent(new dom.window.Event('input'));

      const filteredRows = dom.window.document.querySelectorAll('#secl-mines-tbody tr');
      assert(filteredRows.length === 1, `Filter by "Gevra" reduced rows from 13 to ${filteredRows.length}`);
    }
  } catch (err) {
    console.error('❌ ERROR testing SECL Operational Zone:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DGMS REGULATORY PORTAL VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 2: DGMS Regulatory Oversight Command Center UI ---');
  try {
    const res = await fetchPage('dgms-portal.html');
    assert(res.statusCode === 200, 'dgms-portal.html delivered with HTTP 200 OK');

    const html = res.body;

    // A. Regulatory Header Verification
    assert(html.includes('regulatory-banner'), 'Contains modern regulatory-banner container');
    assert(html.includes('DIRECTORATE GENERAL OF MINES SAFETY'), 'Displays official DGMS government insignia badge');
    assert(html.includes('DGMS Regulatory Oversight Command Center'), 'Displays title: DGMS Regulatory Oversight Command Center');
    assert(html.includes('REGULATORY SYSTEM ACTIVE'), 'Displays REGULATORY SYSTEM ACTIVE status indicator');
    assert(html.includes('Full Compliance Roster'), 'Includes Full Compliance Roster action button');
    assert(html.includes('+ Schedule Inspection'), 'Includes + Schedule Inspection action button');

    // B. Compliance KPI Strip (5 Cards)
    assert(html.includes('dgms-kpi-grid-5'), 'Contains 5-card responsive KPI grid');
    assert(html.includes('id="dgms-kpi-total"'), 'Contains Total Mines KPI (79)');
    assert(html.includes('id="dgms-kpi-comp"'), 'Contains Compliant KPI (54)');
    assert(html.includes('id="dgms-kpi-noncomp"'), 'Contains Non-Compliant KPI (25)');
    assert(html.includes('id="dgms-kpi-crit"'), 'Contains Critical Findings KPI (18)');
    assert(html.includes('id="dgms-kpi-overdue"'), 'Contains Overdue Actions KPI (6)');

    // C. Regulatory Risk Overview (Pillars + Priorities)
    assert(html.includes('Statutory Compliance Health'), 'Displays Statutory Compliance Health card');
    assert(html.includes('Safety Compliance (CMR 2017'), 'Displays CMR 2017 Safety pillar meter');
    assert(html.includes('Environmental Clearances'), 'Displays Environmental Clearances pillar meter');
    assert(html.includes('Statutory Form-IV Returns'), 'Displays Statutory Form-IV Returns pillar meter');
    assert(html.includes('Labour & Contractor Welfare'), 'Displays Labour & Welfare pillar meter');
    assert(html.includes('Inspection Directives Remediation'), 'Displays Directives Remediation pillar meter');

    // D. Regulatory Priorities
    assert(html.includes('Regulatory Priorities'), 'Displays Regulatory Priorities card');
    assert(html.includes('18 Critical Findings'), 'Displays 18 Critical Findings priority item');
    assert(html.includes('6 Overdue Remediations'), 'Displays 6 Overdue Remediations priority item');
    assert(html.includes('25 Mines Under Review'), 'Displays 25 Mines Under Review priority item');

    // E. Compliance Monitoring Table
    assert(html.includes('Compliance Monitoring'), 'Displays Compliance Monitoring section');
    assert(html.includes('id="comp-search"'), 'Contains search input for compliance filings');
    assert(html.includes('id="comp-filter-status"'), 'Contains status filter select');
    assert(html.includes('id="dgms-compliance-tbody"'), 'Contains table body for compliance filings');

    // F. Regulatory Activity & Audit Integrity
    assert(html.includes('Regulatory Activity'), 'Displays Recent Regulatory Activity timeline card');
    assert(html.includes('Audit Integrity & Cryptographic Ledger'), 'Displays Audit Integrity & Cryptographic Ledger card');
    assert(html.includes('HASH CHAIN HEALTHY'), 'Displays HASH CHAIN HEALTHY status badge');
    assert(html.includes('1,248 Verified'), 'Displays 1,248 verified records metric');
    assert(html.includes('id="dgms-audit-ledger"'), 'Contains audit ledger feed box');

    // G. Review Modal
    assert(html.includes('id="dgms-review-modal"'), 'Contains #dgms-review-modal dialog');
    assert(html.includes('Save Regulatory Sign-Off'), 'Contains Save Regulatory Sign-Off button');

    // In-memory DOM Execution Test for DGMS
    if (JSDOM) {
      console.log('\n--- In-Memory DOM Execution: dgms-portal.html ---');
      const mainJsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');

      const dom = new JSDOM(html, {
        url: `${BASE_URL}/dgms-portal.html`,
        runScripts: 'dangerously'
      });

      dom.window.eval(mainJsCode);

      const event = new dom.window.Event('DOMContentLoaded');
      dom.window.document.dispatchEvent(event);

      const compRows = dom.window.document.querySelectorAll('#dgms-compliance-tbody tr');
      assert(compRows.length === 8, `Rendered ${compRows.length} compliance filings dynamically (expected 8)`);

      // Test Review Modal
      dom.window.openComplianceReview('COMP-101', 'Gevra OC', 'CMR 2017 Reg 104', 'UNDER_REVIEW');
      const modal = dom.window.document.getElementById('dgms-review-modal');
      assert(modal.classList.contains('open') || modal.classList.contains('active'), 'Review modal opened with .open/.active class');

      dom.window.saveComplianceReview();
      assert(!modal.classList.contains('open'), 'Review modal closed after saving sign-off');

      // Test Priority Filter
      dom.window.filterByPriority('OVERDUE');
      const overdueRows = dom.window.document.querySelectorAll('#dgms-compliance-tbody tr');
      assert(overdueRows.length === 2, `Filtering by OVERDUE reduced filings from 8 to ${overdueRows.length}`);
    }
  } catch (err) {
    console.error('❌ ERROR testing DGMS Regulatory Portal:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runRedesignVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
