const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /home/graceandforce/debate-engine/backend/api/speech_coach.js | grep -C 5 "prep-hints" -A 40', (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log(d.toString())).on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
