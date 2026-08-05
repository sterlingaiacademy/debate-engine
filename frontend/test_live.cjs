const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', async (msg) => {
    const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(e => arg.toString())));
    console.log('CONSOLE:', msg.type(), args);
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  await page.goto('https://graceandforce.com', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'live_screenshot.png' });
  
  await browser.close();
})();
