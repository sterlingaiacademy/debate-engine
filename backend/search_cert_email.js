const db = require('./database');

async function run() {
  try {
    // 1. Get all tables
    const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables:", res.rows.map(r => r.table_name).join(', '));
    
    // 2. We'll search certificates table if it exists, or just query any table with an email column
    for (let row of res.rows) {
      const tableName = row.table_name;
      // Check if table has an email column
      const colRes = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND (column_name ILIKE '%email%' OR column_name ILIKE '%certificate%')`, [tableName]);
      if (colRes.rows.length > 0) {
        console.log(`Table ${tableName} has potential columns: ${colRes.rows.map(r => r.column_name).join(', ')}`);
        for (let col of colRes.rows) {
            try {
                const searchRes = await db.query(`SELECT * FROM "${tableName}" WHERE "${col.column_name}" = $1 OR "${col.column_name}" LIKE $2`, ['aaryandewade@gmail.com', '%aaryandewade%']);
                if (searchRes.rows.length > 0) {
                    console.log(`FOUND in ${tableName}.${col.column_name}:`, searchRes.rows);
                }
            } catch(e) {
                // Ignore type cast errors
            }
        }
      }
    }

    // Also search specifically in users/registrations
    console.log("Searching users table...");
    try {
        const u = await db.query(`SELECT * FROM users WHERE email = $1`, ['aaryandewade@gmail.com']);
        console.log("Users:", u.rows);
    } catch(e) {}

  } catch (e) {
    console.error("Error:", e);
  } finally {
      process.exit(0);
  }
}
run();
