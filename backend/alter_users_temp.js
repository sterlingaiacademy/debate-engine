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
      async function run() {
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255)');
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(255)');
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)');
          console.log("Database columns added successfully.");
        } catch(e) {
          console.error(e);
        } finally {
          process.exit(0);
        }
      }
      run();
    `;
    sftp.writeFile('/home/graceandforce/debate-engine/backend/alter_users_temp.js', code, (err2) => {
      if (err2) throw err2;
      conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node alter_users_temp.js', (err3, stream) => {
        if (err3) throw err3;
        stream.on('close', () => conn.end())
              .on('data', data => process.stdout.write('STDOUT: ' + data))
              .stderr.on('data', data => process.stderr.write('STDERR: ' + data));
      });
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
