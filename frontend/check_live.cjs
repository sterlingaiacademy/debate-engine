const https = require('https');
https.get('https://graceandforce.com', res => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const jsMatch = html.match(/src="(\/assets\/[^"]+)"/g);
    if (!jsMatch) { console.log('No JS found'); return; }
    jsMatch.forEach(src => {
      const url = 'https://graceandforce.com' + src.match(/"([^"]+)"/)[1];
      console.log('Fetching:', url);
      https.get(url, res2 => {
        let js = '';
        res2.on('data', d => js += d);
        res2.on('end', () => {
          console.log(url, 'contains WORLD TEACHERS:', js.includes('WORLD TEACHERS'));
          console.log(url, 'contains INTERNATIONAL TEACHERS:', js.includes('INTERNATIONAL TEACHERS'));
        });
      });
    });
  });
});
