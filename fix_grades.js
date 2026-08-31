const db = require('./database');
async function run() {
  const schoolRes = await db.query("SELECT id FROM schools WHERE name ILIKE '%PM SHRI K V LATEHAR%'");
  if (!schoolRes.rows.length) { console.log('School not found'); process.exit(1); }
  const schoolId = schoolRes.rows[0].id;
  console.log('School ID:', schoolId);

  const studentsRes = await db.query(
    'SELECT id, name, "studentId", "classLevel", grade FROM users WHERE school_id = $1 AND role = $2',
    [schoolId, 'student']
  );
  console.log('Total students:', studentsRes.rows.length);

  let fixed = 0;
  for (const s of studentsRes.rows) {
    const cl = (s.classLevel || '').trim();
    const cleaned = cl.replace(/[A-Za-z]+$/, '').trim();
    if (cleaned !== cl && cleaned !== '') {
      await db.query('UPDATE users SET "classLevel" = $1, grade = $1 WHERE id = $2', [cleaned, s.id]);
      console.log(`Fixed: ${s.name} | ${cl} -> ${cleaned}`);
      fixed++;
    }
  }
  console.log('Fixed', fixed, 'students');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
