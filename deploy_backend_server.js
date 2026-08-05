const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  const content = fs.readFileSync('backend/server.js', 'utf8');
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/server.js\n${content}\nINNER_EOF`, (err) => {
    if (err) throw err;
    conn.exec('pm2 restart grace-api', (err2, stream) => {
      if (err2) throw err2;
      stream.on('data', d => console.log(d.toString())).on('close', () => conn.end());
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
