require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.VULTR_DB_USER,
  host: process.env.VULTR_DB_HOST,
  database: process.env.VULTR_DB_NAME,
  password: process.env.VULTR_DB_PASSWORD,
  port: process.env.VULTR_DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM indus_mun_registrations');
    console.log(`Found ${res.rows.length} rows in indus_mun_registrations`);
    if(res.rows.length > 0) {
      console.log('Sample:', res.rows[0]);
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
