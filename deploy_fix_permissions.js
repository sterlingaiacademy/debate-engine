const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('echo "wvpi2!ZnTcV];ncy" | sudo -S chown -R graceandforce:graceandforce /var/www/grace-and-force/frontend', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', (d) => console.log(d.toString())).stderr.on('data', (d) => console.log('ERR: ' + d.toString()));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
