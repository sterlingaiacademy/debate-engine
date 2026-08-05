const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  const serverContent = fs.readFileSync('backend/server.js', 'utf8');
  const emailContent = fs.readFileSync('backend/utils/email.js', 'utf8');
  
  conn.exec(`mkdir -p /home/graceandforce/debate-engine/backend/utils && cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/server.js\n${serverContent}\nINNER_EOF\ncat << 'INNER_EOF_2' > /home/graceandforce/debate-engine/backend/utils/email.js\n${emailContent}\nINNER_EOF_2`, (err) => {
    if (err) throw err;
    conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && npm install nodemailer && pm2 restart grace-api', (err3, stream) => {
      if (err3) throw err3;
      stream.on('data', d => console.log(d.toString())).on('close', () => conn.end());
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
