const { Pool } = require('pg');

const pool = new Pool({
  user: 'graceandforce_user',
  password: 'Pck/aawJlsLFZxWu3CG7aw==',
  host: 'localhost',
  port: 5432,
  database: 'graceandforce_db'
});

async function check() {
  try {
    const res = await pool.query("SELECT id, name, email, \"studentId\", username FROM users WHERE username = 'nimeshumeshu' OR \"studentId\" = 'nimeshumeshu'");
    console.log("USER RECORD:");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
