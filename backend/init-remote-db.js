const { Pool } = require('pg');

const connectionString = 'postgresql://postgres.whfmuswqbsgbmaramuhi:sterlingvoiceorders%40123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDB() {
  try {
    const client = await pool.connect();
    console.log('Connected to the PostgreSQL database.');
    
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
    console.log('Database tables verified and created successfully.');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  } finally {
    pool.end();
  }
}

initDB();
