import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Tag } from 'lucide-react';
import { API_BASE } from '../api';

/* ── Circular Progress Ring ─────────────────────────────────────────────────
   Initial ↔ percentage cross-fades on hover with CSS transitions          */
function RingAvatar({ pct, initial, avatar, accent, hovered, size = 24 }) {
  const stroke = 2;
  const gap    = 2.5; // spacing between ring and inner content
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  // Ensure a tiny dot is visible even at 0% to match reference
  const filled = circ * Math.max(Math.min(pct, 100), 0.5) / 100; 

  const ringColor = 'rgba(255, 255, 255, 0.75)';
  const trackColor = 'rgba(255,255,255,0.08)';

  // Pick a stable background color based on the initial letter (simple hash)
  const colors = ['#e11d48', '#c2185b', '#7c3aed', '#2563eb', '#059669', '#d97706'];
  const charCode = initial ? initial.charCodeAt(0) : 0;
  const bgColor = colors[charCode % colors.length];

  return (
    <div style={{ position: 'relative', width: size, height: size, cursor: 'pointer', flexShrink: 0 }}>
      {/* SVG ring */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={ringColor} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>

      {/* Centre — cross-fade initial ↔ % */}
      <div style={{
        position: 'absolute', inset: stroke + gap, borderRadius: '50%',
        background: avatar ? 'transparent' : bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Initial letter / Avatar */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'scale(0.8)' : 'scale(1)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}>
          {avatar ? (
            <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1, userSelect: 'none' }}>{initial}</span>
          )}
        </div>

        {/* Percentage */}
        <span style={{
          position: 'absolute',
          fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
          lineHeight: 1, userSelect: 'none',
        }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ── Profile Dropdown ────────────────────────────────────────────────────── */
function ProfileDropdown({ user, timeLimits, isJunior, onLogout, onClose }) {
  const navigate = useNavigate();
  const ref      = useRef(null);

  const accent    = isJunior ? '#7c3aed' : '#FF6B00';
  const totalMin  = timeLimits ? Math.floor(timeLimits.limitTotal / 60) : null;
  const remMin    = timeLimits ? Math.floor(timeLimits.remainingRanked / 60) : null;
  const pct       = (totalMin && totalMin > 0) ? Math.round((remMin / totalMin) * 100) : 0;
  const barColor  = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';

  const plan      = user?.subscription_plan;
  const isMax     = plan === 'max';
  const planLabel = isMax ? 'MAX' : plan === 'pro' ? 'PRO' : plan === 'gforce' ? 'G-FORCE' : 'DEMO';
  const planColor = isMax ? '#f97316' : plan === 'pro' ? '#8b5cf6' : plan === 'gforce' ? '#10b981' : '#64748b';

  // coupon
  const [showCoupon, setShowCoupon]     = useState(false);
  const [couponCode, setCouponCode]     = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, msg: '', type: '' });

  const handleRedeem = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus({ loading: true, msg: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.studentId || user?.username, couponCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponStatus({ loading: false, msg: data.message || 'Redeemed!', type: 'success' });
        setCouponCode('');
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Invalid code', type: 'error' });
      }
      setTimeout(() => setCouponStatus({ loading: false, msg: '', type: '' }), 3000);
    } catch { setCouponStatus({ loading: false, msg: 'Network error', type: 'error' }); }
  };

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 9999,
      width: 272,
      background: '#16181e',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 13,
      boxShadow: '0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)',
      overflow: 'hidden',
      animation: 'fadeIn 0.12s ease',
    }}>

      {/* ── Daily Time + Upgrade ── */}
      <div style={{ padding: '0.95rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: accent,
              boxShadow: `0 0 6px ${accent}`,
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Daily Time</span>
          </div>
          {/* Only show Upgrade button if NOT on MAX plan */}
          {!isMax && (
            <button
              onClick={() => { navigate('/upgrade'); onClose(); }}
              style={{
                background: '#fff', color: '#111', border: 'none',
                borderRadius: 7, padding: '0.28rem 0.75rem',
                fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
              }}
            >Upgrade</button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
            {totalMin !== null ? `${totalMin} min` : '—'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Remaining</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: barColor }}>
            {remMin !== null ? `${remMin} min` : '—'}
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* ── Plan / User Info ── */}
      <div style={{
        padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 2 }}>Current plan</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9' }}>{user?.name}</div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 1 }}>{planLabel}</div>
        </div>
        <div style={{
          padding: '0.22rem 0.6rem', borderRadius: 6,
          background: `${planColor}18`, border: `1px solid ${planColor}33`,
          fontSize: '0.7rem', fontWeight: 800, color: planColor, letterSpacing: '0.05em',
        }}>{planLabel}</div>
      </div>

      {/* ── Redeem Coupon ── */}
      <div style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {!showCoupon && !couponStatus.msg ? (
          <button
            onClick={() => setShowCoupon(true)}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '0.5rem 0.4rem', cursor: 'pointer',
              color: '#fb923c', fontSize: '0.88rem', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 9,
              borderRadius: 7, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Tag size={15} style={{ opacity: 0.8 }} /> Redeem coupon
          </button>
        ) : couponStatus.msg ? (
          <div style={{
            padding: '0.5rem 0.4rem', fontSize: '0.82rem', fontWeight: 600,
            color: couponStatus.type === 'success' ? '#10b981' : '#ef4444',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {couponStatus.type === 'success' ? '✓' : '✗'} {couponStatus.msg}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, padding: '0.3rem 0.4rem', alignItems: 'center' }}>
            <input
              type="text" placeholder="ENTER CODE" value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 7, padding: '0.4rem 0.6rem', color: '#ffedd5',
                fontSize: '0.78rem', fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none',
              }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              onBlur={() => { if (!couponCode) setShowCoupon(false); }}
            />
            <button onClick={handleRedeem} disabled={couponStatus.loading || !couponCode.trim()}
              style={{
                background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                color: '#fb923c', borderRadius: 7, padding: '0.4rem 0.65rem',
                fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                opacity: couponStatus.loading || !couponCode.trim() ? 0.5 : 1,
              }}
            >{couponStatus.loading ? '…' : 'Apply'}</button>
          </div>
        )}
      </div>

      {/* ── Menu ── */}
      <div style={{ padding: '0.35rem 0' }}>
        <button onClick={() => { navigate('/settings'); onClose(); }}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '0.58rem 1rem', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 9, transition: 'background 0.15s', borderRadius: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        ><Settings size={15} style={{ opacity: 0.6 }} /> Settings</button>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.2rem 0' }} />

        <button onClick={() => { onLogout(); onClose(); }}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '0.58rem 1rem', cursor: 'pointer', color: '#ef4444', fontSize: '0.88rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 9, transition: 'background 0.15s', borderRadius: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        ><LogOut size={15} /> Sign out</button>
      </div>
    </div>
  );
}

/* ── Main Topbar ─────────────────────────────────────────────────────────── */
export default function Topbar({ user, setUser, isCollapsed, setIsCollapsed, isMobile, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumb = (path) => {
    if (path.includes('dashboard'))            return 'Home';
    if (path.includes('mock-un'))              return 'Model UN';
    if (path.includes('mun30'))               return 'MUN 30 Boot Camp';
    if (path.includes('persona'))             return 'Wisdom Arena';
    if (path.includes('conversational-agent'))return 'Super Tutor';
    if (path.includes('speech-coach'))        return 'Speech Coach';
    if (path.includes('speech-analysis'))     return 'Speech Analysis';
    if (path.includes('debate'))              return 'Debate';
    if (path.includes('vocab'))               return 'Vocab Trainer';
    if (path.includes('analytics'))           return 'Analytics';
    if (path.includes('leaderboard'))         return 'Leaderboard';
    if (path.includes('word-scramble'))       return 'Word Scramble';
    if (path.includes('settings'))            return 'Settings';
    if (path.includes('billing') || path.includes('upgrade')) return 'Billing';
    if (path.includes('speech-league'))       return 'Speech League';
    if (path.includes('diplomat'))            return 'Diplomat 365';
    if (path.includes('certificate'))         return 'Certificates';
    return 'Home';
  };

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel)
    && !['Professional','College Student'].includes(user?.grade);
  const accent = isJunior ? '#7c3aed' : '#FF6B00';

  const [timeLimits, setTimeLimits] = useState(null);
  useEffect(() => {
    const id = user?.studentId || user?.username;
    if (!id) return;
    fetch(`${API_BASE}/api/time-limits/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTimeLimits(d); })
      .catch(() => {});
  }, [user]);

  const totalSec = timeLimits?.limitTotal || 0;
  const remSec   = timeLimits?.remainingRanked || 0;
  const pct      = totalSec > 0 ? Math.round((remSec / totalSec) * 100) : 0;
  const initial  = user?.name?.charAt(0).toUpperCase() || '?';

  const [showMenu, setShowMenu] = useState(false);
  const [hovered, setHovered]   = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.5rem 1.25rem',  /* ← reduced from 0.75rem 1.5rem */
      background: 'transparent',
      borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
      flexShrink: 0, minHeight: '50px',  /* ← reduced from 60px */
    }}>

      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ background: isJunior ? '#fff' : '#0a0a0a', border: isJunior ? '1px solid rgba(124,58,237,0.1)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', padding: 5, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = isJunior ? '#7c3aed' : '#fff'; e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.1)'; }}
          >
            {isCollapsed
              ? <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="3.5"/><rect x="7" y="7" width="5" height="10" rx="1.5" fill="currentColor" stroke="none"/></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="3.5"/><path d="M9 8v8"/></svg>
            }
          </button>
        )}
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isJunior ? '#1e293b' : '#f8fafc', letterSpacing: '-0.01em' }}>
          {getBreadcrumb(location.pathname + location.search)}
        </div>
      </div>

      {/* RIGHT — just the ring, coupon moved inside dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <div style={{ position: 'relative' }}>
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={() => setShowMenu(v => !v)}
              style={{ display: 'inline-flex' }}
            >
              <RingAvatar pct={pct} initial={initial} avatar={user?.avatar} accent={accent} hovered={hovered} size={32} />
            </div>
            {showMenu && (
              <ProfileDropdown
                user={user}
                timeLimits={timeLimits}
                isJunior={isJunior}
                onLogout={onLogout}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        )}
      </div>

    </div>
  );
}
