const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("grep -n \"model:\" /home/graceandforce/debate-engine/backend/api/speech_coach.js", (err, stream) => {
    stream.on('data', d => console.log(d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
