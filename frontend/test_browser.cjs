const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', async (msg) => {
    const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(e => arg.toString())));
    console.log(msg.type(), args);
  });
  
  await page.goto('https://graceandforce.com/login', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
