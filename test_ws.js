const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_ws.js
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/ASSEMBLYAI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

const WebSocket = require('ws');
const ws = new WebSocket(\`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=\${apiKey}\`);

ws.on('open', () => {
  console.log('WebSocket opened successfully with API key as token!');
  ws.close();
});
ws.on('error', (err) => {
  console.error('WebSocket error:', err.message);
});
ws.on('close', (code, reason) => {
  console.log('WebSocket closed:', code, reason.toString());
});
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_ws.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (data) => console.log(data.toString()))
          .on('close', () => conn.end())
          .stderr.on('data', (data) => console.error(data.toString()));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
