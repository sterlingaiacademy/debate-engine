// Query Grace & Force API via HTTPS domain
const BASE = 'https://graceandforce.com';

async function get(path, headers = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers,
      signal: AbortSignal.timeout(12000)
    });
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text.slice(0, 300) }; }
  } catch(e) {
    return { ok: false, error: e.message.slice(0, 150) };
  }
}

async function main() {
  console.log('Querying https://graceandforce.com\n');

  // 1. Bootcamp/Cohort registrations
  console.log('=== /api/bootcamp/registrations ===');
  const reg = await get('/api/bootcamp/registrations');
  console.log('Status:', reg.status || reg.error);
  if (reg.ok && Array.isArray(reg.data)) {
    const data = reg.data;
    const paid = data.filter(d => (d.payment_status || d.paymentStatus) === 'paid');
    const pending = data.filter(d => (d.payment_status || d.paymentStatus) === 'pending');
    console.log('Total registrations:', data.length);
    console.log('Paid:', paid.length);
    console.log('Pending:', pending.length);
  } else if (reg.ok) {
    console.log('Response:', JSON.stringify(reg.data).slice(0, 500));
  } else {
    console.log('Error:', JSON.stringify(reg));
  }

  // 2. Leaderboard (to confirm server is up and get user count)
  console.log('\n=== /api/leaderboard ===');
  const lb = await get('/api/leaderboard');
  console.log('Status:', lb.status || lb.error);
  if (lb.ok) {
    const d = lb.data;
    if (Array.isArray(d)) console.log('Users in leaderboard:', d.length);
    else console.log('Response:', JSON.stringify(d).slice(0, 400));
  }

  // 3. Try admin endpoint with header
  console.log('\n=== /api/admin/users (with secret) ===');
  const admin = await get('/api/admin/users', {
    'x-admin-secret': 'grace_and_force_super_secret_key_2026',
    'Authorization': 'Bearer grace_and_force_super_secret_key_2026'
  });
  console.log('Status:', admin.status || admin.error);
  if (admin.ok) console.log('Data:', JSON.stringify(admin.data).slice(0, 500));
}

main().catch(console.error);
