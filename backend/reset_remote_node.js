const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const code = `
      const { Pool } = require('pg');
      const pool = new Pool({ 
        user: 'graceandforce_user',
        password: 'Pck/aawJlsLFZxWu3CG7aw==',
        host: 'localhost',
        port: 5432,
        database: 'graceandforce_db'
      });
      pool.query('UPDATE users SET school_id = NULL, olympiad_registered = false, "classLevel" = NULL WHERE id = 7 RETURNING email')
        .then(res => { console.log("Reset for:", res.rows); process.exit(0); })
        .catch(err => { console.error(err); process.exit(1); });
    `;
    sftp.writeFile('/home/graceandforce/debate-engine/backend/reset_user.js', code, (err2) => {
      if (err2) throw err2;
      conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node reset_user.js', (err3, stream) => {
        if (err3) throw err3;
        stream.on('close', () => conn.end())
              .on('data', data => console.log('STDOUT: ' + data))
              .stderr.on('data', data => console.log('STDERR: ' + data));
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
