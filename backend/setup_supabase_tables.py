"""
One-time script: Creates all Supabase leaderboard tables.
Run: py setup_supabase_tables.py
"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')

SQL = """
CREATE TABLE IF NOT EXISTS debate_users (
    user_id         TEXT PRIMARY KEY,
    username        TEXT NOT NULL,
    country         TEXT DEFAULT '',
    region          TEXT DEFAULT '',
    school          TEXT DEFAULT '',
    class           TEXT DEFAULT '',
    avatar_url      TEXT DEFAULT '',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    total_debates       INTEGER DEFAULT 0,
    total_wins          INTEGER DEFAULT 0,
    best_score          REAL DEFAULT 0,
    avg_score           REAL DEFAULT 0,
    elo_rating          REAL DEFAULT 1000.0,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    total_words_spoken  INTEGER DEFAULT 0,
    badges              JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS debates (
    debate_id       TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES debate_users(user_id),
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
    region          TEXT DEFAULT '',
    school          TEXT DEFAULT '',
    class           TEXT DEFAULT '',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id              BIGSERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES debate_users(user_id),
    badge_id        TEXT NOT NULL,
    badge_name      TEXT NOT NULL,
    badge_desc      TEXT DEFAULT '',
    earned_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_users_elo   ON debate_users(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_class ON debate_users(class, elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_debates_user  ON debates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_class ON debates(class, overall_score DESC);
"""

try:
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(SQL)
    print("SUCCESS! All Supabase leaderboard tables created.")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
