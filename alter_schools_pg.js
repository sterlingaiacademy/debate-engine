const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected, running pg script...');
  const remoteScript = `
    const db = require('./database');
    (async () => {
      try {
        console.log('Altering schools table...');
        await db.query("ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';");
        await db.query("UPDATE schools SET status = 'approved' WHERE status = 'pending';");
        console.log('Done altering table');
      } catch (err) {
        console.error('Error:', err);
      } finally {
        process.exit(0);
      }
    })();
  `;
  const escapedScript = remoteScript.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  conn.exec(`source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node -e "${escapedScript}"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
