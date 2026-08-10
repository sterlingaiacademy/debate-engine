const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const scriptContent = fs.readFileSync(path.join(__dirname, 'search_cert_json.js'), 'utf8');

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const remotePath = '/home/graceandforce/debate-engine/backend/search_cert_json.js';
    const writeStream = sftp.createWriteStream(remotePath);
    writeStream.on('close', () => {
      conn.exec(`export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && cd /home/graceandforce/debate-engine/backend && node search_cert_json.js`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => conn.end())
              .on('data', data => console.log('STDOUT: ' + data))
              .stderr.on('data', data => console.log('STDERR: ' + data));
      });
    });
    writeStream.end(scriptContent);
  });
});

conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
