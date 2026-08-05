const fs = require('fs');
const file = 'backend/server.js';
let content = fs.readFileSync(file, 'utf8');

const newRoutes = `
// SECTION: English Session Registrations

app.post('/api/english-session/register', async (req, res) => {
  const { userId, studentName, parentName, email, mobile, schoolName, grade } = req.body;
  try {
    await db.query(\`
      CREATE TABLE IF NOT EXISTS english_session_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255),
        parent_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(50),
        school_name VARCHAR(255),
        grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    const result = await db.query(
      \`INSERT INTO english_session_registrations (user_id, student_name, parent_name, email, mobile, school_name, grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id\`,
      [userId || null, studentName, parentName, email, mobile, schoolName, grade]
    );
    res.json({ success: true, registrationId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/english-session/registrations', authenticateAdmin, async (req, res) => {
  try {
    await db.query(\`
      CREATE TABLE IF NOT EXISTS english_session_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255),
        parent_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(50),
        school_name VARCHAR(255),
        grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    
    const result = await db.query('SELECT * FROM english_session_registrations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// SECTION: Freedom Quiz Registrations

app.post('/api/freedom-quiz/register', async (req, res) => {
  const { userId, fullName, email, mobile, city, age } = req.body;
  try {
    await db.query(\`
      CREATE TABLE IF NOT EXISTS freedom_quiz_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        full_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(50),
        city VARCHAR(255),
        age VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    const result = await db.query(
      \`INSERT INTO freedom_quiz_registrations (user_id, full_name, email, mobile, city, age)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id\`,
      [userId || null, fullName, email, mobile, city, age]
    );
    res.json({ success: true, registrationId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/freedom-quiz/registrations', authenticateAdmin, async (req, res) => {
  try {
    await db.query(\`
      CREATE TABLE IF NOT EXISTS freedom_quiz_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        full_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(50),
        city VARCHAR(255),
        age VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    const result = await db.query('SELECT * FROM freedom_quiz_registrations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

`;

content = content.replace('const PORT = process.env.PORT || 5000;', newRoutes + 'const PORT = process.env.PORT || 5000;');
fs.writeFileSync(file, content);
