const { Client } = require('ssh2');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

conn.on('ready', () => {
  conn.exec('grep -rn "Speech Analysis" /var/www/grace-and-force/frontend/assets/', (err, stream) => {
    if (err) throw err;
    let dataOut = '';
    stream.on('close', (code, signal) => {
      console.log(dataOut);
      conn.end();
    }).on('data', (data) => {
      dataOut += data;
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
