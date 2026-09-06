import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Zap } from 'lucide-react';
import { API_BASE } from '../api';

/* ── Circular Progress Ring ─────────────────────────────────────────────────
   Shows initial by default; on hover shows % inside the ring             */
function RingAvatar({ pct, initial, accent, hovered, size = 46 }) {
  const stroke = 3.5;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const filled = circ * Math.min(pct, 100) / 100;

  // ring color based on time left
  const ringColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : pct > 0 ? '#ef4444' : '#334155';

  return (
    <div style={{ position: 'relative', width: size, height: size, cursor: 'pointer', flexShrink: 0 }}>
      {/* SVG ring */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {/* filled arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={ringColor} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>

      {/* Avatar / Percentage centre */}
      <div style={{
        position: 'absolute',
        inset: stroke + 3,
        borderRadius: '50%',
        background: hovered ? 'rgba(0,0,0,0.55)' : `${accent}22`,
        border: `1.5px solid ${accent}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
        userSelect: 'none',
      }}>
        {hovered ? (
          <span style={{ fontSize: 11, fontWeight: 800, color: ringColor, lineHeight: 1 }}>
            {pct}%
          </span>
        ) : (
          <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Profile Dropdown ────────────────────────────────────────────────────── */
function ProfileDropdown({ user, timeLimits, isJunior, onLogout, onClose }) {
  const navigate = useNavigate();
  const ref      = useRef(null);

  const accent   = isJunior ? '#7c3aed' : '#FF6B00';
  const totalMin = timeLimits ? Math.floor(timeLimits.limitTotal / 60) : null;
  const remMin   = timeLimits ? Math.floor(timeLimits.remainingRanked / 60) : null;
  const pct      = (totalMin && totalMin > 0) ? Math.round((remMin / totalMin) * 100) : 0;

  const plan      = user?.subscription_plan;
  const planLabel = plan === 'max' ? 'MAX' : plan === 'pro' ? 'PRO' : plan === 'gforce' ? 'G-FORCE' : 'DEMO';

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const barColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 12px)', right: 0, zIndex: 9999,
      width: 270,
      background: '#18191f',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 12,
      boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>

      {/* ── Section 1: Time / Upgrade ── */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: accent, boxShadow: `0 0 7px ${accent}`,
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>Daily Time</span>
          </div>
          <button
            onClick={() => { navigate('/upgrade'); onClose(); }}
            style={{
              background: '#fff', color: '#111', border: 'none',
              borderRadius: 7, padding: '0.3rem 0.8rem',
              fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >Upgrade</button>
        </div>

        {/* Time rows */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
            {totalMin !== null ? `${totalMin} min` : '—'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Remaining</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: barColor }}>
            {remMin !== null ? `${remMin} min` : '—'}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: barColor,
            borderRadius: 99, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* ── Section 2: Plan info ── */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 2 }}>Current plan</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f1f5f9' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 1 }}>
            {planLabel}
          </div>
        </div>
        <div style={{
          padding: '0.25rem 0.65rem', borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.72rem', fontWeight: 800,
          color: accent, letterSpacing: '0.05em',
        }}>{planLabel}</div>
      </div>

      {/* ── Section 3: Menu items ── */}
      <div style={{ padding: '0.35rem 0' }}>
        {[
          { label: 'Settings', icon: Settings, path: '/settings' },
        ].map(({ label, icon: Icon, path }) => (
          <button key={label}
            onClick={() => { navigate(path); onClose(); }}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '0.6rem 1rem', cursor: 'pointer',
              color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Icon size={16} style={{ opacity: 0.6 }} /> {label}
          </button>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />

        <button
          onClick={() => { onLogout(); onClose(); }}
          style={{
            width: '100%', textAlign: 'left', background: 'none', border: 'none',
            padding: '0.6rem 1rem', cursor: 'pointer',
            color: '#ef4444', fontSize: '0.9rem', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}

/* ── Main Topbar ─────────────────────────────────────────────────────────── */
export default function Topbar({ user, setUser, isCollapsed, setIsCollapsed, isMobile, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumb = (path) => {
    if (path.includes('dashboard'))           return 'Home';
    if (path.includes('mock-un'))             return 'Model UN';
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

  // time limits
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

  // coupon
  const [showCoupon, setShowCoupon]     = useState(false);
  const [couponCode, setCouponCode]     = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, msg: '', type: '' });

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus({ loading: true, msg: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.studentId || user?.username, couponCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponStatus({ loading: false, msg: data.message, type: 'success' });
        setCouponCode('');
        if (data.plan) {
          const u2 = { ...user, subscription_plan: data.plan, subscription_status: 'active' };
          if (setUser) setUser(u2);
          localStorage.setItem('user', JSON.stringify(u2));
          setTimeout(() => navigate(`/premium-success?plan=${data.plan}`, { state: { customPopup: data.customPopup } }), 800);
        } else {
          if (timeLimits) {
            const bonus = couponCode.toUpperCase() === 'VVIP30' ? 1800 : 600;
            setTimeLimits(p => ({ ...p, remainingRanked: p.remainingRanked + bonus, limitTotal: p.limitTotal + bonus }));
          }
          setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
        }
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Failed to redeem', type: 'error' });
        setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
      }
    } catch { setCouponStatus({ loading: false, msg: 'Network error', type: 'error' }); }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
      flexShrink: 0, minHeight: '60px',
    }}>

      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ background: isJunior ? '#fff' : '#0a0a0a', border: isJunior ? '1px solid rgba(124,58,237,0.1)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', padding: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = isJunior ? '#7c3aed' : '#fff'; e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.1)'; }}
          >
            {isCollapsed
              ? <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="3.5"/><rect x="7" y="7" width="5" height="10" rx="1.5" fill="currentColor" stroke="none"/></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="3.5"/><path d="M9 8v8"/></svg>
            }
          </button>
        )}
        <div style={{ fontSize: '1rem', fontWeight: 700, color: isJunior ? '#1e293b' : '#f8fafc', letterSpacing: '-0.01em' }}>
          {getBreadcrumb(location.pathname + location.search)}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

        {/* Redeem coupon */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            {!showCoupon ? (
              <div onClick={() => setShowCoupon(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#fb923c', cursor: 'pointer', height: 26, boxSizing: 'border-box', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.1)'}>Redeem</div>
            ) : couponStatus.msg ? (
              <div style={{ display: 'flex', alignItems: 'center', background: couponStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${couponStatus.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: couponStatus.type === 'success' ? '#10b981' : '#ef4444', height: 26, boxSizing: 'border-box', whiteSpace: 'nowrap' }}>{couponStatus.msg}</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 99, padding: '0.15rem 0.3rem 0.15rem 0.65rem' }}>
                <input type="text" placeholder="ENTER CODE" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ background: 'transparent', border: 'none', color: '#ffedd5', width: 90, fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none' }} autoFocus onBlur={() => { if (!couponCode && !couponStatus.loading) setShowCoupon(false); }} onKeyDown={e => e.key === 'Enter' && handleRedeemCoupon()} />
                <button onClick={handleRedeemCoupon} disabled={couponStatus.loading || !couponCode.trim()} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c', padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', opacity: couponStatus.loading || !couponCode.trim() ? 0.5 : 1 }}>{couponStatus.loading ? '…' : 'APPLY'}</button>
              </div>
            )}
          </div>
        )}

        {/* ── Profile Ring ── */}
        {user && (
          <div style={{ position: 'relative' }}>
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={() => setShowMenu(v => !v)}
              style={{ display: 'inline-flex' }}
            >
              <RingAvatar pct={pct} initial={initial} accent={accent} hovered={hovered} size={46} />
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
