const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('ls -la /var/www/grace-and-force/frontend/', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', data => console.log('STDOUT: ' + data));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
