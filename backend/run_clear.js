const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready');
  const scriptContent = `
const db = require('./database');
async function clearSchools() {
  try {
    const result = await db.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE');
    console.log('Successfully cleared all schools from the database.');
  } catch (err) {
    console.error('Error clearing schools:', err);
  } finally {
    process.exit(0);
  }
}
clearSchools();
`;
  
  const cmd = `cd /home/graceandforce/debate-engine/backend && cat << 'INNER_EOF' > clear_schools.js\n${scriptContent}\nINNER_EOF\nnode clear_schools.js`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log(d.toString()))
          .on('close', () => {
             console.log('Done');
             conn.end();
          });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
