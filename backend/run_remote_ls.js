const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cd /home/graceandforce/debate-engine/backend && head -n 15 minimun_mod1_certificates.json`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', data => console.log('STDOUT: ' + data))
          .stderr.on('data', data => console.log('STDERR: ' + data));
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
