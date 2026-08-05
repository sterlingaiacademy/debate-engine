const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('ls -la /etc/nginx/sites-enabled/ && cat /etc/nginx/sites-enabled/*', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
