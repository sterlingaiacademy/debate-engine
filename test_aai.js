const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_aai.js
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/ASSEMBLYAI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';
console.log('API KEY:', apiKey ? 'FOUND' : 'NOT FOUND');

const { AssemblyAI } = require('assemblyai');
const client = new AssemblyAI({ apiKey });

async function run() {
  try {
    const token = await client.realtime.createTemporaryToken({ expires_in: 3600 });
    console.log('Token created successfully:', token);
  } catch (e) {
    console.error('Error creating token:', e.message);
  }
}
run();
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_aai.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (data) => console.log(data.toString()))
          .on('close', () => conn.end())
          .stderr.on('data', (data) => console.error(data.toString()));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
