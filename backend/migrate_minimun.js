require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`ALTER TABLE mini_mun_registrations ADD COLUMN IF NOT EXISTS module INTEGER DEFAULT 1`);
    console.log("Added module column successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
