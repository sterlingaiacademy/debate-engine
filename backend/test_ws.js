const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`source ~/.nvm/nvm.sh && cat << 'EOF' > /home/graceandforce/debate-engine/backend/test_token.js
require('dotenv').config();
const axios = require('axios');
const WebSocket = require('ws');

async function test() {
  try {
    const key = process.env.ASSEMBLYAI_API_KEY;
    console.log("Key:", key.substring(0, 5) + "...");
    
    // First try the API key directly in v2
    try {
      console.log("Trying v2 with API key directly...");
      const ws1 = new WebSocket(\`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=\${key}\`);
      ws1.on('open', () => { console.log('v2 API key open'); ws1.close(); });
      ws1.on('error', (e) => console.log('v2 API key error:', e.message));
      ws1.on('close', (c, r) => console.log('v2 API key closed', c, r.toString()));
    } catch (e) { console.log(e.message); }

    // Try token generation
    const res = await axios.post('https://api.assemblyai.com/v2/realtime/token', 
      { expires_in: 3600 },
      { headers: { authorization: key } }
    );
    const token = res.data.token;
    console.log("Generated temp token.");
    
    const ws2 = new WebSocket(\`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=\${token}\`);
    ws2.on('open', () => { console.log('v2 temp token open'); ws2.close(); });
    ws2.on('error', (e) => console.log('v2 temp token error:', e.message));
    ws2.on('close', (c, r) => console.log('v2 temp token closed', c, r.toString()));

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
EOF
node /home/graceandforce/debate-engine/backend/test_token.js`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
