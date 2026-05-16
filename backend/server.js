require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'grace_and_force_super_secret_key_2026';
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper for IST Date (Resets at 12:00 AM IST)
function getISTDateString() {
  const now = new Date();
  // IST is UTC + 5 hours and 30 minutes
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
    assignedAgentId = 'agent_5301krgg7x98ewm84w8aj2976zqc';
  } else if (classLevel === 'Level 2') {
    assignedAgentId = 'agent_5201krghdxhqfhtbf4yj22406vyv';
  } else if (classLevel === 'Level 4' || classLevel === 'Class 10-12') {
    // Level 4 uses senior debate agent for the standard debate tile
    assignedAgentId = 'agent_9701krh2p85sfs9vyp7e6e1cqbwc';
  } else if (classLevel === 'Level 5') {
    assignedAgentId = 'agent_7801krh4jfmdf9asxz901aeac0gt';
  } else if (['Level 3'].includes(classLevel)) {
    assignedAgentId = 'agent_0601krh0f23df5br0dahys0kdsbr';
  } else {
    return res.status(400).json({ error: 'Invalid class level' });
  }

  try {
    // Check if email already exists to prevent duplicate accounts via Google Auth
    if (email) {
      const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }
    }

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
        // Bug #1 fix: use bracket notation for quoted camelCase PostgreSQL column
        const referrerId = referrerCheck.rows[0]['studentId'];
        if (referrerId) {
          await db.query(`UPDATE debate_users SET gforce_tokens = gforce_tokens + 200 WHERE user_id = $1`, [referrerId]);
        }
      }
    }
    
    // Initialize debate_users record for leaderboard with startup tokens
    await db.query(
      `INSERT INTO debate_users (user_id, username, class, grade, gforce_tokens) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET gforce_tokens = debate_users.gforce_tokens + $5, grade = $4`,
      [studentId, name, classLevel, grade || '', startupTokens]
    );
    
    const token = jwt.sign({ studentId, name, classLevel }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({ 
      message: 'Account created successfully', 
      user: { name, studentId, classLevel, assignedAgentId, email, phone, grade: grade || '' },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Google Native Login / Registration
app.post('/api/auth/google', async (req, res) => {
  const { credential, access_token, classLevel, grade, referralCode } = req.body;
  if (!credential && !access_token) {
    return res.status(400).json({ error: 'Missing Google credential or access token' });
  }

  try {
    let email, name, googleId, avatar;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      avatar = payload.picture;
    } else if (access_token) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch user info from Google');
      const payload = await response.json();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      avatar = payload.picture;
    }

    // Check if user exists by email
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    let user;
    if (rows.length > 0) {
      user = rows[0];
      // Update avatar if missing
      if (!user.avatar && avatar) {
         await db.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar, user.id]);
         user.avatar = avatar;
      }
    } else {
      // User not found in database. Do not auto-register, return 404 so the frontend 
      // can prompt the user to complete their profile (choose grade, username, etc.)
      return res.status(404).json({ error: 'User not registered', profile: { email, name, avatar } });
    }

    const token = jwt.sign({ studentId: user.studentId, name: user.name, classLevel: user.classLevel }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      success: true,
      message: 'Google login successful',
      user: { 
        name: user.name, 
        studentId: user.studentId, 
        classLevel: user.classLevel,
        grade: user.grade || '',
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

// Login
app.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE LOWER("studentId") = LOWER($1) OR LOWER("email") = LOWER($1)', 
      [studentId]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwt.sign({ studentId: user.studentId, name: user.name, classLevel: user.classLevel }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      message: 'Logged in successfully',
      user: { 
        name: user.name, 
        studentId: user.studentId, 
        classLevel: user.classLevel,
        grade: user.grade || '',
        assignedAgentId: user.assignedAgentId, 
        email: user.email, 
        phone: user.phone 
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Enrollment request
app.post('/api/enroll', async (req, res) => {
  const { studentId, studentName, grade, parentPhone, school } = req.body;
  if (!parentPhone || !school) {
    return res.status(400).json({ error: 'Parent phone and school are required' });
  }
  try {
    await db.query(
      `CREATE TABLE IF NOT EXISTS enrollment_requests (
        id SERIAL PRIMARY KEY,
        student_id TEXT,
        student_name TEXT,
        grade TEXT,
        school TEXT,
        parent_phone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    );
    await db.query(
      `INSERT INTO enrollment_requests (student_id, student_name, grade, school, parent_phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [studentId || '', studentName || '', grade || '', school, parentPhone]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ error: 'Server error saving enrollment' });
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


// Analytics — direct Vultr DB query (replaces Python/Supabase path)
app.get('/api/analytics/:studentId', async (req, res) => {
  const studentId = req.params.studentId.replace(/"/g, '');

  try {
    // Get user stats from debate_users (Vultr)
    const userRes = await db.query(
      `SELECT user_id, username, class, grade, gforce_tokens, current_streak, longest_streak,
              total_debates, total_wins, avg_score, best_score, total_words_spoken, badges
       FROM debate_users WHERE user_id = $1`,
      [studentId]
    );

    if (!userRes.rows.length) {
      return res.json({ total_debates: 0, avg_score: 0, total_words_spoken: 0, gforce_tokens: 0,
        current_streak: 0, best_streak: 0, badges: [], badge_details: [], tier: { name: 'Unranked', color: '#64748b' },
        score_trend: [], category_averages: {} });
    }

    const u = userRes.rows[0];
    const tokens = Math.round(u.gforce_tokens || 0);

    // Tier calculation based on tokens
    const tier = (() => {
      if (tokens >= 5000) return { name: 'Grandmaster', color: '#ec4899' };
      if (tokens >= 4000) return { name: 'Master', color: '#f97316' };
      if (tokens >= 3000) return { name: 'Diamond', color: '#818cf8' };
      if (tokens >= 2000) return { name: 'Platinum', color: '#38bdf8' };
      if (tokens >= 1500) return { name: 'Gold', color: '#f59e0b' };
      if (tokens >= 1000) return { name: 'Silver', color: '#94a3b8' };
      if (tokens >= 500)  return { name: 'Bronze', color: '#cd7f32' };
      return { name: 'Unranked', color: '#64748b' };
    })();

    // Get recent debates from debates table
    const debatesRes = await db.query(
      `SELECT debate_id, motion, side, overall_score, grade, total_turns, total_words, created_at,
              score_argument_quality, score_rebuttal_engagement, score_clarity_coherence,
              score_speech_fluency, score_persuasiveness, score_knowledge_evidence,
              score_respectfulness, score_consistency_position
       FROM debates WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [studentId]
    );
    const debates = debatesRes.rows || [];

    // Score trend (last 20)
    const score_trend = debates.slice(0, 20).map(d => ({
      overall_score: d.overall_score,
      created_at: d.created_at,
    }));

    // Category averages
    const CAT_MAP = {
      'Argument Quality': 'score_argument_quality',
      'Rebuttal & Engagement': 'score_rebuttal_engagement',
      'Clarity & Coherence': 'score_clarity_coherence',
      'Speech Fluency': 'score_speech_fluency',
      'Persuasiveness': 'score_persuasiveness',
      'Knowledge & Evidence': 'score_knowledge_evidence',
      'Respectfulness & Tone': 'score_respectfulness',
      'Consistency & Position': 'score_consistency_position',
    };
    const category_averages = {};
    if (debates.length) {
      for (const [name, col] of Object.entries(CAT_MAP)) {
        const vals = debates.map(d => d[col]).filter(v => v !== null && v !== undefined);
        if (vals.length) {
          category_averages[name] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
        }
      }
    }

    // Badges — parse JSONB from debate_users (may be array, object {}, or null)
    let badges = [];
    try {
      const raw = u.badges;
      if (Array.isArray(raw)) badges = raw;
      else if (typeof raw === 'string') badges = JSON.parse(raw);
      else if (raw && typeof raw === 'object') badges = Object.values(raw);
    } catch { badges = []; }
    if (!Array.isArray(badges)) badges = [];

    res.json({
      total_debates: u.total_debates || 0,
      avg_score: u.avg_score ? Math.round(u.avg_score * 10) / 10 : 0,
      best_score: u.best_score || 0,
      total_words_spoken: u.total_words_spoken || 0,
      gforce_tokens: tokens,
      current_streak: u.current_streak || 0,
      best_streak: u.longest_streak || 0,
      tier,
      badges,
      badge_details: [],
      score_trend,
      category_averages,
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.json({ total_debates: 0, avg_score: 0, total_words_spoken: 0, gforce_tokens: 0,
      current_streak: 0, best_streak: 0, badges: [], badge_details: [],
      tier: { name: 'Unranked', color: '#64748b' }, score_trend: [], category_averages: {} });
  }
});


// Leaderboard (Native Vultr DB Query)
app.get('/api/leaderboard', async (req, res) => {
  const level = req.query.level || '';
  const timeframe = req.query.timeframe || '';
  const category = req.query.category || 'global';
  const school = req.query.school || '';
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  try {
    let queryStr = '';
    let countQueryStr = '';
    const params = [];
    let paramIdx = 1;
    let whereClauses = [];

    // Filters
    if (level) {
      whereClauses.push(`class = $${paramIdx++}`);
      params.push(level);
    }
    if (school) {
      whereClauses.push(`school ILIKE $${paramIdx++}`);
      params.push(`%${school}%`);
    }

    // Timeframe logic (if needed in future, currently ignored for simplicity or can filter by updated_at)
    if (timeframe === 'month') {
      whereClauses.push(`updated_at >= NOW() - INTERVAL '1 month'`);
    } else if (timeframe === 'week') {
      whereClauses.push(`updated_at >= NOW() - INTERVAL '1 week'`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    if (category === 'global') {
      queryStr = `SELECT user_id, username, class, grade, gforce_tokens, total_debates, avg_score, current_streak, longest_streak 
                  FROM debate_users ${whereSql} 
                  ORDER BY gforce_tokens DESC NULLS LAST LIMIT $${paramIdx} OFFSET $${paramIdx+1}`;
      countQueryStr = `SELECT COUNT(*) FROM debate_users ${whereSql}`;
      params.push(limit, offset);
    } else if (category === 'top_streaks') {
      queryStr = `SELECT user_id, username, class, grade, gforce_tokens, total_debates, avg_score, current_streak, longest_streak 
                  FROM debate_users ${whereSql} 
                  ORDER BY longest_streak DESC NULLS LAST, current_streak DESC NULLS LAST LIMIT $${paramIdx} OFFSET $${paramIdx+1}`;
      countQueryStr = `SELECT COUNT(*) FROM debate_users ${whereSql}`;
      params.push(limit, offset);
    } else {
      // Category averages (avg_argument, avg_rebuttal, avg_fluency)
      const CAT_COL_MAP = {
        'avg_argument': 'score_argument_quality',
        'avg_rebuttal': 'score_rebuttal_engagement',
        'avg_fluency': 'score_speech_fluency'
      };
      const col = CAT_COL_MAP[category];
      if (!col) return res.status(400).json({ error: 'Invalid category' });

      const debatesWhere = [];
      const dParams = [];
      let dParamIdx = 1;
      if (level) { debatesWhere.push(`u.class = $${dParamIdx++}`); dParams.push(level); }
      if (school) { debatesWhere.push(`u.school ILIKE $${dParamIdx++}`); dParams.push(`%${school}%`); }
      if (timeframe === 'month') debatesWhere.push(`d.created_at >= NOW() - INTERVAL '1 month'`);
      else if (timeframe === 'week') debatesWhere.push(`d.created_at >= NOW() - INTERVAL '1 week'`);

      const dWhereSql = debatesWhere.length ? `WHERE ${debatesWhere.join(' AND ')}` : '';

      queryStr = `
        SELECT u.user_id, u.username, u.class, u.grade, u.gforce_tokens, u.total_debates,
               AVG(d.${col}) as avg_score
        FROM debate_users u
        JOIN debates d ON u.user_id = d.user_id
        ${dWhereSql}
        GROUP BY u.user_id, u.username, u.class, u.grade, u.gforce_tokens, u.total_debates
        ORDER BY avg_score DESC NULLS LAST
        LIMIT $${dParamIdx} OFFSET $${dParamIdx+1}
      `;
      countQueryStr = `
        SELECT COUNT(*) FROM (
          SELECT u.user_id FROM debate_users u
          JOIN debates d ON u.user_id = d.user_id
          ${dWhereSql}
          GROUP BY u.user_id
        ) sub
      `;
      dParams.push(limit, offset);

      // Overwrite params with specific query ones
      params.length = 0;
      params.push(...dParams);
    }

    // Bug #2 fix: use explicit countParams (filter params without limit/offset)
    // For global/top_streaks: params = [...filters, limit, offset]
    // For category: params = [...dParams] which is also [...filters, limit, offset]
    // We always push limit+offset last, so slice(-2) is safe — but be explicit:
    const countParams = params.slice(0, params.length - 2);
    const [rowsRes, countRes] = await Promise.all([
      db.query(queryStr, params),
      db.query(countQueryStr, countParams)
    ]);

    const leaders = rowsRes.rows.map((r, idx) => {
      // Determine tier
      const t = Math.round(r.gforce_tokens || 0);
      let tierName = 'Unranked';
      if (t >= 5000) tierName = 'Grandmaster';
      else if (t >= 4000) tierName = 'Master';
      else if (t >= 3000) tierName = 'Diamond';
      else if (t >= 2000) tierName = 'Platinum';
      else if (t >= 1500) tierName = 'Gold';
      else if (t >= 1000) tierName = 'Silver';
      else if (t >= 500)  tierName = 'Bronze';

      // Parse average correctly
      let parsedAvg = r.avg_score;
      if (typeof parsedAvg === 'string') parsedAvg = parseFloat(parsedAvg);

      return {
        ...r,
        avg_score: parsedAvg,
        rank: offset + idx + 1,
        tier: { name: tierName }
      };
    });

    res.json({
      leaderboard: leaders,
      total_count: parseInt(countRes.rows[0].count, 10)
    });

  } catch (err) {
    console.error('Leaderboard DB error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
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
      stats: { total_turns: transcript.length, total_words: transcript.reduce((acc, m) => acc + (m.text || '').split(' ').length, 0) }
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
    exec(`python3 "${scriptPath}" "${filename}" "${sId}" "${sName}" "${sClass}" "${sTopic}"`, async (error, stdout, stderr) => {
      // Clean up file
      try { fs.unlinkSync(filename); } catch (e) {}

      if (error) {
        console.error('Python execute error:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ error: 'Failed to run debate judge' });
      }

      let result;
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        console.error('JSON parse error from python output:', parseError);
        console.error('Raw stdout:', stdout);
        return res.status(500).json({ error: 'Invalid output from judge' });
      }

      // ── Write to Vultr DB (parallel, non-blocking) ──
      if (studentId && result && !result.error && !result.skipped) {
        const writeToVultr = async () => {
          try {
            const score = result.overall_score || 0;
            const totalWords = result.stats?.total_words || 0;
            const totalTurns = result.stats?.total_turns || 0;
            const catMap = {
              'Argument Quality':        'score_argument_quality',
              'Rebuttal & Engagement':   'score_rebuttal_engagement',
              'Clarity & Coherence':     'score_clarity_coherence',
              'Speech Fluency':          'score_speech_fluency',
              'Persuasiveness':          'score_persuasiveness',
              'Knowledge & Evidence':    'score_knowledge_evidence',
              'Respectfulness & Tone':   'score_respectfulness',
              'Consistency & Position':  'score_consistency_position',
            };
            const catScores = {};
            for (const cat of result.categories || []) {
              const col = catMap[cat.name];
              if (col) catScores[col] = cat.score;
            }

            // Insert debate record
            const debateId = require('crypto').createHash('sha256')
              .update(`${studentId}:${Date.now()}:${score}`).digest('hex').slice(0, 16);

            await db.query(
              `INSERT INTO debates (debate_id, user_id, motion, side, overall_score, grade,
                total_turns, total_words, score_argument_quality, score_rebuttal_engagement,
                score_clarity_coherence, score_speech_fluency, score_persuasiveness,
                score_knowledge_evidence, score_respectfulness, score_consistency_position,
                full_result, class)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
               ON CONFLICT (debate_id) DO NOTHING`,
              [
                debateId, studentId, result.motion || topic || '', result.debater?.side || '',
                score, result.grade || '', totalTurns, totalWords,
                catScores.score_argument_quality || 0, catScores.score_rebuttal_engagement || 0,
                catScores.score_clarity_coherence || 0, catScores.score_speech_fluency || 0,
                catScores.score_persuasiveness || 0, catScores.score_knowledge_evidence || 0,
                catScores.score_respectfulness || 0, catScores.score_consistency_position || 0,
                JSON.stringify(result), classLevel || '',
              ]
            );

            // Update debate_users stats
            const existing = await db.query(
              `SELECT total_debates, avg_score, best_score, total_words_spoken, current_streak,
                      longest_streak, gforce_tokens, badges
               FROM debate_users WHERE user_id = $1`,
              [studentId]
            );

            if (existing.rows.length) {
              const u = existing.rows[0];
              const newTotal = (u.total_debates || 0) + 1;
              const newAvg = Math.round(((u.avg_score || 0) * (u.total_debates || 0) + score) / newTotal * 100) / 100;
              const newBest = Math.max(u.best_score || 0, score);
              const newWords = (u.total_words_spoken || 0) + totalWords;

              // Streak: get PREVIOUS debate date (OFFSET 1 skips the one just inserted)
              // Bug #3 fix: without OFFSET 1, the query returns today's just-inserted row,
              // making deltaDays always 0 and the streak never resets.
              let newStreak = 1;
              try {
                const lastDebateRes = await db.query(
                  `SELECT created_at FROM debates WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1 OFFSET 1`,
                  [studentId]
                );
                if (lastDebateRes.rows.length) {
                  const lastDt = new Date(lastDebateRes.rows[0].created_at);
                  const nowIST  = new Date(Date.now() + 5.5 * 3600 * 1000);
                  const lastIST = new Date(lastDt.getTime() + 5.5 * 3600 * 1000);
                  const deltaDays = Math.floor(nowIST / 86400000) - Math.floor(lastIST / 86400000);
                  if (deltaDays === 0 || deltaDays === 1) {
                    // Same day or yesterday — keep/extend streak
                    newStreak = deltaDays === 0 ? (u.current_streak || 1) : (u.current_streak || 0) + 1;
                  }
                  // >1 day gap — streak resets to 1 (default)
                }
                // No previous debate found → this is the first debate, streak = 1 (default)
              } catch (_) {}
              const newLongest = Math.max(u.longest_streak || 0, newStreak);

              // Tokens: 1 per 30 words + 20 if score >= 7
              const tokensEarned = Math.floor(totalWords / 30) + (score >= 7 ? 20 : 0) + (newStreak * 5);
              const newTokens = (u.gforce_tokens || 100) + tokensEarned;

              await db.query(
                `UPDATE debate_users SET total_debates=$1, avg_score=$2, best_score=$3,
                  total_words_spoken=$4, current_streak=$5, longest_streak=$6, gforce_tokens=$7
                 WHERE user_id=$8`,
                [newTotal, newAvg, newBest, newWords, newStreak, newLongest, newTokens, studentId]
              );
            }
          } catch (e) {
            console.error('Vultr debate write failed (non-critical):', e.message);
          }
        };
        writeToVultr(); // fire and forget
      }

      res.json(result);
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

// POST claim vocab trainer tokens (+75 per deck)
// Bug #19 fix: idempotency using a daily key stored in the users table column
// Format: 'vocab:YYYY-MM-DD' so each user can only claim once per IST day
app.post('/api/claim-vocab-tokens', async (req, res) => {
  const { studentId, tokensEarned } = req.body;
  if (!studentId || !tokensEarned) return res.status(400).json({ error: 'Missing params' });
  try {
    const today = getISTDateString();
    const idempotencyKey = `vocab:${today}`;

    // Check if already claimed today using dailyChallengeCompleted as a multi-purpose field
    // We store vocab claim as a separate column to avoid conflicts
    const check = await db.query(
      `SELECT "dailyVocabClaimed" FROM users WHERE "studentId" = $1`,
      [studentId]
    ).catch(() => ({ rows: [] })); // column may not exist on older DBs

    if (check.rows.length && check.rows[0]['dailyVocabClaimed'] === idempotencyKey) {
      return res.status(409).json({ error: 'Vocab tokens already claimed today' });
    }

    // Mark as claimed and award tokens atomically
    await db.query(
      `UPDATE users SET "dailyVocabClaimed" = $1 WHERE "studentId" = $2`,
      [idempotencyKey, studentId]
    ).catch(() => {}); // column may not exist yet — best effort

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

