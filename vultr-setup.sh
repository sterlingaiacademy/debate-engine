#!/bin/bash
# =============================================================
# Grace & Force — Vultr Server Setup Script
# Run this ON the Vultr VPS after SSH login
# SSH: ssh graceandforce@65.20.85.75
# =============================================================

set -e
echo "=== Grace & Force — Vultr Setup ==="

# ─── 1. PostgreSQL: Create DB + User ─────────────────────────
echo ""
echo ">>> Setting up PostgreSQL database..."

sudo -u postgres psql <<'PSQL'
-- Create user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'graceandforce_user') THEN
    CREATE USER graceandforce_user WITH PASSWORD 'Pck/aawJlsLFZxWu3CG7aw==';
  END IF;
END
$$;

-- Create database if not exists
SELECT 'CREATE DATABASE graceandforce_db OWNER graceandforce_user'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'graceandforce_db')\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE graceandforce_db TO graceandforce_user;
PSQL

echo ">>> PostgreSQL user and database ready."

# ─── 2. Create Schema ─────────────────────────────────────────
echo ""
echo ">>> Creating tables..."

PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -U graceandforce_user -d graceandforce_db -h localhost <<'SQL'
-- TABLE 1: users
CREATE TABLE IF NOT EXISTS users (
    id                        SERIAL PRIMARY KEY,
    name                      TEXT,
    "studentId"               TEXT UNIQUE,
    password                  TEXT,
    "classLevel"              TEXT,
    "assignedAgentId"         TEXT,
    "createdAt"               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastDebateDate"          TEXT DEFAULT '',
    "dailyRankedTime"         INTEGER DEFAULT 0,
    "dailyPersonaTime"        INTEGER DEFAULT 0,
    grade                     TEXT DEFAULT '',
    "dailyChallengeCompleted" TEXT DEFAULT '',
    email                     TEXT,
    phone                     TEXT,
    auth_provider             TEXT,
    avatar                    TEXT
);

-- TABLE 2: debate_users
CREATE TABLE IF NOT EXISTS debate_users (
    user_id             TEXT PRIMARY KEY,
    username            TEXT NOT NULL,
    country             TEXT DEFAULT '',
    region              TEXT DEFAULT '',
    school              TEXT DEFAULT '',
    class               TEXT DEFAULT '',
    grade               TEXT DEFAULT '',
    avatar_url          TEXT DEFAULT '',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    total_debates       INTEGER DEFAULT 0,
    total_wins          INTEGER DEFAULT 0,
    best_score          REAL DEFAULT 0,
    avg_score           REAL DEFAULT 0,
    elo_rating          REAL DEFAULT 1000.0,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    total_words_spoken  INTEGER DEFAULT 0,
    badges              JSONB DEFAULT '[]'::jsonb,
    gforce_tokens       INTEGER DEFAULT 0
);

-- TABLE 3: debates
CREATE TABLE IF NOT EXISTS debates (
    debate_id                   TEXT PRIMARY KEY,
    user_id                     TEXT NOT NULL REFERENCES debate_users(user_id),
    motion                      TEXT DEFAULT '',
    side                        TEXT DEFAULT '',
    overall_score               REAL NOT NULL,
    grade                       TEXT DEFAULT '',
    total_turns                 INTEGER DEFAULT 0,
    total_words                 INTEGER DEFAULT 0,
    score_argument_quality      REAL DEFAULT 0,
    score_rebuttal_engagement   REAL DEFAULT 0,
    score_clarity_coherence     REAL DEFAULT 0,
    score_speech_fluency        REAL DEFAULT 0,
    score_persuasiveness        REAL DEFAULT 0,
    score_knowledge_evidence    REAL DEFAULT 0,
    score_respectfulness        REAL DEFAULT 0,
    score_consistency_position  REAL DEFAULT 0,
    full_result                 JSONB DEFAULT '{}'::jsonb,
    country                     TEXT DEFAULT '',
    region                      TEXT DEFAULT '',
    school                      TEXT DEFAULT '',
    class                       TEXT DEFAULT '',
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: achievements
CREATE TABLE IF NOT EXISTS achievements (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES debate_users(user_id),
    badge_id    TEXT NOT NULL,
    badge_name  TEXT NOT NULL,
    badge_desc  TEXT DEFAULT '',
    earned_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- TABLE 5: argument_bank
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
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_arg_bank_user  ON argument_bank(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_elo      ON debate_users(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_class    ON debate_users(class, elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_debates_user   ON debates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_class  ON debates(class, overall_score DESC);

-- Grant table-level permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO graceandforce_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO graceandforce_user;
SQL

echo ">>> Schema created successfully."

# ─── 3. Install Node.js 20 ────────────────────────────────────
echo ""
echo ">>> Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
node -v
npm -v

# ─── 4. Install Python3 + pip ────────────────────────────────
echo ""
echo ">>> Checking Python3..."
if ! command -v python3 &> /dev/null; then
  sudo apt install -y python3 python3-pip
fi
python3 --version

# ─── 5. Install Python dependencies ──────────────────────────
echo ""
echo ">>> Installing Python packages..."
pip3 install --quiet psycopg2-binary python-dotenv google-generativeai httpx

# ─── 6. Install PM2 ──────────────────────────────────────────
echo ""
echo ">>> Checking PM2..."
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

# ─── 7. App directory ─────────────────────────────────────────
echo ""
echo ">>> Setting up app directory..."
sudo mkdir -p /var/www/grace-and-force/backend
sudo chown -R graceandforce:graceandforce /var/www/grace-and-force

# ─── 8. Summary ───────────────────────────────────────────────
echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "Next steps (run after uploading files via SFTP):"
echo "  cd /var/www/grace-and-force/backend"
echo "  npm install --production"
echo "  pm2 start server.js --name grace-api"
echo "  pm2 save && pm2 startup"
