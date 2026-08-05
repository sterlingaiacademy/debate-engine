const db = require('./database');

async function run() {
  try {
    const res = await db.query('SELECT * FROM schools');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
