const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_ws_v3.js
require('dotenv').config({ path: '.env' });
const WebSocket = require('ws');
const ws = new WebSocket(\`wss://streaming.assemblyai.com/v3/ws?speech_model=universal-3-5-pro&encoding=pcm_s16le&sample_rate=16000&token=\${process.env.ASSEMBLYAI_API_KEY}\`);
ws.on('open', () => {
  console.log('V3 Raw WS Open');
  ws.close();
});
ws.on('error', (err) => console.log('V3 Raw WS Error:', err.message));
ws.on('unexpected-response', (req, res) => console.log('V3 Raw WS Unexpected Response:', res.statusCode));
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_ws_v3.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log('STDOUT:', d.toString()))
          .stderr.on('data', (d) => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
