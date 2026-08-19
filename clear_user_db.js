const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready');
  const query = `PGPASSWORD="Pck/aawJlsLFZxWu3CG7aw==" psql -h localhost -U graceandforce_user -d graceandforce_db -c "DELETE FROM olympiad_quiz_results WHERE user_email = 'hananrc70502@gmail.com'; "`;
  conn.exec(query, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()))
          .on('close', (code) => {
            console.log('Query executed with code:', code);
            conn.end();
          });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
