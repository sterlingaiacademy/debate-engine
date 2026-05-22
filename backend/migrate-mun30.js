/**
 * migrate-mun30.js — creates mun30_days + mun30_user_progress tables
 * and seeds the 30-day curriculum. Run: node migrate-mun30.js
 */
require('dotenv').config();
const db   = require('./database');
const fs   = require('fs');
const path = require('path');

async function migrate() {
  console.log('🎯 MUN 30-Day — running migration...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS mun30_days (
      day_number     INTEGER PRIMARY KEY,
      phase          INTEGER NOT NULL,
      phase_label    TEXT NOT NULL,
      week_day       TEXT,
      title          TEXT NOT NULL,
      engine         TEXT,
      ai_prompt      TEXT,
      daily_ritual   TEXT,
      winning_edge   TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  ✅ mun30_days table ready');

  await db.query(`
    CREATE TABLE IF NOT EXISTS mun30_user_progress (
      user_id          TEXT PRIMARY KEY,
      current_day      INTEGER DEFAULT 1,
      streak           INTEGER DEFAULT 0,
      longest_streak   INTEGER DEFAULT 0,
      tokens           INTEGER DEFAULT 0,
      last_checkin     DATE,
      badges           JSONB DEFAULT '[]',
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  ✅ mun30_user_progress table ready');

  await db.query(`
    CREATE TABLE IF NOT EXISTS mun30_attempts (
      id             SERIAL PRIMARY KEY,
      user_id        TEXT NOT NULL,
      day_number     INTEGER NOT NULL,
      submission     TEXT,
      stars          INTEGER DEFAULT 1,
      total_score    INTEGER DEFAULT 0,
      feedback       TEXT,
      unlocked_next  BOOLEAN DEFAULT FALSE,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_mun30_user ON mun30_attempts(user_id)`);
  console.log('  ✅ mun30_attempts table ready');

  // Seed 30 days
  const daysPath = path.join(__dirname, 'data', 'mun30-days.json');
  if (!fs.existsSync(daysPath)) {
    console.log('  ⚠️  data/mun30-days.json not found');
  } else {
    const days = JSON.parse(fs.readFileSync(daysPath, 'utf8'));
    for (const d of days) {
      await db.query(`
        INSERT INTO mun30_days (day_number, phase, phase_label, week_day, title, engine, ai_prompt, daily_ritual, winning_edge)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (day_number) DO UPDATE SET
          title = EXCLUDED.title, engine = EXCLUDED.engine,
          ai_prompt = EXCLUDED.ai_prompt, daily_ritual = EXCLUDED.daily_ritual,
          winning_edge = EXCLUDED.winning_edge
      `, [d.dayNumber, d.phase, d.phaseLabel, d.weekDay, d.title, d.engine, d.aiPrompt, d.dailyRitual, d.winningEdge]);
    }
    console.log(`  ✅ Seeded ${days.length} curriculum days`);
  }

  console.log('\n🎉 MUN 30-Day migration complete!');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
