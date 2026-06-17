const BASE = 'https://graceandforce.com';

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(12000) });
  return res.json();
}

async function main() {
  // === COHORT REGISTRATIONS ===
  const bootcamp = await get('/api/bootcamp/registrations');
  const regs = bootcamp.registrations || [];

  console.log('╔══════════════════════════════════════╗');
  console.log('║     COHORT REGISTRATIONS REPORT      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`Total Registrations : ${bootcamp.total || regs.length}`);
  console.log(`Paid                : ${bootcamp.paid}`);
  console.log(`Pending/Unpaid      : ${(bootcamp.total || regs.length) - bootcamp.paid}`);

  // Revenue
  const paidRegs = regs.filter(r => r.payment_status === 'paid');
  const totalRevenue = paidRegs.reduce((s, r) => s + (r.amount || 0), 0) / 100;
  console.log(`Revenue Collected   : ₹${totalRevenue.toLocaleString('en-IN')}`);

  // By cohort
  const byCohort = {};
  regs.forEach(r => {
    const c = r.cohort || 'unknown';
    if (!byCohort[c]) byCohort[c] = { total: 0, paid: 0 };
    byCohort[c].total++;
    if (r.payment_status === 'paid') byCohort[c].paid++;
  });
  console.log('\nBreakdown by Cohort:');
  Object.entries(byCohort).forEach(([c, v]) => {
    console.log(`  ${c}: ${v.total} registered, ${v.paid} paid`);
  });

  // === SUBSCRIPTIONS (from users) ===
  // Try getting subscription stats from leaderboard or users
  // The leaderboard gives us total users
  const lb = await get('/api/leaderboard');
  const lbUsers = lb.leaderboard || [];
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║        SUBSCRIPTION REPORT           ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`Total Users in System : ${lbUsers.length}`);

  // Try subscription-specific endpoint
  try {
    const subData = await get('/api/subscriptions/stats');
    console.log('Subscription stats:', JSON.stringify(subData));
  } catch(e) {}

  // Try /api/me for a known user to see subscription fields
  try {
    const meData = await get('/api/me/akshitarajput70');
    if (meData.user) {
      console.log('\nSample user subscription fields:');
      const u = meData.user;
      console.log('  subscription_status:', u.subscription_status);
      console.log('  subscription_plan:', u.subscription_plan);
      console.log('  subscription_period:', u.subscription_period);
    }
  } catch(e) {}
}

main().catch(console.error);
