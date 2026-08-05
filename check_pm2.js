const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("source ~/.nvm/nvm.sh && pm2 show grace-api", (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log(d.toString()))
          .stderr.on('data', d => console.log(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
