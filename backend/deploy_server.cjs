const { Client } = require('ssh2');
const fs = require('fs');

console.log("Connecting via SSH to deploy backend speech_coach.js...");
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready, uploading...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('api/speech_coach.js', '/home/graceandforce/debate-engine/backend/api/speech_coach.js', (err) => {
      if (err) throw err;
      console.log('Upload complete, restarting pm2...');
      const pass = 'wvpi2!ZnTcV];ncy';
      conn.exec(`echo '${pass}' | sudo -S pm2 restart grace-api`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    });
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
