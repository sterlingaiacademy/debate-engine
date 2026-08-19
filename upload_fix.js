const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localFile = 'backend/server_prod.js';
    const remoteFile = '/home/graceandforce/debate-engine/backend/server_prod.js';
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('File uploaded via SFTP.');
      conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api && echo BACKEND_RESTARTED', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d.toString()))
              .stderr.on('data', d => process.stderr.write(d.toString()))
              .on('close', () => {
                conn.end();
              });
      });
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
