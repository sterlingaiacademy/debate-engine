const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  const serverContent = fs.readFileSync('backend/server.js', 'utf8');
  const dbContent = fs.readFileSync('backend/database.js', 'utf8');
  
  const escapedServer = serverContent.replace(/'/g, "'\\''");
  const escapedDb = dbContent.replace(/'/g, "'\\''");
  
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/server.js\n${serverContent}\nINNER_EOF`, (err) => {
    if (err) throw err;
    conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/database.js\n${dbContent}\nINNER_EOF`, (err2) => {
      if (err2) throw err2;
      conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api', (err3, stream) => {
        if (err3) throw err3;
        stream.on('data', d => console.log(d.toString())).on('close', () => conn.end());
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
