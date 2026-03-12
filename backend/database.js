const { Pool } = require('pg');
const path = require('path');

// Connect to PostgreSQL (Supabase or default local)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/Render connections
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});

async function initDB() {
  try {
    const client = await pool.connect();
    console.log('Connected to the PostgreSQL database.');
    
    // Create Tables using PostgreSQL syntax (SERIAL for auto-increment, TIMESTAMP for dates)
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

    client.release();
    console.log('Database tables verified.');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
}

// Initialize tables on startup
initDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
