const db = require('./database');

async function run() {
  try {
    const res = await db.query(
      `SELECT total_score as final_score, created_at FROM olympiad_exam_submissions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [123] // Passing integer to a TEXT column
    );
    console.log("Success:", res.rows);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
