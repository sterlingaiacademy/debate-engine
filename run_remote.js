const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`psql -U postgres -d debate_engine -c "SELECT student_id, score FROM speech_analysis_sessions LIMIT 5;"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
