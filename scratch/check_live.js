// Run this script locally: node scratch/check_live.js
// It will ping all 3 critical endpoints on the live server

const BASE = 'https://graceandforce.com'; // change if different URL

async function check(label, url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    console.log(`\n✅ [${label}] Status: ${res.status}`);
    console.log(JSON.stringify(parsed, null, 2).slice(0, 500));
  } catch (e) {
    console.log(`\n❌ [${label}] FAILED: ${e.message}`);
  }
}

async function run() {
  // 1. Check if backend is alive
  await check('Server Health', `${BASE}/api/analytics/testuser`);

  // 2. Check if a real user's data is in the DB (replace with real studentId)
  const studentId = process.argv[2] || 'testuser';
  await check('Analytics', `${BASE}/api/analytics/${studentId}`);
  await check('Time Limits', `${BASE}/api/time-limits/${studentId}`);

  // 3. Test evaluate endpoint with a fake transcript
  await check('Evaluate Endpoint', `${BASE}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: [
        { role: 'agent', text: 'Do you think social media is good?' },
        { role: 'user',  text: 'Yes I think social media helps people connect and share ideas with each other.' },
        { role: 'agent', text: 'But does it not also cause harm?' },
        { role: 'user',  text: 'It can but the benefits outweigh the harms when used responsibly.' },
      ],
      topic: 'Is social media good for society?',
      isJunior: false,
      studentId,
      name: 'Test User',
      classLevel: 'Level 3',
    }),
  });
}

run();
