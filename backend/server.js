require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper for IST Date (Resets at 12:00 AM IST)
function getISTDateString() {
  const now = new Date();
  // IST is UTC + 5 hours and 20 minutes
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  return istDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// Users
app.post('/api/register', async (req, res) => {
  const { name, studentId, password, classLevel, grade, email, phone, authProvider, referralCode } = req.body;
  if (!name || !studentId || !password || !classLevel) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Assign agent ID based on class
  let assignedAgentId = '';
  if (classLevel === 'Level 1' || classLevel === 'Class 1-3') {
    assignedAgentId = 'agent_3201kkb0dbh3fgravbhyjw4crve8';
  } else if (classLevel === 'Level 2') {
    assignedAgentId = 'agent_1201kkvd9ke5fd180zjz6ckrameq';
  } else if (classLevel === 'Level 4' || classLevel === 'Class 10-12') {
    // Level 4 uses senior debate agent for the standard debate tile
    assignedAgentId = 'agent_1201kkdnn526eebs4fwb822fzgs3';
  } else if (classLevel === 'Level 5') {
    assignedAgentId = 'agent_3801km7h68pbfn1t8m52ny028t6w';
  } else if (['Level 3'].includes(classLevel)) {
    assignedAgentId = 'agent_5601kkx9fa95e9eswcm93gdmp18h';
  } else {
    return res.status(400).json({ error: 'Invalid class level' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, "studentId", password, "classLevel", grade, "assignedAgentId", email, phone, auth_provider) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    
    try {
      await db.query(query, [name, studentId, hashedPassword, classLevel, grade || '', assignedAgentId, email || null, phone || null, authProvider || null]);
    } catch (err) {
      if (err.code === '23505' || /UNIQUE constraint failed/i.test(err.message)) {
        return res.status(400).json({ error: 'Student ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    
    // --- REFERRAL & GFORCE TOKEN ECONOMY ---
    let startupTokens = 100; // Base signup bonus
    
    // Validate referral code (referral code = another user's username)
    if (referralCode && referralCode.trim() !== '') {
      const referrerCheck = await db.query(`SELECT "studentId" FROM users WHERE LOWER("studentId") = LOWER($1)`, [referralCode.trim()]);
      if (referrerCheck.rows.length > 0) {
        startupTokens = 150; // Referred user bonus
        // Grant referrer +200 bounty tokens
        await db.query(`UPDATE debate_users SET gforce_tokens = gforce_tokens + 200 WHERE user_id = $1`, [referrerCheck.rows[0].studentId]);
      }
    }
    
    // Initialize debate_users record for leaderboard with startup tokens
    await db.query(
      `INSERT INTO debate_users (user_id, username, class, grade, gforce_tokens) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET gforce_tokens = debate_users.gforce_tokens + $5, grade = $4`,
      [studentId, name, classLevel, grade || '', startupTokens]
    );
    
    res.status(201).json({ 
      message: 'Account created successfully', 
      user: { name, studentId, classLevel, assignedAgentId, email, phone } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});
app.get('/api/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { rows } = await db.query(`SELECT 1 FROM users WHERE LOWER("studentId") = LOWER($1) LIMIT 1`, [username]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user-by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { rows } = await db.query(`SELECT id, name, "studentId", "classLevel", "assignedAgentId", avatar, grade FROM users WHERE email = $1`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Avatar
app.post('/api/user/avatar', async (req, res) => {
  const { studentId, avatar } = req.body;
  
  if (!studentId || !avatar) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    await db.query(`UPDATE users SET avatar = $1 WHERE "studentId" = $2`, [avatar, studentId]);
    await db.query(`UPDATE debate_users SET avatar_url = $1 WHERE user_id = $2`, [avatar, studentId]);
    res.status(200).json({ success: true, avatar });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;
  
  try {
    const result = await db.query(`SELECT * FROM users WHERE LOWER("studentId") = LOWER($1)`, [studentId]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    // Remove password from response
    delete user.password;
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Time Limits
app.get('/api/time-limits/:studentId', async (req, res) => {
  const studentId = req.params.studentId.replace(/"/g, '');
  try {
    const result = await db.query(`SELECT * FROM users WHERE "studentId" = $1`, [studentId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    
    let user = result.rows[0];
    const currentDateIST = getISTDateString();
    
    if (user.lastDebateDate !== currentDateIST) {
      // Reset times for the new day
      await db.query(`UPDATE users SET "lastDebateDate" = $1, "dailyRankedTime" = 0, "dailyPersonaTime" = 0 WHERE "studentId" = $2`, [currentDateIST, studentId]);
      user.lastDebateDate = currentDateIST;
      user.dailyRankedTime = 0;
      user.dailyPersonaTime = 0;
    }
    
    // Calculate remaining limits (600 seconds = 10 minutes)
    // The user requested a single shared 10-minute pool across all levels for both Ranked and Persona
    const LIMIT = 600;
    const used = (user.dailyRankedTime || 0) + (user.dailyPersonaTime || 0);
    const sharedRemaining = Math.max(0, LIMIT - used);
    
    let remainingRanked = sharedRemaining;
    let remainingPersona = sharedRemaining;
    
    res.json({
      remainingRanked,
      remainingPersona,
      dailyRankedTime: user.dailyRankedTime || 0,
      dailyPersonaTime: user.dailyPersonaTime || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/time-sync', async (req, res) => {
  const { studentId, usedSeconds, isPersona } = req.body;
  if (!studentId || !usedSeconds) return res.status(400).json({ error: 'Missing required params' });

  try {
    const result = await db.query(`SELECT "lastDebateDate" FROM users WHERE "studentId" = $1`, [studentId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    
    const currentDateIST = getISTDateString();
    const userLastDate = result.rows[0].lastDebateDate;

    if (userLastDate !== currentDateIST) {
      if (isPersona) {
        await db.query(`UPDATE users SET "lastDebateDate" = $1, "dailyRankedTime" = 0, "dailyPersonaTime" = $2 WHERE "studentId" = $3`, [currentDateIST, Math.round(usedSeconds), studentId]);
      } else {
        await db.query(`UPDATE users SET "lastDebateDate" = $1, "dailyRankedTime" = $2, "dailyPersonaTime" = 0 WHERE "studentId" = $3`, [currentDateIST, Math.round(usedSeconds), studentId]);
      }
    } else {
      if (isPersona) {
        await db.query(`UPDATE users SET "dailyPersonaTime" = coalesce("dailyPersonaTime", 0) + $1 WHERE "studentId" = $2`, [Math.round(usedSeconds), studentId]);
      } else {
        await db.query(`UPDATE users SET "dailyRankedTime" = coalesce("dailyRankedTime", 0) + $1 WHERE "studentId" = $2`, [Math.round(usedSeconds), studentId]);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Analytics (Routed via Python Profile script)
app.get('/api/analytics/:studentId', async (req, res) => {
  const scriptPath = path.join(__dirname, 'api_profile.py');
  const studentId = req.params.studentId.replace(/"/g, '');
  
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const data = await new Promise((resolve, reject) => {
        exec(`python3 "${scriptPath}" "${studentId}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Python Analytics attempt ${attempt} exec error:`, error);
          }
          try {
            const parsed = JSON.parse(stdout);
            if (parsed.error && parsed.error.includes('10054')) {
              reject(new Error('Connection reset by peer (10054)'));
              return;
            }
            resolve(parsed);
          } catch (e) {
            reject(new Error('Parse error or invalid output'));
          }
        });
      });

      if (data.error) {
         // It's a valid JSON response but contains a logical error (e.g. User not found)
         return res.json({ total_debates: 0, avg_score: 0, total_words_spoken: 0, gforce_tokens: 0, badges: [], badge_details: [] });
      }
      return res.json(data); // Success!
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error('Python Analytics route failed after retries:', err.message);
        return res.json({ total_debates: 0, avg_score: 0, total_words_spoken: 0, gforce_tokens: 0, badges: [], badge_details: [] });
      }
      // Wait a bit before retrying
      await new Promise(r => setTimeout(r, 500));
    }
  }
});

// Leaderboard (Routed via Python)
app.get('/api/leaderboard', (req, res) => {
  const level = req.query.level || '';
  const timeframe = req.query.timeframe || '';
  const category = req.query.category || '';
  const school = req.query.school || '';
  const limit = req.query.limit || '50';
  const offset = req.query.offset || '0';
  const scriptPath = path.join(__dirname, 'api_leaderboard.py');
  
  // Pass params as JSON to avoid argument quoting issues
  const paramsJson = JSON.stringify({ level, timeframe, category, school, limit: parseInt(limit), offset: parseInt(offset) });
  const escapedJson = paramsJson.replace(/"/g, '\\"');
  
  exec(`python3 "${scriptPath}" "${escapedJson}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Python leaderboard error:', error);
      console.error('stderr:', stderr);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
    
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (parseError) {
      console.error('JSON parse error from python leaderboard:', parseError);
      console.error('Raw stdout:', stdout);
      res.status(500).json({ error: 'Invalid output from python leaderboard service' });
    }
  });
});


// Helper: Fetch ElevenLabs post-call conversation data
async function fetchElevenLabsConversationData(conversationId) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || !conversationId || apiKey === 'your_elevenlabs_api_key_here') {
    return null;
  }
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.warn('ElevenLabs API response:', response.status, await response.text());
      return null;
    }
    const data = await response.json();
    console.log('ElevenLabs conversation data:', JSON.stringify(data.analysis || data.metadata, null, 2));
    // Extract collected data variables from the analysis section
    const analysis = data.analysis || {};
    const dataVars = data.metadata?.data_collection_results || analysis.data_collection_results || {};
    return {
      conversationId,
      status: data.status,
      analysis,
      dataVars,
    };
  } catch (err) {
    console.error('Error fetching ElevenLabs conversation:', err.message);
    return null;
  }
}

// AI Judge Evaluation
app.post('/api/evaluate', async (req, res) => {
  const { transcript, topic, isJunior, conversationId, studentId, name, classLevel } = req.body;

  if (!transcript || !Array.isArray(transcript)) {
    return res.status(400).json({ error: 'transcript array is required' });
  }

  if (isJunior) {
    return res.json({
      skipped: true,
      overall_score: 10.0,
      grade: "N/A",
      strengths: ["Great effort!", "Keep practicing your speaking skills."],
      weaknesses: [],
      areas_to_improve: ["Speak a bit louder next time."],
      categories: [],
      fallacies_detected: [],
      persuasion_techniques: [],
      disfluency_report: { total: 0 },
      key_moments: [],
      ai_challenges_summary: [],
      stats: { total_turns: transcript.length, total_words: transcript.reduce((acc, m) => acc + m.text.split(' ').length, 0) }
    });
  }

  try {
    // Step 1: Convert transcript to ElevenLabs raw text format
    let rawText = '';
    for (const msg of transcript) {
      rawText += `\n${msg.text}\n`;
      rawText += msg.role === 'user' ? 'ASR\n' : 'LLM\n';
    }

    // Step 2: Write to tmp file
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const filename = path.join(tmpDir, `transcript_${Date.now()}.txt`);
    fs.writeFileSync(filename, rawText.trim());

    // Step 3: Call Python script
    const scriptPath = path.join(__dirname, 'api_evaluate.py');
    const sId = studentId ? String(studentId).replace(/"/g, '') : 'unknown';
    const sName = name ? String(name).replace(/"/g, '') : 'Anon';
    const sClass = classLevel ? String(classLevel).replace(/"/g, '') : 'unknown';
    const sTopic = topic ? String(topic).replace(/"/g, '') : 'Unknown Motion';
    
    // Pass args securely. Format: py script.py transcript.txt studentId name classLevel topic
    exec(`python3 "${scriptPath}" "${filename}" "${sId}" "${sName}" "${sClass}" "${sTopic}"`, (error, stdout, stderr) => {
      // Clean up file
      try { fs.unlinkSync(filename); } catch (e) {}

      if (error) {
        console.error('Python execute error:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ error: 'Failed to run debate judge' });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        console.error('JSON parse error from python output:', parseError);
        console.error('Raw stdout:', stdout);
        res.status(500).json({ error: 'Invalid output from judge' });
      }
    });
  } catch (err) {
    console.error('Judge mapping error:', err);
    res.status(500).json({ error: 'Server error during evaluation' });
  }
});

// ─── ARGUMENT BANK ───────────────────────────────────────────────────
// GET all saved arguments for a user
app.get('/api/argument-bank/:studentId', async (req, res) => {
  const studentId = req.params.studentId.replace(/"/g, '');
  try {
    const { rows } = await db.query(
      `SELECT * FROM argument_bank WHERE user_id = $1 ORDER BY created_at DESC`,
      [studentId]
    );
    res.json({ arguments: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save a new argument
app.post('/api/argument-bank', async (req, res) => {
  const { studentId, motion, point, evidence, explain, link, score } = req.body;
  if (!studentId || !point) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const { rows } = await db.query(
      `INSERT INTO argument_bank (user_id, motion, point, evidence, explain, link, score)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [studentId, motion || '', point, evidence || '', explain || '', link || '', score || 0]
    );
    res.status(201).json({ argument: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a saved argument
app.delete('/api/argument-bank/:id', async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  try {
    await db.query(
      `DELETE FROM argument_bank WHERE id = $1 AND user_id = $2`,
      [id, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DAILY CHALLENGE ─────────────────────────────────────────────────
// GET daily challenge status for a user
app.get('/api/daily-challenge/:studentId', async (req, res) => {
  const studentId = req.params.studentId.replace(/"/g, '');
  try {
    const { rows } = await db.query(
      `SELECT "dailyChallengeCompleted" FROM users WHERE "studentId" = $1`,
      [studentId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const today = getISTDateString();
    const completed = rows[0].dailyChallengeCompleted === today;
    res.json({ completed, today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark daily challenge as complete — awards 2× tokens in debate_users
app.post('/api/daily-challenge/complete', async (req, res) => {
  const { studentId, tokensEarned } = req.body;
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  try {
    const today = getISTDateString();
    // Check not already completed today
    const check = await db.query(
      `SELECT "dailyChallengeCompleted" FROM users WHERE "studentId" = $1`,
      [studentId]
    );
    if (!check.rows.length) return res.status(404).json({ error: 'User not found' });
    if (check.rows[0].dailyChallengeCompleted === today) {
      return res.status(409).json({ error: 'Already completed today' });
    }
    // Mark completed
    await db.query(
      `UPDATE users SET "dailyChallengeCompleted" = $1 WHERE "studentId" = $2`,
      [today, studentId]
    );
    // Award bonus tokens (2× — caller sends the multiplied amount)
    if (tokensEarned && tokensEarned > 0) {
      await db.query(
        `UPDATE debate_users SET gforce_tokens = gforce_tokens + $1 WHERE user_id = $2`,
        [Math.round(tokensEarned), studentId]
      );
    }
    res.json({ success: true, bonusAwarded: tokensEarned || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST claim vocab trainer tokens (+75 per deck — server-side idempotency via argument_bank tricks)
app.post('/api/claim-vocab-tokens', async (req, res) => {
  const { studentId, tokensEarned } = req.body;
  if (!studentId || !tokensEarned) return res.status(400).json({ error: 'Missing params' });
  try {
    await db.query(
      `UPDATE debate_users SET gforce_tokens = gforce_tokens + $1 WHERE user_id = $2`,
      [Math.round(tokensEarned), studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if running locally vs Vercel Serverless
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

