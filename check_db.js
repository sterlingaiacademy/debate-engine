const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const remoteScript = `
    const db = require('./database');
    (async () => {
      try {
        const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';");
        console.log(res.rows.map(r => r.column_name).join(', '));
      } catch(err) {
        console.log(err);
      }
      process.exit();
    })();
  `;
  conn.exec(`source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node -e "${remoteScript.replace(/"/g, '\\"')}"`, (err, stream) => {
    stream.on('data', d => console.log(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
