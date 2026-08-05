const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://graceandforce.com/login', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: 'screenshot.png'});
  
  await browser.close();
})();
