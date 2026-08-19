const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`psql postgresql://graceandforce_user:'Pck/aawJlsLFZxWu3CG7aw=='@localhost:5432/graceandforce_db -c "SELECT username, grade, category, \"classLevel\" FROM users WHERE username = 'nimeshumeshu';"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
