-- ============================================================
-- Grace & Force — Database Cleanup Migration
-- Run ONCE against Supabase before GCP migration.
-- Drops tables that are written to but never read by any
-- active UI page. Data is permanently deleted.
-- ============================================================

-- 1. analytics — rolling score aggregates, replaced by debate_users + debates
DROP TABLE IF EXISTS analytics;

-- 2. debate_sessions — raw session log, no active read endpoint in any UI page
DROP TABLE IF EXISTS debate_sessions;
