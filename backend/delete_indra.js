const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // First, check linked tables if there's no cascade
  // But let's just try to delete the user
  const deleteQuery = `DELETE FROM users WHERE id = 1184;`;
  
  conn.exec(`PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -h localhost -U graceandforce_user -d graceandforce_db -c "${deleteQuery}"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
