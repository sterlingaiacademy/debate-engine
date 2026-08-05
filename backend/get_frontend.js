const https = require('https');
https.get('https://graceandforce.com/speech-analysis', res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const jsMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
    if (jsMatch) {
      console.log('Found JS:', jsMatch[1]);
      https.get('https://graceandforce.com' + jsMatch[1], res2 => {
        let js = '';
        res2.on('data', chunk => js += chunk);
        res2.on('end', () => {
          console.log('JS contains /api/speech/history:', js.includes('/api/speech/history'));
          console.log('JS contains /speech-coach/realtime-token:', js.includes('/speech-coach/realtime-token'));
          console.log('JS contains API_BASE:', js.includes('API_BASE'));
          const matches = js.match(/\/api\/speech[^"']+/g);
          console.log('Speech API routes in JS:', matches ? [...new Set(matches)] : 'None');
        });
      });
    } else {
      console.log('No JS found in HTML');
    }
  });
});
