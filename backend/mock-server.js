/**
 * mock-server.js
 * Standalone mock backend for local Diplomat 365 preview.
 * Runs on port 5000 — no database required.
 * Run: node mock-server.js
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ── Load curriculum ────────────────────────────────────────────────────────────
const daysPath = path.join(__dirname, 'data', 'diplomat365-days.json');
const D365_DAYS = fs.existsSync(daysPath)
  ? JSON.parse(fs.readFileSync(daysPath, 'utf8'))
  : [];

// ── Mock in-memory store ───────────────────────────────────────────────────────
const mockUsers = {
  'hananphashim': {
    studentId: 'hananphashim',
    name: 'Hanan Phashim',
    classLevel: 'Level 4',
    subscription_plan: 'pro',
    streak: 7,
    gforceTokens: 3450,
    rank: 'Gold',
    grade: 'Class 9',
    avatar: null,
  },
  // Demo user for lock screen testing
  'demouser': {
    studentId: 'demouser',
    name: 'Demo User',
    classLevel: 'Level 4',
    subscription_plan: 'free',
    streak: 0,
    gforceTokens: 100,
    rank: 'Unranked',
    grade: 'Class 9',
    avatar: null,
  },
};

// Mock D365 progress per user
const mockProgress = {
  'hananphashim': {
    currentDay: 3,
    streak: 7,
    missedDaysInRow: 0,
    longestStreak: 12,
    tokens: 2,
    lastCheckin: new Date().toISOString().split('T')[0],
    badges: ['first_day', 'week_1', 'streak_7'],
  },
};

// Mock attempts
const mockAttempts = {
  'hananphashim': [
    { day_number: 1, stars: 4, total_score: 18, feedback: '⭐⭐⭐⭐ Great work! You scored 18/25.', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { day_number: 2, stars: 5, total_score: 23, feedback: '⭐⭐⭐⭐⭐ Excellent! Perfect diplomatic register.', created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
};

// ── Auth route (mock login) ────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockUsers[username] || mockUsers['hananphashim'];
  res.json({
    token: 'mock-token-abc123',
    user,
  });
});

app.get('/api/me/:studentId', (req, res) => {
  const user = mockUsers[req.params.studentId] || mockUsers['hananphashim'];
  res.json({ user });
});

// ── D365 Routes ────────────────────────────────────────────────────────────────

// GET /api/d365/days/:n
app.get('/api/d365/days/:n', (req, res) => {
  const n = parseInt(req.params.n);
  const day = D365_DAYS.find(d => d.dayNumber === n);
  if (!day) return res.status(404).json({ error: 'Day not found' });
  // Normalize field names to match what frontend expects
  res.json({
    ...day,
    vocab_word: day.vocab?.word,
    vocab_prompt: day.vocab?.prompt,
    rubric_dims: day.rubricDimensions,
  });
});

// GET /api/d365/progress/:userId
app.get('/api/d365/progress/:userId', (req, res) => {
  const prog = mockProgress[req.params.userId] || {
    currentDay: 1,
    streak: 0,
    missedDaysInRow: 0,
    longestStreak: 0,
    tokens: 0,
    lastCheckin: null,
    badges: [],
  };
  res.json(prog);
});

// GET /api/d365/attempts/:userId
app.get('/api/d365/attempts/:userId', (req, res) => {
  const attempts = mockAttempts[req.params.userId] || [];
  res.json({ attempts });
});

// POST /api/d365/rubric/grade — uses real grader, no DB needed
app.post('/api/d365/rubric/grade', (req, res) => {
  const { userId, dayNumber, text } = req.body;

  // Import real grader
  const { gradeSubmission } = require('./diplomat365-grader');
  const dayData = D365_DAYS.find(d => d.dayNumber === parseInt(dayNumber));
  const result = gradeSubmission(text || '', dayData);

  // Update mock progress
  if (!mockProgress[userId]) {
    mockProgress[userId] = { currentDay: 1, streak: 1, missedDaysInRow: 0, longestStreak: 1, tokens: 0, badges: [], lastCheckin: null };
  }
  const prog = mockProgress[userId];
  if (result.unlocked && parseInt(dayNumber) >= prog.currentDay) {
    prog.currentDay = parseInt(dayNumber) + 1;
    if (!prog.badges.includes('first_day') && prog.currentDay >= 2) prog.badges.push('first_day');
  }
  prog.streak = Math.max(prog.streak, 1);
  prog.lastCheckin = new Date().toISOString().split('T')[0];

  // Store attempt
  if (!mockAttempts[userId]) mockAttempts[userId] = [];
  mockAttempts[userId].unshift({
    day_number: dayNumber,
    stars: result.stars,
    total_score: result.totalScore,
    feedback: result.feedback,
    created_at: new Date().toISOString(),
  });

  res.json({ ...result, newStreak: prog.streak, newTokens: prog.tokens, newCurrentDay: prog.currentDay });
});

// GET /api/d365/cohort/:ageBand
app.get('/api/d365/cohort/:ageBand', (req, res) => {
  // Return illustrative mock cohort data
  res.json({
    totalUsers: 47,
    avgDay: 18,
    yourPercentile: 72,
    survivalCurve: [
      { month: 1, remaining: 100 },
      { month: 2, remaining: 84 },
      { month: 3, remaining: 71 },
      { month: 4, remaining: 60 },
      { month: 5, remaining: 51 },
      { month: 6, remaining: 44 },
      { month: 7, remaining: 38 },
      { month: 8, remaining: 31 },
      { month: 9, remaining: 25 },
      { month: 10, remaining: 19 },
      { month: 11, remaining: 13 },
      { month: 12, remaining: 8 },
    ],
  });
});

// GET /api/d365/cohort/:ageBand/vienna
app.get('/api/d365/cohort/:ageBand/vienna', (req, res) => {
  res.json({
    top3: [
      { anonId: 'stu001', viennaScore: 94, day: 312 },
      { anonId: 'stu002', viennaScore: 87, day: 289 },
      { anonId: 'stu003', viennaScore: 81, day: 265 },
    ],
    top30: Array.from({ length: 30 }, (_, i) => ({
      anonId: `stu${String(i + 1).padStart(3, '0')}`,
      viennaScore: Math.round(94 - i * 2.5),
      day: Math.round(312 - i * 8),
    })),
  });
});

// POST /api/d365/streak/checkin
app.post('/api/d365/streak/checkin', (req, res) => {
  const { userId } = req.body;
  const prog = mockProgress[userId] || { streak: 0, missedDaysInRow: 0 };
  res.json({ streak: prog.streak, missedDaysInRow: prog.missedDaysInRow });
});

// ── Fallback for any other routes (leaderboard etc.) ──────────────────────────
app.use('/api', (req, res) => res.json({ ok: true, mock: true }));

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`\n📋 Mock accounts available:`);
  console.log(`   PRO user  → username: hananphashim  (Level 4, Pro plan)`);
  console.log(`   DEMO user → username: demouser      (Level 4, Free plan — sees lock screen)`);
  console.log(`\n🌐 Open frontend: http://localhost:5173\n`);
});
