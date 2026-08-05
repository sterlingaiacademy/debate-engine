const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastGet('/home/graceandforce/debate-engine/frontend/src/pages/Dashboard.jsx', 'frontend/src/pages/Dashboard.jsx', (err) => {
      if (err) throw err;
      console.log('Successfully downloaded Dashboard.jsx');
      conn.end();
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
