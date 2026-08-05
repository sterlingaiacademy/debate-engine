const db = require('./database');
async function run() {
  try {
    const res1 = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('studentId', 'school_id');
    `);
    console.log('users table:', res1.rows);
    
    const res2 = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'debate_users' AND column_name = 'user_id';
    `);
    console.log('debate_users table:', res2.rows);

    const res3 = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'schools' AND column_name = 'id';
    `);
    console.log('schools table:', res3.rows);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
