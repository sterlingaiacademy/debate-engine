const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'graceandforce_user',
  password: 'Pck/aawJlsLFZxWu3CG7aw==',
  host: 'localhost',
  port: 5432,
  database: 'graceandforce_db'
});

async function setup() {
  try {
    // Check if already exists
    const existing = await pool.query(
      `SELECT id, coordinator_login_id FROM schools WHERE school_code = $1`,
      ['GURUKULAM']
    );

    if (existing.rows.length > 0) {
      console.log('✅ Gurukulam already exists!');
      console.log('Coordinator Login ID:', existing.rows[0].coordinator_login_id);
      await pool.end();
      return;
    }

    // Insert Gurukulam
    const result = await pool.query(
      `INSERT INTO schools 
        (name, principal_name, coordinator_name, contact_email, contact_phone, school_code, coordinator_login_id, expected_students, classes_participating, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, coordinator_login_id`,
      [
        'Gurukulam',
        'Harold',
        'Harold',
        'coordinator@gurukulam.edu',
        '0000000000',
        'GURUKULAM',
        'COORD-GURUKULAM',
        100,
        'All',
        'approved'
      ]
    );

    console.log('✅ Gurukulam registered successfully!');
    console.log('School ID     :', result.rows[0].id);
    console.log('Coordinator Login:', result.rows[0].coordinator_login_id);
    console.log('');
    console.log('👉 Harold can now log in at graceandforce.com/login');
    console.log('   Username: COORD-GURUKULAM');
    console.log('   (no password needed)');
  } catch (err) {
    console.error('❌ Error:', err.message, err.stack);
  } finally {
    await pool.end();
  }
}

setup();
