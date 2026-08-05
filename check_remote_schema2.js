const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node -e \"const db = require('./database'); db.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \\'debate_users\\' AND column_name IN (\\'user_id\\', \\'gforce_tokens\\', \\'avg_score\\')').then(res => { console.log('debate_users:', res.rows); process.exit(0); });\"", (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', data => console.log('STDOUT: ' + data)).stderr.on('data', data => console.error('STDERR: ' + data));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
