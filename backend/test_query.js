const { Pool } = require('pg');
require('dotenv').config();
const db = new Pool({ connectionString: process.env.VULTR_DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  const users = await db.query(`SELECT email, school_id FROM users WHERE email IN ('soman@school.graceandforce.internal', 'hanan_2@school.graceandforce.internal', 'hananrc70502@gmail.com')`);
  console.log("USERS:", users.rows);
  const results = await db.query(`SELECT mr.user_email, u.name, u.school_id FROM olympiad_mock_results mr LEFT JOIN users u ON u.email = mr.user_email`);
  console.log("JOIN RESULT:", results.rows);
  process.exit(0);
}
run();
