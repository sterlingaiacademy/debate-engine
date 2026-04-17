const fs = require('fs');

// 1. App.jsx - pass setUser to Dashboard
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');
app = app.replace(
  '<Dashboard user={user} />',
  '<Dashboard user={user} setUser={setUser} />'
);
fs.writeFileSync('frontend/src/App.jsx', app);
console.log('App.jsx:', app.includes('setUser={setUser}') ? 'OK' : 'FAIL');

// 2. Dashboard.jsx - accept setUser, push tokens+streak into user when stats load
let dash = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Find the component signature
dash = dash.replace(
  'export default function Dashboard({ user }) {',
  'export default function Dashboard({ user, setUser }) {'
);

// Find where stats are set (after the fetch resolves)
// Look for "setStats(data);" and add the push right after
const oldSetStats = 'setStats(data);';
const newSetStats = `setStats(data);
      // Push live token + streak into shared user state so header always shows them
      if (setUser && (data.gforce_tokens !== undefined || data.current_streak !== undefined)) {
        setUser(prev => {
          const updated = { ...prev, gforceTokens: Math.round(data.gforce_tokens || 0), streak: data.current_streak || 0 };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }`;

if (dash.includes(oldSetStats)) {
  // Only replace the first occurrence (inside fetchStats)
  dash = dash.replace(oldSetStats, newSetStats);
  console.log('Dashboard setStats: OK');
} else {
  console.log('setStats not found');
}

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', dash);

// 3. Layout.jsx - add token and streak pills to header
let layout = fs.readFileSync('frontend/src/components/Layout.jsx', 'utf8');

const oldSwitchBtn = `            {/* Switch Profile Button */}
            {onSwitchProfile && (`;

const newPills = `            {/* GForce Token + Streak Pills */}
            {user?.gforceTokens !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: '20px', padding: '0.3rem 0.65rem',
                  fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa'
                }}>
                  <Zap size={13} strokeWidth={2.5} />
                  {(user.gforceTokens || 0).toLocaleString()}
                </div>
                {user.streak > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                    borderRadius: '20px', padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem', fontWeight: 800, color: '#fb923c'
                  }}>
                    <Flame size={13} strokeWidth={2.5} />
                    {user.streak}d
                  </div>
                )}
              </div>
            )}

            {/* Switch Profile Button */}
            {onSwitchProfile && (`;

if (layout.includes(oldSwitchBtn)) {
  layout = layout.replace(oldSwitchBtn, newPills);
  console.log('Layout pills: OK');
} else {
  console.log('Layout switch btn marker not found');
}

// Also add Flame to Layout imports
layout = layout.replace(
  `import { LogOut, LayoutDashboard, Mic, BarChart2, Trophy, UserCircle, Users, Zap } from 'lucide-react';`,
  `import { LogOut, LayoutDashboard, Mic, BarChart2, Trophy, UserCircle, Users, Zap, Flame } from 'lucide-react';`
);

fs.writeFileSync('frontend/src/components/Layout.jsx', layout);
console.log('Layout imports: OK');
console.log('Layout has Flame pill:', layout.includes('<Flame size={13}'));
