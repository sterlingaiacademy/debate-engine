/**
 * migrate-diplomat365.js
 * Creates 4 new tables for the Diplomat 365 module and seeds 365 curriculum rows.
 * Run: node migrate-diplomat365.js
 */

require('dotenv').config();
const db = require('./database');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('🏛️  Diplomat 365 — running migration...');

  // 1. d365_days — immutable curriculum
  await db.query(`
    CREATE TABLE IF NOT EXISTS d365_days (
      day_number     INTEGER PRIMARY KEY,
      week           INTEGER NOT NULL,
      subweek        INTEGER NOT NULL,
      level          INTEGER NOT NULL,
      age_band       TEXT NOT NULL,
      level_label    TEXT NOT NULL,
      theme          TEXT NOT NULL,
      slot           TEXT NOT NULL,
      slot_desc      TEXT,
      headline       TEXT,
      drill          TEXT,
      vocab_word     TEXT,
      vocab_prompt   TEXT,
      policy_area    TEXT,
      gforce_mode    TEXT,
      rubric_dims    JSONB,
      unlock_requirement INTEGER DEFAULT 3,
      is_assessment_day  BOOLEAN DEFAULT FALSE,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  ✅ d365_days table ready');

  // 2. d365_user_progress — per-user mutable state
  await db.query(`
    CREATE TABLE IF NOT EXISTS d365_user_progress (
      user_id            TEXT PRIMARY KEY,
      current_day        INTEGER DEFAULT 1,
      streak             INTEGER DEFAULT 0,
      missed_days_in_row INTEGER DEFAULT 0,
      longest_streak     INTEGER DEFAULT 0,
      tokens             INTEGER DEFAULT 0,
      last_checkin       DATE,
      badges             JSONB DEFAULT '[]',
      created_at         TIMESTAMPTZ DEFAULT NOW(),
      updated_at         TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  ✅ d365_user_progress table ready');

  // 3. d365_attempts — one per submission
  await db.query(`
    CREATE TABLE IF NOT EXISTS d365_attempts (
      id                   SERIAL PRIMARY KEY,
      user_id              TEXT NOT NULL,
      day_number           INTEGER NOT NULL,
      submission_text      TEXT,
      stars                INTEGER NOT NULL DEFAULT 1,
      total_score          INTEGER NOT NULL DEFAULT 0,
      dim_persuasion       INTEGER DEFAULT 0,
      dim_evidence         INTEGER DEFAULT 0,
      dim_policy_knowledge INTEGER DEFAULT 0,
      dim_diplomatic_register INTEGER DEFAULT 0,
      dim_voice_delivery   INTEGER DEFAULT 0,
      feedback             TEXT,
      unlocked_next        BOOLEAN DEFAULT FALSE,
      created_at           TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_d365_attempts_user ON d365_attempts(user_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_d365_attempts_day  ON d365_attempts(day_number)`);
  console.log('  ✅ d365_attempts table ready');

  // 4. d365_cohort_stats — pre-aggregated daily percentiles
  await db.query(`
    CREATE TABLE IF NOT EXISTS d365_cohort_stats (
      id         SERIAL PRIMARY KEY,
      age_band   TEXT NOT NULL,
      stat_date  DATE NOT NULL,
      day_reached INTEGER NOT NULL,
      user_count  INTEGER NOT NULL DEFAULT 1,
      avg_stars   NUMERIC(4,2),
      UNIQUE (age_band, stat_date, day_reached)
    )
  `);
  console.log('  ✅ d365_cohort_stats table ready');

  // Seed curriculum days
  const daysPath = path.join(__dirname, 'data', 'diplomat365-days.json');
  if (!fs.existsSync(daysPath)) {
    console.log('  ⚠️  data/diplomat365-days.json not found — run build-diplomat365-days.js first');
  } else {
    const days = JSON.parse(fs.readFileSync(daysPath, 'utf8'));
    let seeded = 0;
    for (const d of days) {
      await db.query(`
        INSERT INTO d365_days
          (day_number, week, subweek, level, age_band, level_label, theme, slot, slot_desc,
           headline, drill, vocab_word, vocab_prompt, policy_area, gforce_mode,
           rubric_dims, unlock_requirement, is_assessment_day)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (day_number) DO UPDATE SET
          theme = EXCLUDED.theme, drill = EXCLUDED.drill,
          slot = EXCLUDED.slot
      `, [
        d.dayNumber, d.week, d.subweek, d.level, d.ageBand, d.levelLabel,
        d.theme, d.slot, d.slotDesc, d.headline, d.drill,
        d.vocab?.word || '', d.vocab?.prompt || '', d.policyArea || '',
        d.gForceMode || '', JSON.stringify(d.rubricDimensions || []),
        d.unlockRequirement || 3, d.isAssessmentDay || false,
      ]);
      seeded++;
    }
    console.log(`  ✅ Seeded ${seeded} curriculum days`);
  }

  console.log('\n🎉 Diplomat 365 migration complete!');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
