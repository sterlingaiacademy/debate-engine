const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

const filesToUpload = [
  { local: 'frontend/src/App.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/App.jsx' },
  { local: 'frontend/src/pages/CertificatesHub.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/CertificatesHub.jsx' },
  { local: 'frontend/src/pages/MiniMunMod3CertificateDownload.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/MiniMunMod3CertificateDownload.jsx' },
  { local: 'backend/server.js', remote: '/home/graceandforce/debate-engine/backend/server.js' },
  { local: 'backend/minimun_mod3_certificates.json', remote: '/home/graceandforce/debate-engine/backend/minimun_mod3_certificates.json' }
];

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    let uploads = 0;
    filesToUpload.forEach(file => {
      sftp.fastPut(path.join(__dirname, file.local), file.remote, (err) => {
        if (err) throw err;
        console.log(`Uploaded ${file.local} to ${file.remote}`);
        uploads++;
        if (uploads === filesToUpload.length) {
          console.log('All files uploaded. Building and moving...');
          
          const script = `
            source ~/.nvm/nvm.sh
            cd /home/graceandforce/debate-engine/backend
            pm2 restart grace-api
            cd /home/graceandforce/debate-engine/frontend
            npm run build
            cp -r /home/graceandforce/debate-engine/frontend/dist/* /var/www/grace-and-force/frontend/
          `;
          conn.exec(script, (err, stream) => {
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
        }
      });
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
