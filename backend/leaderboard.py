"""
Debate Arena — Global Leaderboard System (Supabase / PostgreSQL)
=================================================================
A backend leaderboard service powered by Supabase that collects scores
from the DebateJudge, ranks debaters globally, tracks history, and
exposes a clean Python API for your backend.

Setup:
    1. Create these tables in your Supabase dashboard (SQL provided below)
    2. Set environment variables:
         SUPABASE_URL=https://your-project.supabase.co
         SUPABASE_KEY=your-service-role-key
    3. Use in your backend:

        from leaderboard import Leaderboard
        from debate_judge import DebateJudge

        lb = Leaderboard()  # reads env vars automatically
        judge = DebateJudge()

        result = judge.judge(transcript, output_format="dict")
        submission = lb.submit_result(
            user_id="user_123",
            username="Jack",
            result=result,
            metadata={"country": "IN", "school": "DPS", "class": "12"}
        )

Supabase Table Setup SQL:
    Run the SETUP_SQL string (printed by `python leaderboard.py setup`)
    in your Supabase SQL Editor.
"""

import json
import time
import hashlib
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional


# ─────────────────────────────────────────────────────────────────────
# 1. SUPABASE SCHEMA (run in Supabase SQL Editor)
# ─────────────────────────────────────────────────────────────────────

SETUP_SQL = """
-- ============================================================
-- DEBATE ARENA LEADERBOARD — Supabase Schema
-- Run this entire block in your Supabase SQL Editor
-- ============================================================

-- 1. USERS TABLE
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
    gforce_tokens          REAL DEFAULT 1000.0,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    total_words_spoken  INTEGER DEFAULT 0,
    badges              JSONB DEFAULT '[]'::jsonb
);

-- 2. DEBATES TABLE
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

-- 3. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id              BIGSERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES debate_users(user_id),
    badge_id        TEXT NOT NULL,
    badge_name      TEXT NOT NULL,
    badge_desc      TEXT DEFAULT '',
    earned_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 4. INDEXES for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_gforce ON debate_users(gforce_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_users_avg ON debate_users(avg_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_country ON debate_users(country, gforce_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_users_school ON debate_users(school, gforce_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_debates_user ON debates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_created ON debates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_score ON debates(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_debates_arg ON debates(score_argument_quality DESC);
CREATE INDEX IF NOT EXISTS idx_debates_reb ON debates(score_rebuttal_engagement DESC);
CREATE INDEX IF NOT EXISTS idx_debates_country ON debates(country, overall_score DESC);

-- 5. RPC function: get user rank globally
CREATE OR REPLACE FUNCTION get_user_rank(target_user_id TEXT)
RETURNS INTEGER AS $$
    SELECT COALESCE(
        (SELECT COUNT(*)::INTEGER + 1
         FROM debate_users
         WHERE gforce_tokens > (SELECT gforce_tokens FROM debate_users WHERE user_id = target_user_id)
         AND total_debates >= 1),
        0
    );
$$ LANGUAGE SQL STABLE;

-- 6. RPC function: get user rank within country
CREATE OR REPLACE FUNCTION get_user_country_rank(target_user_id TEXT, target_country TEXT)
RETURNS INTEGER AS $$
    SELECT COALESCE(
        (SELECT COUNT(*)::INTEGER + 1
         FROM debate_users
         WHERE gforce_tokens > (SELECT gforce_tokens FROM debate_users WHERE user_id = target_user_id)
         AND country = target_country
         AND total_debates >= 1),
        0
    );
$$ LANGUAGE SQL STABLE;

-- 7. RPC function: global stats
CREATE OR REPLACE FUNCTION get_global_stats()
RETURNS JSON AS $$
    SELECT json_build_object(
        'total_users', (SELECT COUNT(DISTINCT user_id) FROM debates),
        'total_debates', (SELECT COUNT(*) FROM debates),
        'global_avg_score', (SELECT ROUND(AVG(overall_score)::NUMERIC, 2) FROM debates),
        'highest_score_ever', (SELECT MAX(overall_score) FROM debates),
        'total_words_spoken', (SELECT COALESCE(SUM(total_words), 0) FROM debates)
    );
$$ LANGUAGE SQL STABLE;

-- 8. RPC function: category leaderboard
CREATE OR REPLACE FUNCTION get_category_leaderboard(
    category_column TEXT,
    result_limit INTEGER DEFAULT 20,
    filter_country TEXT DEFAULT NULL
)
RETURNS TABLE(
    user_id TEXT,
    username TEXT,
    country TEXT,
    school TEXT,
    class TEXT,
    best_category_score REAL,
    avg_category_score REAL,
    debates_count BIGINT,
    gforce_tokens REAL
) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT d.user_id, u.username, u.country, u.school, u.class,
                MAX(d.%I)::REAL as best_category_score,
                ROUND(AVG(d.%I)::NUMERIC, 2)::REAL as avg_category_score,
                COUNT(*) as debates_count,
                u.gforce_tokens
         FROM debates d
         JOIN debate_users u ON d.user_id = u.user_id
         WHERE ($1 IS NULL OR d.country = $1)
         GROUP BY d.user_id, u.username, u.country, u.school, u.class, u.gforce_tokens
         HAVING COUNT(*) >= 1
         ORDER BY best_category_score DESC, avg_category_score DESC
         LIMIT $2',
        category_column, category_column
    ) USING filter_country, result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Enable Row Level Security (optional but recommended)
-- ALTER TABLE debate_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON debate_users FOR SELECT USING (true);
-- CREATE POLICY "Public read" ON debates FOR SELECT USING (true);
-- CREATE POLICY "Public read" ON achievements FOR SELECT USING (true);
-- INSERT/UPDATE policies should be restricted to your service role key.

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
"""


# ─────────────────────────────────────────────────────────────────────
# 2. SUPABASE CLIENT
# ─────────────────────────────────────────────────────────────────────

class SupabaseClient:
    """Thin wrapper around the Supabase Python client."""

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        import httpx
        
        if not hasattr(httpx.Client, "_patched_for_proxy"):
            orig_sync = httpx.Client.__init__
            def sync_patch(self, *args, **kwargs):
                kwargs.pop("proxy", None)
                kwargs.pop("proxies", None)
                orig_sync(self, *args, **kwargs)
            httpx.Client.__init__ = sync_patch
            httpx.Client._patched_for_proxy = True

        if not hasattr(httpx.AsyncClient, "_patched_for_proxy"):
            orig_async = httpx.AsyncClient.__init__
            def async_patch(self, *args, **kwargs):
                kwargs.pop("proxy", None)
                kwargs.pop("proxies", None)
                orig_async(self, *args, **kwargs)
            httpx.AsyncClient.__init__ = async_patch
            httpx.AsyncClient._patched_for_proxy = True

        from supabase import create_client

        self.url = url or os.environ.get("SUPABASE_URL", "")
        self.key = key or os.environ.get("SUPABASE_KEY", "")

        if not self.url or not self.key:
            raise ValueError(
                "Supabase credentials required. Either pass url/key or set "
                "SUPABASE_URL and SUPABASE_KEY environment variables."
            )

        self.client = create_client(self.url, self.key)

    @property
    def table(self):
        return self.client.table

    def rpc(self, fn_name: str, params: dict = None):
        return self.client.rpc(fn_name, params or {}).execute()


# ─────────────────────────────────────────────────────────────────────
# 3. ELO RATING SYSTEM
# ─────────────────────────────────────────────────────────────────────




# ─────────────────────────────────────────────────────────────────────
# 4. BADGE SYSTEM
# ─────────────────────────────────────────────────────────────────────

BADGE_DEFINITIONS = {
    "first_debate":     {"name": "First Words",        "desc": "Completed your first debate"},
    "ten_debates":      {"name": "Seasoned Speaker",   "desc": "Completed 10 debates"},
    "fifty_debates":    {"name": "Debate Veteran",     "desc": "Completed 50 debates"},
    "hundred_debates":  {"name": "Centurion",          "desc": "Completed 100 debates"},

    "perfect_respect":  {"name": "Diplomat",           "desc": "Scored 10/10 in Respectfulness"},
    "score_8_plus":     {"name": "Rising Star",        "desc": "Scored 8.0 or above overall"},
    "score_9_plus":     {"name": "Debate Champion",    "desc": "Scored 9.0 or above overall"},
    "all_above_5":      {"name": "Well Rounded",       "desc": "All 8 categories scored above 5.0"},
    "all_above_7":      {"name": "Master Debater",     "desc": "All 8 categories scored above 7.0"},

    "argument_master":  {"name": "Argument Architect",  "desc": "Scored 9+ in Argument Quality"},
    "rebuttal_master":  {"name": "Counter-Punch King",  "desc": "Scored 9+ in Rebuttal & Engagement"},
    "fluency_master":   {"name": "Silver Tongue",       "desc": "Scored 9+ in Speech Fluency"},
    "evidence_master":  {"name": "Fact Machine",        "desc": "Scored 9+ in Knowledge & Evidence"},
    "persuasion_master":{"name": "The Persuader",       "desc": "Scored 9+ in Persuasiveness"},

    "streak_3":         {"name": "Hat Trick",          "desc": "3 debates in a row scoring 6+"},
    "streak_5":         {"name": "On Fire",            "desc": "5 debates in a row scoring 6+"},
    "streak_10":        {"name": "Unstoppable",        "desc": "10 debates in a row scoring 6+"},

    "big_improvement":  {"name": "Comeback Kid",       "desc": "Improved overall score by 3+ points"},

    "words_10k":        {"name": "Chatterbox",         "desc": "Spoke 10,000+ total words"},
    "words_50k":        {"name": "Orator",             "desc": "Spoke 50,000+ total words"},

    "tokens_1000":         {"name": "Silver Rank",      "desc": "Reached Silver Tier"},
    "tokens_2000":         {"name": "Gold Rank",      "desc": "Reached Gold Tier"},
    "tokens_3000":         {"name": "Platinum Rank",        "desc": "Reached Platinum Tier"},
    "tokens_4000":         {"name": "Diamond Rank",    "desc": "Reached Diamond Tier"},
    "tokens_5000":         {"name": "Master Rank",     "desc": "Reached Master Tier"},
}


def check_badges(user: dict, debate_result: dict, prev_score: Optional[float] = None) -> list[str]:
    """Check which new badges a user has earned. Returns list of new badge_ids."""
    earned = set(user.get("badges") or [])
    new_badges = []

    total = user["total_debates"]
    score = debate_result["overall_score"]
    elo = user["gforce_tokens"]
    total_words = user["total_words_spoken"]
    categories = {c["name"]: c["score"] for c in debate_result.get("categories", [])}

    def award(badge_id):
        if badge_id not in earned:
            new_badges.append(badge_id)

    # Milestones
    if total >= 1: award("first_debate")
    if total >= 10: award("ten_debates")
    if total >= 50: award("fifty_debates")
    if total >= 100: award("hundred_debates")

    # Scores
    if score >= 8.0: award("score_8_plus")
    if score >= 9.0: award("score_9_plus")
    if categories and all(v >= 5.0 for v in categories.values()): award("all_above_5")
    if categories and all(v >= 7.0 for v in categories.values()): award("all_above_7")

    # Category excellence
    if categories.get("Respectfulness & Tone", 0) >= 10: award("perfect_respect")
    if categories.get("Argument Quality", 0) >= 9: award("argument_master")
    if categories.get("Rebuttal & Engagement", 0) >= 9: award("rebuttal_master")
    if categories.get("Speech Fluency", 0) >= 9: award("fluency_master")
    if categories.get("Knowledge & Evidence", 0) >= 9: award("evidence_master")
    if categories.get("Persuasiveness", 0) >= 9: award("persuasion_master")

    # Streaks
    streak = user["current_streak"]
    if streak >= 3: award("streak_3")
    if streak >= 5: award("streak_5")
    if streak >= 10: award("streak_10")

    # Improvement
    if prev_score is not None and score - prev_score >= 3.0:
        award("big_improvement")

    # Volume
    if total_words >= 10000: award("words_10k")
    if total_words >= 50000: award("words_50k")

    # ELO leagues
    if elo >= 1200: award("elo_1200")
    if elo >= 1500: award("elo_1500")
    if elo >= 1800: award("elo_1800")
    if elo >= 2000: award("elo_2000")
    if elo >= 2200: award("elo_2200")

    return new_badges


# ─────────────────────────────────────────────────────────────────────
# 5. CATEGORY COLUMN MAP
# ─────────────────────────────────────────────────────────────────────

CATEGORY_COLUMN_MAP = {
    "Argument Quality":        "score_argument_quality",
    "Rebuttal & Engagement":   "score_rebuttal_engagement",
    "Clarity & Coherence":     "score_clarity_coherence",
    "Speech Fluency":          "score_speech_fluency",
    "Persuasiveness":          "score_persuasiveness",
    "Knowledge & Evidence":    "score_knowledge_evidence",
    "Respectfulness & Tone":   "score_respectfulness",
    "Consistency & Position":  "score_consistency_position",
}


# ─────────────────────────────────────────────────────────────────────
# 6. LEADERBOARD ENGINE
# ─────────────────────────────────────────────────────────────────────

class Leaderboard:
    """
    Main leaderboard class using Supabase as the backend.

    Usage:
        lb = Leaderboard()  # uses SUPABASE_URL and SUPABASE_KEY env vars
        lb = Leaderboard(url="https://xxx.supabase.co", key="your-key")
    """

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.db = SupabaseClient(url, key)

    # ── SUBMIT A DEBATE RESULT ──

    def submit_result(
        self,
        user_id: str,
        username: str,
        result: dict,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Submit a DebateJudge result dict to the leaderboard.

        Args:
            user_id:  Unique user identifier (from your auth system / Supabase Auth)
            username: Display name
            result:   Output from DebateJudge.judge(..., output_format="dict")
            metadata: Optional {"country": "IN", "region": "Kerala", "school": "DPS", "class": "12"}

        Returns:
            {"debate_id": str, "new_elo": float, "elo_change": float,
             "rank": int, "streak": int, "new_badges": [...]}
        """
        if "error" in result:
            raise ValueError(f"Cannot submit errored result: {result['error']}")

        meta = metadata or {}
        country = meta.get("country", "")
        region = meta.get("region", "")
        school = meta.get("school", "")
        class_ = meta.get("class", result.get("debater", {}).get("class", ""))

        # ── Get or create user ──
        resp = self.db.table("debate_users").select("*").eq("user_id", user_id).execute()
        user = resp.data[0] if resp.data else None

        if not user:
            self.db.table("debate_users").insert({
                "user_id": user_id,
                "username": username,
                "country": country,
                "region": region,
                "school": school,
                "class": class_,
            }).execute()
            resp = self.db.table("debate_users").select("*").eq("user_id", user_id).execute()
            user = resp.data[0]

        # ── Get previous debate score for improvement badge ──
        prev_resp = (self.db.table("debates")
                     .select("overall_score, created_at")
                     .eq("user_id", user_id)
                     .order("created_at", desc=True)
                     .limit(1)
                     .execute())
        prev_score = prev_resp.data[0]["overall_score"] if prev_resp.data else None

        # ── Extract category scores ──
        cat_scores = {}
        for cat in result.get("categories", []):
            col = CATEGORY_COLUMN_MAP.get(cat["name"])
            if col:
                cat_scores[col] = cat["score"]

        # ── Generate debate ID ──
        debate_id = hashlib.sha256(
            f"{user_id}:{time.time()}:{result.get('overall_score', 0)}".encode()
        ).hexdigest()[:16]

        # ── Insert debate ──
        self.db.table("debates").insert({
            "debate_id": debate_id,
            "user_id": user_id,
            "motion": result.get("motion", ""),
            "side": result.get("debater", {}).get("side", ""),
            "overall_score": result["overall_score"],
            "grade": result.get("grade", ""),
            "total_turns": result.get("stats", {}).get("total_turns", 0),
            "total_words": result.get("stats", {}).get("total_words", 0),
            **cat_scores,
            "full_result": result,
            "country": country,
            "region": region,
            "school": school,
            "class": class_,
        }).execute()

        # ── Calculate new user stats ──
        new_total = user["total_debates"] + 1
        debate_words = result.get("stats", {}).get("total_words", 0)
        new_words = user["total_words_spoken"] + debate_words
        new_best = max(user["best_score"], result["overall_score"])
        new_avg = round(((user["avg_score"] * user["total_debates"]) + result["overall_score"]) / new_total, 2)

        new_streak = user.get("current_streak") or 0
        if new_streak == 0:
            new_streak = 1
        
        if prev_resp.data and prev_resp.data[0].get("created_at"):
            last_date_str = prev_resp.data[0]["created_at"]
            try:
                from datetime import datetime, timezone, timedelta
                last_dt = datetime.fromisoformat(last_date_str.replace("Z", "+00:00"))
                ist_last = last_dt + timedelta(hours=5, minutes=30)
                ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
                delta_days = (ist_now.date() - ist_last.date()).days
                
                if delta_days == 1:
                    new_streak += 1
                elif delta_days > 1:
                    new_streak = 1
            except Exception:
                pass
        new_longest = max(user["longest_streak"], new_streak)

        # ── Gforce Token Calculation ──
        # 1 token per 30 words (approx 5 tokens per min)
        base_tokens = debate_words // 30
        streak_bonus = new_streak * 5
        win_bonus = 20 if result["overall_score"] >= 7.0 else 0
        
        # We need to pre-check badges to add badge bounty
        temp_user = user.copy()
        temp_user.update({
            "total_debates": new_total,
            "total_words_spoken": new_words,
            "current_streak": new_streak,
            "avg_score": new_avg
        })
        new_badges = check_badges(temp_user, result, prev_score)
        badge_bonus = len(new_badges) * 25

        tokens_earned = int(base_tokens + streak_bonus + win_bonus + badge_bonus)
        new_gforce = int(user.get("gforce_tokens") or 0) + tokens_earned

        # ── Update user ──
        update_data = {
            "username": username,
            "total_debates": new_total,
            "total_wins": user["total_wins"] + (1 if result["overall_score"] >= 7.0 else 0),
            "best_score": new_best,
            "avg_score": new_avg,
            "gforce_tokens": new_gforce,
            "current_streak": new_streak,
            "longest_streak": new_longest,
            "total_words_spoken": new_words,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        # Update location if provided
        if country:
            update_data["country"] = country
        if region:
            update_data["region"] = region
        if school:
            update_data["school"] = school
        if class_:
            update_data["class"] = class_

        self.db.table("debate_users").update(update_data).eq("user_id", user_id).execute()

        # ── Refresh user for badge check ──
        resp = self.db.table("debate_users").select("*").eq("user_id", user_id).execute()
        user = resp.data[0]

        # ── Check badges ──
        new_badges = check_badges(user, result, prev_score)
        if new_badges:
            existing = set(user.get("badges") or [])
            all_badges = list(existing | set(new_badges))
            self.db.table("debate_users").update({
                "badges": all_badges
            }).eq("user_id", user_id).execute()

            for bid in new_badges:
                bdef = BADGE_DEFINITIONS.get(bid, {})
                try:
                    self.db.table("achievements").upsert({
                        "user_id": user_id,
                        "badge_id": bid,
                        "badge_name": bdef.get("name", bid),
                        "badge_desc": bdef.get("desc", ""),
                    }, on_conflict="user_id,badge_id").execute()
                except Exception:
                    pass

        # ── Get rank ──
        rank = self._get_user_rank(user_id)

        return {
            "debate_id": debate_id,
            "overall_score": result["overall_score"],
            "grade": result.get("grade", ""),
            "new_tokens": new_gforce,
            "tokens_earned": tokens_earned,
            "rank": rank,
            "streak": new_streak,
            "new_badges": [
                {"id": bid, **BADGE_DEFINITIONS.get(bid, {"name": bid, "desc": ""})}
                for bid in new_badges
            ],
        }

    # ── LEADERBOARD QUERIES ──

    def get_leaderboard(
        self,
        sort_by: str = "gforce_tokens",
        limit: int = 50,
        offset: int = 0,
        country: Optional[str] = None,
        region: Optional[str] = None,
        school: Optional[str] = None,
        class_: Optional[str] = None,
        min_debates: int = 1,
        time_range: Optional[str] = None,
    ) -> dict:
        """
        Get global or filtered leaderboard.

        Args:
            sort_by:     "gforce_tokens", "avg_score", "best_score", "total_debates", "total_wins"
            limit:       Number of results (max 100)
            offset:      Pagination offset
            country:     Filter by country code
            region:      Filter by region
            school:      Filter by school name
            class_:      Filter by class
            min_debates: Minimum debates to appear
            time_range:  "week", "month", "season", or None for all-time
        """
        allowed_sorts = {"gforce_tokens", "avg_score", "best_score", "total_debates",
                         "total_wins", "longest_streak"}
        if sort_by not in allowed_sorts:
            sort_by = "gforce_tokens"

        # Time-based leaderboard requires different approach
        if time_range:
            return self._get_time_based_leaderboard(
                sort_by, limit, offset, country, region, school, class_, min_debates, time_range
            )

        # Build query
        query = (self.db.table("debate_users")
                 .select("user_id, username, country, region, school, class, grade, "
                         "total_debates, total_wins, best_score, avg_score, "
                         "gforce_tokens, current_streak, longest_streak, badges, "
                         "total_words_spoken")
                 .gte("total_debates", min_debates))

        if country:
            query = query.eq("country", country)
        if region:
            query = query.eq("region", region)
        if school:
            query = query.eq("school", school)
        if class_:
            query = query.eq("class", class_)

        query = query.order(sort_by, desc=True).range(offset, offset + limit - 1)
        resp = query.execute()

        # Get total count
        count_query = (self.db.table("debate_users")
                       .select("user_id", count="exact")
                       .gte("total_debates", min_debates))
        if country:
            count_query = count_query.eq("country", country)
        if region:
            count_query = count_query.eq("region", region)
        if school:
            count_query = count_query.eq("school", school)
        if class_:
            count_query = count_query.eq("class", class_)
        count_resp = count_query.execute()
        total_count = count_resp.count if hasattr(count_resp, 'count') and count_resp.count else len(resp.data)

        leaderboard = []
        for i, row in enumerate(resp.data):
            entry = dict(row)
            entry["rank"] = offset + i + 1
            entry["badges"] = entry.get("badges") or []
            entry["badge_count"] = len(entry["badges"])
            entry["win_rate"] = round(entry["total_wins"] / max(1, entry["total_debates"]) * 100, 1)
            entry["tier"] = self._gforce_tier(entry["gforce_tokens"])
            leaderboard.append(entry)

        return {
            "leaderboard": leaderboard,
            "total_count": total_count,
            "page": offset // max(1, limit) + 1,
            "per_page": limit,
            "sort_by": sort_by,
            "filters": {
                "country": country, "region": region,
                "school": school, "class": class_,
                "min_debates": min_debates, "time_range": time_range,
            },
        }

    def _get_time_based_leaderboard(
        self, sort_by, limit, offset, country, region, school, class_, min_debates, time_range
    ) -> dict:
        """Leaderboard based on recent performance within a time window."""
        days = {"week": 7, "month": 30, "season": 90}.get(time_range, 30)
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

        # Fetch recent debates
        query = (self.db.table("debates")
                 .select("user_id, overall_score, total_words, created_at")
                 .gte("created_at", cutoff))

        if country:
            query = query.eq("country", country)
        if school:
            query = query.eq("school", school)

        resp = query.execute()

        # Aggregate per user
        user_stats = {}
        for row in resp.data:
            uid = row["user_id"]
            if uid not in user_stats:
                user_stats[uid] = {"scores": [], "words": 0}
            user_stats[uid]["scores"].append(row["overall_score"])
            user_stats[uid]["words"] += row.get("total_words", 0)

        # Filter by min debates
        user_stats = {uid: s for uid, s in user_stats.items() if len(s["scores"]) >= min_debates}

        # Get user details for matching users
        if not user_stats:
            return {"leaderboard": [], "total_count": 0, "sort_by": f"period_avg ({time_range})"}

        user_ids = list(user_stats.keys())
        users_resp = (self.db.table("debate_users")
                      .select("user_id, username, country, region, school, class, gforce_tokens, badges")
                      .in_("user_id", user_ids)
                      .execute())

        user_map = {u["user_id"]: u for u in users_resp.data}

        # Build leaderboard
        entries = []
        for uid, stats in user_stats.items():
            user = user_map.get(uid, {})
            entries.append({
                "user_id": uid,
                "username": user.get("username", "Unknown"),
                "country": user.get("country", ""),
                "region": user.get("region", ""),
                "school": user.get("school", ""),
                "class": user.get("class", ""),
                "gforce_tokens": user.get("gforce_tokens", 1000),
                "badges": user.get("badges", []),
                "period_debates": len(stats["scores"]),
                "period_avg": round(sum(stats["scores"]) / len(stats["scores"]), 2),
                "period_best": max(stats["scores"]),
                "period_words": stats["words"],
                "tier": self._gforce_tier(user.get("gforce_tokens", 1000)),
            })

        entries.sort(key=lambda e: e["period_avg"], reverse=True)
        entries = entries[offset:offset + limit]

        for i, e in enumerate(entries):
            e["rank"] = offset + i + 1

        return {
            "leaderboard": entries,
            "total_count": len(user_stats),
            "page": offset // max(1, limit) + 1,
            "per_page": limit,
            "sort_by": f"period_avg ({time_range})",
            "filters": {"time_range": time_range, "country": country, "school": school},
        }

    # ── CATEGORY LEADERBOARDS ──

    def get_category_leaderboard(
        self,
        category: str,
        limit: int = 20,
        country: Optional[str] = None,
    ) -> dict:
        """Leaderboard for a specific scoring category."""
        col = CATEGORY_COLUMN_MAP.get(category)
        if not col:
            return {"error": f"Unknown category: {category}. Valid: {list(CATEGORY_COLUMN_MAP.keys())}"}

        try:
            resp = self.db.rpc("get_category_leaderboard", {
                "category_column": col,
                "result_limit": limit,
                "filter_country": country,
            })
            rows = resp.data
        except Exception:
            # Fallback: manual query if RPC not set up
            rows = self._category_leaderboard_fallback(col, limit, country)

        leaderboard = []
        for i, r in enumerate(rows):
            entry = dict(r)
            entry["rank"] = i + 1
            entry["category"] = category
            leaderboard.append(entry)

        return {
            "category": category,
            "leaderboard": leaderboard,
            "total_count": len(leaderboard),
        }

    def _category_leaderboard_fallback(self, col: str, limit: int, country: Optional[str]) -> list:
        """Fallback category leaderboard without RPC function."""
        query = (self.db.table("debates")
                 .select(f"user_id, {col}")
                 .order(col, desc=True)
                 .limit(limit * 3))  # fetch extra for grouping

        if country:
            query = query.eq("country", country)

        resp = query.execute()

        # Group by user, take best
        best = {}
        for row in resp.data:
            uid = row["user_id"]
            score = row[col]
            if uid not in best or score > best[uid]:
                best[uid] = score

        # Get user details
        if not best:
            return []
        user_ids = list(best.keys())
        users = (self.db.table("debate_users")
                 .select("user_id, username, country, school, class, grade, gforce_tokens")
                 .in_("user_id", user_ids)
                 .execute())
        user_map = {u["user_id"]: u for u in users.data}

        results = []
        for uid, score in sorted(best.items(), key=lambda x: x[1], reverse=True)[:limit]:
            user = user_map.get(uid, {})
            results.append({
                "user_id": uid,
                "username": user.get("username", "Unknown"),
                "country": user.get("country", ""),
                "school": user.get("school", ""),
                "class": user.get("class", ""),
                "best_category_score": score,
                "gforce_tokens": user.get("gforce_tokens", 1000),
            })
        return results

    # ── USER PROFILE ──

    def get_user_profile(self, user_id: str) -> Optional[dict]:
        """Get full profile with stats, history, badges, and ranking."""
        resp = self.db.table("debate_users").select("*").eq("user_id", user_id).execute()
        if not resp.data:
            return None

        profile = dict(resp.data[0])
        profile["badges"] = profile.get("badges") or []
        profile["badge_details"] = [
            {"id": bid, **BADGE_DEFINITIONS.get(bid, {"name": bid, "desc": ""})}
            for bid in profile["badges"]
        ]

        # Ranks
        profile["global_rank"] = self._get_user_rank(user_id)
        if profile.get("country"):
            profile["country_rank"] = self._get_user_country_rank(user_id, profile["country"])
        else:
            profile["country_rank"] = 0

        # Win rate
        profile["win_rate"] = round(
            profile["total_wins"] / max(1, profile["total_debates"]) * 100, 1
        )

        # Tier
        profile["tier"] = self._gforce_tier(profile["gforce_tokens"])

        # Category averages from recent debates
        cat_cols = ", ".join(CATEGORY_COLUMN_MAP.values())
        debates_resp = (self.db.table("debates")
                        .select(f"debate_id, motion, side, overall_score, grade, "
                                f"total_turns, total_words, created_at, {cat_cols}")
                        .eq("user_id", user_id)
                        .order("created_at", desc=True)
                        .limit(50)
                        .execute())

        debates = debates_resp.data or []
        profile["recent_debates"] = [{
            "debate_id": d["debate_id"],
            "motion": d["motion"],
            "side": d["side"],
            "overall_score": d["overall_score"],
            "grade": d["grade"],
            "total_turns": d["total_turns"],
            "total_words": d["total_words"],
            "created_at": d["created_at"],
        } for d in debates[:10]]

        # Score trend
        profile["score_trend"] = [{
            "overall_score": d["overall_score"],
            "created_at": d["created_at"],
        } for d in debates[:20]]

        # Category averages
        if debates:
            cat_avgs = {}
            for col_name, col_key in CATEGORY_COLUMN_MAP.items():
                values = [d[col_key] for d in debates if d.get(col_key) is not None]
                if values:
                    cat_avgs[col_name] = round(sum(values) / len(values), 2)
            profile["category_averages"] = cat_avgs

            if cat_avgs:
                profile["strongest_category"] = max(cat_avgs, key=cat_avgs.get)
                profile["weakest_category"] = min(cat_avgs, key=cat_avgs.get)
        else:
            profile["category_averages"] = {}

        return profile

    # ── DEBATE DETAIL ──

    def get_debate_detail(self, debate_id: str) -> Optional[dict]:
        """Get full detail for a single debate."""
        resp = (self.db.table("debates")
                .select("*")
                .eq("debate_id", debate_id)
                .execute())
        if not resp.data:
            return None
        return dict(resp.data[0])

    # ── GLOBAL STATS ──

    def get_global_stats(self) -> dict:
        """Platform-wide statistics."""
        try:
            resp = self.db.rpc("get_global_stats")
            stats = resp.data
        except Exception:
            stats = self._global_stats_fallback()

        # Top countries
        country_resp = (self.db.table("debate_users")
                        .select("country")
                        .neq("country", "")
                        .execute())
        country_counts = {}
        for row in (country_resp.data or []):
            c = row["country"]
            country_counts[c] = country_counts.get(c, 0) + 1
        top_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:20]

        # Popular motions
        motion_resp = (self.db.table("debates")
                       .select("motion, overall_score")
                       .neq("motion", "")
                       .execute())
        motion_stats = {}
        for row in (motion_resp.data or []):
            m = row["motion"]
            if m not in motion_stats:
                motion_stats[m] = {"count": 0, "scores": []}
            motion_stats[m]["count"] += 1
            motion_stats[m]["scores"].append(row["overall_score"])

        popular_motions = sorted(motion_stats.items(), key=lambda x: x[1]["count"], reverse=True)[:10]
        popular_motions = [{
            "motion": m,
            "debate_count": s["count"],
            "avg_score": round(sum(s["scores"]) / len(s["scores"]), 2),
        } for m, s in popular_motions]

        if isinstance(stats, dict):
            result = stats
        else:
            result = stats if not isinstance(stats, list) else (stats[0] if stats else {})

        result["countries"] = [{"country": c, "user_count": n} for c, n in top_countries]
        result["popular_motions"] = popular_motions
        return result

    def _global_stats_fallback(self) -> dict:
        """Fallback global stats without RPC."""
        debates_resp = self.db.table("debates").select("overall_score, total_words, user_id").execute()
        debates = debates_resp.data or []

        if not debates:
            return {"total_users": 0, "total_debates": 0, "global_avg_score": 0,
                    "highest_score_ever": 0, "total_words_spoken": 0}

        scores = [d["overall_score"] for d in debates]
        return {
            "total_users": len(set(d["user_id"] for d in debates)),
            "total_debates": len(debates),
            "global_avg_score": round(sum(scores) / len(scores), 2),
            "highest_score_ever": max(scores),
            "total_words_spoken": sum(d.get("total_words", 0) for d in debates),
        }

    # ── SEARCH ──

    def search_users(self, query: str, limit: int = 20) -> list[dict]:
        """Search users by username."""
        resp = (self.db.table("debate_users")
                .select("user_id, username, country, school, gforce_tokens, total_debates, avg_score")
                .ilike("username", f"%{query}%")
                .order("gforce_tokens", desc=True)
                .limit(limit)
                .execute())
        return resp.data or []

    # ── HELPERS ──

    def _get_user_rank(self, user_id: str) -> int:
        try:
            resp = self.db.rpc("get_user_rank", {"target_user_id": user_id})
            return resp.data if isinstance(resp.data, int) else (resp.data[0] if resp.data else 0)
        except Exception:
            return self._rank_fallback(user_id)

    def _get_user_country_rank(self, user_id: str, country: str) -> int:
        try:
            resp = self.db.rpc("get_user_country_rank", {
                "target_user_id": user_id,
                "target_country": country,
            })
            return resp.data if isinstance(resp.data, int) else (resp.data[0] if resp.data else 0)
        except Exception:
            return 0

    def _rank_fallback(self, user_id: str) -> int:
        """Calculate rank without RPC."""
        user_resp = self.db.table("debate_users").select("gforce_tokens").eq("user_id", user_id).execute()
        if not user_resp.data:
            return 0
        elo = user_resp.data[0]["gforce_tokens"]
        count_resp = (self.db.table("debate_users")
                      .select("user_id", count="exact")
                      .gt("gforce_tokens", elo)
                      .gte("total_debates", 1)
                      .execute())
        return (count_resp.count or 0) + 1

    @staticmethod
    def _gforce_tier(elo: float) -> dict:
        tiers = [
            (2200, "Diamond",  "💎"),
            (2000, "Platinum", "⚪"),
            (1800, "Gold",     "🥇"),
            (1500, "Silver",   "🥈"),
            (1200, "Bronze",   "🥉"),
            (0,    "Unranked", "⬜"),
        ]
        for threshold, name, icon in tiers:
            if elo >= threshold:
                return {"name": name, "icon": icon, "min_elo": threshold}
        return {"name": "Unranked", "icon": "⬜", "min_elo": 0}


# ─────────────────────────────────────────────────────────────────────
# 7. CLI
# ─────────────────────────────────────────────────────────────────────

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python leaderboard.py setup    — Print SQL to run in Supabase SQL Editor")
        print("  python leaderboard.py test     — Test connection to Supabase")
        print("  python leaderboard.py stats    — Show global stats")
        return

    cmd = sys.argv[1]

    if cmd == "setup":
        print(SETUP_SQL)
        print("\n✅ Copy the SQL above and run it in your Supabase SQL Editor.")

    elif cmd == "test":
        try:
            lb = Leaderboard()
            stats = lb.get_global_stats()
            print("✅ Connected to Supabase successfully!")
            print(f"   Total users:   {stats.get('total_users', 0)}")
            print(f"   Total debates:  {stats.get('total_debates', 0)}")
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print("   Make sure SUPABASE_URL and SUPABASE_KEY are set.")

    elif cmd == "stats":
        lb = Leaderboard()
        stats = lb.get_global_stats()
        print(json.dumps(stats, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
