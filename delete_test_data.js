require('dotenv').config({ path: 'backend/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("DELETE FROM student_speech_sessions WHERE league = true");
    console.log(`Deleted ${res.rowCount} speech league sessions.`);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
