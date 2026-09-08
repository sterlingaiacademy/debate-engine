const fs = require('fs');
const path = 'backend/server_prod.js';
let content = fs.readFileSync(path, 'utf8');

const existingMarker = "app.post('/api/olympiad/quiz/submit', async (req, res) => {";
if (content.includes(existingMarker) && !content.includes('/api/olympiad/mock/:subject/:grade')) {
  
  const mockEndpoints = `
// ==========================================
// THINKQUEST OLYMPIAD – MOCK TEST
// ==========================================
const subjectMockQuestions = {
  english: require('./data/english_mock.json'),
};

async function ensureMockTable() {
  await db.query(\`
    CREATE TABLE IF NOT EXISTS olympiad_mock_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      user_email VARCHAR(255),
      quiz_name VARCHAR(255),
      subject VARCHAR(100),
      grade INTEGER,
      score INTEGER,
      total INTEGER,
      percentage NUMERIC(5,2),
      answers JSONB,
      attempted_at TIMESTAMP DEFAULT NOW()
    )
  \`);
}
ensureMockTable().catch(console.error);

app.get('/api/olympiad/mock/:subject/:grade', async (req, res) => {
  try {
    const grade = parseInt(req.params.grade);
    const subject = req.params.subject.toLowerCase();
    const bank = subjectMockQuestions[subject];
    if (!bank) return res.status(404).json({ error: 'Subject not found for mock test' });
    const raw = bank[String(grade)];
    if (!raw) return res.status(404).json({ error: 'No mock questions for this grade' });
    
    const shuffledPassages = raw.sort(() => Math.random() - 0.5).slice(0, 3);
    
    const questions = [];
    const letters = ['A', 'B', 'C', 'D'];
    
    shuffledPassages.forEach(p => {
      p.questions.forEach(q => {
        const originalOptions = q.options.slice();
        const originalCorrectText = originalOptions.find(o => o.letter === q.correct)?.text;
        const shuffled = originalOptions.map(o => o.text).sort(() => Math.random() - 0.5);
        const newOptions = shuffled.map((text, idx) => ({ letter: letters[idx], text }));
        const newCorrectLetter = newOptions.find(o => o.text === originalCorrectText)?.letter || q.correct;
        
        questions.push({
          id: questions.length,
          passage: p.passage,
          question: q.question,
          options: newOptions,
          correct: newCorrectLetter
        });
      });
    });

    const label = SUBJECT_LABELS[subject] || subject;
    res.json({ quiz_name: \`\${label} Mock Test – Grade \${grade}\`, subject: label, grade, total: questions.length, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/olympiad/mock/status/:subject/:grade', async (req, res) => {
  try {
    const { email } = req.query;
    const grade = parseInt(req.params.grade);
    const subject = req.params.subject.toLowerCase();
    const label = SUBJECT_LABELS[subject] || subject;
    const quiz_name = \`\${label} Mock Test – Grade \${grade}\`;

    const existing = await db.query(
      'SELECT score, total, percentage, answers FROM olympiad_mock_results WHERE user_email = $1 AND quiz_name = $2 ORDER BY attempted_at DESC LIMIT 1',
      [email, quiz_name]
    );

    if (existing.rows.length > 0) {
      res.json({ attempted: true, result: existing.rows[0] });
    } else {
      res.json({ attempted: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/olympiad/mock/submit', async (req, res) => {
  try {
    const { user_email, subject, grade, quiz_name, score, total, answers } = req.body;
    let percentage = 0;
    if (total > 0) percentage = (score / total) * 100;
    
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [user_email]);
    const user_id = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    await db.query(
      \`INSERT INTO olympiad_mock_results (user_id, user_email, quiz_name, subject, grade, score, total, percentage, answers) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)\`,
      [user_id, user_email, quiz_name, subject, grade, score, total, percentage, JSON.stringify(answers)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

  const lines = content.split('\n');
  const targetIndex = lines.findIndex(l => l.includes("app.post('/api/olympiad/quiz/submit', async (req, res) => {"));
  
  if (targetIndex !== -1) {
    lines.splice(targetIndex, 0, mockEndpoints);
    fs.writeFileSync(path, lines.join('\n'));
    console.log("Mock API endpoints inserted successfully.");
  } else {
    console.log("Could not find insertion point.");
  }
} else {
  console.log("Mock API already exists or marker not found.");
}
