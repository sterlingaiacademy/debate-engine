const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /home/graceandforce/debate-engine/backend/api/speech_coach.js', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', (d) => data += d).on('close', () => {
      console.log(data.substring(data.indexOf('/analyze')));
      conn.end();
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
