const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const localFile = path.join(__dirname, 'test_models_remote.js');
const fileCode = fs.readFileSync(localFile, 'utf8');

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const stream = sftp.createWriteStream('/home/graceandforce/debate-engine/backend/test_models_remote.js');
    stream.write(fileCode);
    stream.end();
    
    stream.on('close', () => {
      conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_models_remote.js', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d))
              .stderr.on('data', d => process.stderr.write(d));
        stream.on('close', () => {
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
