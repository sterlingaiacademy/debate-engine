const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

const filesToUpload = [
  { local: 'frontend/src/pages/GTalkCohort.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/GTalkCohort.jsx' }
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
          console.log('All files uploaded. Building and restarting...');
          
          const script = `
            source ~/.nvm/nvm.sh
            
            # Build frontend
            cd /home/graceandforce/debate-engine/frontend
            npm install
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
