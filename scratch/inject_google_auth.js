const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'backend', 'server.js');
let code = fs.readFileSync(serverJsPath, 'utf-8');

// Add OAuthClient import
if (!code.includes('OAuth2Client')) {
    code = code.replace("const jwt = require('jsonwebtoken');", "const jwt = require('jsonwebtoken');\nconst { OAuth2Client } = require('google-auth-library');\nconst googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);");
}

// Add Google Auth route
const googleRoute = `
// Google Native Login / Registration
app.post('/api/auth/google', async (req, res) => {
  const { credential, classLevel, grade } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;
    const avatar = payload.picture;

    // Check if user exists by email
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1 OR "studentId" = $1', [email]);
    
    let user;
    if (rows.length > 0) {
      user = rows[0];
      // Update avatar if missing
      if (!user.avatar && avatar) {
         await db.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar, user.id]);
         user.avatar = avatar;
      }
    } else {
      // New User: Auto Register
      // Default to Level 1 if no classLevel provided during registration
      const assignedClass = classLevel || 'Level 1';
      const assignedGrade = grade || 'KG';
      const studentId = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      let assignedAgentId = 'agent_3201kkb0dbh3fgravbhyjw4crve8'; // Level 1 agent
      
      // We don't have a password for Google users, so store a random hash
      const randomPassword = await bcrypt.hash(googleId + Date.now().toString(), 10);
      
      const insertQuery = \`INSERT INTO users (name, "studentId", password, "classLevel", grade, "assignedAgentId", email, avatar, auth_provider) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *\`;
      const result = await db.query(insertQuery, [name, studentId, randomPassword, assignedClass, assignedGrade, assignedAgentId, email, avatar, 'google']);
      user = result.rows[0];
      
      // Init token economy
      await db.query(
        \`INSERT INTO debate_users (user_id, username, class, grade, gforce_tokens, avatar_url) VALUES ($1, $2, $3, $4, $5, $6)\`,
        [studentId, name, assignedClass, assignedGrade, 100, avatar]
      );
    }
    
    const token = jwt.sign({ studentId: user.studentId, name: user.name, classLevel: user.classLevel }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      message: 'Google login successful',
      user: { 
        name: user.name, 
        studentId: user.studentId, 
        classLevel: user.classLevel, 
        assignedAgentId: user.assignedAgentId, 
        email: user.email, 
        avatar: user.avatar 
      },
      token
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
});
`;

if (!code.includes('/api/auth/google')) {
    code = code.replace("// Login\napp.post('/api/login', async (req, res) => {", googleRoute + "\n// Login\napp.post('/api/login', async (req, res) => {");
    fs.writeFileSync(serverJsPath, code);
    console.log("Added /api/auth/google route to server.js");
} else {
    console.log("Google auth route already exists.");
}
