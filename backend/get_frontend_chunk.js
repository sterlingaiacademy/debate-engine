const https = require('https');
https.get('https://graceandforce.com/speech-analysis', res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // get all scripts
    const scriptMatches = html.match(/src="(\/assets\/[^"]+)"/g) || [];
    console.log(scriptMatches);
  });
});
