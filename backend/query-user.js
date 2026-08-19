require('dotenv').config();
const { Pool } = require('pg');
const dbUrl = process.env.DATABASE_URL || 'postgresql://graceandforce_user:Pck/aawJlsLFZxWu3CG7aw==@localhost:5432/graceandforce_db';
function parseDbUrl(url) {
  try {
    const clean = url.replace(/^postgresql:\/\//, '').replace(/^postgres:\/\//, '');
    const atIdx = clean.lastIndexOf('@');
    const userInfo = clean.slice(0, atIdx);
    const hostInfo = clean.slice(atIdx + 1);
    const colonIdx = userInfo.indexOf(':');
    const user = userInfo.slice(0, colonIdx);
    const password = userInfo.slice(colonIdx + 1);
    const [hostPort, database] = hostInfo.split('/');
    const [host, port] = hostPort.split(':');
    return { user, password, host, port: parseInt(port, 10) || 5432, database };
  } catch (e) { return null; }
}
const config = parseDbUrl(dbUrl);
const pool = new Pool(config);
async function run() {
  const res = await pool.query("SELECT * FROM users WHERE \"studentId\" = 'nimeshumeshu'");
  console.log(res.rows[0]);
  pool.end();
}
run();
