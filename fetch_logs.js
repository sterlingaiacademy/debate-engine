const { Client } = require('ssh2');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

conn.on('ready', () => {
  const script = `
    source ~/.nvm/nvm.sh
    pm2 logs grace-api --lines 50 --nostream
  `;
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
