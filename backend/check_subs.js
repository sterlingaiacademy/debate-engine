const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://whfmuswqbsgbmaramuhi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZm11c3dxYnNnYm1hcmFtdWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDgzNywiZXhwIjoyMDg4ODg2ODM3fQ.pua1mjLQhrJ_O4iWMtLHaXUrxVaMPDFd62MjntEZpJk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // 1. List all tables via pg system catalog (use rpc if available, else try known tables)
  const knownTables = ['users', 'subscriptions', 'cohort_registrations', 'payments', 'orders'];

  for (const table of knownTables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`Table '${table}' exists, count: ${count}`);
    }
  }

  // 2. Get subscription details
  console.log('\n=== SUBSCRIPTIONS ===');
  const { data: subs, error: subErr } = await supabase.from('subscriptions').select('*');
  if (subErr) {
    console.log('Error fetching subscriptions:', subErr.message);
  } else {
    console.log('Total subscriptions:', subs.length);
    const byStatus = {};
    const byPlan = {};
    subs.forEach(s => {
      byStatus[s.status || 'unknown'] = (byStatus[s.status || 'unknown'] || 0) + 1;
      byPlan[s.plan_id || s.plan || 'unknown'] = (byPlan[s.plan_id || s.plan || 'unknown'] || 0) + 1;
    });
    console.log('By status:', byStatus);
    console.log('By plan:', byPlan);
  }

  // 3. Get users subscription status
  console.log('\n=== USERS SUBSCRIPTION STATUS ===');
  const { data: users, error: usrErr } = await supabase.from('users').select('subscription_status, subscription_plan, subscription_end_date, is_pro');
  if (usrErr) {
    console.log('Error fetching users:', usrErr.message);
    // Try with just id and sub status
    const { data: users2, error: usrErr2 } = await supabase.from('users').select('*').limit(1);
    if (!usrErr2 && users2.length > 0) {
      console.log('User columns:', Object.keys(users2[0]));
    }
  } else {
    console.log('Total users:', users.length);
    const bySubStatus = {};
    users.forEach(u => {
      const key = u.subscription_status || u.is_pro ? (u.is_pro ? 'pro' : 'free') : 'free';
      bySubStatus[u.subscription_status || 'none'] = (bySubStatus[u.subscription_status || 'none'] || 0) + 1;
    });
    console.log('By subscription_status:', bySubStatus);
    
    const active = users.filter(u => u.subscription_status === 'active');
    console.log('Active subscribers:', active.length);
    
    const byPlan = {};
    active.forEach(u => {
      byPlan[u.subscription_plan || 'unknown'] = (byPlan[u.subscription_plan || 'unknown'] || 0) + 1;
    });
    if (Object.keys(byPlan).length) console.log('Active by plan:', byPlan);
  }
}

main().catch(console.error);
