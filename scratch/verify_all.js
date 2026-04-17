const fs = require('fs');
const checks = [];

// 1. server.js checks
const server = fs.readFileSync('backend/server.js', 'utf8');
checks.push(['Avatar endpoint exists', server.includes('/api/user/avatar')]);
checks.push(['Multi-profile API (no LIMIT 1)', !server.includes('WHERE email = $1 LIMIT 1')]);
checks.push(['Returns users array', server.includes('users: rows')]);
checks.push(['Referral token logic', server.includes('startupTokens = 150')]);
checks.push(['Referrer bounty +200', server.includes('gforce_tokens + 200')]);
checks.push(['debate_users init', server.includes('INSERT INTO debate_users')]);
checks.push(['No elo_rating fallback', !server.includes('elo_rating: 1000')]);
checks.push(['Avatar in SELECT', server.includes('avatar FROM users')]);

// 2. App.jsx checks
const app = fs.readFileSync('frontend/src/App.jsx', 'utf8');
checks.push(['Profile selector state', app.includes('profilesToSelect')]);
checks.push(['setIsInitializing on multi', app.includes('setIsInitializing(false)')]);
checks.push(['data.users array', app.includes('data.users')]);
checks.push(['Profile nav to dashboard', app.includes("window.location.href = '/dashboard'")]);
checks.push(['No Netflix text', !app.toLowerCase().includes('netflix')]);
checks.push(['setUser passed to Settings', app.includes('setUser={setUser}')]);

// 3. Register.jsx checks  
const reg = fs.readFileSync('frontend/src/pages/Register.jsx', 'utf8');
checks.push(['Grade label', reg.includes('>Grade</label>')]);
checks.push(['Grade options', reg.includes('Grade {i + 1}')]);
checks.push(['data.users check', reg.includes('data.users')]);
checks.push(['referralCode in payload', reg.includes('referralCode: formData.referralCode')]);
checks.push(['Referral input field', reg.includes('referralCode')]);
checks.push(['Add Learner bypass', reg.includes("searchParams.get('step') !== 'details'")]);

// 4. Dashboard.jsx checks
const dash = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');
checks.push(['No ELO visible text', !dash.includes('Earn ELO') && !dash.includes('ELO rating')]);
checks.push(['No Level display', !dash.includes('{user.classLevel}')]);
checks.push(['Referral widget', dash.includes('Share')]);
checks.push(['Gforce tokens text', dash.includes('Gforce Tokens')]);

// 5. Leaderboard.jsx checks
const lb = fs.readFileSync('frontend/src/pages/Leaderboard.jsx', 'utf8');
checks.push(['No elo_rating', !lb.includes('elo_rating')]);
checks.push(['gforce_tokens', lb.includes('gforce_tokens')]);
checks.push(['No ELO label', !lb.includes('Your ELO')]);

// 6. Settings.jsx checks
const settings = fs.readFileSync('frontend/src/pages/Settings.jsx', 'utf8');
checks.push(['Avatar upload endpoint', settings.includes('/api/user/avatar')]);
checks.push(['setUser prop', settings.includes('setUser')]);
checks.push(['Canvas compression', settings.includes('canvas')]);
checks.push(['Avatar persists to localStorage', settings.includes("localStorage.setItem('user'")]);

// 7. Layout.jsx checks
const layout = fs.readFileSync('frontend/src/components/Layout.jsx', 'utf8');
checks.push(['Avatar in nav', layout.includes('user?.avatar')]);

// 8. LandingPage.jsx checks
const lp = fs.readFileSync('frontend/src/pages/LandingPage.jsx', 'utf8');
checks.push(['No ELO text on landing', !lp.includes('ELO')]);
checks.push(['Grade not Class', !lp.includes('Class 12')]);

// 9. Analytics.jsx checks
const analytics = fs.readFileSync('frontend/src/pages/Analytics.jsx', 'utf8');
checks.push(['No ELO text', !analytics.includes('ELO')]);

// Print results
let pass = 0, fail = 0;
checks.forEach(([name, ok]) => {
  const status = ok ? 'PASS' : 'FAIL';
  if (ok) pass++; else fail++;
  console.log(status + ' | ' + name);
});
console.log('\n' + pass + '/' + (pass+fail) + ' checks passed. ' + fail + ' failures.');
