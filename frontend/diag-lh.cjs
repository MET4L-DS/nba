// Kaspersky is NOT in the initial DOM, but Lighthouse is still seeing it.
// This means it's injected AFTER Lighthouse starts its own Chrome session.
// Kaspersky operates at the system network level (LSP/WFP driver), intercepting HTTP traffic.
// The blockedUrlPatterns in Lighthouse settings should prevent these from being audited.
// Let's run Lighthouse manually to check if the settings ARE being applied correctly.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--remote-debugging-port=9222', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const lh = await import('lighthouse');
  const lighthouse = lh.default || lh;

  console.log('Running Lighthouse with blockedUrlPatterns...');
  const report = await lighthouse('http://localhost:4173/login', {
    port: 9222,
    output: 'json',
    logLevel: 'silent',
    settings: {
      disableStorageReset: true,
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
      blockedUrlPatterns: ['*kaspersky*', '*kaspersky-labs*', '*gc.kis*'],
    }
  });

  const lhr = JSON.parse(report.report);
  
  console.log('\n=== SCORES ===');
  for (const [k, v] of Object.entries(lhr.categories)) {
    console.log(`${v.title}: ${(v.score * 100).toFixed(0)}%`);
  }
  
  console.log('\n=== BLOCKED REQUESTS (from audit) ===');
  const networkReqs = lhr.audits['network-requests'];
  if (networkReqs && networkReqs.details && networkReqs.details.items) {
    const kasItems = networkReqs.details.items.filter(i => 
      i.url && (i.url.includes('kaspersky') || i.url.includes('gc.kis'))
    );
    console.log('Kaspersky requests in network log:', kasItems.length);
    if (kasItems.length) kasItems.forEach(i => console.log(' -', i.url.substring(0, 80), 'Status:', i.statusCode));
  }

  console.log('\n=== UNUSED JS OPPORTUNITIES ===');
  const unusedJs = lhr.audits['unused-javascript'];
  if (unusedJs && unusedJs.details && unusedJs.details.items) {
    unusedJs.details.items.forEach(i => {
      console.log(`- ${i.url ? i.url.substring(0, 80) : 'N/A'}: ${((i.wastedBytes||0)/1024).toFixed(1)} KB wasted`);
    });
  }

  await browser.close();
}

run().catch(console.error);
