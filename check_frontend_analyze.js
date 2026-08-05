const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /home/graceandforce/debate-engine/frontend/src/pages/SpeechAnalysis.jsx | grep -C 10 "api/speech/analyze"', (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log(d.toString())).on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
