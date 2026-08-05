const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_curl.js
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/ASSEMBLYAI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

const { exec } = require('child_process');
exec(\`curl -s -X POST https://api.assemblyai.com/v2/realtime/token -H "Authorization: \${apiKey}" -H "Content-Type: application/json" -d '{"expires_in": 3600}'\`, (err, stdout, stderr) => {
  console.log('CURL OUTPUT:', stdout);
});
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_curl.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (data) => console.log(data.toString()))
          .on('close', () => conn.end())
          .stderr.on('data', (data) => console.error(data.toString()));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
