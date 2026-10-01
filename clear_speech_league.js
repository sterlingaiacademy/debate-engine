const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Use the local postgres user (peer auth works for postgres user)
  conn.exec(`sudo -S -u postgres psql -d graceandforce_db -c "DELETE FROM speech_league_registrations;" 2>&1`, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('data', d => { output += d; process.stdout.write(d); })
          .stderr.on('data', d => { output += d; process.stderr.write(d); })
          .stdin.write('wvpi2!ZnTcV];ncy\n')
          .on('close', () => {
            console.log('\nDone.');
            conn.end();
          });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
