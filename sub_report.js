const BASE = 'https://graceandforce.com';

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(12000) });
  return res.json();
}

async function main() {
  // Get all leaderboard users (this is the full user list)
  const lb = await get('/api/leaderboard');
  const users = lb.leaderboard || [];
  
  console.log(`Total users in leaderboard: ${users.length}`);
  
  // Fetch each user's subscription data
  let active = 0, free = 0, inactive = 0, other = 0;
  const planBreakdown = {};
  const periodBreakdown = {};
  const activeUsers = [];

  for (const u of users) {
    try {
      const data = await get(`/api/me/${u.user_id}`);
      const user = data.user || data;
      const status = user.subscription_status || 'none';
      const plan = user.subscription_plan || 'free';
      const period = user.subscription_period || '';

      if (status === 'active') {
        active++;
        activeUsers.push({ name: user.name || u.username, plan, period, studentId: u.user_id });
        planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
        if (period) periodBreakdown[period] = (periodBreakdown[period] || 0) + 1;
      } else if (plan === 'free' || !plan) {
        free++;
      } else if (status === 'inactive' || status === '') {
        inactive++;
      } else {
        other++;
        console.log(`  Other status: ${u.user_id} → status=${status}, plan=${plan}`);
      }
    } catch(e) {
      // skip
    }
  }

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║        SUBSCRIPTION REPORT           ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`Total Users         : ${users.length}`);
  console.log(`Active Subscribers  : ${active}`);
  console.log(`Free Users          : ${free}`);
  console.log(`Inactive            : ${inactive}`);
  if (other > 0) console.log(`Other               : ${other}`);

  if (active > 0) {
    console.log('\nActive Subscribers by Plan:');
    Object.entries(planBreakdown).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
    console.log('\nActive Subscribers by Period:');
    Object.entries(periodBreakdown).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
    console.log('\nActive Subscribers List:');
    activeUsers.forEach(u => console.log(`  ${u.name} (${u.studentId}) — ${u.plan} / ${u.period}`));
  }
}

main().catch(console.error);
