const { Client } = require('ssh2');

const script = `
const db = require('./database.js');
db.query('DELETE FROM speech_league_registrations WHERE id IN (2, 3, 4, 5)').then(res => {
  console.log('Deleted rows:', res.rowCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && echo "${script.replace(/"/g, '\\"')}" > check_sl.js && node check_sl.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString())).stderr.on('data', d => process.stderr.write(d.toString())).on('close', () => conn.end());
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
