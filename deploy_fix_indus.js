const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const serverProdPath = path.join(__dirname, 'backend', 'server_prod.js');
const serverPath = path.join(__dirname, 'backend', 'server.js');
const dedupPath = path.join(__dirname, 'backend', 'dedup.js');

const serverProdCode = fs.readFileSync(serverProdPath, 'utf8');
const serverCode = fs.readFileSync(serverPath, 'utf8');
const dedupCode = fs.readFileSync(dedupPath, 'utf8');

conn.on('ready', () => {
  console.log('Connected to remote server via SSH.');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP session started.');
    
    const s1 = sftp.createWriteStream('/home/graceandforce/debate-engine/backend/server_prod.js');
    s1.write(serverProdCode);
    s1.end();

    const s2 = sftp.createWriteStream('/home/graceandforce/debate-engine/backend/server.js');
    s2.write(serverCode);
    s2.end();

    let uploaded = 0;
    const checkUploads = () => {
      uploaded++;
      if (uploaded === 2) {
        console.log('Files uploaded successfully! Restarting PM2...');
        conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api', (err2, stream2) => {
          if (err2) throw err2;
          stream2.on('data', d => process.stdout.write(d))
                 .stderr.on('data', d => process.stderr.write(d));
          stream2.on('close', () => {
            console.log('\nPM2 restarted.');
            conn.end();
          });
        });
      }
    };

    s1.on('close', checkUploads);
    s2.on('close', checkUploads);
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
