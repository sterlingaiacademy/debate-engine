const BASE = 'https://graceandforce.com';

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(12000) });
  return res.json();
}

async function main() {
  // The /api/bootcamp/registrations already told us total users
  // Let's try all user-related endpoints

  // 1. Leaderboard (debate_users table)
  const lb = await get('/api/leaderboard');
  const lbUsers = lb.leaderboard || [];
  console.log('Users in leaderboard (debate_users):', lbUsers.length);

  // 2. Check if there's a total users count anywhere
  // Try check-username with a wildcard or user list endpoint
  const endpoints = [
    '/api/users',
    '/api/admin/users',
    '/api/users/count',
    '/api/total-users',
    '/api/all-users',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE}${ep}`, { signal: AbortSignal.timeout(6000) });
      const text = await res.text();
      if (res.ok) {
        console.log(`\n✅ ${ep} (${res.status}):`, text.slice(0, 400));
      } else {
        console.log(`❌ ${ep}: ${res.status}`);
      }
    } catch(e) {
      console.log(`❌ ${ep}: ${e.message.slice(0,60)}`);
    }
  }

  // 3. Check the leaderboard broken down by class/grade
  console.log('\n=== Users by Class Level ===');
  const byClass = {};
  lbUsers.forEach(u => {
    const c = u.class || 'unknown';
    byClass[c] = (byClass[c] || 0) + 1;
  });
  Object.entries(byClass).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
    console.log(`  ${k}: ${v} users`);
  });

  // 4. Check cohort registrations for unique registered users
  const cohort = await get('/api/bootcamp/registrations');
  const cohortRegs = cohort.registrations || [];
  const uniqueEmails = new Set(cohortRegs.map(r => r.email));
  console.log('\n=== Cohort Registered Users ===');
  console.log('Total cohort entries:', cohortRegs.length);
  console.log('Unique emails:', uniqueEmails.size);

  // 5. Total across both (unique)
  const appUserIds = new Set(lbUsers.map(u => u.user_id));
  console.log('\n=== SUMMARY ===');
  console.log('App users (signed up)     :', lbUsers.length);
  console.log('Cohort registrations      :', cohortRegs.length);
  console.log('(Cohort may overlap with app users)');
}

main().catch(console.error);
