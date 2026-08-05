const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  const content = fs.readFileSync('backend/api/speech_coach.js', 'utf8');
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/api/speech_coach.js\n${content}\nINNER_EOF`, (err) => {
    if (err) throw err;
    const { exec } = require('child_process');
    exec('cd frontend && scp -r -o StrictHostKeyChecking=no dist graceandforce@65.20.85.75:/home/graceandforce/debate-engine/frontend/dist', (err2, stdout, stderr) => {
      if (err2) console.error(err2);
      conn.exec('pm2 restart all', (err3, stream) => {
        if (err3) throw err3;
        stream.on('data', d => console.log(d.toString())).on('close', () => conn.end());
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
