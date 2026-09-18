import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Mic, BarChart2, Trophy,
  Zap, Flame, Settings, BookOpen, Gamepad2, Menu, X, Crown, Globe, Users, Brain, Radio, Scroll, Target, Presentation, FileQuestion, Award, ChevronRight, Music
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import PremiumEnrollModal from './PremiumEnrollModal';
import Topbar from './Topbar';

// Mobile bottom nav tab item
function BottomTabItem({ name, icon: Icon, path, isActive, isJunior }) {
  return (
    <Link
      to={path}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        textDecoration: 'none', flex: 1, padding: '8px 4px',
        color: isActive ? (isJunior ? '#7c3aed' : '#FF6B00') : '#64748b',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span style={{ fontSize: '10px', fontWeight: isActive ? 800 : 600 }}>{name}</span>
    </Link>
  );
}


export default function Layout({ user, setUser, onLogout, onSwitchProfile }) {
  const location = useLocation();
  const { pathname, search } = location;
  const mainScrollRef = useRef(null);

  useLayoutEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [pathname]);
  const searchParams = new URLSearchParams(search);
  const nextParam = searchParams.get('next');

  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
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

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);

  const isFullScreenRoute =
    pathname.includes('/debate') ||
    pathname.includes('agent') ||
    pathname.includes('/persona') ||
    pathname.includes('/mock-un') ||
    pathname.includes('/speech-coach') ||
    pathname.includes('/speech-analysis') ||
    pathname.includes('/speech-league');

  const isFullWidthRoute = pathname.includes('/ito-register') || pathname.includes('/mini-mun') || pathname.includes('/indus-mun') || pathname.includes('/english-session') || pathname.includes('/speech-league-register') || pathname.includes('/freedom-quiz') || pathname.includes('/teacher-2030-register');

  const getNormalizedLevel = (cls) => {
    if (!cls) return 'Level 1';
    if (cls.startsWith('Level ')) return cls;
    if (['KG', 'Class 1', 'Class 2', 'Class KG', 'KG-2', 'Grade 1', 'Grade 2'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5', 'Grade 3', 'Grade 4', 'Grade 5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8', 'Grade 6', 'Grade 7', 'Grade 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10', 'Grade 9', 'Grade 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12', 'Grade 11', 'Grade 12'].includes(cls)) return 'Level 5';
    return 'Level 1';
  };
  const normalizedLevel = getNormalizedLevel(user?.classLevel);
  const isLevel3Plus = ['Level 3', 'Level 4', 'Level 5'].includes(normalizedLevel);

  const plan = user?.subscription_plan;
  const isPro  = ['pro', 'max'].includes(plan);  // MUN30 access
  const isMax  = plan === 'max';                   // D365 access
  const isFree = !isPro;                           // lock screen for both

  const navLinks = [
    { name: 'Dashboard',       path: '/dashboard',         match: '/dashboard',         icon: LayoutDashboard },
    { name: 'Debate Arena',    path: isJunior ? '/debate' : '/debate-instructions?next=/debate', match: '/debate', icon: Mic },
    isLevel3Plus && { name: 'Model UN', path: isJunior ? '/mock-un' : '/debate-instructions?next=/mock-un', match: '/mock-un', icon: Globe },
    isLevel3Plus && { name: 'Wisdom Arena', path: isJunior ? '/persona' : '/debate-instructions?next=/persona', match: '/persona', icon: Users },
    { name: 'Super Tutor', path: isJunior ? '/conversational-agent' : '/debate-instructions?next=/conversational-agent', match: '/conversational-agent', icon: Brain },
    isLevel3Plus && { name: 'Speech Coach', path: isJunior ? '/speech-coach' : '/debate-instructions?next=/speech-coach', match: '/speech-coach', icon: Radio },
    isLevel3Plus && { name: 'Speech Analysis', path: '/speech-analysis', match: '/speech-analysis', icon: Mic },
    { name: 'Sangeet', path: '/sangeet', match: '/sangeet', icon: Music },
    // MUN 30-Day — Pro & Max full access; Free sees it locked
    { name: 'MUN 30 Boot Camp', path: '/mun30', match: '/mun30', icon: Target, locked: isFree, plan: 'Pro' },
    // Diplomat 365 — Max only; Pro & Free see it locked
    { name: 'Diplomat 365', path: '/diplomat365', match: '/diplomat365', icon: Scroll, locked: !isMax, plan: 'Max' },
    { name: 'Word Scramble',   path: '/word-scramble',   match: '/word-scramble',   icon: Gamepad2 },
    !isJunior && { name: 'Analytics',   path: '/analytics',   match: '/analytics',  icon: BarChart2 },
    !isJunior && { name: 'Leaderboard', path: '/leaderboard', match: '/leaderboard', icon: Trophy },
    { name: 'Certificates', path: '/certificates', match: '/certificates', icon: Award },
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

  // Desktop: collapsed=64px icons only, hovered=264px expanded
  const desktopExpanded = !isCollapsed || sidebarHovered;
  const SIDEBAR_W = desktopExpanded && !isMobile ? 264 : (!isMobile ? 64 : 280);

  const activeStyle = isJunior
    ? {
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
        borderRadius: 99,
      }
    : {
        background: 'linear-gradient(135deg, rgba(255,107,0,0.18) 0%, rgba(255,107,0,0.08) 100%)',
        color: '#FF6B00',
        borderLeft: '3px solid #FF6B00',
        borderRadius: '0 12px 12px 0',
        boxShadow: '0 0 20px rgba(255,107,0,0.12), inset 0 0 0 1px rgba(255,107,0,0.12)',
      };

  const inactiveStyle = {
    background: 'transparent',
    color: isJunior ? 'var(--j-purple)' : '#64748b',
    borderLeft: isJunior ? 'none' : '3px solid transparent',
    borderRadius: isJunior ? 99 : '0 12px 12px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? '100svh' : '111.111vh', minHeight: isMobile ? '-webkit-fill-available' : '111.111vh', overflow: 'hidden', background: isJunior ? 'rgba(240,233,255,0.6)' : 'rgba(8,10,18,0.97)' }}>
      
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
      <motion.aside
        onMouseEnter={() => !isMobile && setSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setSidebarHovered(false)}
        animate={{ 
          width: isMobile ? 280 : (desktopExpanded ? 264 : 64),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 35, mass: 0.8 }}
        style={{
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 70,
          overflow: 'hidden',
          ...(isMobile ? {
            position: 'fixed', top: 0, bottom: 0, left: 0,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          } : {
            transform: 'none',
          }),
          ...(isJunior ? {
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '4px 0 32px rgba(124,58,237,0.12)',
          } : {
            background: 'linear-gradient(180deg, rgba(8,10,18,0.97) 0%, rgba(6,8,15,0.99) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
          }),
        }}>

        {/* Logo Row (Desktop/Mobile Menu Header) */}
        <div style={{
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: !desktopExpanded && !isMobile ? 'center' : 'space-between',
          padding: isMobile ? '1.25rem 1.25rem 1.25rem 1.5rem' : (!desktopExpanded ? '1.5rem 0 0.5rem 0' : '1.5rem 1rem 0.5rem 1.25rem'),
          borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.1)',
          minHeight: 72,
          flexShrink: 0,
          gap: !desktopExpanded && !isMobile ? '0.75rem' : '0.5rem',
        }}>
          {/* Logo (Always visible, scaled when collapsed) */}
          <Link to="/dashboard" onClick={() => isMobile && setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', overflow: 'hidden' }}>
            <img src={logoImg} alt="G FORCE" style={{ 
              height: !desktopExpanded && !isMobile ? 'auto' : 32, 
              width: !desktopExpanded && !isMobile ? '100%' : 'auto', 
              maxWidth: !desktopExpanded && !isMobile ? '36px' : 'none',
              flexShrink: 0 
            }} />
            <motion.span
              animate={{ opacity: (desktopExpanded || isMobile) ? 1 : 0, width: (desktopExpanded || isMobile) ? 'auto' : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35, mass: 0.8 }}
              style={{
                fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden', display: 'block',
                background: isJunior
                  ? 'linear-gradient(135deg, #7c3aed, #e879f9)'
                  : 'linear-gradient(135deg, #FF6B5A, #FF6B00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              G FORCE
            </motion.span>
          </Link>

          {/* Mobile Close Button */}
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

        {/* ── Nav Links ── */}
        <nav style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          gap: isMobile ? '0.45rem' : (isJunior ? '0.35rem' : '0.15rem'),
          padding: isMobile ? '1.5rem 1.25rem 80px 1.25rem' : (!desktopExpanded && !isMobile ? '0.5rem' : '0.75rem 0.75rem 0.75rem 0'),
          overflowY: 'auto', overflowX: 'hidden',
          marginTop: isMobile ? '1rem' : 0,
        }}>
          {navLinks.map(({ name, path, match, icon: Icon, locked, plan: requiredPlan }) => {
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
                title={!desktopExpanded && !isMobile ? name : ''}
                className={!isMobile && isActive ? (isJunior ? 'gf-nav-link-active gf-nav-link-active-junior' : 'gf-nav-link-active') : ''}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: isMobile ? '1rem' : (!desktopExpanded && !isMobile ? 0 : '0.75rem'),
                  padding: isMobile 
                    ? '1.05rem 1.25rem'
                    : (isJunior
                      ? (!desktopExpanded && !isMobile ? '0.85rem' : '0.85rem 1.1rem')
                      : (!desktopExpanded && !isMobile ? '0.85rem 0' : '0.85rem 1rem')),
                  justifyContent: !desktopExpanded && !isMobile ? 'center' : 'flex-start',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: isMobile ? '1.1rem' : '0.95rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: isActive && !isMobile ? 'visible' : 'hidden',
                  opacity: locked ? 0.6 : 1,
                  ...(isActive ? activeStyle : inactiveStyle),
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = isJunior
                      ? 'rgba(124,58,237,0.08)'
                      : 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = isJunior ? '#7c3aed' : '#e2e8f0';
                    e.currentTarget.style.borderLeftColor = 'rgba(255,255,255,0.12)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isJunior ? 'var(--j-purple)' : '#64748b';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }
                }}
              >
                <Icon
                  size={isMobile ? 24 : 20}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ flexShrink: 0, color: isActive && !isJunior ? '#FF6B00' : 'currentColor' }}
                />
                <motion.span
                  animate={{ opacity: (desktopExpanded || isMobile) ? 1 : 0, maxWidth: (desktopExpanded || isMobile) ? 200 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 35, mass: 0.8 }}
                  style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                >{name}</motion.span>
                {/* Lock badge — emoji only to save horizontal space */}
                <motion.span
                  animate={{ opacity: locked && (desktopExpanded || isMobile) ? 0.85 : 0, maxWidth: locked && (desktopExpanded || isMobile) ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 35, mass: 0.8 }}
                  title={`${requiredPlan} plan required`}
                  style={{ fontSize: '0.75rem', flexShrink: 0, marginLeft: '0.2rem', overflow: 'hidden', display: 'inline-block' }}
                >🔒</motion.span>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ── */}
        <div style={{
          marginTop: 'auto',
          padding: !desktopExpanded && !isMobile ? '1rem 0.5rem' : '1rem 1rem',
          borderTop: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0,
        }}>

          {/* Stats pills removed */}

          {/* XP / progress bar removed */}

          {/* Sidebar Upgrade Banner */}
          {(!user?.subscription_plan || user?.subscription_plan === 'free') && (
            <div
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false);
                setShowPremiumModal(true);
              }}
              style={{
                margin: (desktopExpanded || isMobile) ? '0.5rem 0.5rem 1rem' : '0.5rem 0 1rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                borderRadius: (desktopExpanded || isMobile) ? 14 : 10,
                padding: (desktopExpanded || isMobile) ? '0.75rem' : '0.65rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: (desktopExpanded || isMobile) ? 'space-between' : 'center',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              title="Upgrade to Pro"
            >
              {(desktopExpanded || isMobile) ? (
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
            padding: !desktopExpanded && !isMobile ? '0.5rem' : '0.75rem',
            borderRadius: isJunior ? 99 : 12,
            justifyContent: !desktopExpanded && !isMobile ? 'center' : 'flex-start',
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

            {(desktopExpanded || isMobile) && (
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
          {!desktopExpanded && !isMobile && (
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
      </motion.aside>

      {/* ─── RIGHT SIDE (TOPBAR + MAIN CONTENT) ─── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        /* Inward curve: this whole panel curves away from the sidebar */
        borderTopLeftRadius: isMobile ? 0 : 24,
        borderBottomLeftRadius: isMobile ? 0 : 24,
        borderTop: isMobile ? 'none' : (isJunior ? '1px solid rgba(124,58,237,0.12)' : '1px solid rgba(255,255,255,0.08)'),
        borderLeft: isMobile ? 'none' : (isJunior ? '1px solid rgba(124,58,237,0.12)' : '1px solid rgba(255,255,255,0.08)'),
        background: isJunior
          ? 'linear-gradient(135deg, #faf5ff 0%, #fff0f7 50%, #f0f9ff 100%)'
          : '#06080f',
      }}>
        
        {/* TOPBAR — desktop only; mobile already has the top header */}
        {!isMobile && <Topbar user={user} setUser={setUser} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} onLogout={onLogout} />}


        {/* ─── MAIN CONTENT ─── */}
        <main ref={mainScrollRef} id="main-scroll-container" style={{
          flex: 1,
          overflowX: 'hidden',
          overflowY: isFullScreenRoute ? 'hidden' : 'auto',
          padding: isFullScreenRoute ? 0 : isFullWidthRoute ? (isMobile ? '0 0 calc(80px + env(safe-area-inset-bottom, 0px)) 0' : 0) : (isMobile ? '1rem 1rem calc(80px + env(safe-area-inset-bottom, 0px)) 1rem' : '2rem 1.5rem'),
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', zIndex: 10,
        }}>
          <div style={{
            width: '100%',
            maxWidth: (isFullScreenRoute || isFullWidthRoute) ? '100%' : (pathname === '/dashboard' ? '1400px' : '1100px'),
            flex: isFullScreenRoute ? '1 1 100%' : '1 0 auto',
            display: 'flex', flexDirection: 'column',
            minHeight: 0,
          }}>
            {useMemo(() => <Outlet />, [pathname])}
          </div>
        </main>
      </div>

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

