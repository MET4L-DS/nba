const puppeteer = require('puppeteer');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

puppeteer.launch({ headless: true, executablePath, args: ['--remote-debugging-port=9223', '--no-sandbox'] }).then(async browser => {
  const page = await browser.newPage();
  await page.goto('http://localhost:4173/login', { waitUntil: 'networkidle2' });
  const source = await page.content();
  const hasKaspersky = source.toLowerCase().includes('kaspersky');
  console.log('Kaspersky in page source:', hasKaspersky);
  const scriptTagsMatch = source.match(/<script[^>]*src="[^"]*kaspersky[^"]*"/gi);
  console.log('Kaspersky script src tags:', scriptTagsMatch ? scriptTagsMatch.length : 0);
  // Check page evaluate DOM
  const domScripts = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('script'));
    return all.map(s => ({src: s.src, inline: !s.src, len: s.textContent.length}));
  });
  const kasScripts = domScripts.filter(s => s.src && (s.src.includes('kaspersky') || s.src.includes('gc.kis')));
  console.log('Kaspersky scripts in DOM:', kasScripts.length);
  if (kasScripts.length) console.log('Scripts:', kasScripts.map(s => s.src));
  await browser.close();
}).catch(console.error);
