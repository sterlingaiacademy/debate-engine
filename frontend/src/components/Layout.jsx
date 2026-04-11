import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Mic, BarChart2, Trophy, UserCircle } from 'lucide-react';

export default function Layout({ user, onLogout }) {
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

          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '0.75rem', gap: '0.375rem' }}
          >
            <LogOut size={16} />
            <span className="nav-label">Logout</span>
          </button>
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
