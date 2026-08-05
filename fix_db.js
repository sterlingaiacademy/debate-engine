const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    source ~/.nvm/nvm.sh
    cd /home/graceandforce/debate-engine/backend
    node -e "const { Pool } = require('pg'); const pool = new Pool({ user: 'graceandforce_user', password: 'Pck/aawJlsLFZxWu3CG7aw==', host: 'localhost', port: 5432, database: 'graceandforce_db' }); pool.query(\\\"UPDATE indus_mun_registrations SET grade = '6' WHERE grade = 'Professional'\\\").then(res => { console.log('Updated', res.rowCount, 'rows'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); })"
  `;
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream closed with code ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
