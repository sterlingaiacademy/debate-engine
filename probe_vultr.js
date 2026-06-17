// Query the live Grace & Force API server on Vultr
const BASE = 'http://65.20.85.75';

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(10000) });
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text.slice(0, 500) }; }
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  console.log('Testing connection to Vultr server at', BASE);
  const ping = await get('/health');
  console.log('Health check:', JSON.stringify(ping));

  // Try admin endpoints
  const endpoints = [
    '/api/admin/stats',
    '/api/admin/subscriptions',
    '/api/admin/users',
    '/admin/stats',
    '/stats',
    '/api/stats',
  ];

  for (const ep of endpoints) {
    const r = await get(ep);
    if (r.ok) {
      console.log(`\n✅ ${ep}:`, JSON.stringify(r.data).slice(0, 500));
    } else {
      console.log(`❌ ${ep}: ${r.status || r.error}`);
    }
  }
}

main().catch(console.error);
