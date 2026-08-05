const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `cd /home/graceandforce/debate-engine/backend && source ~/.nvm/nvm.sh && node -e "const db = require('./database'); db.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE').then(()=>console.log('CLEARED_SUCCESSFULLY')).catch(console.error).finally(()=>process.exit(0));"`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log('STDOUT:', d.toString()))
          .on('stderr', d => console.error('STDERR:', d.toString()))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
