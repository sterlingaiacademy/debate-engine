const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && cd /home/graceandforce/debate-engine && git pull && pm2 restart all', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
