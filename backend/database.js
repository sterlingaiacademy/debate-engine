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

    const addColumnSafeDebateUsers = async (col, type, def) => {
      try {
        await client.query(`ALTER TABLE debate_users ADD COLUMN IF NOT EXISTS "${col}" ${type} DEFAULT ${def}`);
      } catch (e) { /* Already exists */ }
    };
    await addColumnSafeDebateUsers('grade', 'TEXT', "''");


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
