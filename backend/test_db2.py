const { Pool } = require('pg');

const pool = new Pool({
  user: 'graceandforce_user',
  password: 'Pck/aawJlsLFZxWu3CG7aw==',
  host: 'localhost',
  port: 5432,
  database: 'graceandforce_db',
});

async function run() {
  try {
    const res = await pool.query(`SELECT id, student_name, email, payment_status, module FROM mini_mun_registrations WHERE email = 'yasmeenbasheer140584@gmail.com'`);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
