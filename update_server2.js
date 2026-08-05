const { Client } = require('ssh2');
const fs = require('fs');

const frontendCode = fs.readFileSync('frontend/src/pages/SpeechAnalysis.jsx', 'utf8');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const frontendStream = sftp.createWriteStream('/home/graceandforce/debate-engine/frontend/src/pages/SpeechAnalysis.jsx');
    frontendStream.write(frontendCode);
    frontendStream.end();
    
    frontendStream.on('close', () => {
      console.log('File uploaded successfully!');
      conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && pm2 restart all', (err2, stream) => {
        if (err2) throw err2;
        stream.on('data', d => console.log('STDOUT:', d.toString()))
              .stderr.on('data', d => console.log('STDERR:', d.toString()));
        stream.on('close', () => conn.end());
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
