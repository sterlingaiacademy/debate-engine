const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_ws_model2.js
require('dotenv').config({ path: '.env' });
const { RealtimeService } = require('assemblyai');
const realtime = new RealtimeService({ 
  apiKey: process.env.ASSEMBLYAI_API_KEY,
  realtimeUrl: "wss://api.assemblyai.com/v2/realtime/ws"
});
// Try raw WebSocket just in case
const WebSocket = require('ws');
const ws = new WebSocket("wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000", {
  headers: {
    Authorization: process.env.ASSEMBLYAI_API_KEY
  }
});
ws.on('open', () => {
  console.log('Raw WS Open');
  ws.close();
});
ws.on('error', (err) => console.log('Raw WS Error:', err.message));
ws.on('unexpected-response', (req, res) => console.log('Raw WS Unexpected Response:', res.statusCode));
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_ws_model2.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log('STDOUT:', d.toString()))
          .stderr.on('data', (d) => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
