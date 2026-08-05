const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected, running build...');
  conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', (code, signal) => {
       console.log('Stream closed. Code: ' + code + ', Signal: ' + signal);
       conn.end();
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
