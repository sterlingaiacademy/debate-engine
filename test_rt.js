const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_rt.js
require('dotenv').config({ path: '.env' });
const { AssemblyAI } = require('assemblyai');
const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
aai.realtime.createTemporaryToken({ expires_in: 3600 })
  .then(token => console.log('TOKEN:', token))
  .catch(err => console.error('ERROR:', err.message));
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_rt.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log('STDOUT:', d.toString()))
          .stderr.on('data', (d) => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
