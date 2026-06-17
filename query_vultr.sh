#!/bin/bash
PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -U graceandforce_user -d graceandforce_db -h localhost << 'SQL'

\echo '=== TOTAL USERS ==='
SELECT COUNT(*) as total_users FROM users;

\echo ''
\echo '=== SUBSCRIPTION STATUS BREAKDOWN ==='
SELECT 
  COALESCE(subscription_status, 'none') as status, 
  COUNT(*) as count 
FROM users 
GROUP BY subscription_status 
ORDER BY count DESC;

\echo ''
\echo '=== ACTIVE SUBSCRIBERS BY PLAN ==='
SELECT 
  COALESCE(subscription_plan, 'unknown') as plan, 
  COALESCE(subscription_period, 'unknown') as period,
  COUNT(*) as count 
FROM users 
WHERE subscription_status = 'active'
GROUP BY subscription_plan, subscription_period
ORDER BY count DESC;

\echo ''
\echo '=== COHORT REGISTRATIONS ==='
SELECT COUNT(*) as total_registrations FROM cohort_registrations;

\echo ''
\echo '=== COHORT PAYMENT STATUS ==='
SELECT 
  COALESCE(payment_status, 'unknown') as status,
  COUNT(*) as count
FROM cohort_registrations
GROUP BY payment_status
ORDER BY count DESC;

\echo ''
\echo '=== COHORT REVENUE ==='
SELECT 
  SUM(amount) as total_revenue_paise,
  SUM(amount)/100 as total_revenue_rupees,
  COUNT(*) as paid_count
FROM cohort_registrations
WHERE payment_status = 'paid';

SQL
