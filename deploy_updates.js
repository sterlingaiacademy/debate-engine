const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const backendPath = path.join(__dirname, 'backend', 'server_prod.js');
const backendCode = fs.readFileSync(backendPath, 'utf8');

const backendPath2 = path.join(__dirname, 'backend', 'server.js');
const backendCode2 = fs.readFileSync(backendPath2, 'utf8');

conn.on('ready', () => {
  console.log('Connected to remote server via SSH.');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP session started.');
    
    const backendStream = sftp.createWriteStream('/home/graceandforce/debate-engine/backend/server_prod.js');
    backendStream.write(backendCode);
    backendStream.end();
    
    backendStream.on('close', () => {
      console.log('server_prod.js uploaded successfully!');
      const backendStream2 = sftp.createWriteStream('/home/graceandforce/debate-engine/backend/server.js');
      backendStream2.write(backendCode2);
      backendStream2.end();
      
      backendStream2.on('close', () => {
        console.log('server.js uploaded successfully!');
        conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api && pm2 restart grace-api-2', (err, stream) => {
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
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
