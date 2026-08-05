const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const scriptContent = `
const db = require('./database');
async function checkSchools() {
  try {
    const result = await db.query('SELECT COUNT(*) FROM schools');
    console.log('SCHOOL COUNT:', result.rows[0].count);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
checkSchools();
`;
  
  const cmd = `cd /home/graceandforce/debate-engine/backend && cat << 'INNER_EOF' > check_schools.js\n${scriptContent}\nINNER_EOF\nnode check_schools.js`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log(d.toString()))
          .on('stderr', d => console.error(d.toString()))
          .on('close', () => {
             conn.end();
          });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
