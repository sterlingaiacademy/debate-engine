// Query Supabase REST API directly
const SUPABASE_URL = 'https://whfmuswqbsgbmaramuhi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZm11c3dxYnNnYm1hcmFtdWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDgzNywiZXhwIjoyMDg4ODg2ODM3fQ.pua1mjLQhrJ_O4iWMtLHaXUrxVaMPDFd62MjntEZpJk';

async function query(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    }
  });
  const count = res.headers.get('content-range');
  const data = await res.json();
  return { data, count };
}

async function rpc(fn, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return res.json();
}

async function main() {
  console.log('Querying Supabase REST API...\n');

  // --- USERS / SUBSCRIPTIONS ---
  // Get all users with subscription data
  const usersRes = await query('users?select=studentId,subscription_status,subscription_plan,subscription_period&limit=1000');
  if (!Array.isArray(usersRes.data)) {
    console.log('Users error:', JSON.stringify(usersRes.data));
  } else {
    const users = usersRes.data;
    console.log('=== SUBSCRIPTION STATS (from users table) ===');
    console.log('Total users:', users.length);

    const byStatus = {};
    const byPlan = {};
    users.forEach(u => {
      const s = u.subscription_status || 'none';
      byStatus[s] = (byStatus[s] || 0) + 1;
      if (s === 'active') {
        const p = u.subscription_plan || 'unknown';
        byPlan[p] = (byPlan[p] || 0) + 1;
      }
    });

    console.log('\nBy subscription_status:');
    Object.entries(byStatus).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

    const activeCount = byStatus['active'] || 0;
    console.log(`\n✅ ACTIVE SUBSCRIBERS: ${activeCount}`);
    if (activeCount > 0) {
      console.log('\nActive by plan:');
      Object.entries(byPlan).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
    }
  }

  // --- COHORT REGISTRATIONS ---
  const cohortRes = await query('cohort_registrations?select=payment_status,cohort&limit=1000');
  if (!Array.isArray(cohortRes.data)) {
    console.log('\nCohort registrations error or table not found:', JSON.stringify(cohortRes.data));
  } else {
    const regs = cohortRes.data;
    console.log('\n=== COHORT STATS (from DB) ===');
    console.log('Total registrations:', regs.length);
    const byStatus = {};
    regs.forEach(r => { const s = r.payment_status || 'unknown'; byStatus[s] = (byStatus[s]||0)+1; });
    console.log('By payment_status:', byStatus);
  }
}

main().catch(console.error);
