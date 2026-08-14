const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localFile = 'frontend/src/pages/OlympiadDashboard.jsx';
    const remoteFile = '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadDashboard.jsx';
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('File uploaded via SFTP.');
      conn.exec('cd /home/graceandforce/debate-engine/frontend && source ~/.nvm/nvm.sh && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo FRONTEND_DEPLOYED', (err, stream) => {
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
