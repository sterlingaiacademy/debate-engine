const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('npm list assemblyai', { cwd: '/home/graceandforce/debate-engine/frontend' }, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log('STDOUT:', d.toString()))
          .stderr.on('data', (d) => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
