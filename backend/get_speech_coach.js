const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat /home/graceandforce/debate-engine/backend/api/speech_coach.js`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      require('fs').writeFileSync('remote_speech_coach.js', out);
      console.log('Saved to remote_speech_coach.js');
      conn.end();
    });
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
