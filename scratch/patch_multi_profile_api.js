const fs = require('fs');

let file = "../backend/server.js";
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `app.get('/api/user-by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { rows } = await db.query(\`SELECT id, name, "studentId", "classLevel", "assignedAgentId", avatar FROM users WHERE email = $1 LIMIT 1\`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`,
  `app.get('/api/user-by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { rows } = await db.query(\`SELECT id, name, "studentId", "classLevel", "assignedAgentId", avatar FROM users WHERE email = $1\`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`
);

fs.writeFileSync(file, content);
console.log('server.js patched for multi-profiles!');
