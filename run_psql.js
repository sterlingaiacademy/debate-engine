const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`PGPASSWORD="Pck/aawJlsLFZxWu3CG7aw==" psql -U graceandforce_user -d graceandforce_db -h localhost -c "\\d speech_analysis_sessions;"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
