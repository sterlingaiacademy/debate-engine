const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('backend/server.js', '/home/graceandforce/debate-engine/backend/server.js', (err2) => {
      if (err2) throw err2;
      console.log('Successfully uploaded server.js');
      sftp.fastPut('backend/server_prod.js', '/home/graceandforce/debate-engine/backend/server_prod.js', (err3) => {
        if (err3) throw err3;
        console.log('Successfully uploaded server_prod.js');
        conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api', (err4, stream) => {
          if (err4) throw err4;
          stream.on('data', (d) => process.stdout.write(d))
                .on('close', () => {
                  conn.end();
                  console.log('Restarted PM2');
                });
        });
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
