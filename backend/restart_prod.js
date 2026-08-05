const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('source ~/.nvm/nvm.sh && pm2 restart grace-api && sleep 2 && pm2 logs grace-api --lines 50 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    }).on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
