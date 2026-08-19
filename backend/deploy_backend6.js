const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('/home/graceandforce/.nvm/versions/node/v25.9.0/lib/node_modules/pm2/bin/pm2 restart all', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
