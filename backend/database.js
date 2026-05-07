require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 
  'postgresql://graceandforce_user:Pck/aawJlsLFZxWu3CG7aw==@localhost:5432/graceandforce_db';

// Disable SSL for local connections (Vultr localhost PostgreSQL), enable for remote
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

console.log('Connecting to Vultr PostgreSQL database...');

// Initialize tables on startup
async function initDB() {
  const client = await pool.connect();
  try {
    // Core tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        "studentId" TEXT UNIQUE,
        password TEXT,
        "classLevel" TEXT,
        "assignedAgentId" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // Daily time-limit columns — add if not already present
    const addColumnSafeUsers = async (col, type, def) => {
      try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "${col}" ${type} DEFAULT ${def}`);
      } catch (e) { /* Already exists */ }
    };

    await addColumnSafeUsers('lastDebateDate', 'TEXT', "''");
    await addColumnSafeUsers('dailyRankedTime', 'INTEGER', '0');
    await addColumnSafeUsers('dailyPersonaTime', 'INTEGER', '0');
    await addColumnSafeUsers('grade', 'TEXT', "''");
    await addColumnSafeUsers('dailyChallengeCompleted', 'TEXT', "''"); // YYYY-MM-DD IST

    const addColumnSafeDebateUsers = async (col, type, def) => {
      try {
        await client.query(`ALTER TABLE debate_users ADD COLUMN IF NOT EXISTS "${col}" ${type} DEFAULT ${def}`);
      } catch (e) { /* Already exists */ }
    };
    await addColumnSafeDebateUsers('grade', 'TEXT', "''");

    // Argument Bank table
    await client.query(`
      CREATE TABLE IF NOT EXISTS argument_bank (
        id          SERIAL PRIMARY KEY,
        user_id     TEXT NOT NULL,
        motion      TEXT DEFAULT '',
        point       TEXT DEFAULT '',
        evidence    TEXT DEFAULT '',
        explain     TEXT DEFAULT '',
        link        TEXT DEFAULT '',
        score       REAL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Index for fast user lookups
    await client.query(`CREATE INDEX IF NOT EXISTS idx_arg_bank_user ON argument_bank(user_id, created_at DESC)`);

    // Premium Enrollment Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollment_requests (
        id             SERIAL PRIMARY KEY,
        student_id     TEXT,
        student_name   TEXT,
        parent_phone   TEXT NOT NULL,
        grade          TEXT,
        school         TEXT,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Add school column for existing deployments
    try {
      await client.query(`ALTER TABLE enrollment_requests ADD COLUMN IF NOT EXISTS school TEXT`);
    } catch (e) { /* ignore */ }
    await client.query(`CREATE INDEX IF NOT EXISTS idx_enroll_phone ON enrollment_requests(parent_phone, created_at DESC)`);

    // debates table (stores individual debate results for analytics)
    await client.query(`
      CREATE TABLE IF NOT EXISTS debates (
        debate_id       TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL,
        motion          TEXT DEFAULT '',
        side            TEXT DEFAULT '',
        overall_score   REAL NOT NULL,
        grade           TEXT DEFAULT '',
        total_turns     INTEGER DEFAULT 0,
        total_words     INTEGER DEFAULT 0,
        score_argument_quality      REAL DEFAULT 0,
        score_rebuttal_engagement   REAL DEFAULT 0,
        score_clarity_coherence     REAL DEFAULT 0,
        score_speech_fluency        REAL DEFAULT 0,
        score_persuasiveness        REAL DEFAULT 0,
        score_knowledge_evidence    REAL DEFAULT 0,
        score_respectfulness        REAL DEFAULT 0,
        score_consistency_position  REAL DEFAULT 0,
        full_result     JSONB DEFAULT '{}'::jsonb,
        country         TEXT DEFAULT '',
        school          TEXT DEFAULT '',
        class           TEXT DEFAULT '',
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_debates_user ON debates(user_id, created_at DESC)`);

    // Ensure debate_users has all needed stat columns
    const addDU = async (col, type, def) => {
      try {
        await client.query(`ALTER TABLE debate_users ADD COLUMN IF NOT EXISTS "${col}" ${type} DEFAULT ${def}`);
      } catch (e) { /* Already exists */ }
    };
    await addDU('total_debates', 'INTEGER', '0');
    await addDU('total_wins', 'INTEGER', '0');
    await addDU('best_score', 'REAL', '0');
    await addDU('avg_score', 'REAL', '0');
    await addDU('current_streak', 'INTEGER', '0');
    await addDU('longest_streak', 'INTEGER', '0');
    await addDU('total_words_spoken', 'INTEGER', '0');
    await addDU('badges', 'JSONB', "'[]'");
    await addDU('avatar_url', 'TEXT', "''");

    console.log('Vultr database tables verified.');

  } catch (err) {
    console.error('DB init error:', err.message);
  } finally {
    client.release();
  }
}

initDB();

/**
 * pg-compatible query wrapper — same API as before (server.js unchanged).
 */
async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}

module.exports = { query };
