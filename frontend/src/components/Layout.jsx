import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Mic, BarChart2, Trophy,
  Zap, Flame, ChevronRight, ChevronLeft, Settings, BookOpen, Gamepad2, Menu, X, Crown, Globe, Users, Brain, Radio
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import PremiumEnrollModal from './PremiumEnrollModal';

export default function Layout({ user, onLogout, onSwitchProfile }) {
  const location = useLocation();
  const { pathname, search } = location;
  const searchParams = new URLSearchParams(search);
  const nextParam = searchParams.get('next');

  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2','Class 1-5',
    'Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);

  const isFullScreenRoute =
    pathname.includes('/debate') ||
    pathname.includes('agent') ||
    pathname.includes('/persona') ||
    pathname.includes('/mock-un') ||
    pathname.includes('/speech-coach');

  const getNormalizedLevel = (cls) => {
    if (!cls) return 'Level 1';
    if (cls.startsWith('Level ')) return cls;
    if (['KG', 'Class 1', 'Class 2', 'Class KG', 'KG-2'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
    return 'Level 1';
  };
  const normalizedLevel = getNormalizedLevel(user?.classLevel);
  const isLevel3Plus = ['Level 3', 'Level 4', 'Level 5'].includes(normalizedLevel);

  const navLinks = [
    { name: 'Dashboard',       path: '/dashboard',         match: '/dashboard',         icon: LayoutDashboard },
    { name: 'Debate Arena',    path: isJunior ? '/debate' : '/debate-instructions?next=/debate', match: '/debate', icon: Mic },
    isLevel3Plus && { name: 'Model UN', path: isJunior ? '/mock-un' : '/debate-instructions?next=/mock-un', match: '/mock-un', icon: Globe },
    isLevel3Plus && { name: 'Wisdom Arena', path: isJunior ? '/persona' : '/debate-instructions?next=/persona', match: '/persona', icon: Users },
    { name: 'Super Tutor', path: isJunior ? '/conversational-agent' : '/debate-instructions?next=/conversational-agent', match: '/conversational-agent', icon: Brain },
    isLevel3Plus && { name: 'Speech Coach', path: isJunior ? '/speech-coach' : '/debate-instructions?next=/speech-coach', match: '/speech-coach', icon: Radio },
    { name: 'Vocab Trainer',   path: '/vocab-trainer',   match: '/vocab-trainer',   icon: BookOpen },
    { name: 'Word Scramble',   path: '/word-scramble',   match: '/word-scramble',   icon: Gamepad2 },
    !isJunior && { name: 'Analytics',   path: '/analytics',   match: '/analytics',  icon: BarChart2 },
    !isJunior && { name: 'Leaderboard', path: '/leaderboard', match: '/leaderboard', icon: Trophy },
    { name: 'Settings',   path: '/settings',    match: '/settings',   icon: Settings },
  ].filter(Boolean);

  const tokens = user?.gforceTokens || 0;
  const xpPct  = Math.min((tokens % 5000) / 5000 * 100, 100);

  const TIER_COLORS = {
    Unranked: '#64748b', Bronze: '#cd7f32', Silver: '#94a3b8',
    Gold: '#f59e0b', Platinum: '#38bdf8', Diamond: '#818cf8',
    Master: '#f97316', Grandmaster: '#ec4899',
  };
  const tierColor = TIER_COLORS[user?.rank] || '#64748b';

  const SIDEBAR_W = isCollapsed && !isMobile ? 72 : 264;

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

  const BottomTabItem = ({ name, icon: Icon, path, isActive, isJunior }) => (
    <Link to={path} onClick={() => setMobileMenuOpen(false)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      textDecoration: 'none', padding: '8px 4px',
      color: isActive ? (isJunior ? '#7c3aed' : '#FF6B00') : '#64748b',
      flex: 1,
      WebkitTapHighlightColor: 'transparent',
    }}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span style={{ fontSize: '10px', fontWeight: isActive ? 800 : 600 }}>{name}</span>
    </Link>
  );

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100dvh', overflow: 'hidden', background: isJunior ? 'var(--bg-secondary)' : '#000' }}>
      
      {/* Mobile Top Header */}
      {isMobile && !isFullScreenRoute && (
        <header style={{
          height: 60, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem',
          background: isJunior ? 'rgba(255,255,255,0.95)' : 'rgba(10,10,10,0.95)',
          borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.06)',
          zIndex: 60,
        }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
            <img src={logoImg} alt="G FORCE" style={{ height: 28, width: 'auto' }} />
            <span style={{
              fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em',
              background: isJunior ? 'linear-gradient(135deg, #7c3aed, #e879f9)' : 'linear-gradient(135deg, #FF6B5A, #FF6B00)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              G FORCE
            </span>
          </Link>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              background: isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(139,92,246,0.1)',
              padding: '0.35rem 0.6rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
              color: isJunior ? '#7c3aed' : '#a78bfa',
            }}>
               <Zap size={12} strokeWidth={2.5} /> {(tokens).toLocaleString()}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              background: isJunior ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.1)',
              padding: '0.35rem 0.6rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
              color: '#fb923c',
            }}>
               <Flame size={12} strokeWidth={2.5} /> {user?.streak || 0}d
            </div>
          </div>
        </header>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', zIndex: 65,
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: isMobile ? 280 : SIDEBAR_W,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: isMobile ? 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' : 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
        zIndex: 70,
        overflow: 'hidden',
        ...(isMobile ? {
          position: 'fixed', top: 0, bottom: 0, left: 0,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        } : {
          transform: 'none',
        }),
        ...(isJunior ? {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '2px solid rgba(124,58,237,0.1)',
          boxShadow: '4px 0 24px rgba(124,58,237,0.08)',
        } : {
          background: 'rgba(10,10,10,0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
        }),
      }}>

        {/* Logo Row (Desktop/Mobile Menu Header) */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: isCollapsed && !isMobile ? 'center' : 'space-between',
          padding: isCollapsed && !isMobile ? '1.25rem 0' : '1.25rem 1.25rem 1.25rem 1.5rem',
          borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
          minHeight: 72,
          flexShrink: 0,
          gap: '0.5rem',
        }}>
          <Link to="/dashboard" onClick={() => isMobile && setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', overflow: 'hidden' }}>
            <img src={logoImg} alt="G FORCE" style={{ height: 32, width: 'auto', flexShrink: 0 }} />
            {(!isCollapsed || isMobile) && (
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

          {!isCollapsed && !isMobile && (
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

          {isMobile && (
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'transparent', border: 'none', color: isJunior ? '#7c3aed' : '#fff', padding: '8px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Collapsed expand button (Desktop only) */}
        {!isMobile && isCollapsed && (
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
          padding: isCollapsed && !isMobile ? '0.5rem' : '0.75rem 0.75rem 0.75rem 0',
          overflowY: 'auto', overflowX: 'hidden',
          marginTop: isMobile ? '1rem' : 0,
          paddingBottom: isMobile ? '80px' : 0,
        }}>
          {navLinks.map(({ name, path, match, icon: Icon }) => {
            const isCurrentRoute = pathname === match || pathname.startsWith(`${match}/`) || pathname.startsWith(`${match}?`);
            const isInstructionRoute = pathname === '/debate-instructions';
            const matchesInstruction = isInstructionRoute && (
              (match === '/debate' && (!nextParam || nextParam.startsWith('/debate'))) ||
              (match !== '/debate' && nextParam?.startsWith(match))
            );
            const isActive = isCurrentRoute || matchesInstruction;
            return (
              <Link
                key={name}
                to={path}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                title={isCollapsed && !isMobile ? name : ''}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: isCollapsed && !isMobile ? 0 : '0.75rem',
                  padding: isMobile 
                    ? '1.15rem 1.25rem'
                    : (isJunior
                      ? (isCollapsed && !isMobile ? '0.85rem' : '0.85rem 1.1rem')
                      : (isCollapsed && !isMobile ? '0.85rem 0' : '0.85rem 1rem')),
                  justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
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
                {(!isCollapsed || isMobile) && (
                  <span style={{ opacity: 1, transition: 'opacity 0.2s' }}>{name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ── */}
        <div style={{
          marginTop: 'auto',
          padding: isCollapsed && !isMobile ? '1rem 0.5rem' : '1rem 1rem',
          borderTop: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0,
        }}>

          {/* Stats pills — tokens + streak */}
          {(!isCollapsed || isMobile) && user && (
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
          {(!isCollapsed || isMobile) && (
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

          {/* Sidebar Upgrade Banner */}
          {(!user?.subscription_plan || user?.subscription_plan === 'free') && (
            <div
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false);
                setShowPremiumModal(true);
              }}
              style={{
                margin: (!isCollapsed || isMobile) ? '0.5rem 0.5rem 1rem' : '0.5rem 0 1rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                borderRadius: (!isCollapsed || isMobile) ? 14 : 10,
                padding: (!isCollapsed || isMobile) ? '0.75rem' : '0.65rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: (!isCollapsed || isMobile) ? 'space-between' : 'center',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              title="Upgrade to Pro"
            >
              {(!isCollapsed || isMobile) ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.3rem', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Crown size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Upgrade Plan</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: '0.1rem' }}>Unlock all features</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#fff" strokeWidth={3} />
                </>
              ) : (
                <Crown size={20} color="#fff" strokeWidth={2.5} />
              )}
            </div>
          )}

          {/* User profile row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '0.75rem',
            padding: isCollapsed && !isMobile ? '0.5rem' : '0.75rem',
            borderRadius: isJunior ? 99 : 12,
            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
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

            {(!isCollapsed || isMobile) && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.7rem', color: isJunior ? '#7c3aed' : '#475569', fontWeight: 600 }}>
                      {user?.grade
                        ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                        : user?.classLevel}
                    </div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, background: isJunior ? '#7c3aed' : '#FF6B00', color: '#fff', padding: '0.1rem 0.3rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                      {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'PRO' : 'DEMO'}
                    </div>
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

          {/* Collapsed logout (Desktop only) */}
          {isCollapsed && !isMobile && (
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

        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{
        flex: 1,
        overflowX: 'hidden',
        overflowY: isFullScreenRoute ? 'hidden' : 'auto',
        padding: isFullScreenRoute ? 0 : (isMobile ? '1rem 1rem calc(80px + env(safe-area-inset-bottom, 0px)) 1rem' : '2rem 1.5rem'),
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

      {/* ─── MOBILE BOTTOM NAVIGATION ─── */}
      {isMobile && !isFullScreenRoute && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 70,
          background: isJunior ? 'rgba(255,255,255,0.98)' : 'rgba(10,10,10,0.98)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderTop: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 60,
        }}>
          <BottomTabItem name="Home" icon={LayoutDashboard} path="/dashboard" isActive={pathname === '/dashboard'} isJunior={isJunior} />
          <BottomTabItem name="Debate" icon={Mic} path={isJunior ? '/debate' : '/debate-instructions?next=/debate'} isActive={pathname.includes('/debate')} isJunior={isJunior} />
          <BottomTabItem name={isJunior ? "Vocab" : "Stats"} icon={isJunior ? BookOpen : BarChart2} path={isJunior ? '/vocab-trainer' : '/analytics'} isActive={pathname.includes(isJunior ? '/vocab-trainer' : '/analytics')} isJunior={isJunior} />
          <BottomTabItem name={isJunior ? "Play" : "Rank"} icon={isJunior ? Gamepad2 : Trophy} path={isJunior ? '/word-scramble' : '/leaderboard'} isActive={pathname.includes(isJunior ? '/word-scramble' : '/leaderboard')} isJunior={isJunior} />
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: 'transparent', border: 'none', padding: '8px 4px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              color: mobileMenuOpen ? (isJunior ? '#7c3aed' : '#FF6B00') : '#64748b',
              flex: 1,
            }}
          >
            <Menu size={24} strokeWidth={mobileMenuOpen ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: mobileMenuOpen ? 800 : 600 }}>More</span>
          </button>
        </nav>
      )}

    {/* Sidebar Premium Modal */}
    {showPremiumModal && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', overflowY: 'auto' }}>
        <PremiumEnrollModal user={user} mode="upgrade" onDismiss={() => setShowPremiumModal(false)} />
      </div>
    )}

    </div>
  );
}

