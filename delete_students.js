const db = require('./database');
async function run() {
  const schoolRes = await db.query("SELECT id, name FROM schools WHERE name ILIKE '%PM SHRI K V LATEHAR%'");
  if (!schoolRes.rows.length) { console.log('School not found'); process.exit(1); }
  const schoolId = schoolRes.rows[0].id;
  console.log('School:', schoolRes.rows[0].name, '| ID:', schoolId);

  // Count first
  const countRes = await db.query('SELECT COUNT(*) FROM users WHERE school_id = $1 AND role = $2', [schoolId, 'student']);
  console.log('Students to delete:', countRes.rows[0].count);

  // Delete from debate_users first (FK references)
  const studentsRes = await db.query('SELECT "studentId" FROM users WHERE school_id = $1 AND role = $2', [schoolId, 'student']);
  const ids = studentsRes.rows.map(r => r.studentId);

  if (ids.length > 0) {
    await db.query('DELETE FROM debate_users WHERE user_id = ANY($1)', [ids]);
    console.log('Deleted debate_users records for', ids.length, 'students');
  }

  // Delete from users
  const del = await db.query('DELETE FROM users WHERE school_id = $1 AND role = $2', [schoolId, 'student']);
  console.log('Deleted', del.rowCount, 'student accounts from users table');

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
