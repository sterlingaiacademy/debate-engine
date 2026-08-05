const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected, altering schools table...');
  const query = "ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'; UPDATE schools SET status = 'approved' WHERE status = 'pending';";
  conn.exec(`sudo -u postgres psql -d graceandforce -c "${query}"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
       console.log('Done.');
       conn.end();
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
