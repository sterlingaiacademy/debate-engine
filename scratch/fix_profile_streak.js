const fs = require('fs');

// FIX 1: App.jsx - handleSwitchProfile should fall back to user.email for credential users
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const oldSwitch = `  const handleSwitchProfile = async () => {
    // Fetch profiles for the current Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    if (!email) return;
    try {
      const res = await fetch(\`/api/user-by-email/\${encodeURIComponent(email)}\`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUser(null);
          localStorage.removeItem('user');
          setProfilesToSelect(data.users);
        }
      }
    } catch (e) { console.error(e); }
  };`;

const newSwitch = `  const handleSwitchProfile = async () => {
    // Get email from OAuth session OR from stored user object (for credential login users)
    let email = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      email = session?.user?.email;
    } catch (e) {}
    // Fallback: use email stored in user object (credential login users)
    if (!email) {
      const storedUser = localStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      email = parsed?.email;
    }
    if (!email) {
      alert('Cannot switch profile: no email linked to this account.');
      return;
    }
    try {
      const res = await fetch(\`/api/user-by-email/\${encodeURIComponent(email)}\`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUser(null);
          localStorage.removeItem('user');
          setProfilesToSelect(data.users);
        } else {
          alert('Only one profile found for this account.');
        }
      }
    } catch (e) { console.error(e); }
  };`;

if (app.includes(oldSwitch)) {
  app = app.replace(oldSwitch, newSwitch);
  console.log('App.jsx switch fix: OK');
} else {
  console.log('App.jsx switch: match failed, trying partial...');
  const idx = app.indexOf('handleSwitchProfile = async');
  console.log('Found at:', idx);
}
fs.writeFileSync('frontend/src/App.jsx', app);

// FIX 2: Layout.jsx - Show streak always (even 0), and show token pill even before stats load
let layout = fs.readFileSync('frontend/src/components/Layout.jsx', 'utf8');

// Remove the `user.streak > 0` guard so streak always shows once it's set
const oldStreakGuard = `                {user.streak > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                    borderRadius: '20px', padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem', fontWeight: 800, color: '#fb923c'
                  }}>
                    <Flame size={13} strokeWidth={2.5} />
                    {user.streak}d
                  </div>
                )}`;

const newStreakGuard = `                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                    borderRadius: '20px', padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem', fontWeight: 800, color: '#fb923c'
                  }}>
                    <Flame size={13} strokeWidth={2.5} />
                    {user.streak || 0}d
                  </div>`;

// Also change the outer condition from gforceTokens !== undefined to just show always
const oldOuterGuard = `            {user?.gforceTokens !== undefined && (`;
const newOuterGuard = `            {user && (`;

if (layout.includes(oldStreakGuard)) {
  layout = layout.replace(oldStreakGuard, newStreakGuard);
  console.log('Streak guard removed: OK');
} else {
  console.log('Streak guard not found - may have different whitespace');
}

if (layout.includes(oldOuterGuard)) {
  layout = layout.replace(oldOuterGuard, newOuterGuard);
  console.log('Outer guard simplified: OK');
} else {
  console.log('Outer guard not found');
}

fs.writeFileSync('frontend/src/components/Layout.jsx', layout);
console.log('Done');
