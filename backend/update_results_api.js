const fs = require('fs');
const path = 'backend/server_prod.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Coordinator Dashboard API
const coordinatorOldQuery = `
      // Get quiz results
      let quizResults = [];
      try {
        await ensureQuizTable();
        const quizRes = await db.query(
          \`SELECT quiz_name, subject, score, total, percentage, attempted_at FROM olympiad_quiz_results WHERE user_email=$1 ORDER BY attempted_at DESC\`,
          [student.contact_email || student.email || '']
        );
        quizResults = quizRes.rows;
      } catch(e) { /* quiz table may not exist yet */ }
`;

const coordinatorNewQuery = `
      // Get quiz results
      let quizResults = [];
      try {
        await ensureQuizTable();
        const quizRes = await db.query(
          \`
            SELECT quiz_name, subject, score, total, percentage, attempted_at 
            FROM olympiad_quiz_results WHERE user_email=$1
            UNION ALL
            SELECT quiz_name, subject, score, total, percentage, attempted_at 
            FROM olympiad_mock_results WHERE user_email=$1
            ORDER BY attempted_at DESC
          \`,
          [student.contact_email || student.email || '']
        );
        quizResults = quizRes.rows;
      } catch(e) { /* tables may not exist yet */ }
`;
if (content.includes("SELECT quiz_name, subject, score, total, percentage, attempted_at FROM olympiad_quiz_results WHERE user_email=$1 ORDER BY attempted_at DESC")) {
  content = content.replace("SELECT quiz_name, subject, score, total, percentage, attempted_at FROM olympiad_quiz_results WHERE user_email=$1 ORDER BY attempted_at DESC", 
    `SELECT quiz_name, subject, score, total, percentage, attempted_at FROM olympiad_quiz_results WHERE user_email=$1
     UNION ALL
     SELECT quiz_name, subject, score, total, percentage, attempted_at FROM olympiad_mock_results WHERE user_email=$1
     ORDER BY attempted_at DESC`);
}

// 2. Update Admin Quiz Results API
const adminOldQuery = `
      SELECT qr.id, qr.user_email, qr.quiz_name, qr.subject, qr.grade, qr.score, qr.total, qr.percentage, qr.attempted_at,
             u.name as student_name, u."classLevel" as grade_level, u.city, u.state, u.school_id
      FROM olympiad_quiz_results qr
      LEFT JOIN users u ON u.email = qr.user_email
      ORDER BY qr.attempted_at DESC
`;

const adminNewQuery = `
      SELECT * FROM (
        SELECT qr.id, qr.user_email, qr.quiz_name, qr.subject, qr.grade, qr.score, qr.total, qr.percentage, qr.attempted_at,
               u.name as student_name, u."classLevel" as grade_level, u.city, u.state, u.school_id
        FROM olympiad_quiz_results qr
        LEFT JOIN users u ON u.email = qr.user_email
        UNION ALL
        SELECT mr.id, mr.user_email, mr.quiz_name, mr.subject, mr.grade, mr.score, mr.total, mr.percentage, mr.attempted_at,
               u.name as student_name, u."classLevel" as grade_level, u.city, u.state, u.school_id
        FROM olympiad_mock_results mr
        LEFT JOIN users u ON u.email = mr.user_email
      ) combined
      ORDER BY attempted_at DESC
`;

if (content.includes("FROM olympiad_quiz_results qr") && !content.includes("UNION ALL")) {
  content = content.replace(adminOldQuery, adminNewQuery);
}

fs.writeFileSync(path, content);
console.log('Results APIs updated with UNION ALL.');
