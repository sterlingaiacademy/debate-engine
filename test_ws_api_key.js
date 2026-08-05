const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_ws_api_key.js
require('dotenv').config({ path: '.env' });
const { RealtimeService } = require('assemblyai');
const realtime = new RealtimeService({ apiKey: process.env.ASSEMBLYAI_API_KEY });
realtime.on('open', ({ sessionId }) => {
  console.log('Session ID:', sessionId);
  realtime.close();
});
realtime.on('error', (error) => {
  console.error('Realtime error:', error);
});
realtime.connect().catch(err => console.error('Connect error:', err.message));
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_ws_api_key.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log('STDOUT:', d.toString()))
          .stderr.on('data', (d) => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
