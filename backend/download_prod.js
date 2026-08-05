const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastGet('/home/graceandforce/debate-engine/backend/server.js', 'server_prod.js', (err) => {
      if (err) throw err;
      console.log('Downloaded server_prod.js');
      conn.end();
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
