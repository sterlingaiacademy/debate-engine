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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="header">
        <Link to="/dashboard" className="site-title" style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.4rem' }}>G FORCE</Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(({ name, path, match, icon: Icon }) => (
            <Link
              key={name}
              to={path}
              className={`nav-link${pathname.includes(match) ? ' active' : ''}`}
            >
              <Icon size={17} strokeWidth={2} />
              <span className="nav-label">{name}</span>
            </Link>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border)' }}>

            {/* GForce Token + Streak Pills */}
            {user && (
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
                {user.rank && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
                    borderRadius: '20px', padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem', fontWeight: 800, color: '#facc15'
                  }}>
                    <Award size={13} strokeWidth={2.5} />
                    {user.rank}
                  </div>
                )}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                    borderRadius: '20px', padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem', fontWeight: 800, color: '#fb923c'
                  }}>
                    <Flame size={13} strokeWidth={2.5} />
                    {user.streak || 0}d
                  </div>
              </div>
            )}

            {/* Switch Profile Button */}
            {onSwitchProfile && (
              <button
                onClick={onSwitchProfile}
                title="Switch Profile"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.6rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#a78bfa',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
              >
                <Users size={14} />
                <span className="nav-label">Profiles</span>
              </button>
            )}

            {/* Avatar */}
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)' }}>
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
               )}
            </div>
            
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.375rem' }}
            >
              <LogOut size={16} />
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </nav>
      </header>

      <main style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
