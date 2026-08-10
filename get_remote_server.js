const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /home/graceandforce/debate-engine/backend/server.js', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d.toString())
          .on('close', () => {
             require('fs').writeFileSync('remote_server.js', data);
             conn.end();
          });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
