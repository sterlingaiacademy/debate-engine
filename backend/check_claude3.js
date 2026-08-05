const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_models.js`, (err, stream) => {
    stream.on('data', d => console.log('STDOUT:', d.toString()));
    stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
