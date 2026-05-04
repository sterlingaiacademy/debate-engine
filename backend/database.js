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
