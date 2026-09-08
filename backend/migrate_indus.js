require('dotenv').config();
const db = require('./database.js');

async function migrate() {
  try {
    const res = await db.query('SELECT * FROM indus_mun_registrations');
    console.log('Found ' + res.rows.length + ' registrations to migrate.');
    
    await db.query(`CREATE TABLE IF NOT EXISTS indusmun_individuals (
      id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255),
      mobile VARCHAR(50), grade VARCHAR(100), city VARCHAR(255), state VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    for (const r of res.rows) {
      if (r.email) {
        await db.query('UPDATE users SET indusmun_registered = true WHERE email = $1', [r.email]);
      }
      if (r.mobile) {
        await db.query('UPDATE users SET indusmun_registered = true WHERE mobile = $1', [r.mobile]);
      }
      
      const exists = await db.query('SELECT id FROM indusmun_individuals WHERE email = $1 OR mobile = $2', [r.email || 'N/A', r.mobile || 'N/A']);
      if (exists.rows.length === 0) {
        await db.query(
          `INSERT INTO indusmun_individuals (name, email, mobile, grade, city, state, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [r.student_name || '', r.email || '', r.mobile || '', r.grade || '', '', '', r.created_at]
        );
      }
    }
    console.log('Migration complete.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
migrate();
