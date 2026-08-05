const https = require('https');
https.get('https://graceandforce.com', res => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const url = 'https://graceandforce.com/assets/ITORegister-BnE_gTU4.js';
    https.get(url, res2 => {
      let js = '';
      res2.on('data', d => js += d);
      res2.on('end', () => {
        console.log(url, 'contains WORLD TEACHERS:', js.includes('WORLD TEACHERS'));
        console.log(url, 'contains CHALLENGE 2026:', js.includes('CHALLENGE 2026'));
      });
    });
  });
});
