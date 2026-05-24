// Dedicated test: check if request interception via CDP's Network.setBlockedURLs works
// and if the Kaspersky script can be blocked before Lighthouse runs its audit.
const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--remote-debugging-port=9222', '--no-sandbox']
  });

  const page = await browser.newPage();
  
  // Use CDP session directly (Lighthouse-compatible method)
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', { 
    urls: ['*kaspersky*', '*kaspersky-labs.com*', '*gc.kis*']
  });
  
  console.log('CDP blocked URLs set. Navigating to login page...');
  await page.goto('http://localhost:4173/login', { waitUntil: 'networkidle2' });
  
  console.log('Page loaded. Checking for kaspersky scripts...');
  const scripts = await page.evaluate(() => {
    return [...document.querySelectorAll('script[src]')].map(s => s.src);
  });
  
  const kasperskyScripts = scripts.filter(s => s.includes('kaspersky'));
  console.log('Kaspersky scripts found:', kasperskyScripts.length);
  if (kasperskyScripts.length) {
    console.log('Scripts:', kasperskyScripts);
  } else {
    console.log('SUCCESS: No Kaspersky scripts detected!');
  }
  
  await browser.close();
}

test().catch(console.error);
