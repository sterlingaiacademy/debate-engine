const db = require('./backend/database.js');
async function run() {
  try {
    const res = await db.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%indus%';
    `);
    console.log(res.rows);
  } catch (err) { console.error(err); }
  process.exit(0);
}
run();
