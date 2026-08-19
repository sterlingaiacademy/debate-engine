const { Pool } = require('pg');
const pool = new Pool({
  user: 'graceandforce_user',
  host: 'localhost',
  database: 'graceandforce_db',
  password: 'Pck/aawJlsLFZxWu3CG7aw==',
  port: 5432,
});
async function run() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE \"studentId\" = 'nimeshumeshu'");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
