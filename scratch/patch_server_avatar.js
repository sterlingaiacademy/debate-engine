const fs = require('fs');

let file = "../backend/server.js";
let content = fs.readFileSync(file, 'utf8');

// 1. Update /api/login to fetch avatar
content = content.replace(
  `app.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;
  
  try {
    const result = await db.query(\`SELECT * FROM users WHERE LOWER("studentId") = LOWER($1)\`, [studentId]);`,
  `app.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;
  
  try {
    // Include avatar in the fetch
    const result = await db.query(\`SELECT id, name, "studentId", password, "classLevel", "assignedAgentId", "createdAt", email, phone, auth_provider, avatar FROM users WHERE LOWER("studentId") = LOWER($1)\`, [studentId]);`
);

// 2. Fetch avatar in /api/user-by-email
content = content.replace(
  `const { rows } = await db.query(\`SELECT id, name, "studentId", "classLevel", "assignedAgentId" FROM users WHERE email = $1 LIMIT 1\`, [email]);`,
  `const { rows } = await db.query(\`SELECT id, name, "studentId", "classLevel", "assignedAgentId", avatar FROM users WHERE email = $1 LIMIT 1\`, [email]);`
);

// 3. Add POST /api/user/avatar endpoint
const avatarEndpoint = `
// Upload Avatar
app.post('/api/user/avatar', async (req, res) => {
  const { studentId, avatar } = req.body;
  
  if (!studentId || !avatar) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // Update Node auth DB
    await db.query(\`UPDATE users SET avatar = $1 WHERE "studentId" = $2\`, [avatar, studentId]);
    
    // Update Python leaderboard DB synchronously
    await db.query(\`UPDATE debate_users SET avatar_url = $1 WHERE user_id = $2\`, [avatar, studentId]);
    
    res.status(200).json({ success: true, avatar });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
`;

// Insert the endpoint right before `// Login via Subabase token extraction`
content = content.replace(
  `// Google Login via external Supabase session mapping`,
  avatarEndpoint + `\n// Google Login via external Supabase session mapping`
);

fs.writeFileSync(file, content);
console.log('server.js patched!');
