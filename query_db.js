const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function test() {
  const res = await pool.query(`SELECT student_id, user_id, score FROM speech_analysis_sessions LIMIT 10`);
  console.log(res.rows);
  const users = await pool.query(`SELECT id, email, "studentId" FROM users LIMIT 5`);
  console.log(users.rows);
  process.exit();
}
test();
