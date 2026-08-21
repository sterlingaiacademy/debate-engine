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
const { execFile } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SpxzVJVdO5A5xr',
  key_secret: process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF'
});


// Simple async queue for python executions to prevent process flooding under high load
class ExecutionQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  async enqueue(fn) {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.running++;
    try { return await fn(); } 
    finally {
      this.running--;
      if (this.queue.length > 0) this.queue.shift()();
    }
  }
}
const pythonQueue = new ExecutionQueue(20); // Max 20 concurrent python processes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Speech Coach Routes
app.use('/api/speech', require('./api/speech_coach'));

// Helper for IST Date (Resets at 12:00 AM IST)
function getISTDateString() {
  const now = new Date();
  // IST is UTC + 5 hours and 30 minutes
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  return istDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}


// SECTION: English Session Registrations

app.post('/api/english-session/register', async (req, res) => {
  const { userId, studentName, parentName, email, mobile, schoolName, grade } = req.body;
  try {
    await db.query(`
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
    `);

    const result = await db.query(
      `INSERT INTO english_session_registrations (user_id, student_name, parent_name, email, mobile, school_name, grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId || null, studentName, parentName, email, mobile, schoolName, grade]
    );
    res.json({ success: true, registrationId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/english-session/registrations', async (req, res) => {
  try {
    await db.query(`
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
    `);
    
    const result = await db.query(`
      SELECT esr.*, COALESCE(MAX(sas.score), 0) AS max_speech_score
      FROM english_session_registrations esr
      LEFT JOIN users u ON u.id::text = esr.user_id OR u.email = esr.email
      LEFT JOIN speech_analysis_sessions sas ON sas.student_id = u."studentId"
      GROUP BY esr.id
      ORDER BY esr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// SECTION: Speech League Registrations

app.post('/api/speech-league/register', async (req, res) => {
  const { userId, studentName, email, mobile, schoolName, grade } = req.body;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS speech_league_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(50),
        school_name VARCHAR(255),
        grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existing = await db.query(
      `SELECT id FROM speech_league_registrations WHERE email = $1`,
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    const result = await db.query(
      `INSERT INTO speech_league_registrations (user_id, student_name, email, mobile, school_name, grade)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId || null, studentName, email, mobile, schoolName, grade]
    );
    res.json({ success: true, registrationId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/speech-league/registrations', async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS speech_league_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(50),
        school_name VARCHAR(255),
        grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await db.query(`
      SELECT *
      FROM speech_league_registrations
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// SECTION: Freedom Quiz Registrations

app.post('/api/freedom-quiz/register', async (req, res) => {
  const { userId, fullName, email, mobile, city, age } = req.body;
  try {
    await db.query(`
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
    `);

    const result = await db.query(
      `INSERT INTO freedom_quiz_registrations (user_id, full_name, email, mobile, city, age)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId || null, fullName, email, mobile, city, age]
    );
    res.json({ success: true, registrationId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/freedom-quiz/registrations', async (req, res) => {
  try {
    await db.query(`
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
    `);

    const result = await db.query(`
      SELECT fqr.*, COALESCE(MAX(sas.score), 0) AS max_speech_score
      FROM freedom_quiz_registrations fqr
      LEFT JOIN users u ON u.id::text = fqr.user_id OR u.email = fqr.email
      LEFT JOIN speech_analysis_sessions sas ON sas.student_id = u."studentId"
      GROUP BY fqr.id
      ORDER BY fqr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/indusmun/register
app.post('/api/indusmun/register', async (req, res) => {
  try {
    const { userId, studentName, email, mobile, schoolName, grade } = req.body;
    if (!studentName || !email || !mobile || !schoolName || !grade) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    await db.query(`
      CREATE TABLE IF NOT EXISTS indus_mun_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(255),
        school_name VARCHAR(255),
        grade VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check for duplicates
    const existing = await db.query(
      `SELECT id FROM indus_mun_registrations WHERE email = $1 OR mobile = $2`,
      [email, mobile]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You are already registered for Indus MUN with this email or mobile number.' });
    }

    const result = await db.query(
      `INSERT INTO indus_mun_registrations (user_id, student_name, email, mobile, school_name, grade)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId || null, studentName, email, mobile, schoolName, grade]
    );
    res.json({ success: true, registrationId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/indusmun/registrations
app.get('/api/indusmun/registrations', requireAdmin, async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS indus_mun_registrations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        student_name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(255),
        school_name VARCHAR(255),
        grade VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const result = await db.query(`
      SELECT imr.*, COALESCE(MAX(sas.score), 0) AS max_speech_score
      FROM indus_mun_registrations imr
      LEFT JOIN users u ON u.id::text = imr.user_id OR u.email = imr.email
      LEFT JOIN speech_analysis_sessions sas ON sas.student_id = u."studentId"
      GROUP BY imr.id
      ORDER BY imr.created_at DESC
    `);
    res.json({ total: result.rows.length, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Users
app.post('/api/register', async (req, res) => {
  const { name, studentId, password, classLevel, grade, email, phone, authProvider, referralCode, mobile, schoolName, category, city, state, olympiadSchoolCode, designation } = req.body;
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

    let school_id = null;
    let olympiad_registered = false;
    if (olympiadSchoolCode) {
      const schoolRes = await db.query(`SELECT id FROM schools WHERE school_code = $1`, [olympiadSchoolCode]);
      if (schoolRes.rows.length === 0) {
        return res.status(404).json({ error: 'Invalid Olympiad School Code' });
      }
      school_id = schoolRes.rows[0].id;
      olympiad_registered = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, "studentId", password, "classLevel", grade, "assignedAgentId", email, phone, auth_provider, mobile, "schoolName", category, city, state, school_id, olympiad_registered, designation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`;
    
    try {
      await db.query(query, [name, studentId, hashedPassword, classLevel, grade || '', assignedAgentId, email || null, phone || null, authProvider || null, mobile || null, schoolName || null, category || null, city || null, state || null, school_id, olympiad_registered, designation || null]);
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
      user: { name, studentId, classLevel, assignedAgentId, email, phone, grade: grade || '', subscription_plan: 'free', subscription_period: 'monthly', subscription_status: 'inactive' },
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
        avatar: user.avatar,
        subscription_plan: user.subscription_plan || 'free',
        subscription_period: user.subscription_period || 'monthly',
        subscription_status: user.subscription_status || 'inactive',
        olympiad_registered: user.olympiad_registered || false,
        olympiad_school_name: user.olympiad_school_name || null
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
      'SELECT u.*, s.name as olympiad_school_name, u.subjects FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE LOWER(u."studentId") = LOWER($1) OR LOWER(u."email") = LOWER($1)', 
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
        phone: user.phone,
        subscription_plan: user.subscription_plan || 'free',
        subscription_period: user.subscription_period || 'monthly',
        subscription_status: user.subscription_status || 'inactive',
        olympiad_registered: user.olympiad_registered || false,
        olympiad_school_name: user.olympiad_school_name || null,
        subjects: user.subjects || null,
        avatar: user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || 'User')}`
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
    const { rows } = await db.query(`SELECT id, name, "studentId", "classLevel", "assignedAgentId", avatar, grade, subscription_plan, subscription_period FROM users WHERE email = $1`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Latest User Profile (for syncing subscription status)
app.get('/api/me/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { rows } = await db.query(
      `SELECT u.name, u."studentId", u."classLevel", u.grade, u."assignedAgentId", u.email, u.avatar, u.phone, u.subscription_plan, u.subscription_period, u.subscription_status, u.olympiad_registered, u.subjects, s.name as olympiad_school_name FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u."studentId" = $1`,
      [studentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];
    user.avatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || 'User')}`;
    res.json({ user });
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
    
    // Calculate remaining limits
    let LIMIT = 600; // Free: 10 minutes
    if (user.subscription_plan === 'pro') LIMIT = 1200; // Pro: 20 minutes
    if (user.subscription_plan === 'max') LIMIT = 3600; // Max: 60 minutes

    // Check active coupons:
    // GFORCE10 — resets at midnight IST (date-based)
    const gforce10Res = await db.query(
      `SELECT coupon_code FROM user_coupons WHERE user_id = $1 AND coupon_code = 'GFORCE10' AND effect_date = $2`,
      [studentId, currentDateIST]
    );
    if (gforce10Res.rows.length > 0) {
      LIMIT += 600; // +10 minutes
    }

    // VVIP30 — 24-hour rolling window from time of redemption
    const vvip30Res = await db.query(
      `SELECT coupon_code FROM user_coupons WHERE user_id = $1 AND coupon_code = 'VVIP30' AND redeemed_at > NOW() - INTERVAL '24 hours'`,
      [studentId]
    );
    if (vvip30Res.rows.length > 0) {
      LIMIT += 1800; // +30 minutes (VVIP exclusive, 24hr rolling)
    }

    // Topup credits (paid one-time top-ups and free topup coupons) — valid for 30 days
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS topup_credits (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          bonus_seconds INTEGER NOT NULL,
          effect_date TEXT NOT NULL,
          source TEXT DEFAULT 'payment',
          razorpay_payment_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
        )
      `);
      const topupRes = await db.query(
        `SELECT COALESCE(SUM(bonus_seconds), 0) AS total_bonus FROM topup_credits WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
        [studentId]
      );
      LIMIT += parseInt(topupRes.rows[0].total_bonus || 0);
    } catch (topupErr) {
      console.error('Topup credits error:', topupErr.message);
    }
    
    const used = (user.dailyRankedTime || 0) + (user.dailyPersonaTime || 0);
    const sharedRemaining = Math.max(0, LIMIT - used);
    
    let remainingRanked = sharedRemaining;
    let remainingPersona = sharedRemaining;
    
    res.json({
      remainingRanked,
      remainingPersona,
      dailyRankedTime: user.dailyRankedTime || 0,
      dailyPersonaTime: user.dailyPersonaTime || 0,
      subscription_plan: user.subscription_plan || 'free',
      limitTotal: LIMIT
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

// Coupons API
app.post('/api/coupons/redeem', async (req, res) => {
  try {
    const { studentId, couponCode } = req.body;
    if (!studentId || !couponCode) return res.status(400).json({ error: 'Missing required params' });

    const code = couponCode.toUpperCase().trim();

    // ── School coupon codes (GFPRO-XXXX-XXXX / GFMAX-XXXX-XXXX) ──
    if (code.startsWith('GFPRO-') || code.startsWith('GFMAX-')) {
      await ensureSchoolCouponsTable();
      const couponRes = await db.query(`SELECT * FROM gforce.school_coupons WHERE code = $1`, [code]);
      if (couponRes.rows.length === 0) return res.status(400).json({ error: 'Invalid code. Please check and try again.' });
      const coupon = couponRes.rows[0];
      if (coupon.is_used) return res.status(400).json({ error: 'This code has already been used.' });
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.status(400).json({ error: 'This code has expired.' });
      await db.query(`UPDATE gforce.school_coupons SET is_used = TRUE, used_by = $1, used_at = NOW() WHERE code = $2`, [studentId, code]);
      await db.query(`UPDATE gforce.users SET subscription_plan = $1, subscription_status = 'active' WHERE "studentId" = $2`, [coupon.plan, studentId]);
      return res.json({ success: true, plan: coupon.plan, message: `🎉 Code activated! Your account is now on ${coupon.plan.toUpperCase()} plan.` });
    }

    // ── Ankita Custom Freedom Quiz Coupon ──
    if (code === 'ANKITA10000' || code === 'TEST-ANKITA10000' || code === 'TEST-ANKITA-2') {
      const checkRes = await db.query(`SELECT id FROM user_coupons WHERE coupon_code = $1`, [code]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ error: 'This special coupon has already been redeemed.' });
      }

      await db.query(`UPDATE gforce.users SET subscription_plan = 'max', subscription_status = 'active' WHERE "studentId" = $1`, [studentId]);
      await db.query(`INSERT INTO user_coupons (user_id, coupon_code, effect_date, redeemed_at) VALUES ($1, $2, $3, NOW())`, [studentId, code, getISTDateString()]);
      
      return res.json({
        success: true,
        plan: 'max',
        message: 'Code activated! Your account is now on MAX plan.',
        customPopup: {
          title: 'Congratulations Anita K Nair!',
          desc: 'For securing the FIRST POSITION in the Freedom Quiz Challenge, you have been awarded the MAX Plan (worth ₹10,000) for 1 month! Keep up the amazing work!'
        }
      });
    }

    // ── Habiba Custom Freedom Quiz Coupon (2nd Prize) ──
    if (code === 'HABIBA5000' || code === 'TEST-HABIBA5000' || code === 'TEST-HABIBA-2') {
      const checkRes = await db.query(`SELECT id FROM user_coupons WHERE coupon_code = $1`, [code]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ error: 'This special coupon has already been redeemed.' });
      }

      await db.query(`UPDATE gforce.users SET subscription_plan = 'pro', subscription_status = 'active' WHERE "studentId" = $1`, [studentId]);
      await db.query(`INSERT INTO user_coupons (user_id, coupon_code, effect_date, redeemed_at) VALUES ($1, $2, $3, NOW())`, [studentId, code, getISTDateString()]);
      
      return res.json({
        success: true,
        plan: 'pro',
        message: 'Code activated! Your account is now on PRO plan.',
        customPopup: {
          title: 'Congratulations Habiba Ansari!',
          desc: 'For securing the SECOND POSITION in the Freedom Quiz Challenge, you have been awarded the PRO Plan (worth ₹5,000) for 1 month! Keep up the amazing work!'
        }
      });
    }

    // ── DevbINU Custom Freedom Quiz Coupon (3rd Prize) ──
    if (code === 'DEVBINU3000' || code === 'TEST-DEVBINU3000') {
      const checkRes = await db.query(`SELECT id FROM user_coupons WHERE coupon_code = $1`, [code]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ error: 'This special coupon has already been redeemed.' });
      }

      await db.query(`UPDATE gforce.users SET subscription_plan = 'pro', subscription_status = 'active' WHERE "studentId" = $1`, [studentId]);
      await db.query(`INSERT INTO user_coupons (user_id, coupon_code, effect_date, redeemed_at) VALUES ($1, $2, $3, NOW())`, [studentId, code, getISTDateString()]);
      
      return res.json({
        success: true,
        plan: 'pro',
        message: 'Code activated! Your account is now on PRO plan.',
        customPopup: {
          title: 'Congratulations DevbINU!',
          desc: 'For securing the THIRD POSITION in the Freedom Quiz Challenge, you have been awarded the PRO Plan (worth ₹3,000) for 1 month! Keep up the amazing work!'
        }
      });
    }

    // ── Top 14 Winners Freedom Quiz Coupons (2 Weeks PRO) ──
    const TOP_14_WINNERS = {
      'AMINA2000': 'Amina Minha Muneer',
      'ASHIQ2000': 'Ashiq Hussain Sheikh',
      'SUMIA2000': 'SUMIA BASHIR',
      'YUKTI2000': 'Yukti Sharma',
      'MOHAMMED2000': 'Mohammed Afil',
      'JEREMY2000': 'Jeremy Robin',
      'SHAHAN2000': 'Shahan shabeeb',
      'RESHMY2000': 'Reshmy Rachel Shibu',
      'ANSU2000': 'Ansu Abraham',
      'RADIN2000': 'Radin T',
      'SHAFEEQUE2000': 'MUHAMMED SHAFEEQUE',
      'PARUL2000': 'Parul',
      'ZAHRA2000': 'Zahra Shakir',
      'PRERANA2000': 'Prerana Shukla',
      'TEST-WINNER2000': 'Admin Test User'
    };

    if (TOP_14_WINNERS[code]) {
      const winnerName = TOP_14_WINNERS[code];
      const checkRes = await db.query(`SELECT id FROM user_coupons WHERE coupon_code = $1`, [code]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ error: 'This special coupon has already been redeemed.' });
      }

      await db.query(`UPDATE gforce.users SET subscription_plan = 'pro', subscription_status = 'active' WHERE "studentId" = $1`, [studentId]);
      await db.query(`INSERT INTO user_coupons (user_id, coupon_code, effect_date, redeemed_at) VALUES ($1, $2, $3, NOW())`, [studentId, code, getISTDateString()]);
      
      return res.json({
        success: true,
        plan: 'pro',
        message: 'Code activated! Your account is now on PRO plan.',
        customPopup: {
          title: `Congratulations ${winnerName}!`,
          desc: 'For your outstanding performance in the Freedom Quiz Challenge, you have been awarded the PRO Plan (worth ₹2,000) for 2 weeks! Keep up the amazing work!'
        }
      });
    }

    // ── Regular coupons ──
    const VALID_COUPONS = {
      'GFORCE10': '+10 minutes for today',
      'VVIP30':   '+30 minutes for today (VVIP exclusive)',
      'TOPUP499': '+60 mins for 30 days',
      'TOPUP999': '+120 mins for 30 days',
    };
    if (!VALID_COUPONS[code]) {
      return res.status(400).json({ error: 'Invalid coupon code.' });
    }

    // Check if already redeemed
    const checkRes = await db.query(`SELECT id FROM user_coupons WHERE user_id = $1 AND coupon_code = $2`, [studentId, code]);
    if (checkRes.rows.length > 0) {
      return res.status(400).json({ error: 'You have already redeemed this coupon.' });
    }

    const currentDateIST = getISTDateString();

    // Insert redemption (redeemed_at defaults to NOW() for 24hr rolling coupons)
    await db.query(
      `INSERT INTO user_coupons (user_id, coupon_code, effect_date, redeemed_at) VALUES ($1, $2, $3, NOW())`,
      [studentId, code, currentDateIST]
    );

    // For topup coupons, also insert into topup_credits (30-day validity)
    if (code === 'TOPUP499' || code === 'TOPUP999') {
      const bonusSeconds = code === 'TOPUP499' ? 3600 : 7200;
      await db.query(`
        CREATE TABLE IF NOT EXISTS topup_credits (
          id SERIAL PRIMARY KEY, user_id TEXT NOT NULL, bonus_seconds INTEGER NOT NULL,
          effect_date TEXT NOT NULL, source TEXT DEFAULT 'coupon',
          razorpay_payment_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
        )
      `);
      await db.query(
        `INSERT INTO topup_credits (user_id, bonus_seconds, effect_date, source, expires_at) VALUES ($1, $2, $3, 'coupon', NOW() + INTERVAL '30 days')`,
        [studentId, bonusSeconds, currentDateIST]
      );
    }

    const MSG_MAP = {
      'VVIP30':   'VVIP coupon redeemed! +30 minutes added for today. 🎉',
      'TOPUP499': 'Top-up redeemed! +60 mins added. Valid for 30 days. ⚡',
      'TOPUP999': 'Top-up redeemed! +120 mins added. Valid for 30 days. ⚡',
    };
    const successMsg = MSG_MAP[code] || 'Coupon redeemed successfully! You get +10 minutes for today.';
    res.json({ success: true, message: successMsg });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'You have already redeemed this coupon.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Top-Up Payment API (one-time Razorpay Orders)
app.post('/api/payment/create-topup-order', async (req, res) => {
  try {
    const { amount, studentId } = req.body;
    if (!amount || !studentId) return res.status(400).json({ error: 'amount and studentId are required' });
    if (![499, 999].includes(Number(amount))) return res.status(400).json({ error: 'Invalid amount. Use 499 or 999.' });

    const order = await razorpayInstance.orders.create({
      amount: Number(amount) * 100, // paise
      currency: 'INR',
      receipt: `topup_${studentId}_${Date.now()}`,
      notes: { studentId, topup_amount: String(amount) }
    });
    res.json(order);
  } catch (err) {
    console.error('Create topup order error:', err);
    res.status(500).json({ error: err.error?.description || err.message });
  }
});

app.post('/api/payment/verify-topup', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, amount } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !studentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const secret = process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = require('crypto').createHmac('sha256', secret).update(body).digest('hex');
    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const bonusSeconds = Number(amount) === 999 ? 7200 : 3600;
    const currentDateIST = getISTDateString();

    await db.query(`
      CREATE TABLE IF NOT EXISTS topup_credits (
        id SERIAL PRIMARY KEY, user_id TEXT NOT NULL, bonus_seconds INTEGER NOT NULL,
        effect_date TEXT NOT NULL, source TEXT DEFAULT 'payment',
        razorpay_payment_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
      )
    `);
    await db.query(
      `INSERT INTO topup_credits (user_id, bonus_seconds, effect_date, source, razorpay_payment_id, expires_at) VALUES ($1, $2, $3, 'payment', $4, NOW() + INTERVAL '30 days')`,
      [studentId, bonusSeconds, currentDateIST, razorpay_payment_id]
    );

    res.json({ success: true, bonusSeconds, message: `+${bonusSeconds / 3600} hours added! Valid for 30 days.` });
  } catch (err) {
    console.error('Verify topup error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────
// School Bulk Coupon System
// ─────────────────────────────────────────────

// Ensure school_coupons table exists
async function ensureSchoolCouponsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS gforce.school_coupons (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      school_name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'pro',
      batch_id TEXT NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      used_by TEXT,
      used_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// Admin: Generate N school coupon codes
// POST /api/admin/generate-school-coupons
// Body: { adminSecret, schoolName, plan, count, expiryDays }
app.post('/api/admin/generate-school-coupons', async (req, res) => {
  try {
    const { adminSecret, schoolName, plan = 'pro', count = 20, expiryDays = 365 } = req.body;

    // Simple admin secret check
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'gforce_admin_2026';
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (!schoolName) return res.status(400).json({ error: 'schoolName is required' });
    if (count < 1 || count > 500) return res.status(400).json({ error: 'count must be between 1 and 500' });

    await ensureSchoolCouponsTable();

    const batchId = `SCHOOL-${Date.now()}`;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    const codes = [];

    for (let i = 0; i < count; i++) {
      // e.g. GFPRO-A3X9-K2M7
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const code = `GF${plan.toUpperCase()}-${part1}-${part2}`;
      await db.query(
        `INSERT INTO gforce.school_coupons (code, school_name, plan, batch_id, expires_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING`,
        [code, schoolName, plan, batchId, expiresAt]
      );
      codes.push(code);
    }

    res.json({ success: true, batchId, schoolName, plan, count: codes.length, expiresAt, codes });
  } catch (err) {
    console.error('Generate school coupons error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Student: Redeem a school coupon code → upgrades their plan
// POST /api/school-coupons/redeem
// Body: { studentId, code }
app.post('/api/school-coupons/redeem', async (req, res) => {
  try {
    const { studentId, code } = req.body;
    if (!studentId || !code) return res.status(400).json({ error: 'studentId and code are required' });

    await ensureSchoolCouponsTable();

    const cleanCode = code.trim().toUpperCase();

    // Fetch the coupon
    const couponRes = await db.query(
      `SELECT * FROM gforce.school_coupons WHERE code = $1`,
      [cleanCode]
    );
    if (couponRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid code. Please check and try again.' });
    }

    const coupon = couponRes.rows[0];

    if (coupon.is_used) {
      return res.status(400).json({ error: 'This code has already been used.' });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This code has expired.' });
    }


    // Mark code as used
    await db.query(
      `UPDATE gforce.school_coupons SET is_used = TRUE, used_by = $1, used_at = NOW() WHERE code = $2`,
      [studentId, cleanCode]
    );

    // Upgrade user's plan
    await db.query(
      `UPDATE gforce.users SET subscription_plan = $1, subscription_status = 'active' WHERE "studentId" = $2`,
      [coupon.plan, studentId]
    );

    res.json({
      success: true,
      plan: coupon.plan,
      schoolName: coupon.school_name,
      message: `🎉 Success! Your account has been upgraded to ${coupon.plan.toUpperCase()} plan by ${coupon.school_name}.`
    });
  } catch (err) {
    console.error('Redeem school coupon error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Payment API (Subscriptions)
app.post('/api/payment/create-subscription', async (req, res) => {
  try {
    const { plan, period = 'yearly', studentId } = req.body;
    
    if (!plan || !studentId) {
      return res.status(400).json({ error: 'Plan and studentId are required' });
    }
    
    // Check if user already has an active subscription
    const userRes = await db.query('SELECT subscription_status FROM users WHERE "studentId" = $1', [studentId]);
    if (userRes.rows.length > 0 && userRes.rows[0].subscription_status === 'active') {
      return res.status(400).json({ error: 'User already has an active subscription. Please use the upgrade flow instead.' });
    }
    
    let plan_id;
    if (plan === 'pro' && period === 'monthly') plan_id = process.env.PLAN_PRO_MONTHLY;
    else if (plan === 'pro' && period === 'yearly') plan_id = process.env.PLAN_PRO_YEARLY;
    else if (plan === 'max' && period === 'monthly') plan_id = process.env.PLAN_MAX_MONTHLY;
    else if (plan === 'max' && period === 'yearly') plan_id = process.env.PLAN_MAX_YEARLY;
    else return res.status(400).json({ error: 'Invalid plan or period' });

    if (!plan_id) return res.status(500).json({ error: 'Plan ID not configured on server' });
    
    const options = {
      plan_id: plan_id,
      customer_notify: 1,
      total_count: period === 'yearly' ? 10 : 120, // 10 years roughly
      notes: {
        plan: plan,
        period: period,
        studentId: studentId
      }
    };
    
    const subscription = await razorpayInstance.subscriptions.create(options);
    if (!subscription) return res.status(500).json({ error: 'Error creating subscription' });
    
    await db.query(
      `UPDATE users SET razorpay_subscription_id = $1, subscription_status = 'created' WHERE "studentId" = $2`,
      [subscription.id, studentId]
    );
    
    res.json(subscription);
  } catch (err) {
    console.error('Razorpay Create Subscription Error:', err);
    const msg = err.error?.description || err.message || 'Internal Server Error';
    res.status(500).json({ error: msg });
  }
});

// Subscription Upgrades & Proration
app.post('/api/payment/update-subscription', async (req, res) => {
  try {
    const { plan, period = 'yearly', studentId } = req.body;
    
    if (!plan || !studentId) {
      return res.status(400).json({ error: 'Plan and studentId are required' });
    }

    // Get user's active subscription
    const userRes = await db.query('SELECT razorpay_subscription_id, subscription_status FROM users WHERE "studentId" = $1', [studentId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const { razorpay_subscription_id, subscription_status } = userRes.rows[0];
    if (!razorpay_subscription_id || subscription_status !== 'active') {
      return res.status(400).json({ error: 'User does not have an active subscription to upgrade' });
    }
    
    let plan_id;
    if (plan === 'pro' && period === 'monthly') plan_id = process.env.PLAN_PRO_MONTHLY;
    else if (plan === 'pro' && period === 'yearly') plan_id = process.env.PLAN_PRO_YEARLY;
    else if (plan === 'max' && period === 'monthly') plan_id = process.env.PLAN_MAX_MONTHLY;
    else if (plan === 'max' && period === 'yearly') plan_id = process.env.PLAN_MAX_YEARLY;
    else return res.status(400).json({ error: 'Invalid plan or period' });

    if (!plan_id) return res.status(500).json({ error: 'Plan ID not configured on server' });
    
    const options = {
      plan_id: plan_id,
      schedule_change_at: 'now',
      customer_notify: 1
    };
    
    const subscription = await razorpayInstance.subscriptions.update(razorpay_subscription_id, options);
    if (!subscription) return res.status(500).json({ error: 'Error updating subscription' });
    
    // Update our DB to reflect the new plan immediately
    await db.query(
      `UPDATE users SET subscription_plan = $1, subscription_period = $2 WHERE "studentId" = $3`,
      [plan, period, studentId]
    );
    
    res.json(subscription);
  } catch (err) {
    console.error('Razorpay Update Subscription Error:', err);
    const msg = err.error?.description || err.message || 'Internal Server Error';
    res.status(500).json({ error: msg });
  }
});

app.post('/api/payment/verify-subscription', async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature,
      studentId: bodyStudentId,  // optional fallback from frontend
      plan: bodyPlan,
      period: bodyPeriod
    } = req.body;
    
    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }
    
    const secret = process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF';
    const body = razorpay_payment_id + "|" + razorpay_subscription_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");
      
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    const subscription = await razorpayInstance.subscriptions.fetch(razorpay_subscription_id);
    if (!subscription) {
      return res.status(400).json({ error: 'Could not fetch subscription. Contact support.' });
    }

    const notes = subscription.notes || {};
    // Use notes from Razorpay; fall back to the ones sent from the frontend
    const studentId = notes.studentId || bodyStudentId;
    const plan = notes.plan || bodyPlan;
    const period = notes.period || bodyPeriod;

    if (!studentId) {
      return res.status(400).json({ error: 'Cannot identify user for this subscription. Contact support.' });
    }
    
    await db.query(
      `UPDATE users SET subscription_plan = $1, subscription_period = $2, subscription_status = 'active', razorpay_subscription_id = $3 WHERE "studentId" = $4`,
      [plan, period, razorpay_subscription_id, studentId]
    );
    
    res.json({ success: true, message: 'Subscription verified and plan updated successfully' });
  } catch (err) {
    console.error('Razorpay Verify Subscription Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Razorpay Webhook
app.post('/api/webhook/razorpay', async (req, res) => {
  try {
    // IMPORTANT: RAZORPAY_WEBHOOK_SECRET must be set separately from RAZORPAY_SECRET in .env
    // The webhook secret is configured in the Razorpay dashboard under Webhooks settings.
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured! Webhook rejected.');
      return res.status(500).json({ error: 'Webhook secret not configured on server' });
    }
    const signature = req.headers['x-razorpay-signature'];
    
    // Use the raw body buffered by express.json middleware for accurate signature verification
    const bodyStr = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(bodyStr)
                                    .digest('hex');
                                    
    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const payload = req.body; // Since express.json() parsed it, req.body is an object
    const event = payload.event;
    
    if (event === 'subscription.charged') {
      const subscription = payload.payload.subscription.entity;
      const notes = subscription.notes || {};
      const studentId = notes.studentId;
      
      let plan = 'free';
      let period = 'monthly';
      const pId = subscription.plan_id;
      if (pId === process.env.PLAN_PRO_MONTHLY) { plan = 'pro'; period = 'monthly'; }
      else if (pId === process.env.PLAN_PRO_YEARLY) { plan = 'pro'; period = 'yearly'; }
      else if (pId === process.env.PLAN_MAX_MONTHLY) { plan = 'max'; period = 'monthly'; }
      else if (pId === process.env.PLAN_MAX_YEARLY) { plan = 'max'; period = 'yearly'; }
      
      if (studentId) {
        await db.query(
          `UPDATE users SET subscription_plan = $1, subscription_period = $2, subscription_status = 'active', razorpay_subscription_id = $3 WHERE "studentId" = $4`,
          [plan, period, subscription.id, studentId]
        );
      }
    } else if (event === 'subscription.halted' || event === 'subscription.cancelled' || event === 'subscription.completed') {
      const subscription = payload.payload.subscription.entity;
      const notes = subscription.notes || {};
      const studentId = notes.studentId;
      if (studentId) {
        await db.query(
          `UPDATE users SET subscription_plan = 'free', subscription_period = '', subscription_status = $1 WHERE "studentId" = $2 AND razorpay_subscription_id = $3`,
          [event.split('.')[1], studentId, subscription.id]
        );
      }
    } else if (event === 'order.paid') {
      const order = payload.payload.order.entity;
      const orderId = order.id;
      const payment = payload.payload.payment?.entity;
      const paymentId = payment?.id || null;

      if (orderId) {
        // Update bootcamp_registrations
        await db.query(
          `UPDATE bootcamp_registrations SET payment_status = 'paid', razorpay_payment_id = COALESCE($1, razorpay_payment_id) WHERE razorpay_order_id = $2 AND payment_status != 'paid'`,
          [paymentId, orderId]
        );

        // Update mun_mentor_registrations
        await db.query(
          `UPDATE mun_mentor_registrations SET payment_status = 'paid', razorpay_payment_id = COALESCE($1, razorpay_payment_id) WHERE razorpay_order_id = $2 AND payment_status != 'paid'`,
          [paymentId, orderId]
        );

        // Update mini_mun_registrations and allocate topup credits if applicable
        const regRes = await db.query(
          `UPDATE mini_mun_registrations SET payment_status = 'paid', razorpay_payment_id = COALESCE($1, razorpay_payment_id) WHERE razorpay_order_id = $2 AND payment_status != 'paid' RETURNING user_id`,
          [paymentId, orderId]
        );

        const userId = regRes.rows[0]?.user_id;
        if (userId) {
          await db.query(`
            CREATE TABLE IF NOT EXISTS topup_credits (
              id SERIAL PRIMARY KEY,
              user_id TEXT NOT NULL,
              bonus_seconds INTEGER NOT NULL,
              effect_date TEXT NOT NULL,
              source TEXT DEFAULT 'payment',
              razorpay_payment_id TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
            )
          `);
          const effectDate = new Date().toISOString().slice(0, 10);
          await db.query(`
            INSERT INTO topup_credits (user_id, bonus_seconds, effect_date, source, razorpay_payment_id)
            VALUES ($1, 1800, $2, 'minimun', $3)
          `, [userId, effectDate, paymentId]);
        }
      }
    }
    
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
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
    pythonQueue.enqueue(() => {
      return new Promise((resolveQueue) => {
        execFile('python3', [scriptPath, filename, sId, sName, sClass, sTopic], { maxBuffer: 1024 * 1024 * 10, timeout: 15000 }, async (error, stdout, stderr) => {
          resolveQueue(); // Free up the queue slot immediately after python finishes
          // The rest of the DB processing happens asynchronously outside the process limit lock
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
    });
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

    await db.query(
      `UPDATE users SET "dailyVocabClaimed" = $1 WHERE "studentId" = $2`,
      [idempotencyKey, studentId]
    );

    await db.query(
      `UPDATE debate_users SET gforce_tokens = gforce_tokens + $1 WHERE user_id = $2`,
      [Math.round(tokensEarned), studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ══════════════════════════════════════════════════════════════════════════════
// DIPLOMAT 365 ROUTES  — /api/d365/*
// ══════════════════════════════════════════════════════════════════════════════

const { gradeSubmission } = require('./diplomat365-grader');
const d365DaysPath = path.join(__dirname, 'data', 'diplomat365-days.json');

// Cache curriculum in memory at startup (365 rows, ~200KB)
let D365_DAYS = null;
try {
  if (fs.existsSync(d365DaysPath)) {
    D365_DAYS = JSON.parse(fs.readFileSync(d365DaysPath, 'utf8'));
  }
} catch (e) {
  console.warn('diplomat365-days.json not found — run build-diplomat365-days.js');
}

// Helper — get or create user progress row
async function getOrCreateProgress(userId) {
  let res = await db.query('SELECT * FROM d365_user_progress WHERE user_id = $1', [userId]);
  if (!res.rows.length) {
    await db.query(
      `INSERT INTO d365_user_progress (user_id, current_day, streak, missed_days_in_row, longest_streak, tokens, badges)
       VALUES ($1, 1, 0, 0, 0, 0, '[]') ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    res = await db.query('SELECT * FROM d365_user_progress WHERE user_id = $1', [userId]);
  }
  return res.rows[0];
}

// GET /api/d365/days/:n — one curriculum day
app.get('/api/d365/days/:n', (req, res) => {
  const n = parseInt(req.params.n);
  if (!D365_DAYS) return res.status(503).json({ error: 'Curriculum not loaded. Run build-diplomat365-days.js first.' });
  const day = D365_DAYS.find(d => d.dayNumber === n);
  if (!day) return res.status(404).json({ error: 'Day not found' });
  res.json(day);
});

// GET /api/d365/progress/:userId — full user progress
app.get('/api/d365/progress/:userId', async (req, res) => {
  try {
    const prog = await getOrCreateProgress(req.params.userId);
    res.json({
      currentDay: prog.current_day || 1,
      streak: prog.streak || 0,
      missedDaysInRow: prog.missed_days_in_row || 0,
      longestStreak: prog.longest_streak || 0,
      tokens: prog.tokens || 0,
      lastCheckin: prog.last_checkin,
      badges: prog.badges || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/d365/attempts/:userId — recent attempts
app.get('/api/d365/attempts/:userId', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { rows } = await db.query(
      `SELECT day_number, stars, total_score, feedback, created_at
       FROM d365_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [req.params.userId, limit]
    );
    res.json({ attempts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/d365/rubric/grade — submit text → grade → unlock
app.post('/api/d365/rubric/grade', async (req, res) => {
  const { userId, dayNumber, text } = req.body;
  if (!userId || !dayNumber || !text) {
    return res.status(400).json({ error: 'userId, dayNumber, and text are required' });
  }

  // Verify user is pro/max
  try {
    const userRes = await db.query(`SELECT subscription_plan FROM users WHERE "studentId" = $1`, [userId]);
    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' });
    const plan = userRes.rows[0].subscription_plan;
    if (!['pro', 'max'].includes(plan)) {
      return res.status(403).json({ error: 'Diplomat 365 requires a Pro or Max subscription.' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Could not verify subscription' });
  }

  const dayData = D365_DAYS ? D365_DAYS.find(d => d.dayNumber === parseInt(dayNumber)) : null;
  const result = gradeSubmission(text, dayData);

  try {
    // Save attempt
    await db.query(
      `INSERT INTO d365_attempts
         (user_id, day_number, submission_text, stars, total_score,
          dim_persuasion, dim_evidence, dim_policy_knowledge, dim_diplomatic_register, dim_voice_delivery,
          feedback, unlocked_next)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        userId, dayNumber, text.slice(0, 5000),
        result.stars, result.totalScore,
        result.dims.persuasion, result.dims.evidence, result.dims.policyKnowledge,
        result.dims.diplomaticRegister, result.dims.voiceDelivery,
        result.feedback, result.unlocked,
      ]
    );

    // Update progress
    const prog = await getOrCreateProgress(userId);
    let newCurrentDay = prog.current_day;
    let newStreak = prog.streak;
    let newMissed = prog.missed_days_in_row;
    let newLongest = prog.longest_streak;
    let newTokens = prog.tokens;
    let badges = Array.isArray(prog.badges) ? [...prog.badges] : [];

    const today = new Date().toISOString().split('T')[0];
    const lastDate = prog.last_checkin ? new Date(prog.last_checkin).toISOString().split('T')[0] : null;

    // Streak engine
    if (lastDate !== today) {
      if (!lastDate) {
        newStreak = 1; newMissed = 0;
      } else {
        const diffDays = Math.round((new Date(today) - new Date(lastDate)) / 86400000);
        if (diffDays === 1)      { newStreak += 1; newMissed = 0; }
        else if (diffDays === 2) { newStreak += 1; newMissed = 1; }
        else if (diffDays === 3) { newStreak += 1; newMissed = 2; }
        else                     { newStreak = 1;  newMissed = 0; }
      }
      newLongest = Math.max(newLongest, newStreak);

      // Badge: streak milestones
      if (newStreak >= 7  && !badges.includes('streak_7'))  badges.push('streak_7');
      if (newStreak >= 14 && !badges.includes('streak_14')) badges.push('streak_14');
      if (newStreak >= 30 && !badges.includes('streak_30')) { badges.push('streak_30'); newTokens += 1; }
    }

    // Unlock next day
    if (result.unlocked && parseInt(dayNumber) >= prog.current_day) {
      newCurrentDay = parseInt(dayNumber) + 1;
      if (!badges.includes('first_day') && newCurrentDay >= 2) badges.push('first_day');
      if (!badges.includes('week_1')    && newCurrentDay >= 8) badges.push('week_1');
    }

    await db.query(
      `UPDATE d365_user_progress SET
         current_day = $1, streak = $2, missed_days_in_row = $3,
         longest_streak = $4, tokens = $5, last_checkin = $6,
         badges = $7, updated_at = NOW()
       WHERE user_id = $8`,
      [newCurrentDay, newStreak, newMissed, newLongest, newTokens, today, JSON.stringify(badges), userId]
    );

    res.json({
      ...result,
      newStreak,
      newTokens,
      newCurrentDay,
    });
  } catch (err) {
    console.error('D365 grade error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/d365/streak/checkin — daily check-in without grading
app.post('/api/d365/streak/checkin', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const prog = await getOrCreateProgress(userId);
    res.json({ streak: prog.streak, missedDaysInRow: prog.missed_days_in_row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/d365/cohort/:ageBand — survival curve + percentile
app.get('/api/d365/cohort/:ageBand', async (req, res) => {
  try {
    const ageBand = decodeURIComponent(req.params.ageBand);

    // Get all users who have attempted at least 1 day in this age band
    // (age band is stored per day; we approximate by joining users table classLevel)
    const { rows } = await db.query(`
      SELECT up.user_id, up.current_day, up.streak
      FROM d365_user_progress up
      JOIN users u ON u."studentId" = up.user_id
      WHERE up.current_day > 1
      ORDER BY up.current_day DESC
      LIMIT 500
    `);

    const totalUsers = rows.length;
    const avgDay = totalUsers > 0 ? Math.round(rows.reduce((a, r) => a + r.current_day, 0) / totalUsers) : 0;

    // Build survival curve: for each month checkpoint, how many still going
    const survivalCurve = Array.from({ length: 12 }, (_, i) => {
      const monthStart = Math.round((i / 12) * 365) + 1;
      const stillActive = rows.filter(r => r.current_day >= monthStart).length;
      return {
        month: i + 1,
        remaining: totalUsers > 0 ? Math.round((stillActive / totalUsers) * 100) : 0,
      };
    });

    res.json({ totalUsers, avgDay, survivalCurve, yourPercentile: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/d365/cohort/:ageBand/vienna — top 3 + top 30
app.get('/api/d365/cohort/:ageBand/vienna', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT up.user_id,
             SUBSTRING(up.user_id, 1, 6) AS anon_id,
             up.current_day,
             up.streak,
             up.tokens,
             (up.current_day::float / 365 * 50
              + (up.streak::float / 365) * 20
              + (up.tokens::float / 12) * 20) AS vienna_score
      FROM d365_user_progress up
      ORDER BY vienna_score DESC
      LIMIT 30
    `);
    res.json({
      top3:  rows.slice(0, 3).map(r => ({ anonId: r.anon_id, viennaScore: Math.round(r.vienna_score), day: r.current_day })),
      top30: rows.map(r => ({ anonId: r.anon_id, viennaScore: Math.round(r.vienna_score), day: r.current_day })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── End Diplomat 365 Routes ──────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES — /api/admin/*
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/login — verifies admin username/password, returns token
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'gfadmin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gforce_admin_2026';
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ success: true, token, isAdmin: true });
});

// Middleware: verify admin JWT
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No admin token provided' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}

// GET /api/admin/stats — comprehensive platform stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    // === USERS ===
    const totalUsersRes = await db.query(`SELECT COUNT(*) AS count FROM users`);
    const totalUsers = parseInt(totalUsersRes.rows[0].count);

    const todayIST = getISTDateString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const newTodayRes = await db.query(`SELECT COUNT(*) AS count FROM users WHERE "createdAt"::date = $1::date`, [todayIST]);
    const newWeekRes = await db.query(`SELECT COUNT(*) AS count FROM users WHERE "createdAt" >= $1`, [weekAgo]);
    const newMonthRes = await db.query(`SELECT COUNT(*) AS count FROM users WHERE "createdAt" >= $1`, [monthAgo]);

    // === SUBSCRIPTIONS ===
    const planRes = await db.query(`
      SELECT subscription_plan, subscription_status, subscription_period, COUNT(*) AS count
      FROM users GROUP BY subscription_plan, subscription_status, subscription_period
    `);

    let planCounts = { free: 0, pro: 0, max: 0 };
    let statusCounts = { active: 0, inactive: 0, halted: 0, cancelled: 0 };
    let periodCounts = { monthly: 0, yearly: 0 };
    planRes.rows.forEach(r => {
      const plan = r.subscription_plan || 'free';
      const status = r.subscription_status || 'inactive';
      const period = r.subscription_period || '';
      const cnt = parseInt(r.count);
      if (planCounts[plan] !== undefined) planCounts[plan] += cnt; else planCounts.free += cnt;
      if (status === 'active') statusCounts.active += cnt;
      else if (status === 'halted') statusCounts.halted += cnt;
      else if (status === 'cancelled') statusCounts.cancelled += cnt;
      else statusCounts.inactive += cnt;
      if (period === 'monthly') periodCounts.monthly += cnt;
      else if (period === 'yearly') periodCounts.yearly += cnt;
    });

    // Users by class level
    const byLevelRes = await db.query(`SELECT "classLevel", COUNT(*) AS count FROM users GROUP BY "classLevel" ORDER BY count DESC`);

    // === DEBATES ===
    const debateStatsRes = await db.query(`
      SELECT COUNT(*) AS total, ROUND(AVG(overall_score)::numeric, 1) AS avg_score,
             SUM(total_words) AS total_words
      FROM debates
    `);
    const debateTodayRes = await db.query(`SELECT COUNT(*) AS count FROM debates WHERE created_at >= NOW() - INTERVAL '24 hours'`);
    const debateWeekRes = await db.query(`SELECT COUNT(*) AS count FROM debates WHERE created_at >= NOW() - INTERVAL '7 days'`);
    const debateByLevelRes = await db.query(`
      SELECT class, COUNT(*) AS total, ROUND(AVG(overall_score)::numeric, 1) AS avg_score
      FROM debates GROUP BY class ORDER BY total DESC LIMIT 10
    `);

    // === BOOTCAMP ===
    const bootcampRes = await db.query(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid,
             SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending,
             cohort
      FROM bootcamp_registrations GROUP BY cohort
    `);
    const bootcampByGradeRes = await db.query(`
      SELECT grade, COUNT(*) AS count, SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid
      FROM bootcamp_registrations GROUP BY grade ORDER BY count DESC LIMIT 10
    `);
    const bootcampTotal = bootcampRes.rows.reduce((sum, row) => sum + parseInt(row.total || 0), 0);
    const bootcampPaid = bootcampRes.rows.reduce((sum, row) => sum + parseInt(row.paid || 0), 0);
    const bootcampPending = bootcampRes.rows.reduce((sum, row) => sum + parseInt(row.pending || 0), 0);
    const bootcampRevenue = bootcampPaid * 499;

    // === SCHOOL COUPONS ===
    let schoolCoupons = { total: 0, used: 0, unused: 0, batches: [] };
    try {
      const scRes = await db.query(`
        SELECT school_name, plan, COUNT(*) AS total,
               SUM(CASE WHEN is_used THEN 1 ELSE 0 END) AS used,
               SUM(CASE WHEN NOT is_used THEN 1 ELSE 0 END) AS unused,
               MAX(created_at) AS created_at
        FROM gforce.school_coupons GROUP BY school_name, plan ORDER BY created_at DESC
      `);
      scRes.rows.forEach(r => {
        schoolCoupons.total += parseInt(r.total);
        schoolCoupons.used += parseInt(r.used);
        schoolCoupons.unused += parseInt(r.unused);
      });
      schoolCoupons.batches = scRes.rows.map(r => ({
        school: r.school_name, plan: r.plan,
        total: parseInt(r.total), used: parseInt(r.used), unused: parseInt(r.unused),
        created_at: r.created_at
      }));
    } catch (e) { /* table may not exist yet */ }

    // === GFORCE TOKENS ===
    const tokenRes = await db.query(`SELECT COALESCE(SUM(gforce_tokens),0) AS total FROM debate_users`);

    // === RECENT USERS ===
    const recentUsersRes = await db.query(`
      SELECT users.name, users."studentId", users.email, users.phone, users."classLevel", users.grade,
             users.subscription_plan, users.subscription_status, users."createdAt",
             COALESCE(MAX(sas.score), 0) AS max_speech_score
      FROM users 
      LEFT JOIN speech_analysis_sessions sas ON users."studentId" = sas.student_id
      GROUP BY users.id
      ORDER BY users."createdAt" DESC LIMIT 20
    `);

    // === RECENT SUBSCRIPTIONS ===
    const recentSubsRes = await db.query(`
      SELECT name, "studentId", email, subscription_plan, subscription_period,
             subscription_status, razorpay_subscription_id, "createdAt"
      FROM users WHERE subscription_plan != 'free' AND subscription_plan IS NOT NULL
      ORDER BY "createdAt" DESC LIMIT 20
    `);

    // === TOP DEBATES ===
    const topDebatesRes = await db.query(`
      SELECT d.user_id, u.name, d.motion, d.overall_score, d.class, d.created_at
      FROM debates d LEFT JOIN users u ON u."studentId" = d.user_id
      ORDER BY d.created_at DESC LIMIT 15
    `);

    // === FUTUREQUEST ===
    let futureQuestTotal = 0;
    try {
      const fqRes = await db.query(`SELECT COUNT(*) AS total FROM gforce.future_quest_registrations`);
      futureQuestTotal = parseInt(fqRes.rows[0].total);
    } catch (e) { /* table might not exist yet */ }

    // === QUIZ REGISTRATIONS ===
    let quizTotal = 0;
    try {
      const qRes = await db.query(`SELECT COUNT(*) AS total FROM quiz_registrations`);
      quizTotal = parseInt(qRes.rows[0].total);
    } catch (e) { /* table might not exist */ }

    // === INDUS MUN ===
    let indusMunTotal = 0;
    try {
      const imRes = await db.query(`SELECT COUNT(*) AS total FROM indus_mun_registrations`);
      indusMunTotal = parseInt(imRes.rows[0].total);
    } catch (e) { /* table might not exist */ }

    res.json({
      users: {
        total: totalUsers,
        newToday: parseInt(newTodayRes.rows[0].count),
        newThisWeek: parseInt(newWeekRes.rows[0].count),
        newThisMonth: parseInt(newMonthRes.rows[0].count),
        byLevel: byLevelRes.rows,
      },
      subscriptions: {
        byPlan: planCounts,
        byStatus: statusCounts,
        byPeriod: periodCounts,
      },
      debates: {
        total: parseInt(debateStatsRes.rows[0]?.total || 0),
        avgScore: parseFloat(debateStatsRes.rows[0]?.avg_score || 0),
        totalWords: parseInt(debateStatsRes.rows[0]?.total_words || 0),
        today: parseInt(debateTodayRes.rows[0].count),
        thisWeek: parseInt(debateWeekRes.rows[0].count),
        byLevel: debateByLevelRes.rows,
      },
      bootcamp: {
        total: bootcampTotal,
        paid: bootcampPaid,
        pending: bootcampPending,
        revenue: bootcampRevenue,
        byGrade: bootcampByGradeRes.rows,
        cohorts: bootcampRes.rows,
      },
      schoolCoupons,
      gforceTokensIssued: Math.round(parseFloat(tokenRes.rows[0]?.total || 0)),
      quizRegistrations: quizTotal,
      futureQuestRegistrations: futureQuestTotal,
      indusMunRegistrations: indusMunTotal,
      recentUsers: recentUsersRes.rows,
      recentSubscriptions: recentSubsRes.rows,
      recentDebates: topDebatesRes.rows,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — paginated user list with search + filter
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const planFilter = req.query.plan || null;
    const gradeFilter = req.query.grade || null;
    const speechOnly = req.query.speechOnly === 'true';

    let conditions = [];
    let params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(LOWER(users.name) LIKE LOWER($${idx}) OR LOWER(users."studentId") LIKE LOWER($${idx}) OR LOWER(COALESCE(users.email,'')) LIKE LOWER($${idx}))`);
      params.push(search); idx++;
    }
    if (planFilter && planFilter !== 'all') {
      conditions.push(`users.subscription_plan = $${idx}`);
      params.push(planFilter); idx++;
    }
    if (gradeFilter && gradeFilter !== 'all') {
      conditions.push(`users.grade = $${idx}`);
      params.push(gradeFilter); idx++;
    }
    if (speechOnly) {
      conditions.push(`sas.score IS NOT NULL AND sas.score > 0`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(DISTINCT users.id) AS count FROM users LEFT JOIN speech_analysis_sessions sas ON users."studentId" = sas.student_id ${where}`, params);
    const usersRes = await db.query(
      `SELECT users.name, users."studentId", users.email, users.phone, users."classLevel", users.grade,
              users.subscription_plan, users.subscription_period, users.subscription_status, users."createdAt",
              COALESCE(MAX(sas.score), 0) AS max_speech_score,
              MAX(sas.created_at) AS speech_date
       FROM users 
       LEFT JOIN speech_analysis_sessions sas ON users."studentId" = sas.student_id
       ${where} 
       GROUP BY users.id
       ORDER BY ${speechOnly ? 'max_speech_score DESC' : 'users."createdAt" DESC'} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      total: parseInt(countRes.rows[0].count),
      page,
      limit,
      users: usersRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/olympiad/schools — fetch all schools (pending and approved)
app.get('/api/admin/olympiad/schools', requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT id, name, principal_name, coordinator_name, contact_email, contact_phone, 
             school_code, coordinator_login_id, expected_students, classes_participating, 
             status, created_at 
      FROM schools 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// POST /api/admin/olympiad/schools/:id/approve
app.post('/api/admin/olympiad/schools/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`UPDATE schools SET status = 'approved' WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'School not found' });
    
    // In a real production system we would send an email here with the school_code and coordinator_login_id
    // using nodemailer or SendGrid.
    
    res.json({ success: true, school: result.rows[0] });
  } catch (err) {
    console.error('Error approving school:', err);
    res.status(500).json({ error: 'Failed to approve school' });
  }
});

// POST /api/admin/olympiad/schools/:id/reject
app.post('/api/admin/olympiad/schools/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`UPDATE schools SET status = 'rejected' WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'School not found' });
    res.json({ success: true, school: result.rows[0] });
  } catch (err) {
    console.error('Error rejecting school:', err);
    res.status(500).json({ error: 'Failed to reject school' });
  }
});

// POST /api/admin/olympiad/schools/:id/remove
app.post('/api/admin/olympiad/schools/:id/remove', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM schools WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'School not found' });
    res.json({ success: true, school: result.rows[0] });
  } catch (err) {
    console.error('Error removing school:', err);
    res.status(500).json({ error: 'Failed to remove school' });
  }
});

// GET /api/admin/bootcamp — paginated bootcamp registrations
app.get('/api/admin/bootcamp', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    const cohortFilter = req.query.cohort || 'all';

    let conditions = [];
    let params = [];
    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`payment_status = $${params.length}`);
    }
    if (cohortFilter !== 'all') {
      params.push(cohortFilter);
      conditions.push(`cohort = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`
      SELECT COUNT(*) AS count,
             SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid,
             SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM bootcamp_registrations ${where}
    `, params);
    
    const gradeRes = await db.query(`
      SELECT grade, COUNT(*) AS count, SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid
      FROM bootcamp_registrations ${where} GROUP BY grade ORDER BY count DESC LIMIT 10
    `, params);
    const rows = await db.query(
      `SELECT br.id, br.student_id, br.name, br.email, br.phone, br.school, br.grade, br.city, br.category,
              br.payment_status, br.razorpay_payment_id, br.amount, br.registered_at,
              COALESCE(MAX(sas.score), 0) AS max_speech_score
       FROM bootcamp_registrations br
       LEFT JOIN users u ON u.email = br.email OR u."studentId" = br.student_id
       LEFT JOIN speech_analysis_sessions sas ON sas.student_id = u."studentId"
       ${where}
       GROUP BY br.id
       ORDER BY br.registered_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const statsTotal = parseInt(countRes.rows[0].count || 0);
    const statsPaid = parseInt(countRes.rows[0].paid || 0);
    const statsPending = parseInt(countRes.rows[0].pending || 0);

    res.json({
      stats: {
        total: statsTotal,
        paid: statsPaid,
        pending: statsPending,
        revenue: statsPaid * 499,
        byGrade: gradeRes.rows
      },
      total: statsTotal,
      page,
      limit,
      registrations: rows.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;


// ══════════════════════════════════════════════════════════════════════════════
// MUN 30-DAY ROUTES  — /api/mun30/*
// ══════════════════════════════════════════════════════════════════════════════

const mun30Days = (() => {
  try {
    const p = require('path').join(__dirname, 'data', 'mun30-days.json');
    return require(p);
  } catch { return []; }
})();

// GET /api/mun30/day/:n — one curriculum day
app.get('/api/mun30/day/:n', (req, res) => {
  const n = parseInt(req.params.n, 10);
  const day = mun30Days.find(d => d.dayNumber === n);
  if (!day) return res.status(404).json({ error: 'Day not found' });
  res.json(day);
});

// GET /api/mun30/progress/:userId
app.get('/api/mun30/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const r = await db.query(
      'SELECT * FROM mun30_user_progress WHERE user_id=$1', [userId]
    );
    if (!r.rows.length) {
      await db.query(
        'INSERT INTO mun30_user_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]
      );
      return res.json({ userId, currentDay: 1, streak: 0, tokens: 0, badges: [] });
    }
    const row = r.rows[0];
    res.json({ userId, currentDay: row.current_day, streak: row.streak, tokens: row.tokens, badges: row.badges });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/mun30/submit — grade submission + unlock
app.post('/api/mun30/submit', async (req, res) => {
  try {
    const { userId, dayNumber, submission } = req.body;
    if (!userId || !dayNumber || !submission) return res.status(400).json({ error: 'Missing fields' });

    const day = mun30Days.find(d => d.dayNumber === parseInt(dayNumber, 10));
    const { gradeSubmission: gradeMUN } = require('./diplomat365-grader');

    // Map MUN30 phase to slot type for the grader
    const phaseToSlot = { 1: 'Concept Day', 2: 'Drill Day', 3: 'Debate Day', 4: 'Assessment Day' };
    const phase = day?.phase || 1;
    const slot = phaseToSlot[phase] || 'Concept Day';

    const result = gradeMUN(submission, { dayNumber: parseInt(dayNumber, 10), slot });

    // Save attempt
    await db.query(
      'INSERT INTO mun30_attempts (user_id, day_number, submission, stars, total_score, feedback, unlocked_next) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [userId, dayNumber, submission, result.stars, result.totalScore, result.feedback, result.unlocked]
    );

    // Update progress if unlocked
    if (result.unlocked) {
      const next = parseInt(dayNumber, 10) + 1;
      await db.query(`
        INSERT INTO mun30_user_progress (user_id, current_day, streak, last_checkin, updated_at)
        VALUES ($1, $2, 1, CURRENT_DATE, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          current_day  = GREATEST(mun30_user_progress.current_day, $2),
          streak       = CASE WHEN mun30_user_progress.last_checkin = CURRENT_DATE - 1 THEN mun30_user_progress.streak + 1 ELSE 1 END,
          last_checkin = CURRENT_DATE,
          updated_at   = NOW()
      `, [userId, next]);
    }

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// ──────────────────────────────────────────────────────────────────────────────
// BOOTCAMP — G-Talk Cohort 1 Registration API
// ──────────────────────────────────────────────────────────────────────────────

// Ensure bootcamp_registrations table exists
async function ensureBootcampTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS bootcamp_registrations (
      id SERIAL PRIMARY KEY,
      student_id TEXT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      school TEXT,
      grade TEXT,
      city TEXT,
      category TEXT,
      achievements TEXT,
      hear_about TEXT,
      questions TEXT,
      cohort TEXT DEFAULT 'cohort-1',
      payment_status TEXT DEFAULT 'pending',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      amount INTEGER DEFAULT 49900,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add new columns if table already existed without them
  const cols = ['city TEXT', 'category TEXT', 'achievements TEXT', 'hear_about TEXT', 'questions TEXT'];
  for (const col of cols) {
    const colName = col.split(' ')[0];
    await db.query(`ALTER TABLE bootcamp_registrations ADD COLUMN IF NOT EXISTS ${col}`).catch(() => {});
  }
}
ensureBootcampTable().catch(console.error);

// POST /api/bootcamp/register — Create Razorpay order + save pending registration
app.post('/api/bootcamp/register', async (req, res) => {
  try {
    const { studentId, name, email, phone, school, grade, city, category, achievements, hearAbout, questions, cohort = 'cohort-1' } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    // Check if already paid for this phone number
    const existing = await db.query(
      `SELECT id, payment_status FROM bootcamp_registrations WHERE phone = $1 AND cohort = $2 AND payment_status = 'paid'`,
      [phone, cohort]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'This phone number has already registered for Cohort 1.' });
    }

    const amountPaise = 49900; // ₹499 in paise

    // Create Razorpay Order
    const order = await razorpayInstance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `bootcamp_${Date.now()}`,
      notes: { programme: 'G-Talk ' + cohort, studentId: studentId || '', name, phone, school: school || '', grade: grade || '', city: city || '', category: category || '' },
    });

    // Save pending registration with all fields
    const insertRes = await db.query(
      `INSERT INTO bootcamp_registrations
         (student_id, name, email, phone, school, grade, city, category, achievements, hear_about, questions, razorpay_order_id, amount, cohort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [
        studentId || '', name, email || null, phone,
        school || '', grade || '', city || '', category || '',
        achievements || '', hearAbout || '', questions || '',
        order.id, amountPaise, cohort
      ]
    );

    res.json({ success: true, orderId: order.id, amount: amountPaise, registrationId: insertRes.rows[0].id });
  } catch (err) {
    console.error('Bootcamp register error:', err);
    const msg = err.error?.description || err.message || 'Internal Server Error';
    res.status(500).json({ error: msg });
  }
});

// POST /api/bootcamp/verify-payment — Verify Razorpay signature + mark as paid
app.post('/api/bootcamp/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    await db.query(
      `UPDATE bootcamp_registrations SET payment_status = 'paid', razorpay_payment_id = $1 WHERE id = $2`,
      [razorpay_payment_id, registrationId]
    );

    res.json({ success: true, message: 'Registration confirmed! Welcome to G-Talk Cohort 1.' });
  } catch (err) {
    console.error('Bootcamp verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bootcamp/registrations — Admin: list all registrations
app.get('/api/bootcamp/registrations', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, student_id, name, email, phone, school, grade, city, category,
              achievements, hear_about, questions, cohort, payment_status,
              razorpay_order_id, razorpay_payment_id, amount, registered_at
       FROM bootcamp_registrations
       ORDER BY registered_at DESC`
    );
    const paid = result.rows.filter(r => r.payment_status === 'paid').length;
    res.json({ total: result.rows.length, paid, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ══════════════════════════════════════════════════════════════════════════════
// UN QUIZ CONTEST ROUTES
// ══════════════════════════════════════════════════════════════════════════════

async function ensureQuizRegistrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS quiz_registrations (
      id SERIAL PRIMARY KEY,
      student_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      class_grade TEXT NOT NULL,
      school_name TEXT NOT NULL,
      city TEXT,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// POST /api/quiz/register
app.post('/api/quiz/register', async (req, res) => {
  try {
    const { studentId, fullName, email, mobile, classGrade, schoolName, city } = req.body;
    if (!fullName || !email || !mobile || !classGrade || !schoolName) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    await ensureQuizRegistrationsTable();
    if (studentId) {
      const dup = await db.query(`SELECT id FROM quiz_registrations WHERE student_id = $1`, [studentId]);
      if (dup.rows.length > 0) {
        return res.status(409).json({ error: 'already_registered', message: 'You have already registered for the UN Quiz Contest.' });
      }
    }
    const emailDup = await db.query(`SELECT id FROM quiz_registrations WHERE email = $1`, [email]);
    if (emailDup.rows.length > 0) {
      return res.status(409).json({ error: 'already_registered', message: 'This email is already registered for the UN Quiz Contest.' });
    }
    const result = await db.query(
      `INSERT INTO quiz_registrations (student_id, full_name, email, mobile, class_grade, school_name, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, registered_at`,
      [studentId || null, fullName, email, mobile, classGrade, schoolName, city || '']
    );
    res.json({ success: true, registrationId: result.rows[0].id, registeredAt: result.rows[0].registered_at });
  } catch (err) {
    console.error('Quiz register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/registrations — Admin
app.get('/api/quiz/registrations', requireAdmin, async (req, res) => {
  try {
    await ensureQuizRegistrationsTable();
    const result = await db.query(
      `SELECT id, student_id, full_name, email, mobile, class_grade, school_name, city, registered_at
       FROM quiz_registrations ORDER BY registered_at DESC`
    );
    res.json({ total: result.rows.length, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// INTERNATIONAL TEACHERS' OLYMPIAD (ITO) REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

async function ensureITORegistrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ito_registrations (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      school_name TEXT NOT NULL,
      city TEXT,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add subject_or_role if it doesn't exist
  await db.query(`
    ALTER TABLE ito_registrations
    ADD COLUMN IF NOT EXISTS subject_or_role TEXT
  `).catch(err => console.log('ALTER subject_or_role skipped or error:', err.message));
}

// POST /api/ito/register
app.post('/api/ito/register', async (req, res) => {
  try {
    const { userId, fullName, email, mobile, subjectOrRole, schoolName, city } = req.body;
    if (!fullName || !email || !mobile || !subjectOrRole || !schoolName) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    await ensureITORegistrationsTable();
    
    const emailDup = await db.query(`SELECT id FROM ito_registrations WHERE email = $1`, [email]);
    if (emailDup.rows.length > 0) {
      return res.status(409).json({ error: 'already_registered', message: 'This email is already registered for the International Teachers Olympiad.' });
    }
    const result = await db.query(
      `INSERT INTO ito_registrations (user_id, full_name, email, mobile, subject_or_role, school_name, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, registered_at`,
      [userId || null, fullName, email, mobile, subjectOrRole, schoolName, city || '']
    );
    res.json({ success: true, registrationId: result.rows[0].id, registeredAt: result.rows[0].registered_at });
  } catch (err) {
    console.error('ITO register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ito/registrations — Admin
app.get('/api/ito/registrations', requireAdmin, async (req, res) => {
  try {
    await ensureITORegistrationsTable();
    const result = await db.query(
      `SELECT id, user_id, full_name, email, mobile, subject_or_role, school_name, city, registered_at
       FROM ito_registrations ORDER BY registered_at DESC`
    );
    res.json({ total: result.rows.length, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/futurequest/register
app.post('/api/futurequest/register', async (req, res) => {
  try {
    const { userId, fullName, email, mobile, gradeOrRole, schoolName, city } = req.body;
    if (!fullName || !email || !mobile || !gradeOrRole || !schoolName || !city) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    
    // Create table if not exists (defensive)
    await db.query(`
      CREATE TABLE IF NOT EXISTS gforce.future_quest_registrations (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        full_name TEXT,
        email TEXT,
        mobile TEXT,
        grade_or_role TEXT,
        school_name TEXT,
        city TEXT,
        registered_at TIMESTAMPTZ DEFAULT NOW()
      );
    `).catch(console.error);

    const emailDup = await db.query(`SELECT id FROM gforce.future_quest_registrations WHERE email = $1`, [email]);
    if (emailDup.rows.length > 0) {
      return res.status(409).json({ error: 'already_registered', message: 'This email is already registered for FutureQuest.' });
    }

    const result = await db.query(
      `INSERT INTO gforce.future_quest_registrations (user_id, full_name, email, mobile, grade_or_role, school_name, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, registered_at`,
      [userId || null, fullName, email, mobile, gradeOrRole, schoolName, city]
    );
    res.json({ success: true, registrationId: result.rows[0].id, registeredAt: result.rows[0].registered_at });
  } catch (err) {
    console.error('FutureQuest register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/futurequest/registrations — Admin
app.get('/api/futurequest/registrations', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, full_name, email, mobile, grade_or_role, school_name, city, registered_at
       FROM gforce.future_quest_registrations ORDER BY registered_at DESC`
    );
    res.json({ total: result.rows.length, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET /api/quiz/certificate-status/:email
app.get('/api/quiz/certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'quiz_certificates.json');
    if (!fs.existsSync(certPath)) {
       return res.status(404).json({ error: 'Certificates data not found.' });
    }
    const data = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    const student = data.find(s => s.email === email);
    
    if (!student) {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
    
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freedom-quiz/certificate-status/:email
app.get('/api/freedom-quiz/certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'freedom_quiz_certificates.json');
    if (!fs.existsSync(certPath)) {
      return res.status(500).json({ error: 'Certificate database not found.' });
    }
    const certData = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    
    if (certData[email]) {
      return res.json({ success: true, student: certData[email] });
    } else {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/minimun/certificate-status/:email
app.get('/api/minimun/certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'minimun_mod1_certificates.json');
    if (!fs.existsSync(certPath)) {
      return res.status(500).json({ error: 'Certificate database not found.' });
    }
    const certData = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    
    if (certData[email]) {
      return res.json({ success: true, student: certData[email] });
    } else {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/minimun/mod2-certificate-status/:email
app.get('/api/minimun/mod2-certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'minimun_mod2_certificates.json');
    if (!fs.existsSync(certPath)) {
      return res.status(500).json({ error: 'Certificate database not found.' });
    }
    const certData = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    
    if (certData[email]) {
      return res.json({ success: true, student: certData[email] });
    } else {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/minimun/mod3-certificate-status/:email
app.get('/api/minimun/mod3-certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'minimun_mod3_certificates.json');
    if (!fs.existsSync(certPath)) {
      return res.status(500).json({ error: 'Certificate database not found.' });
    }
    const certData = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    
    if (certData[email]) {
      return res.json({ success: true, student: certData[email] });
    } else {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/minimun/mod4-certificate-status/:email
app.get('/api/minimun/mod4-certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'minimun_mod4_certificates.json');
    if (!fs.existsSync(certPath)) {
      return res.status(500).json({ error: 'Certificate database not found.' });
    }
    const certData = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    
    if (certData[email]) {
      return res.json({ success: true, student: certData[email] });
    } else {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ito/certificate-status/:email
app.get('/api/ito/certificate-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const certPath = path.join(__dirname, 'teachers_challenge_certificates.json');
    if (!fs.existsSync(certPath)) {
      return res.status(500).json({ error: 'Certificate database not found.' });
    }
    const certData = JSON.parse(fs.readFileSync(certPath, 'utf8'));
    
    if (certData[email]) {
      return res.json({ success: true, student: certData[email] });
    } else {
      return res.status(404).json({ error: 'No certificate found for this email address. Please make sure you are using the exact email you registered with.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- MUN Mentor Master Class Registrations ---

async function ensureMunMentorRegistrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS mun_mentor_registrations (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      school_name TEXT NOT NULL,
      city TEXT,
      role TEXT NOT NULL,
      experience_years TEXT,
      reason TEXT,
      hear_about TEXT,
      payment_status TEXT DEFAULT 'pending',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      amount INTEGER DEFAULT 99900,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add new columns if table already existed without them
  const cols = ['experience_years TEXT', 'reason TEXT', 'hear_about TEXT', 'payment_status TEXT DEFAULT \'pending\'', 'razorpay_order_id TEXT', 'razorpay_payment_id TEXT', 'amount INTEGER DEFAULT 99900'];
  for (const col of cols) {
    const colName = col.split(' ')[0];
    await db.query(`ALTER TABLE mun_mentor_registrations ADD COLUMN IF NOT EXISTS ${col}`).catch(() => {});
  }
}
ensureMunMentorRegistrationsTable().catch(console.error);

// POST /api/munmentor/register
app.post('/api/munmentor/register', async (req, res) => {
  try {
    const { userId, fullName, email, mobile, schoolName, city, role, experience, reason, hearAbout } = req.body;
    if (!fullName || !email || !mobile || !schoolName || !role) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    await ensureMunMentorRegistrationsTable();
    
    // Check if already registered for this email
    const emailDup = await db.query(
      `SELECT id FROM mun_mentor_registrations WHERE email = $1`, 
      [email]
    );
    if (emailDup.rows.length > 0) {
      return res.status(409).json({ error: 'already_registered', message: 'This email is already registered.' });
    }

    const amountPaise = 0; // Free

    const result = await db.query(
      `INSERT INTO mun_mentor_registrations 
        (user_id, full_name, email, mobile, school_name, city, role, experience_years, reason, hear_about, razorpay_order_id, amount, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'free') RETURNING id, registered_at`,
      [
        userId || null, fullName, email, mobile, schoolName, city || '', role,
        experience || '', reason || '', hearAbout || '', 'free_registration', amountPaise
      ]
    );
    res.json({ success: true, amount: amountPaise, registrationId: result.rows[0].id });
  } catch (err) {
    console.error('MUN Mentor register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/munmentor/verify-payment
app.post('/api/munmentor/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    await db.query(
      `UPDATE mun_mentor_registrations SET payment_status = 'paid', razorpay_payment_id = $1 WHERE id = $2`,
      [razorpay_payment_id, registrationId]
    );

    res.json({ success: true, message: 'Registration confirmed! Welcome to the MUN Mentor Master Class.' });
  } catch (err) {
    console.error('MUN Mentor verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/munmentor/registrations — Admin
app.get('/api/munmentor/registrations', requireAdmin, async (req, res) => {
  try {
    await ensureMunMentorRegistrationsTable();
    const result = await db.query(
      `SELECT mmr.id, mmr.user_id, mmr.full_name, mmr.email, mmr.mobile, mmr.school_name, mmr.city, mmr.role, 
              mmr.experience_years, mmr.reason, mmr.hear_about, mmr.payment_status, mmr.razorpay_payment_id, mmr.amount, mmr.registered_at,
              COALESCE(MAX(sas.score), 0) AS max_speech_score
       FROM mun_mentor_registrations mmr
       LEFT JOIN users u ON u.id::text = mmr.user_id OR u.email = mmr.email
       LEFT JOIN speech_analysis_sessions sas ON sas.student_id = u."studentId"
       GROUP BY mmr.id
       ORDER BY mmr.registered_at DESC`
    );
    res.json({ total: result.rows.length, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/minimun/register
app.post('/api/minimun/register', async (req, res) => {
  try {
    const { userId, studentName, email, mobile, schoolName, category, grade, city, module } = req.body;
    if (!studentName || !email || !mobile || !schoolName || !grade || !category || !city) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    

    const amountPaise = 9900; // ₹99 in paise

    await db.query(`ALTER TABLE mini_mun_registrations ADD COLUMN IF NOT EXISTS module INTEGER DEFAULT 1`).catch(console.error);
    await db.query(`ALTER TABLE mini_mun_registrations ADD COLUMN IF NOT EXISTS category VARCHAR(100)`).catch(console.error);

    const targetModule = module || 3;

    const emailDup = await db.query(
      `SELECT id FROM mini_mun_registrations WHERE email = $1 AND payment_status = 'paid' AND module = $2`,
      [email, targetModule]
    );
    if (emailDup.rows.length > 0) {
      return res.status(409).json({ error: 'already_registered', message: 'This email is already registered.' });
    }

    const order = await razorpayInstance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `minimun_${Date.now()}`,
      notes: { programme: `Mini MUN Master Class Module-${targetModule}`, userId: userId || '', studentName, mobile, school: schoolName || '' },
    });

    const result = await db.query(
      `INSERT INTO mini_mun_registrations 
        (user_id, student_name, email, mobile, school_name, category, grade, city, razorpay_order_id, amount, module)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, registered_at`,
      [userId || null, studentName, email, mobile, schoolName, category, grade, city, order.id, amountPaise, targetModule]
    );
    res.json({ success: true, orderId: order.id, amount: amountPaise, registrationId: result.rows[0].id });
  } catch (err) {
    console.error('Mini MUN register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/minimun/verify-payment
app.post('/api/minimun/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const regRes = await db.query(
      `UPDATE mini_mun_registrations SET payment_status = 'paid', razorpay_payment_id = $1 WHERE id = $2 RETURNING user_id`,
      [razorpay_payment_id, registrationId]
    );

    const userId = regRes.rows[0]?.user_id;
    if (userId) {
      await db.query(`
        CREATE TABLE IF NOT EXISTS topup_credits (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          bonus_seconds INTEGER NOT NULL,
          effect_date TEXT NOT NULL,
          source TEXT DEFAULT 'payment',
          razorpay_payment_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
        )
      `);
      
      const effectDate = new Date().toISOString().slice(0, 10);
      await db.query(`
        INSERT INTO topup_credits (user_id, bonus_seconds, effect_date, source, razorpay_payment_id)
        VALUES ($1, 1800, $2, 'minimun', $3)
      `, [userId, effectDate, razorpay_payment_id]);
    }

    res.json({ success: true, message: 'Registration confirmed! Welcome to Mini MUN Sunday.' });
  } catch (err) {
    console.error('Mini MUN verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/minimun/status/:email
app.get('/api/minimun/status/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const result = await db.query(
      `SELECT id FROM mini_mun_registrations 
       WHERE email = $1 AND payment_status = 'paid' 
       AND module = 3`,
      [email]
    );
    res.json({ registered: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/minimun/registrations — Admin
app.get('/api/minimun/registrations', requireAdmin, async (req, res) => {
  try {
    await db.query(`ALTER TABLE mini_mun_registrations ADD COLUMN IF NOT EXISTS module INTEGER DEFAULT 1`).catch(console.error);
    const result = await db.query(
      `SELECT mmr.id, mmr.user_id, mmr.student_name, mmr.email, mmr.mobile, mmr.school_name, mmr.category, mmr.grade, mmr.city, 
              mmr.payment_status, mmr.razorpay_payment_id, mmr.amount, mmr.registered_at, mmr.module,
              COALESCE(MAX(sas.score), 0) AS max_speech_score
       FROM mini_mun_registrations mmr
       LEFT JOIN users u ON u.id::text = mmr.user_id OR u.email = mmr.email
       LEFT JOIN speech_analysis_sessions sas ON sas.student_id = u."studentId"
       GROUP BY mmr.id
       ORDER BY mmr.registered_at DESC`
    );
    res.json({ total: result.rows.length, registrations: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// OLYMPIAD FEATURE ROUTES
// ==========================================

// 1. School Registration
app.post('/api/olympiad/school/register', async (req, res) => {
  try {
    const { name, principal_name, coordinator_name, contact_email, contact_phone, expected_students, classes_participating } = req.body;
    
    if (!name || !contact_email) {
      return res.status(400).json({ error: 'School name and contact email are required' });
    }

    // Generate unique school code
    const school_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const coordinator_login_id = `COORD-${school_code}`;

    const result = await db.query(
      `INSERT INTO schools (name, principal_name, coordinator_name, contact_email, contact_phone, school_code, coordinator_login_id, expected_students, classes_participating, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING id`,
      [name, principal_name, coordinator_name, contact_email, contact_phone, school_code, coordinator_login_id, expected_students || 0, classes_participating || '']
    );

    res.json({ 
      success: true, 
      message: 'Your registration has been submitted. Our team will verify your school and email the school code and coordinator login ID to your contact email within 24 hours.'
    });
  } catch (err) {
    console.error('Olympiad school registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Student Registration for Olympiad
// ==========================================
// THINQUEST OLYMPIAD - VERIFY SCHOOL CODE
// ==========================================
app.post('/api/olympiad/verify-school', async (req, res) => {
  try {
    const { school_code } = req.body;
    if (!school_code) {
      return res.status(400).json({ error: 'School code is required.' });
    }

    const schoolRes = await db.query(`SELECT id, name FROM schools WHERE school_code = $1`, [school_code]);
    if (schoolRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid School Code' });
    }
    
    res.json({ success: true, school: schoolRes.rows[0] });
  } catch (err) {
    console.error('Olympiad school verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// THINQUEST OLYMPIAD - EXISTING USER ENROLLMENT
// ==========================================
app.post('/api/olympiad/enroll', async (req, res) => {
  try {
    const { email, school_code, name, classLevel, age, parentName, parentPhone, city, state, contactEmail, subjects } = req.body;
    if (!email || !school_code) {
      return res.status(400).json({ error: 'Email and school code are required.' });
    }

    // Verify school code
    let school_id = null;
    let school_name = 'Independent Participant';
    
    if (school_code !== 'INDIVIDUAL') {
      const schoolRes = await db.query(`SELECT id, name FROM schools WHERE school_code = $1`, [school_code]);
      if (schoolRes.rows.length === 0) {
        return res.status(404).json({ error: 'Invalid School Code' });
      }
      school_id = schoolRes.rows[0].id;
      school_name = schoolRes.rows[0].name;
    }

    // Ensure columns exist (fallback if DB init didn't run)
    try {
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255)`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(50)`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects TEXT`);
    } catch (e) {
      // Ignore if fails
    }

    // Update user
    const updateRes = await db.query(
      `UPDATE users 
       SET school_id = $1, 
           olympiad_registered = true,
           name = COALESCE($3, name),
           "classLevel" = COALESCE($4, "classLevel"),
           age = COALESCE($5::INTEGER, age),
           parent_name = COALESCE($6, parent_name),
           parent_phone = COALESCE($7, parent_phone),
           city = COALESCE($8, city),
           state = COALESCE($9, state),
           contact_email = COALESCE($10, contact_email),
           subjects = COALESCE($11, subjects)
       WHERE email = $2 RETURNING id`,
      [school_id, email, name || null, classLevel || null, age || null, parentName || null, parentPhone || null, city || null, state || null, contactEmail || null, subjects || null]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      schoolName: school_name,
      message: `Successfully enrolled in ${school_name}!` 
    });

  } catch (err) {
    console.error('Olympiad enrollment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/olympiad/individual/register
app.post('/api/olympiad/individual/register', async (req, res) => {
  try {
    const { email, name, classLevel, city, parentPhone, parentName, category } = req.body;
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS thinkquest_individuals (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255),
          mobile VARCHAR(50),
          category VARCHAR(100),
          grade VARCHAR(100),
          school_name VARCHAR(255),
          city VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(
      `INSERT INTO thinkquest_individuals (name, email, mobile, category, grade, school_name, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, email, parentPhone, category, classLevel, parentName, city]
    );

    res.json({ success: true, message: 'Successfully registered as an independent participant.' });
  } catch (err) {
    console.error('Individual register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/olympiad/independent-students — list all individually registered ThinkQuest students
app.get('/api/admin/olympiad/independent-students', requireAdmin, async (req, res) => {
  try {
    // Individual participants enrolled via 'INDIVIDUAL' school_code → school_id is NULL, olympiad_registered = true
    const result = await db.query(
      `SELECT id, name, email, "classLevel", city, state, parent_name, parent_phone, contact_email, subjects, "createdAt" as created_at
       FROM users
       WHERE olympiad_registered = true AND (school_id IS NULL) AND COALESCE("classLevel", '') NOT ILIKE '%teacher%'
       ORDER BY "createdAt" DESC`
    );
    res.json({ students: result.rows });
  } catch (err) {
    console.error('Error fetching independent students:', err);
    res.status(500).json({ error: 'Failed to fetch independent students' });
  }
});

// DELETE /api/admin/olympiad/independent-students/:id — remove an independent registration (reset flag)
app.delete('/api/admin/olympiad/independent-students/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE users SET olympiad_registered = false, school_id = NULL WHERE id = $1 AND school_id IS NULL RETURNING id, name`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing independent student:', err);
    res.status(500).json({ error: 'Failed to remove registration' });
  }
});

// ==========================================
// COORDINATOR DASHBOARD
// ==========================================
app.get('/api/coordinator/dashboard/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;

    // Verify coordinator and get school details
    const schoolRes = await db.query(
      `SELECT id, name as school, expected_students FROM schools WHERE coordinator_login_id = $1`,
      [coordinatorId]
    );

    if (schoolRes.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const school = schoolRes.rows[0];

    // Fetch students linked to this school (plain_password for coordinator-created accounts)
    const studentsRes = await db.query(
      `SELECT id, name, "studentId" as username, COALESCE(plain_password, password) as password, "classLevel" as class, email, olympiad_registered, age, parent_name, parent_phone, city, state, contact_email, subjects
       FROM users 
       WHERE school_id = $1 AND role = 'student'`,
      [school.id]
    );

    let totalRegistrations = studentsRes.rows.length;
    let olympiadCompleted = 0;
    let totalPracticeCount = 0;

    // We will enrich each student with their status, daily practice, and exam score
    const enrichedStudents = [];

    for (let student of studentsRes.rows) {
      // Get exam score
      const examRes = await db.query(
        `SELECT total_score as final_score, created_at FROM olympiad_exam_submissions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [student.id.toString()]
      );
      
      const hasTakenExam = examRes.rows.length > 0;
      const examScore = hasTakenExam ? examRes.rows[0].final_score : 'N/A';
      
      if (hasTakenExam) {
        olympiadCompleted++;
      }

      // Get practice stats
      const practiceRes = await db.query(
        `SELECT COUNT(*) as practice_count, AVG(score) as avg_score FROM olympiad_practice_logs WHERE student_id = $1`,
        [student.id.toString()]
      );
      const practiceCount = parseInt(practiceRes.rows[0].practice_count || '0');
      const avgScore = parseFloat(practiceRes.rows[0].avg_score || '0');
      totalPracticeCount += practiceCount;

      // Get quiz results
      let quizResults = [];
      try {
        await ensureQuizTable();
        const quizRes = await db.query(
          `SELECT quiz_name, subject, score, total, percentage, attempted_at FROM olympiad_quiz_results WHERE user_email=$1 ORDER BY attempted_at DESC`,
          [student.contact_email || student.email || '']
        );
        quizResults = quizRes.rows;
      } catch(e) { /* quiz table may not exist yet */ }

      let status = 'Registered';
      if (hasTakenExam) {
        status = 'Completed';
      } else if (practiceCount > 0 || quizResults.length > 0) {
        status = 'In Progress';
      } else if (!student.olympiad_registered) {
        status = 'Pending';
      }

      enrichedStudents.push({
        id: student.id,
        name: student.name,
        username: student.username,
        password: student.password,
        class: student.class || 'Unknown',
        age: student.age,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        contact_email: student.contact_email,
        city: student.city,
        state: student.state,
        subjects: student.subjects,
        status: status,
        dailyPractice: practiceCount,
        avg_score: avgScore,
        examScore: examScore,
        quizResults: quizResults
      });
    }

    const avgDailyEngagement = totalRegistrations > 0 
      ? Math.round((totalPracticeCount / totalRegistrations) * 10) 
      : 0;

    res.json({
      school: school.school,
      totalRegistrations: totalRegistrations,
      expectedRegistrations: school.expected_students || 0,
      olympiadCompleted: olympiadCompleted,
      avgDailyEngagement: avgDailyEngagement,
      students: enrichedStudents
    });

  } catch (err) {
    console.error('Coordinator dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// REMOVE STUDENT FROM SCHOOL
// ==========================================
app.post('/api/coordinator/remove-student', async (req, res) => {
  try {
    const { coordinatorId, studentId } = req.body;
    
    // Verify coordinator
    const schoolRes = await db.query(
      `SELECT id FROM schools WHERE coordinator_login_id = $1`,
      [coordinatorId]
    );

    if (schoolRes.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolId = schoolRes.rows[0].id;

    // Remove student ONLY if they belong to this school
    const updateRes = await db.query(
      `UPDATE users 
       SET school_id = NULL, olympiad_registered = false, age = NULL, parent_name = NULL, parent_phone = NULL, city = NULL, state = NULL, contact_email = NULL 
       WHERE id = $1 AND school_id = $2 RETURNING id`,
      [studentId, schoolId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found in this school' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Coordinator remove student error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// COORDINATOR: BULK CREATE STUDENTS
// ==========================================
app.post('/api/coordinator/bulk-create-students', async (req, res) => {
  try {
    const { coordinatorId, students } = req.body;
    if (!coordinatorId || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'coordinatorId and students array are required' });
    }

    const schoolRes = await db.query(
      `SELECT id, name FROM schools WHERE coordinator_login_id = $1`,
      [coordinatorId]
    );
    if (schoolRes.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    const { id: schoolId } = schoolRes.rows[0];

    // Run schema migrations ONCE before the loop (not 1000 times)
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password TEXT`).catch(() => {});
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects JSONB`).catch(() => {});
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`).catch(() => {});

    // Load all existing usernames into memory once — eliminates N DB queries for dedup
    const existingRes = await db.query(`SELECT LOWER("studentId") as sid FROM users`);
    const existingSet = new Set(existingRes.rows.map(r => r.sid));

    const results = [];
    const getAgentIdForClass = (cls) => {
      const norm = (cls || '').trim().replace(/^(grade|class)\s*/i, 'Grade ').replace(/\bkg\b/i, 'KG');
      if (['Grade 3','Grade 4','Grade 5'].includes(norm)) return 'agent_5201krghdxhqfhtbf4yj22406vyv';
      if (['Grade 6','Grade 7','Grade 8'].includes(norm)) return 'agent_0601krh0f23df5br0dahys0kdsbr';
      if (['Grade 9','Grade 10'].includes(norm)) return 'agent_9701krh2p85sfs9vyp7e6e1cqbwc';
      if (['Grade 11','Grade 12'].includes(norm)) return 'agent_7801krh4jfmdf9asxz901aeac0gt';
      return 'agent_5301krgg7x98ewm84w8aj2976zqc';
    };

    for (const student of students) {
      const { name, classLevel, email: rawEmail } = student;
      if (!name || !classLevel) {
        results.push({ name: name || '?', status: 'skipped', reason: 'Missing name or class' });
        continue;
      }

      // Dedup via in-memory Set (no extra DB query per student)
      const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      let username = baseUsername;
      let suffix = 2;
      while (existingSet.has(username.toLowerCase())) {
        username = `${baseUsername}_${suffix}`;
        suffix++;
      }
      existingSet.add(username.toLowerCase());

      const firstName = name.trim().split(' ')[0];
      const capFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const symbols = ['@', '#', '$'];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const plainPassword = `${capFirst}${sym}${Math.floor(100 + Math.random() * 900)}`;
      const email = rawEmail && rawEmail.trim() ? rawEmail.trim() : `${username}@school.graceandforce.internal`;
      const phoneVal = student.phone && student.phone.trim() ? student.phone.trim() : null;
      const subjectsVal = student.subjects ? JSON.stringify(student.subjects) : null;
      const assignedAgentId = getAgentIdForClass(classLevel);

      try {
        const hashedPassword = await bcrypt.hash(plainPassword, 8); // cost 8 = ~4x faster than cost 10
        await db.query(
          `INSERT INTO users (name, "studentId", password, plain_password, "classLevel", email, phone, subjects, "assignedAgentId", school_id, role, olympiad_registered)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'student', true)
           ON CONFLICT ("studentId") DO NOTHING`,
          [name, username, hashedPassword, plainPassword, classLevel, email, phoneVal, subjectsVal, assignedAgentId, schoolId]
        );
        await db.query(
          `INSERT INTO debate_users (user_id, username, class, gforce_tokens) VALUES ($1, $2, $3, 100) ON CONFLICT (user_id) DO NOTHING`,
          [username, name, classLevel]
        );
        results.push({ name, username, password: plainPassword, email, status: 'created' });
      } catch (err) {
        results.push({ name, username, status: 'skipped', reason: 'DB error' });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Bulk create students error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// COORDINATOR: ADD SINGLE STUDENT
// ==========================================
app.post('/api/coordinator/add-student', async (req, res) => {
  try {
    const { coordinatorId, name, classLevel, password: rawPassword, email: rawEmail, phone: rawPhone, subjects } = req.body;
    if (!coordinatorId || !name || !classLevel) {
      return res.status(400).json({ error: 'coordinatorId, name, and classLevel are required' });
    }

    const schoolRes = await db.query(
      `SELECT id, name FROM schools WHERE coordinator_login_id = $1`,
      [coordinatorId]
    );
    if (schoolRes.rows.length === 0) return res.status(404).json({ error: 'School not found' });
    const { id: schoolId } = schoolRes.rows[0];

    const getAgentIdForClass = (cls) => {
      const norm = (cls || '').trim().toLowerCase().replace(/^(grade|class)\s*/, 'Grade ').replace('kg', 'KG');
      if (['Grade 3','Grade 4','Grade 5'].includes(norm)) return 'agent_5201krghdxhqfhtbf4yj22406vyv'; // Level 2
      if (['Grade 6','Grade 7','Grade 8'].includes(norm)) return 'agent_0601krh0f23df5br0dahys0kdsbr'; // Level 3
      if (['Grade 9','Grade 10'].includes(norm)) return 'agent_9701krh2p85sfs9vyp7e6e1cqbwc'; // Level 4
      if (['Grade 11','Grade 12'].includes(norm)) return 'agent_7801krh4jfmdf9asxz901aeac0gt'; // Level 5
      return 'agent_5301krgg7x98ewm84w8aj2976zqc'; // Level 1 default
    };

    const assignedAgentId = getAgentIdForClass(classLevel);
    const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    let username = baseUsername;
    let suffix = 2;
    while (true) {
      const taken = await db.query(`SELECT id FROM users WHERE LOWER("studentId") = LOWER($1)`, [username]);
      if (taken.rows.length === 0) break;
      username = `${baseUsername}_${suffix}`;
      suffix++;
    }

    const firstName = name.trim().split(' ')[0];
    const capFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const symbols = ['@', '#', '$'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const plainPassword = rawPassword && rawPassword.trim() ? rawPassword.trim() : `${capFirst}${sym}${Math.floor(100 + Math.random() * 900)}`;
    const email = rawEmail && rawEmail.trim() ? rawEmail.trim() : `${username}@school.graceandforce.internal`;
    const phone = rawPhone && rawPhone.trim() ? rawPhone.trim() : null;
    const subjectsVal = subjects ? JSON.stringify(subjects) : null;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password TEXT`).catch(() => {});
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects JSONB`).catch(() => {});
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`).catch(() => {});
    await db.query(
      `INSERT INTO users (name, "studentId", password, plain_password, "classLevel", email, phone, subjects, "assignedAgentId", school_id, role, olympiad_registered)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'student', true)`,
      [name, username, hashedPassword, plainPassword, classLevel, email, phone, subjectsVal, assignedAgentId, schoolId]
    );
    await db.query(
      `INSERT INTO debate_users (user_id, username, class, gforce_tokens) VALUES ($1, $2, $3, 100) ON CONFLICT (user_id) DO NOTHING`,
      [username, name, classLevel]
    );

    res.json({ success: true, student: { name, username, password: plainPassword, email } });
  } catch (err) {
    console.error('Add student error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ==========================================
// COORDINATOR: UPDATE STUDENT CREDENTIALS
// ==========================================
app.put('/api/coordinator/update-student', async (req, res) => {
  try {
    const { coordinatorId, studentId, newUsername, newPassword, resetPassword } = req.body;
    if (!coordinatorId || !studentId) {
      return res.status(400).json({ error: 'coordinatorId and studentId are required' });
    }

    const schoolRes = await db.query(
      `SELECT id FROM schools WHERE coordinator_login_id = $1`,
      [coordinatorId]
    );
    if (schoolRes.rows.length === 0) return res.status(404).json({ error: 'School not found' });
    const schoolId = schoolRes.rows[0].id;

    const studentRes = await db.query(
      `SELECT id, "studentId", name FROM users WHERE "studentId" = $1 AND school_id = $2`,
      [studentId, schoolId]
    );
    if (studentRes.rows.length === 0) return res.status(404).json({ error: 'Student not found in this school' });
    const student = studentRes.rows[0];

    if (newUsername && newUsername !== studentId) {
      const taken = await db.query(`SELECT id FROM users WHERE LOWER("studentId") = LOWER($1) AND "studentId" != $2`, [newUsername, studentId]);
      if (taken.rows.length > 0) return res.status(400).json({ error: 'Username already taken' });
      await db.query(`UPDATE users SET "studentId" = $1 WHERE "studentId" = $2 AND school_id = $3`, [newUsername, studentId, schoolId]);
      await db.query(`UPDATE debate_users SET user_id = $1 WHERE user_id = $2`, [newUsername, studentId]);
    }

    const effectiveId = newUsername || studentId;
    let plainPwd = null;

    if (resetPassword) {
      // Auto-generate a new readable password for this student
      const firstName = (student.name || effectiveId).trim().split(' ')[0];
      const capFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const symbols = ['@', '#', '$'];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      plainPwd = `${capFirst}${sym}${Math.floor(100 + Math.random() * 900)}`;
    } else if (newPassword && newPassword.trim()) {
      plainPwd = newPassword.trim();
    }

    if (plainPwd) {
      const hashed = await bcrypt.hash(plainPwd, 10);
      await db.query(
        `UPDATE users SET password = $1, plain_password = $2 WHERE "studentId" = $3 AND school_id = $4`,
        [hashed, plainPwd, effectiveId, schoolId]
      );
    }

    res.json({ success: true, newPassword: plainPwd });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/olympiad/student/register', async (req, res) => {

  try {
    const { name, email, password, classLevel, school_code } = req.body;

    if (!name || !email || !password || !school_code) {
      return res.status(400).json({ error: 'All fields (name, email, password, school code) are required.' });
    }

    // Verify school code
    const schoolRes = await db.query(`SELECT id FROM schools WHERE school_code = $1`, [school_code]);
    if (schoolRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid School Code' });
    }
    const school_id = schoolRes.rows[0].id;

    // Check if user already exists
    const existingUserRes = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
    let studentId = '';
    
    if (existingUserRes.rows.length > 0) {
      // User exists, just update them
      studentId = email; // Using email as studentId for simplicity in updates
      await db.query(
        `UPDATE users SET school_id = $1, role = 'student', olympiad_registered = true WHERE email = $2`,
        [school_id, email]
      );
    } else {
      // Create new user (using logic similar to main register endpoint)
      studentId = email;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Assign dummy agent ID to prevent crash
      let assignedAgentId = 'agent_0601krh0f23df5br0dahys0kdsbr'; 

      await db.query(
        `INSERT INTO users (name, "studentId", password, "classLevel", email, "assignedAgentId", school_id, role, olympiad_registered) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [name, studentId, hashedPassword, classLevel || 'Level 1', email, assignedAgentId, school_id, 'student', true]
      );
    }

    res.json({ 
      success: true, 
      message: 'Successfully registered for ThinkQuest Olympiad!' 
    });

  } catch (err) {
    console.error('Olympiad student registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Daily Challenge
app.get('/api/olympiad/daily-challenge', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await db.query(`SELECT id, topic, difficulty_level, questions FROM olympiad_daily_challenges WHERE date = $1`, [today]);
    
    if (result.rows.length === 0) {
      // Fallback: return a default challenge if none exists for today
      return res.json({
        id: 0,
        date: today,
        topic: "General Cognitive Skills",
        difficulty_level: "Medium",
        questions: [
          { q: "If A is taller than B, and B is taller than C, who is the shortest?", options: ["A", "B", "C"], type: "mcq" },
          { q: "Write a short paragraph convincing a peer to read your favorite book.", type: "subjective" }
        ]
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submit Daily Practice
app.post('/api/olympiad/practice/submit', async (req, res) => {
  try {
    const { email, challenge_id, score, time_spent } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email is required' });

    await db.query(
      `INSERT INTO olympiad_practice_logs (student_id, challenge_id, score, time_spent) VALUES ($1, $2, $3, $4)`,
      [email, challenge_id, score || 0, time_spent || 0]
    );

    res.json({ success: true, message: 'Practice submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Submit Grand Olympiad Exam
app.post('/api/olympiad/exam/submit', async (req, res) => {
  try {
    const { email, answers, time_taken } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Mock Grading logic for the MVP
    const part_a_score = Math.floor(Math.random() * 20) + 1; // 1-20
    const part_b_score = Math.floor(Math.random() * 20) + 1;
    const part_c_score = Math.floor(Math.random() * 20) + 1;
    const part_d_score = Math.floor(Math.random() * 20) + 1;
    const part_e_score = Math.floor(Math.random() * 20) + 1;
    
    const total_score = part_a_score + part_b_score + part_c_score + part_d_score + part_e_score;

    // Generate mock AI competency report
    const ai_report = {
      strengths: ["Logical Reasoning", "Creative Expression"],
      areas_for_improvement: ["Analytical Depth"],
      overall_feedback: "Great performance! Keep practicing analytical challenges.",
      percentile: 85
    };

    const result = await db.query(
      `INSERT INTO olympiad_exam_submissions 
       (student_id, part_a_score, part_b_score, part_c_score, part_d_score, part_e_score, total_score, time_taken, ai_competency_report) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [email, part_a_score, part_b_score, part_c_score, part_d_score, part_e_score, total_score, time_taken || 3600, JSON.stringify(ai_report)]
    );

    res.json({ 
      success: true, 
      submission_id: result.rows[0].id,
      total_score,
      report: ai_report,
      message: 'Exam submitted successfully!' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// THINKQUEST OLYMPIAD – ENGLISH MCQ QUIZ
// ==========================================

const subjectQuestions = {
  english: require('./data/english_questions.json'),
  mathematics: require('./data/mathematics_questions.json'),
  science: require('./data/science_questions.json'),
  social_science: require('./data/social_science_questions.json'),
  ct_ai: require('./data/ct_ai_questions.json'),
};

const SUBJECT_LABELS = {
  english: 'English',
  mathematics: 'Mathematics',
  science: 'Science',
  social_science: 'Social Sciences',
  ct_ai: 'CT & AI',
};

async function ensureQuizTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS olympiad_quiz_results (
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
  `);
}
ensureQuizTable().catch(console.error);

// GET questions for a grade (includes correct for instant feedback; options are shuffled per question)
app.get('/api/olympiad/quiz/:subject/:grade', async (req, res) => {
  try {
    const grade = parseInt(req.params.grade);
    const subject = req.params.subject.toLowerCase();
    const bank = subjectQuestions[subject];
    if (!bank) return res.status(404).json({ error: 'Subject not found' });
    const raw = bank[grade];
    if (!raw) return res.status(404).json({ error: 'No questions for this grade' });
    const letters = ['A', 'B', 'C', 'D'];
    const questions = raw.map((q, i) => {
      // Shuffle options so correct answer isn't always first
      const originalOptions = q.options.slice(); // [{letter, text}]
      const originalCorrectText = originalOptions.find(o => o.letter === q.correct)?.text;
      // Shuffle
      const shuffled = originalOptions.map(o => o.text).sort(() => Math.random() - 0.5);
      const newOptions = shuffled.map((text, idx) => ({ letter: letters[idx], text }));
      // Find new correct letter
      const newCorrectLetter = newOptions.find(o => o.text === originalCorrectText)?.letter || q.correct;
      return { id: i, question: q.question, options: newOptions, correct: newCorrectLetter };
    });
    const label = SUBJECT_LABELS[subject] || subject;
    res.json({ quiz_name: `${label} Practice – Grade ${grade}`, subject: label, grade, total: questions.length, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET quiz attempt status for a user
app.get('/api/olympiad/quiz/status/:subject/:grade', async (req, res) => {
  try {
    const { email } = req.query;
    const grade = parseInt(req.params.grade);
    const subject = req.params.subject;
    if (!email) return res.status(400).json({ error: 'Email required' });
    await ensureQuizTable();
    const existing = await db.query(
      `SELECT id, score, total, percentage, attempted_at, quiz_name FROM olympiad_quiz_results WHERE user_email=$1 AND subject=$2 AND grade=$3`,
      [email, subject, grade]
    );
    if (existing.rows.length > 0) return res.json({ attempted: true, result: existing.rows[0] });
    res.json({ attempted: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit quiz answers
app.post('/api/olympiad/quiz/submit', async (req, res) => {
  try {
    const { email, subject, grade, answers, correctAnswers } = req.body;
    if (!email || !subject || !grade || !answers) return res.status(400).json({ error: 'Missing fields' });
    const gradeNum = parseInt(grade);
    await ensureQuizTable();
    const existing = await db.query(
      `SELECT id FROM olympiad_quiz_results WHERE user_email=$1 AND subject=$2 AND grade=$3`,
      [email, subject, gradeNum]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Already attempted' });
    const raw = subjectQuestions[subject.toLowerCase()]?.[gradeNum];
    if (!raw) return res.status(404).json({ error: 'Questions not found' });
    let score = 0;
    const breakdown = raw.map((q, i) => {
      const selected = answers[i];
      // Use correctAnswers from frontend if provided (shuffled letters), else fall back to raw
      const correctLetter = correctAnswers ? correctAnswers[i] : q.correct;
      const isCorrect = selected !== undefined && selected === correctLetter;
      if (isCorrect) score++;
      return { question: q.question, selected, correct: correctLetter, isCorrect };
    });
    const total = raw.length;
    const percentage = parseFloat(((score / total) * 100).toFixed(2));
    const quiz_name = `${SUBJECT_LABELS[subject.toLowerCase()] || subject} Practice – Grade ${gradeNum}`;
    const userRes = await db.query(`SELECT id FROM users WHERE email=$1`, [email]);
    const user_id = userRes.rows[0]?.id || null;
    await db.query(
      `INSERT INTO olympiad_quiz_results (user_id, user_email, quiz_name, subject, grade, score, total, percentage, answers) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [user_id, email, quiz_name, subject, gradeNum, score, total, percentage, JSON.stringify({ submitted: answers, breakdown })]
    );
    res.json({ success: true, score, total, percentage, quiz_name, breakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET quiz results for admin (all students)
app.get('/api/admin/olympiad/quiz-results', requireAdmin, async (req, res) => {
  try {
    await ensureQuizTable();
    const result = await db.query(`
      SELECT qr.id, qr.user_email, qr.quiz_name, qr.subject, qr.grade, qr.score, qr.total, qr.percentage, qr.attempted_at,
             u.name as student_name, u."classLevel" as grade_level, u.city, u.state, u.school_id
      FROM olympiad_quiz_results qr
      LEFT JOIN users u ON u.email = qr.user_email
      ORDER BY qr.attempted_at DESC
    `);
    res.json({ results: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Automated Coupon Expiration Job ──
// Runs every 12 hours to downgrade expired special coupons
setInterval(async () => {
  try {
    // 14-Day Coupons (PRO Plan for Top 14 Winners)
    await db.query(`
      UPDATE gforce.users u
      SET subscription_plan = 'free', subscription_status = 'expired'
      FROM user_coupons c
      WHERE u."studentId" = c.user_id
      AND c.coupon_code IN (
        'AMINA2000', 'ASHIQ2000', 'SUMIA2000', 'YUKTI2000', 'MOHAMMED2000',
        'JEREMY2000', 'SHAHAN2000', 'RESHMY2000', 'ANSU2000', 'RADIN2000',
        'SHAFEEQUE2000', 'PARUL2000', 'ZAHRA2000', 'PRERANA2000', 'TEST-WINNER2000'
      )
      AND c.redeemed_at < NOW() - INTERVAL '14 days'
      AND u.subscription_plan = 'pro'
    `);

    // 30-Day Coupons (PRO or MAX for Top 3)
    await db.query(`
      UPDATE gforce.users u
      SET subscription_plan = 'free', subscription_status = 'expired'
      FROM user_coupons c
      WHERE u."studentId" = c.user_id
      AND c.coupon_code IN (
        'ANKITA10000', 'HABIBA5000', 'DEVBINU3000',
        'TEST-ANKITA-2', 'TEST-HABIBA-2', 'TEST-DEVBINU3000'
      )
      AND c.redeemed_at < NOW() - INTERVAL '30 days'
      AND u.subscription_plan IN ('pro', 'max')
    `);
  } catch (error) {
    console.error("Error in automated coupon expiration job:", error);
  }
}, 12 * 60 * 60 * 1000); // 12 hours
