const { Pool } = require('pg');
const pool = new Pool({
  user: 'graceandforce_user',
  password: 'Pck/aawJlsLFZxWu3CG7aw==',
  host: 'localhost',
  port: 5432,
  database: 'graceandforce_db'
});

async function fix() {
  try {
    // First find the school
    const schoolRes = await pool.query(
      `SELECT id, name FROM schools WHERE name ILIKE '%BEST PUBLIC%'`
    );
    if (schoolRes.rows.length === 0) {
      console.log('School not found!');
      process.exit(1);
    }
    const school = schoolRes.rows[0];
    console.log('Found school:', school);

    // List all students in that school
    const studentsRes = await pool.query(
      `SELECT id, "studentId", name, email, "classLevel" FROM users WHERE school_id = $1 AND role = 'student' ORDER BY id`,
      [school.id]
    );
    console.log('Total students found:', studentsRes.rows.length);
    console.log('Students:', JSON.stringify(studentsRes.rows, null, 2));

    if (studentsRes.rows.length === 0) {
      console.log('No students found for this school.');
      process.exit(0);
    }

    // DELETE mode: only runs if LIST looks correct
    const studentIds = studentsRes.rows.map(s => s.id);

    // Delete related speech sessions first
    const delSpeech = await pool.query(
      `DELETE FROM speech_analysis_sessions WHERE student_id = ANY($1::text[])`,
      [studentIds.map(String)]
    );
    console.log('Deleted speech sessions:', delSpeech.rowCount);

    // Now delete the user accounts
    const delUsers = await pool.query(
      `DELETE FROM users WHERE school_id = $1 AND role = 'student' RETURNING id, "studentId", name`,
      [school.id]
    );
    console.log('Deleted students:', delUsers.rowCount);
    console.log('Deleted accounts:', delUsers.rows.map(r => r.studentId));

    console.log('Done!');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
fix();
