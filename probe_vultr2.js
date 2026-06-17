// Query the live Grace & Force API server on Vultr (Port 5000 directly)
const BASES = [
  'http://65.20.85.75:5000',
  'http://65.20.85.75:3000',
  'http://65.20.85.75:8000',
  'http://65.20.85.75',
];

async function get(base, path) {
  try {
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text.slice(0, 300) }; }
  } catch(e) {
    return { ok: false, error: e.message.slice(0, 100) };
  }
}

async function main() {
  // 1. Find the right port
  console.log('=== Finding active port ===');
  for (const base of BASES) {
    const r = await get(base, '/api/leaderboard');
    console.log(`${base}/api/leaderboard:`, r.ok ? '✅ REACHABLE' : `❌ ${r.status || r.error}`);
    if (r.ok) {
      console.log('Sample:', JSON.stringify(r.data).slice(0, 200));
    }
  }

  // 2. Try bootcamp/cohort registrations
  console.log('\n=== Cohort/Bootcamp Registrations ===');
  for (const base of BASES) {
    const r = await get(base, '/api/bootcamp/registrations');
    if (r.ok) {
      console.log(`Found at ${base}!`);
      const data = r.data;
      if (Array.isArray(data)) {
        console.log('Total registrations:', data.length);
        const paid = data.filter(d => d.payment_status === 'paid' || d.paymentStatus === 'paid');
        console.log('Paid:', paid.length);
        console.log('Unpaid:', data.length - paid.length);
      } else {
        console.log('Data:', JSON.stringify(data).slice(0, 500));
      }
      break;
    }
  }
}

main().catch(console.error);
