const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const filesToUpload = [
  { local: 'frontend/index.html', remote: '/home/graceandforce/debate-engine/frontend/index.html' },
  { local: 'frontend/public/favicon.png', remote: '/home/graceandforce/debate-engine/frontend/public/favicon.png' }
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
          console.log('Building...');
          conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && sudo cp -r dist/* /var/www/graceandforce.com/html/', (err3, stream) => {
            if (err3) throw err3;
            stream.on('data', d => console.log(d.toString()))
                  .on('close', () => {
                     console.log('Done.');
                     conn.end();
                  });
          });
        }
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
