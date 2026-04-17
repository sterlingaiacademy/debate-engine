import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Mic, BarChart2, Trophy, UserCircle, Users, Zap, Flame, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Layout({ user, onLogout, onSwitchProfile }) {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true); // START COLLAPSED by default
  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);

  const isFullScreenRoute = pathname.includes('/debate') || pathname.includes('agent') || pathname.includes('/persona') || pathname.includes('/mock-un');


  const navLinks = [
    { name: 'Dashboard',   path: '/dashboard', match: '/dashboard',  icon: LayoutDashboard },
    { name: 'Start Debate',path: isJunior ? '/debate' : '/debate-instructions?next=/debate', match: '/debate', icon: Mic },
    !isJunior && { name: 'Analytics',   path: '/analytics', match: '/analytics',   icon: BarChart2 },
    !isJunior && { name: 'Leaderboard', path: '/leaderboard', match: '/leaderboard', icon: Trophy },
    { name: 'Settings', path: '/settings', match: '/settings', icon: UserCircle }
  ].filter(Boolean);

  return (
    <div style={{ 
      display: 'flex', height: '100vh', overflow: 'hidden', 
      backgroundColor: '#000000',
    }}>
      {/* SIDEBAR NAVIGATION - Glassmorphic iOS Style */}
      <aside style={{ 
        width: isCollapsed ? '88px' : '280px', flexShrink: 0, 
        borderRight: '1px solid rgba(255,255,255,0.08)', 
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        padding: isCollapsed ? '1.5rem 0.75rem' : '1.5rem', zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
      }}>
        {/* LOGO AND TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: '2.5rem' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img src={logoImg} alt="G FORCE" style={{ height: '32px', width: 'auto', flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                G FORCE
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', 
              cursor: 'pointer', padding: '0.25rem', borderRadius: '50%', display: isCollapsed ? 'none' : 'flex' 
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Expand toggle when collapsed (Floating) */}
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)}
            style={{
              alignSelf: 'center', marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%', padding: '0.25rem', color: 'var(--text-secondary)',
              cursor: 'pointer', zIndex: 100
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* NAV LINKS */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navLinks.map(({ name, path, match, icon: Icon }) => {
            const isActive = pathname.includes(match);
            return (
              <Link
                key={name}
                to={path}
                title={isCollapsed ? name : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', 
                  padding: isCollapsed ? '0.875rem' : '0.875rem 1rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: '12px', color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, #FF6B00 0%, #D84200 100%)' : 'transparent',
                  fontWeight: isActive ? 800 : 600, fontSize: '1rem', textDecoration: 'none',
                  transition: 'all 0.2s ease', 
                  boxShadow: isActive ? '0 4px 15px rgba(216, 66, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
                  overflow: 'hidden', whiteSpace: 'nowrap'
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s' }}>{name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM SECTION: Stats & User */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Stats Pills */}
          {!isCollapsed && user && (
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
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', 
            background: 'rgba(255,255,255,0.03)', padding: isCollapsed ? '0.5rem' : '0.75rem', 
            borderRadius: '12px', justifyContent: isCollapsed ? 'center' : 'flex-start',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
               )}
            </div>
            
            {!isCollapsed && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {user?.grade ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade) : user?.classLevel?.replace('Level', 'Grade')}
                  </div>
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
              </>
            )}
          </div>

          {/* Switch Profile Button */}
          {!isCollapsed && onSwitchProfile && user?.email && (
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

          {/* Only Logout Button if Collapsed */}
          {isCollapsed && (
             <button
              onClick={onLogout}
              style={{ 
                width: '100%',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', 
                color: '#ef4444', cursor: 'pointer', display: 'flex', justifyContent: 'center', 
                padding: '0.75rem', borderRadius: '12px', transition: 'all 0.2s' 
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ 
        flex: 1, overflowX: 'hidden', overflowY: isFullScreenRoute ? 'hidden' : 'auto', 
        padding: isFullScreenRoute ? '0' : '2rem 1.5rem', 
        display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: isFullScreenRoute ? '100%' : '1100px', 
          height: isFullScreenRoute ? '100%' : 'auto',
          display: 'flex', flexDirection: 'column'
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
