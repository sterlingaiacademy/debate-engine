const BASE = 'https://graceandforce.com';

async function get(path, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE + path, { signal: AbortSignal.timeout(12000) });
      return res.json();
    } catch(e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
    }
  }
}

async function main() {
  // Get all users
  const lb = await get('/api/leaderboard?limit=9999&offset=0');
  const users = lb.leaderboard || [];
  console.log(`Scanning all ${users.length} users (sequential with retries)...\n`);

  const active = [];
  const failed = [];
  let free = 0;

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    try {
      const data = await get('/api/me/' + u.user_id);
      const user = data.user || data;
      const status = user.subscription_status || '';
      const plan = user.subscription_plan || 'free';

      if (status === 'active') {
        active.push({
          name: user.name || u.username,
          id: u.user_id,
          plan,
          period: user.subscription_period || '—',
          level: user.classLevel || '—',
          grade: user.grade || '—',
          email: user.email || '—'
        });
      } else {
        free++;
      }
    } catch(e) {
      failed.push(u.user_id);
    }

    // Progress every 50
    if ((i + 1) % 50 === 0) console.log(`  Progress: ${i+1}/${users.length}`);
  }

  console.log('\n====================================');
  console.log('   COMPLETE SUBSCRIPTION REPORT');
  console.log('====================================');
  console.log(`Total users scanned : ${users.length}`);
  console.log(`Active subscribers  : ${active.length}`);
  console.log(`Free users          : ${free}`);
  if (failed.length) console.log(`Failed to fetch     : ${failed.length} (${failed.join(', ')})`);

  console.log('\n--- Active Subscribers ---');
  active.forEach((u, i) => {
    console.log(`${i+1}. ${u.name}`);
    console.log(`   ID     : ${u.id}`);
    console.log(`   Plan   : ${u.plan} / ${u.period}`);
    console.log(`   Level  : ${u.level} | Grade: ${u.grade}`);
    console.log(`   Email  : ${u.email}`);
  });

  // Plan breakdown
  const byPlan = {};
  active.forEach(u => { byPlan[u.plan] = (byPlan[u.plan]||0)+1; });
  console.log('\n--- By Plan ---');
  Object.entries(byPlan).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
}

main().catch(console.error);
