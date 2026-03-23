require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres.whfmuswqbsgbmaramuhi:sterlingvoiceorders%40123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

console.log('Connecting to Supabase PostgreSQL database...');

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS debate_sessions (
        id SERIAL PRIMARY KEY,
        "studentId" TEXT,
        "debateTopic" TEXT,
        "sessionDuration" INTEGER,
        "argumentsCount" INTEGER,
        "debateScore" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        "studentId" TEXT PRIMARY KEY,
        "averageScore" REAL DEFAULT 0,
        "debatesCompleted" INTEGER DEFAULT 0,
        "speakingTime" INTEGER DEFAULT 0
      )
    `);

    // Daily time-limit columns — add if not already present
    const addColumnSafe = async (col, type, def) => {
      try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "${col}" ${type} DEFAULT ${def}`);
      } catch (e) { /* Already exists */ }
    };

    await addColumnSafe('lastDebateDate', 'TEXT', "''");
    await addColumnSafe('dailyRankedTime', 'INTEGER', '0');
    await addColumnSafe('dailyPersonaTime', 'INTEGER', '0');

    console.log('Supabase database tables verified.');
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
