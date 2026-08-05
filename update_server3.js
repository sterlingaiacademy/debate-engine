const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const backendPath = path.join(__dirname, 'backend', 'api', 'speech_coach.js');
const backendCode = fs.readFileSync(backendPath, 'utf8');

conn.on('ready', () => {
  console.log('Connected to remote server via SSH.');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP session started.');
    const backendStream = sftp.createWriteStream('/home/graceandforce/debate-engine/backend/api/speech_coach.js');
    backendStream.write(backendCode);
    backendStream.end();
    
    backendStream.on('close', () => {
      console.log('File uploaded successfully!');
      conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d))
              .stderr.on('data', d => process.stderr.write(d));
        stream.on('close', () => {
          console.log('\nPM2 restarted.');
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
