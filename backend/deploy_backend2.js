const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('find / -name "server_prod.js" -path "*/debate*" 2>/dev/null | head -5', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => { console.log(out); conn.end(); })
          .on('data', d => out += d.toString())
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
