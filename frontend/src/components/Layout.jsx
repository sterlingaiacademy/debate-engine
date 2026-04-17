import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Mic, BarChart2, Trophy, UserCircle, Users, Zap, Flame, Award } from 'lucide-react';

export default function Layout({ user, onLogout, onSwitchProfile }) {
  const { pathname } = useLocation();
  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);

  const navLinks = [
    { name: 'Dashboard',   path: '/dashboard', match: '/dashboard',  icon: LayoutDashboard },
    { name: 'Start Debate',path: isJunior ? '/debate' : '/debate-instructions?next=/debate', match: '/debate', icon: Mic },
    !isJunior && { name: 'Analytics',   path: '/analytics', match: '/analytics',   icon: BarChart2 },
    !isJunior && { name: 'Leaderboard', path: '/leaderboard', match: '/leaderboard', icon: Trophy },
    { name: 'Settings', path: '/settings', match: '/settings', icon: UserCircle }
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ 
        width: '280px', flexShrink: 0, borderRight: '1px solid var(--border)', 
        background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
        padding: '1.5rem', zIndex: 50
      }}>
        {/* LOGO */}
        <Link to="/dashboard" style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.75rem', marginBottom: '2.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
          G FORCE
        </Link>

        {/* NAV LINKS */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navLinks.map(({ name, path, match, icon: Icon }) => {
            const isActive = pathname.includes(match);
            return (
              <Link
                key={name}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem',
                  borderRadius: '12px', color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  fontWeight: isActive ? 800 : 600, fontSize: '1rem', textDecoration: 'none',
                  transition: 'all 0.2s ease', 
                  boxShadow: isActive ? '0 4px 15px rgba(139, 92, 246, 0.2)' : 'none'
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM SECTION: Stats & User */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Stats Pills */}
          {user && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '8px', padding: '0.5rem',
                fontSize: '0.85rem', fontWeight: 800, color: '#a78bfa'
              }} title="Gforce Tokens">
                <Zap size={14} strokeWidth={2.5} />
                {(user.gforceTokens || 0).toLocaleString()}
              </div>
              <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                  background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: '8px', padding: '0.5rem',
                  fontSize: '0.85rem', fontWeight: 800, color: '#fb923c'
                }} title="Daily Streak">
                  <Flame size={14} strokeWidth={2.5} />
                  {user.streak || 0}d
                </div>
              {user.rank && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                  background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
                  borderRadius: '8px', padding: '0.5rem',
                  fontSize: '0.85rem', fontWeight: 800, color: '#facc15',
                  gridColumn: 'span 2'
                }} title="Rank">
                  <Award size={14} strokeWidth={2.5} />
                  {user.rank}
                </div>
              )}
            </div>
          )}

          {/* User Profile Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
               )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user?.classLevel?.replace('Level', 'Grade')}</div>
            </div>

            <button
              onClick={onLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}
              title="Logout"
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Switch Profile Button */}
          {onSwitchProfile && user?.email && (
            <button
              onClick={onSwitchProfile}
              style={{
                width: '100%',
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '8px',
                padding: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#a78bfa',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
            >
              <Users size={16} />
              Switch Accounts
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto', padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
