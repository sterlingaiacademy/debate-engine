const db = require('./database');

async function clearSchools() {
  try {
    console.log('Connecting to database...');
    const result = await db.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE');
    console.log('Successfully cleared all schools from the database.');
  } catch (err) {
    console.error('Error clearing schools:', err);
  } finally {
    process.exit(0);
  }
}

clearSchools();
