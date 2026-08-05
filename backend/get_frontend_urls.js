const https = require('https');
https.get('https://graceandforce.com/assets/index-wHe3BQ_6.js', res => {
  let js = '';
  res.on('data', chunk => js += chunk);
  res.on('end', () => {
    const fetchMatches = js.match(/fetch\([^)]+\)/g) || [];
    console.log('Fetch calls:', [...new Set(fetchMatches)].slice(0, 20));
    const urlMatches = js.match(/[\w\.]+\/api\/[\w\-\/]+/g) || [];
    console.log('API URLs:', [...new Set(urlMatches)].slice(0, 20));
  });
});
