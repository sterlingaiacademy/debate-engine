const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -h localhost -U graceandforce_user -d graceandforce_db -c "SELECT id, COALESCE(NULLIF(phone, ''), parent_phone) as phone, COALESCE(NULLIF(grade, ''), \\"classLevel\\") as grade FROM users ORDER BY id DESC LIMIT 5;"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
