const fs = require('fs');

let file = "backend/server.js";
let content = fs.readFileSync(file, 'utf8');

// Update destructuring
content = content.replace(
  `const { name, studentId, password, classLevel, email, phone, authProvider } = req.body;`,
  `const { name, studentId, password, classLevel, email, phone, authProvider, referralCode } = req.body;`
);

// Update logic
const insertLogic = `
    // Initialize analytics for new user
    await db.query(\`INSERT INTO analytics ("studentId") VALUES ($1)\`, [studentId]);

    // Referral System Logic
    let startingTokens = 100;
    
    if (referralCode && referralCode.trim() !== '') {
      try {
        // Validate referral code (must exist as a studentId and not be their own)
        const refUser = await db.query(\`SELECT "studentId" FROM users WHERE LOWER("studentId") = LOWER($1)\`, [referralCode.trim()]);
        
        if (refUser.rows.length > 0 && refUser.rows[0].studentId.toLowerCase() !== studentId.toLowerCase()) {
          const inviterId = refUser.rows[0].studentId;
          
          // Boost new user's tokens!
          startingTokens = 150;

          // Reward the Referrer with 200 Tokens via UPSERT (in case they don't have a row yet either)
          await db.query(\`
            INSERT INTO debate_users (user_id, username, gforce_tokens) 
            VALUES ($1, $1, 200) 
            ON CONFLICT (user_id) 
            DO UPDATE SET gforce_tokens = debate_users.gforce_tokens + 200;
          \`, [inviterId]);
          
        }
      } catch (err) {
        console.error('Referral Processing Error:', err);
      }
    }

    // Initialize new user in the debate_users table with their starting tokens
    try {
       await db.query(\`
         INSERT INTO debate_users (user_id, username, class, gforce_tokens) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (user_id) 
         DO UPDATE SET gforce_tokens = $4;
       \`, [studentId, name, classLevel, startingTokens]);
    } catch (err) {
       console.error('Debate users init error:', err);
    }
`;

content = content.replace(
  `// Initialize analytics for new user\n    await db.query(\`INSERT INTO analytics ("studentId") VALUES ($1)\`, [studentId]);`,
  insertLogic.trim()
);

fs.writeFileSync(file, content);
console.log('server.js rewritten!');
