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

const PAGES = [
  { file: 'dashboard.html', expectedActive: 'HQ Dashboard' },
  { file: 'secl-zone.html', expectedActive: 'SECL Operational Zone' },
  { file: 'dgms-portal.html', expectedActive: 'DGMS Regulatory Portal' },
  { file: 'ai-prediction.html', expectedActive: 'HQ Dashboard' },
  { file: 'mine-intelligence.html', expectedActive: 'HQ Dashboard' },
  { file: 'gis-map.html', expectedActive: 'HQ Dashboard' },
  { file: 'reports.html', expectedActive: 'HQ Dashboard' },
  { file: 'contractors.html', expectedActive: 'SECL Operational Zone' },
  { file: 'analytics.html', expectedActive: 'HQ Dashboard' },
  { file: 'compliance.html', expectedActive: 'DGMS Regulatory Portal' },
  { file: 'inspections.html', expectedActive: 'DGMS Regulatory Portal' },
  { file: 'field-reports.html', expectedActive: 'SECL Operational Zone' }
];

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}/${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function parseHeaderLinksWithRegex(html) {
  const match = html.match(/<div class="header-links">([\s\S]*?)<\/div>/i);
  if (!match) return null;
  const containerHtml = match[1];
  const linkRegex = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  const links = [];
  let m;
  while ((m = linkRegex.exec(containerHtml)) !== null) {
    const attrs = m[1];
    const text = m[2].trim();
    const hrefMatch = attrs.match(/href="([^"]*)"/i);
    const classMatch = attrs.match(/class="([^"]*)"/i);
    links.push({
      text,
      href: hrefMatch ? hrefMatch[1] : '',
      classes: classMatch ? classMatch[1] : '',
      isActive: classMatch ? classMatch[1].includes('active') : false
    });
  }
  return links;
}

async function runNavigationTests() {
  console.log('====================================================');
  console.log('COALGUARD TOP NAVIGATION VERIFICATION SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  for (const page of PAGES) {
    try {
      const res = await fetchPage(page.file);
      if (res.statusCode !== 200) {
        console.error(`❌ [FAIL] ${page.file} returned status ${res.statusCode}`);
        failed++;
        continue;
      }

      // Check file exists physically
      const localPath = path.join(__dirname, '..', page.file);
      if (!fs.existsSync(localPath)) {
        console.error(`❌ [FAIL] File does not exist on disk: ${localPath}`);
        failed++;
        continue;
      }

      let links;
      if (JSDOM) {
        const dom = new JSDOM(res.body);
        const headerLinksWrap = dom.window.document.querySelector('.header-links');
        if (!headerLinksWrap) {
          console.error(`❌ [FAIL] ${page.file} has no .header-links container`);
          failed++;
          continue;
        }
        links = Array.from(headerLinksWrap.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href') || '',
          isActive: a.classList.contains('active')
        }));
      } else {
        links = parseHeaderLinksWithRegex(res.body);
      }

      if (!links || links.length !== 3) {
        console.error(`❌ [FAIL] ${page.file} expected 3 navigation links, found ${links ? links.length : 0}`);
        failed++;
        continue;
      }

      const [linkHq, linkSecl, linkDgms] = links;

      // Validate labels
      let labelCheck = true;
      if (!linkHq.text.includes('HQ Dashboard')) {
        console.error(`❌ [FAIL] ${page.file}: Link 1 text "${linkHq.text}" does not contain "HQ Dashboard"`);
        labelCheck = false;
      }
      if (!linkSecl.text.includes('SECL Operational Zone')) {
        console.error(`❌ [FAIL] ${page.file}: Link 2 text "${linkSecl.text}" does not contain "SECL Operational Zone"`);
        labelCheck = false;
      }
      if (!linkDgms.text.includes('DGMS Regulatory Portal')) {
        console.error(`❌ [FAIL] ${page.file}: Link 3 text "${linkDgms.text}" does not contain "DGMS Regulatory Portal"`);
        labelCheck = false;
      }

      // Validate targets (no '#' or fake handlers)
      let targetCheck = true;
      if (!linkHq.href.startsWith('dashboard.html')) {
        console.error(`❌ [FAIL] ${page.file}: Link 1 href is "${linkHq.href}", expected dashboard.html`);
        targetCheck = false;
      }
      if (!linkSecl.href.startsWith('secl-zone.html')) {
        console.error(`❌ [FAIL] ${page.file}: Link 2 href is "${linkSecl.href}", expected secl-zone.html`);
        targetCheck = false;
      }
      if (!linkDgms.href.startsWith('dgms-portal.html')) {
        console.error(`❌ [FAIL] ${page.file}: Link 3 href is "${linkDgms.href}", expected dgms-portal.html`);
        targetCheck = false;
      }

      // Validate active tab
      const activeLink = links.find(l => l.isActive);
      let activeCheck = true;
      if (!activeLink) {
        console.error(`❌ [FAIL] ${page.file}: No link has the .active class`);
        activeCheck = false;
      } else if (!activeLink.text.includes(page.expectedActive)) {
        console.error(`❌ [FAIL] ${page.file}: Active link is "${activeLink.text}", expected "${page.expectedActive}"`);
        activeCheck = false;
      }

      if (labelCheck && targetCheck && activeCheck) {
        console.log(`✅ [PASS] ${page.file.padEnd(24)} -> HQ: ${linkHq.href.padEnd(14)} | SECL: ${linkSecl.href.padEnd(14)} | DGMS: ${linkDgms.href.padEnd(16)} | Active: [${page.expectedActive}]`);
        passed++;
      } else {
        failed++;
      }

    } catch (err) {
      console.error(`❌ [ERROR] ${page.file}:`, err.message);
      failed++;
    }
  }

  // Parameter preservation test in js/main.js
  console.log('\n--- Testing Parameter Preservation in setupHeaderNavigation() ---');
  if (JSDOM) {
    try {
      const mainJsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head></head>
        <body>
          <div class="header-links">
            <a href="dashboard.html" class="header-link">HQ Dashboard</a>
            <a href="secl-zone.html" class="header-link">SECL Operational Zone</a>
            <a href="dgms-portal.html" class="header-link">DGMS Regulatory Portal</a>
          </div>
        </body>
        </html>
      `, {
        url: `${BASE_URL}/mine-intelligence.html?mine=Gevra%20OC`,
        runScripts: 'outside-only'
      });

      dom.window.eval(mainJsCode);
      dom.window.setupHeaderNavigation();

      const links = dom.window.document.querySelectorAll('.header-links a');
      const hqHref = links[0].getAttribute('href');
      const seclHref = links[1].getAttribute('href');
      const dgmsHref = links[2].getAttribute('href');
      const activeClass = links[0].classList.contains('active');

      if (hqHref.includes('mine=Gevra%20OC') && seclHref.includes('mine=Gevra%20OC') && dgmsHref.includes('mine=Gevra%20OC') && activeClass) {
        console.log(`✅ [PASS] Query param preservation: mine=Gevra%20OC successfully preserved across navigation links.`);
        passed++;
      } else {
        console.error(`❌ [FAIL] Query param preservation failed: hq=${hqHref}, secl=${seclHref}, dgms=${dgmsHref}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [ERROR] Query param preservation test:`, err.message);
      failed++;
    }
  } else {
    console.log('ℹ️ [SKIP] JSDOM not available, skipping in-memory DOM execution test.');
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runNavigationTests();
