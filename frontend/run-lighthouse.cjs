const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Starting Puppeteer...');
  
  let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(executablePath)) {
    executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  }
  
  if (fs.existsSync(executablePath)) {
    console.log('Found system Google Chrome at:', executablePath);
  } else {
    console.warn('System Google Chrome not found. Falling back to Puppeteer bundled Chromium...');
    executablePath = undefined;
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: ['--remote-debugging-port=9222', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = (await browser.pages())[0] || await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Audit the Login Page (unauthenticated)
  console.log('Auditing Login Page (pre-auth)...');
  const lh = await import('lighthouse');
  const lighthouse = lh.default || lh;

  const loginReport = await lighthouse('http://localhost:58291/login', {
    port: 9222,
    output: 'html',
    logLevel: 'info',
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
      blockedUrlPatterns: [
        '*kaspersky*',
        '*kis.v2.scr*',
        '*gc.kis*',
        '*.kaspersky.*'
      ],
    }
  });

  const loginReportPath = path.join(__dirname, 'lighthouse-login-report.html');
  fs.writeFileSync(loginReportPath, loginReport.report);
  console.log('Saved login page report to:', loginReportPath);

  // 2. Perform Login
  console.log('Navigating to login page for auth...');
  const pages = await browser.pages();
  const authPage = pages[0] || await browser.newPage();
  
  // Register error listeners
  authPage.on('pageerror', err => {
    console.error('🔴 Browser Page Error:', err.stack || err.message);
  });
  authPage.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('🔴 Browser Console Error:', msg.text());
    } else {
      console.log('🟢 Browser Console:', msg.text());
    }
  });

  await authPage.setViewport({ width: 1280, height: 800 });
  await authPage.goto('http://localhost:58291/login', { waitUntil: 'networkidle2' });
  
  try {
    await authPage.waitForSelector('#identifier', { visible: true, timeout: 10000 });
  } catch (err) {
    console.error('Failed to find #identifier. Current URL:', authPage.url());
    console.error('Taking debugging screenshot and saving HTML...');
    await authPage.screenshot({ path: path.join(__dirname, 'debug-login-failed.png') });
    fs.writeFileSync(path.join(__dirname, 'debug-login-failed.html'), await authPage.content());
    throw err;
  }

  await authPage.type('#identifier', 'akar@tezu.ac.in');
  await authPage.waitForSelector('#password', { visible: true, timeout: 10000 });
  await authPage.type('#password', 'password123');
  await authPage.click('button[type="submit"]');
  
  console.log('Waiting for login redirect...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const currentUrl = authPage.url();
  console.log('Logged in! Current URL is:', currentUrl);

  // 3. Audit the Authenticated Faculty Dashboard
  console.log('Auditing Faculty Home Page (post-auth)...');
  const authReport = await lighthouse('http://localhost:58291/faculty', {
    port: 9222,
    output: 'html',
    logLevel: 'info',
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
      blockedUrlPatterns: [
        '*kaspersky*',
        '*kis.v2.scr*',
        '*gc.kis*',
        '*.kaspersky.*'
      ],
    }
  });

  const authReportPath = path.join(__dirname, 'lighthouse-faculty-report.html');
  fs.writeFileSync(authReportPath, authReport.report);
  console.log('Saved faculty page report to:', authReportPath);

  // Print scores
  console.log('\n--- LIGHTHOUSE RESULTS SUMMARY ---');
  const printScores = (name, result) => {
    const categories = result.lhr.categories;
    console.log(`\n[${name}]`);
    for (const key of Object.keys(categories)) {
      console.log(`- ${categories[key].title}: ${(categories[key].score * 100).toFixed(0)}%`);
    }
  };

  printScores('Login Page (Unauthenticated)', loginReport);
  printScores('Faculty Dashboard (Authenticated)', authReport);

  await browser.close();
  console.log('\nAudit complete! Reports saved in the frontend directory.');
}

run().catch(err => {
  console.error('Error running audit:', err);
  process.exit(1);
});
