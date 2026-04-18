import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Mic, BarChart2, Trophy,
  UserCircle, Users, Zap, Flame, Award, ChevronRight,
  ChevronLeft, Target, Settings, BookOpen, PenLine
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Layout({ user, onLogout, onSwitchProfile }) {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2','Class 1-5',
    'Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);

  const isFullScreenRoute =
    pathname.includes('/debate') ||
    pathname.includes('agent') ||
    pathname.includes('/persona') ||
    pathname.includes('/mock-un');

  const navLinks = [
    { name: 'Dashboard',       path: '/dashboard',         match: '/dashboard',         icon: LayoutDashboard },
    { name: 'Daily Challenge',  path: '/daily-challenge',   match: '/daily-challenge',   icon: Flame },
    { name: 'Debate',          path: isJunior ? '/debate' : '/debate-instructions?next=/debate', match: '/debate', icon: Mic },
    { name: 'Vocab Trainer',   path: '/vocab-trainer',     match: '/vocab-trainer',     icon: BookOpen },
    { name: 'Argument Builder',path: '/argument-builder',  match: '/argument-builder',  icon: PenLine },
    !isJunior && { name: 'Analytics',   path: '/analytics',   match: '/analytics',  icon: BarChart2 },
    !isJunior && { name: 'Leaderboard', path: '/leaderboard', match: '/leaderboard', icon: Trophy },
    { name: 'Settings',   path: '/settings',    match: '/settings',   icon: Settings },
  ].filter(Boolean);


  // XP-style bar: tokens relative to next tier (~5000 tokens per tier roughly)
  const tokens = user?.gforceTokens || 0;
  const xpPct  = Math.min((tokens % 5000) / 5000 * 100, 100);

  const TIER_COLORS = {
    Unranked: '#64748b', Bronze: '#cd7f32', Silver: '#94a3b8',
    Gold: '#f59e0b', Platinum: '#38bdf8', Diamond: '#818cf8',
    Master: '#f97316', Grandmaster: '#ec4899',
  };
  const tierColor = TIER_COLORS[user?.rank] || '#64748b';

  /* ── Styles ── */
  const SIDEBAR_W = isCollapsed ? 72 : 264;

  const activeStyle = isJunior
    ? {
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
        borderRadius: 99,
      }
    : {
        background: 'rgba(255,107,0,0.12)',
        color: '#FF6B00',
        borderLeft: '3px solid #FF6B00',
        borderRadius: '0 10px 10px 0',
      };

  const inactiveStyle = {
    background: 'transparent',
    color: isJunior ? 'var(--j-purple)' : '#64748b',
    borderLeft: isJunior ? 'none' : '3px solid transparent',
    borderRadius: isJunior ? 99 : '0 10px 10px 0',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: isJunior ? 'var(--bg-secondary)' : '#000' }}>

      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: SIDEBAR_W,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
        zIndex: 50,
        overflow: 'hidden',
        ...(isJunior ? {
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '2px solid rgba(124,58,237,0.1)',
          boxShadow: '4px 0 24px rgba(124,58,237,0.08)',
        } : {
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
        }),
      }}>

        {/* ── Logo Row ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '1.25rem 0' : '1.25rem 1.25rem 1.25rem 1.5rem',
          borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
          minHeight: 72,
          flexShrink: 0,
          gap: '0.5rem',
        }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', overflow: 'hidden' }}>
            <img src={logoImg} alt="G FORCE" style={{ height: 32, width: 'auto', flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{
                fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden',
                background: isJunior
                  ? 'linear-gradient(135deg, #7c3aed, #e879f9)'
                  : 'linear-gradient(135deg, #FF6B5A, #FF6B00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                G FORCE
              </span>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                background: 'transparent',
                border: isJunior ? '1.5px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isJunior ? '#7c3aed' : '#64748b',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              margin: '0.75rem auto',
              background: isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.04)',
              border: isJunior ? '1.5px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isJunior ? '#7c3aed' : '#64748b',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ChevronRight size={14} />
          </button>
        )}

        {/* ── Nav Links ── */}
        <nav style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          gap: isJunior ? '0.35rem' : '0.15rem',
          padding: isCollapsed ? '0.5rem' : '0.75rem 0.75rem 0.75rem 0',
          overflowY: 'auto', overflowX: 'hidden',
        }}>
          {navLinks.map(({ name, path, match, icon: Icon }) => {
            const isActive = pathname.startsWith(match) || (match === '/debate' && pathname.includes('/debate'));
            return (
              <Link
                key={name}
                to={path}
                title={isCollapsed ? name : ''}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: isCollapsed ? 0 : '0.75rem',
                  padding: isJunior
                    ? (isCollapsed ? '0.85rem' : '0.85rem 1.1rem')
                    : (isCollapsed ? '0.85rem 0' : '0.85rem 1rem'),
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  marginLeft: isJunior || isCollapsed ? 0 : 0,
                  ...(isActive ? activeStyle : inactiveStyle),
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = isJunior
                      ? 'rgba(124,58,237,0.08)'
                      : 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = isJunior ? '#7c3aed' : '#e2e8f0';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isJunior ? 'var(--j-purple)' : '#64748b';
                  }
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ flexShrink: 0, color: isActive && !isJunior ? '#FF6B00' : 'currentColor' }}
                />
                {!isCollapsed && (
                  <span style={{ opacity: 1, transition: 'opacity 0.2s' }}>{name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ── */}
        <div style={{
          marginTop: 'auto',
          padding: isCollapsed ? '1rem 0.5rem' : '1rem 1rem',
          borderTop: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0,
        }}>

          {/* Stats pills — tokens + streak */}
          {!isCollapsed && user && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                background: isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(139,92,246,0.1)',
                border: isJunior ? '1.5px solid rgba(124,58,237,0.18)' : '1px solid rgba(139,92,246,0.25)',
                borderRadius: 8, padding: '0.5rem',
                fontSize: '0.82rem', fontWeight: 800,
                color: isJunior ? '#7c3aed' : '#a78bfa',
              }} title="GForce Tokens">
                <Zap size={14} strokeWidth={2.5} />
                {(tokens).toLocaleString()}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                background: isJunior ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.1)',
                border: isJunior ? '1.5px solid rgba(249,115,22,0.2)' : '1px solid rgba(249,115,22,0.25)',
                borderRadius: 8, padding: '0.5rem',
                fontSize: '0.82rem', fontWeight: 800,
                color: '#fb923c',
              }} title="Daily Streak">
                <Flame size={14} strokeWidth={2.5} />
                {user.streak || 0}d
              </div>
            </div>
          )}

          {/* XP / progress bar */}
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isJunior ? '#7c3aed' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.rank || 'Unranked'}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isJunior ? '#a78bfa' : '#334155' }}>
                  {tokens % 5000} / 5000
                </span>
              </div>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          )}

          {/* User profile row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '0.75rem',
            padding: isCollapsed ? '0.5rem' : '0.75rem',
            borderRadius: isJunior ? 99 : 12,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            background: isJunior ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.03)',
            border: isJunior ? '1.5px solid rgba(124,58,237,0.12)' : '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: isJunior ? 'linear-gradient(135deg, #7c3aed, #e879f9)' : 'rgba(255,107,0,0.15)',
              border: isJunior ? 'none' : `2px solid ${tierColor}40`,
              overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '0.95rem', fontWeight: 800, color: isJunior ? '#fff' : tierColor }}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
              }
            </div>

            {!isCollapsed && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isJunior ? '#7c3aed' : '#475569', fontWeight: 600 }}>
                    {user?.grade
                      ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                      : user?.classLevel}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    background: 'transparent', border: 'none',
                    color: isJunior ? '#94a3b8' : '#334155',
                    cursor: 'pointer', display: 'flex', padding: '0.4rem', borderRadius: 8,
                    transition: 'all 0.2s',
                  }}
                  title="Logout"
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isJunior ? '#94a3b8' : '#334155'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>

          {/* Collapsed logout */}
          {isCollapsed && (
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                width: '100%',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
                color: '#ef4444', cursor: 'pointer',
                display: 'flex', justifyContent: 'center',
                padding: '0.65rem', borderRadius: 10,
                transition: 'all 0.2s',
              }}
            >
              <LogOut size={16} />
            </button>
          )}

          {/* Switch accounts */}
          {!isCollapsed && onSwitchProfile && user?.email && (
            <button
              onClick={onSwitchProfile}
              style={{
                width: '100%',
                background: isJunior ? 'rgba(124,58,237,0.06)' : 'rgba(139,92,246,0.08)',
                border: isJunior ? '1.5px solid rgba(124,58,237,0.15)' : '1px solid rgba(139,92,246,0.2)',
                borderRadius: isJunior ? 99 : 9,
                padding: '0.6rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                color: isJunior ? '#7c3aed' : '#a78bfa',
                fontSize: '0.8rem', fontWeight: 700,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = isJunior ? 'rgba(124,58,237,0.14)' : 'rgba(139,92,246,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = isJunior ? 'rgba(124,58,237,0.06)' : 'rgba(139,92,246,0.08)'}
            >
              <Users size={14} />
              Switch Accounts
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{
        flex: 1,
        overflowX: 'hidden',
        overflowY: isFullScreenRoute ? 'hidden' : 'auto',
        padding: isFullScreenRoute ? 0 : '2rem 1.5rem',
        display: 'flex', justifyContent: 'center',
        position: 'relative', zIndex: 10,
        background: isJunior
          ? 'linear-gradient(135deg, #faf5ff 0%, #fff0f7 50%, #f0f9ff 100%)'
          : '#000',
      }}>
        <div style={{
          width: '100%',
          maxWidth: isFullScreenRoute ? '100%' : '1100px',
          height: isFullScreenRoute ? '100%' : 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
