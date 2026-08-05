const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node -e \"const db = require('./database'); async function setup() { try { await db.query('CREATE TABLE IF NOT EXISTS indus_mun_registrations (id SERIAL PRIMARY KEY, user_id VARCHAR(255), student_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, mobile VARCHAR(50) NOT NULL, school_name VARCHAR(255), grade VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);'); console.log('Table created successfully'); } catch(e) { console.error(e); } finally { process.exit(); } } setup();\"", (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '139.117.20.106',
  port: 22,
  username: 'graceandforce',
  privateKey: require('fs').readFileSync('/Users/hananphashim/.ssh/id_rsa')
});
