const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));

  try {
      await page.goto('https://graceandforce.com', { waitUntil: 'networkidle0', timeout: 15000 });
      await page.screenshot({ path: 'screenshot.png' });
      console.log('Screenshot saved to screenshot.png');
  } catch (e) {
      console.log('Error:', e.message);
  }
  
  await browser.close();
})();
