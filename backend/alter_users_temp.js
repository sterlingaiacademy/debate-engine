const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(50)`);
    console.log("Added parent_name and parent_phone to users");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
