const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const backendFile = fs.readFileSync('/Users/hananphashim/.gemini/antigravity/worktrees/debate-engine/analyze-entire-project-scope/backend/api/speech_coach.js', 'utf8');
const frontendFile = fs.readFileSync('/Users/hananphashim/.gemini/antigravity/worktrees/debate-engine/analyze-entire-project-scope/frontend/src/pages/SpeechAnalysis.jsx', 'utf8');

conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/api/speech_coach.js
${backendFile.replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/`/g, '\\`')}
INNER_EOF
cat << 'INNER_EOF' > /home/graceandforce/debate-engine/frontend/src/pages/SpeechAnalysis.jsx
${frontendFile.replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/`/g, '\\`')}
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && pm2 restart all`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log(d.toString()))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
