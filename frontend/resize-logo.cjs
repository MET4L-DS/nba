const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(executablePath)) {
    executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  }
  const browser = await puppeteer.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  
  // Read original PNG file
  const originalPath = path.join(__dirname, 'public', 'tulogo.png');
  const originalBuffer = fs.readFileSync(originalPath);
  const base64Image = originalBuffer.toString('base64');
  
  console.log('Executing canvas resize in browser...');
  const results = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create 96x96 canvas for excellent retina display rendering
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        
        // Draw image resized
        ctx.drawImage(img, 0, 0, 96, 96);
        
        // Export to WebP and PNG
        const webpData = canvas.toDataURL('image/webp', 0.9);
        const pngData = canvas.toDataURL('image/png');
        resolve({ webpData, pngData });
      };
      img.src = 'data:image/png;base64,' + base64;
    });
  }, base64Image);
  
  // Save WebP
  const webpBuffer = Buffer.from(results.webpData.split(',')[1], 'base64');
  const webpPath = path.join(__dirname, 'public', 'tulogo.webp');
  fs.writeFileSync(webpPath, webpBuffer);
  console.log('Saved resized WebP to:', webpPath, `(${webpBuffer.length} bytes)`);
  
  // Overwrite original PNG with resized one
  const pngBuffer = Buffer.from(results.pngData.split(',')[1], 'base64');
  fs.writeFileSync(originalPath, pngBuffer);
  console.log('Overwrote original PNG with resized PNG:', originalPath, `(${pngBuffer.length} bytes)`);
  
  await browser.close();
  console.log('Resize complete!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
