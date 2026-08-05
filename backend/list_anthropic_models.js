const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/list_models.js
require('dotenv').config();
const https = require('https');

const options = {
  hostname: 'api.anthropic.com',
  path: '/v1/models',
  method: 'GET',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed.data.map(m => m.id).join('\\n'));
    } catch(e) {
      console.log(data);
    }
  });
});
req.end();
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node list_models.js`, (err, stream) => {
    stream.on('data', d => console.log('STDOUT:', d.toString()));
    stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
