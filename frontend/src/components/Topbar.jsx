import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Zap } from 'lucide-react';
import { API_BASE } from '../api';

/* ── Circular Progress Ring ────────────────────────────────────────────────── */
function RingAvatar({ pct, initial, color, size = 42 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      {/* Progress */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={3}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Avatar circle */}
      <circle cx={size / 2} cy={size / 2} r={r - 5}
        fill={`${color}22`} />
      {/* Initial letter */}
      <text x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        fontSize={14} fontWeight={800} fill="#fff"
        fontFamily="Inter, sans-serif"
      >{initial}</text>
    </svg>
  );
}

/* ── Profile Dropdown ──────────────────────────────────────────────────────── */
function ProfileDropdown({ user, timeLimits, isJunior, onLogout, onClose }) {
  const navigate = useNavigate();
  const ref = useRef(null);

  const totalMins  = timeLimits ? Math.floor(timeLimits.limitTotal / 60) : null;
  const usedMins   = timeLimits ? Math.floor((timeLimits.limitTotal - timeLimits.remainingRanked) / 60) : null;
  const remMins    = timeLimits ? Math.floor(timeLimits.remainingRanked / 60) : null;
  const pct        = (totalMins && totalMins > 0) ? Math.round((remMins / totalMins) * 100) : 0;
  const accent     = isJunior ? '#7c3aed' : '#FF6B00';

  const plan = user?.subscription_plan;
  const planLabel = plan === 'max' ? 'MAX' : plan === 'pro' ? 'PRO' : plan === 'gforce' ? 'GFORCE' : 'DEMO';
  const planColor = plan === 'max' ? '#a855f7' : plan === 'pro' ? '#FF6B00' : plan === 'gforce' ? '#10b981' : '#64748b';

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const Row = ({ children, onClick, danger }) => (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', background: 'none', border: 'none',
      padding: '0.65rem 1rem', cursor: 'pointer', color: danger ? '#ef4444' : '#e2e8f0',
      fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.6rem',
      borderRadius: 8, transition: 'background 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >{children}</button>
  );

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 9999,
      width: 280,
      background: '#111318',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      animation: 'fadeIn 0.15s ease',
    }}>

      {/* ── Time / Upgrade Header ── */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Plan badge + Upgrade button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: planColor,
              boxShadow: `0 0 8px ${planColor}88`
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: planColor }}>{planLabel} Plan</span>
          </div>
          <button
            onClick={() => { navigate('/upgrade'); onClose(); }}
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 800,
              cursor: 'pointer', letterSpacing: '0.02em',
            }}
          >Upgrade ↑</button>
        </div>

        {/* Time stats */}
        {totalMins !== null ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total daily time</span>
              <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700 }}>{totalMins} min</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Remaining</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700,
                color: pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444'
              }}>{remMins} min ({pct}%)</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${pct}%`,
                background: pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>Loading time data…</div>
        )}
      </div>

      {/* ── User Info ── */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f1f5f9' }}>{user?.name}</div>
        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.1rem' }}>@{user?.studentId || user?.username}</div>
      </div>

      {/* ── Menu Rows ── */}
      <div style={{ padding: '0.4rem' }}>
        <Row onClick={() => { navigate('/settings'); onClose(); }}>
          <Settings size={16} style={{ opacity: 0.7 }} /> Settings
        </Row>
        <Row onClick={() => { onLogout(); onClose(); }} danger>
          <LogOut size={16} /> Sign out
        </Row>
      </div>
    </div>
  );
}

/* ── Main Topbar ────────────────────────────────────────────────────────────── */
export default function Topbar({ user, setUser, isCollapsed, setIsCollapsed, isMobile, onLogout }) {
  const location  = useLocation();
  const navigate  = useNavigate();

  const getBreadcrumb = (path) => {
    if (path.includes('dashboard')) return 'Home';
    if (path.includes('mock-un')) return 'Model UN';
    if (path.includes('mun30')) return 'MUN 30 Boot Camp';
    if (path.includes('persona')) return 'Wisdom Arena';
    if (path.includes('conversational-agent')) return 'Super Tutor';
    if (path.includes('speech-coach')) return 'Speech Coach';
    if (path.includes('speech-analysis')) return 'Speech Analysis';
    if (path.includes('debate')) return 'Debate';
    if (path.includes('vocab')) return 'Vocab Trainer';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('leaderboard')) return 'Leaderboard';
    if (path.includes('word-scramble')) return 'Word Scramble';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('billing') || path.includes('upgrade')) return 'Billing';
    if (path.includes('help')) return 'Help';
    if (path.includes('reports')) return 'Reports';
    if (path.includes('speech-league')) return 'Speech League';
    if (path.includes('diplomat')) return 'Diplomat 365';
    if (path.includes('certificate')) return 'Certificates';
    return 'Home';
  };

  const breadcrumbText = getBreadcrumb(location.pathname + location.search);

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel)
    && !['Professional', 'College Student'].includes(user?.grade);

  const accent = isJunior ? '#7c3aed' : '#FF6B00';

  // ── Time limits ──
  const [timeLimits, setTimeLimits] = useState(null);
  const [showMenu, setShowMenu]     = useState(false);
  const [hovered, setHovered]       = useState(false);

  useEffect(() => {
    const id = user?.studentId || user?.username;
    if (!id) return;
    fetch(`${API_BASE}/api/time-limits/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTimeLimits(d); })
      .catch(() => {});
  }, [user]);

  const totalSecs = timeLimits?.limitTotal || 0;
  const remSecs   = timeLimits?.remainingRanked || 0;
  const pct       = totalSecs > 0 ? Math.round((remSecs / totalSecs) * 100) : 0;
  const remMins   = Math.floor(remSecs / 60);

  // ring color: green > 50%, amber > 20%, red otherwise
  const ringColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
  const initial   = user?.name?.charAt(0).toUpperCase() || '?';

  // Coupon state (preserved from before)
  const [showCoupon, setShowCoupon]     = useState(false);
  const [couponCode, setCouponCode]     = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, msg: '', type: '' });

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus({ loading: true, msg: '', type: '' });
    try {
      const activeId = user?.studentId || user?.username;
      const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: activeId, couponCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponStatus({ loading: false, msg: data.message, type: 'success' });
        setCouponCode('');
        if (data.plan) {
          const updatedUser = { ...user, subscription_plan: data.plan, subscription_status: 'active' };
          if (setUser) setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setTimeout(() => navigate(`/premium-success?plan=${data.plan}`, { state: { customPopup: data.customPopup } }), 800);
        } else {
          if (timeLimits) {
            const bonus = couponCode.toUpperCase() === 'VVIP30' ? 1800 : 600;
            setTimeLimits(prev => ({ ...prev, remainingRanked: prev.remainingRanked + bonus, limitTotal: prev.limitTotal + bonus }));
          }
          setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
        }
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Failed to redeem', type: 'error' });
        setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
      }
    } catch {
      setCouponStatus({ loading: false, msg: 'Network error', type: 'error' });
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
      flexShrink: 0, minHeight: '60px',
    }}>

      {/* ── LEFT: Toggle + Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: isJunior ? '#fff' : '#0a0a0a',
              border: isJunior ? '1px solid rgba(124,58,237,0.1)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', cursor: 'pointer', padding: '6px', transition: 'all 0.2s ease',
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            onMouseEnter={e => { e.currentTarget.style.color = isJunior ? '#7c3aed' : '#fff'; e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.1)'; }}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="3.5" /><rect x="7" y="7" width="5" height="10" rx="1.5" fill="currentColor" stroke="none" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="3.5" /><path d="M9 8v8" /></svg>
            )}
          </button>
        )}
        <div style={{ fontSize: '1rem', fontWeight: 700, color: isJunior ? '#1e293b' : '#f8fafc', letterSpacing: '-0.01em' }}>
          {breadcrumbText}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

        {/* Redeem Coupon */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
            {!showCoupon ? (
              <div onClick={() => setShowCoupon(true)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: 99, padding: '3px 10px',
                fontSize: 12, fontWeight: 700, color: '#fb923c',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                lineHeight: 1, height: 26, boxSizing: 'border-box',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; }}
              >Redeem</div>
            ) : couponStatus.msg ? (
              <div style={{
                display: 'flex', alignItems: 'center',
                background: couponStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${couponStatus.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                color: couponStatus.type === 'success' ? '#10b981' : '#ef4444',
                lineHeight: 1, height: 26, boxSizing: 'border-box', whiteSpace: 'nowrap',
              }}>{couponStatus.msg}</div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.25)',
                borderRadius: 99, padding: '0.15rem 0.3rem 0.15rem 0.65rem', animation: 'fadeIn 0.2s'
              }}>
                <input type="text" placeholder="ENTER CODE" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  style={{ background: 'transparent', border: 'none', color: '#ffedd5', width: '90px', fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none', letterSpacing: '0.05em' }}
                  autoFocus
                  onBlur={() => { if (!couponCode && !couponStatus.loading) setShowCoupon(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleRedeemCoupon()}
                />
                <button onClick={handleRedeemCoupon} disabled={couponStatus.loading || !couponCode.trim()}
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c', padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', opacity: couponStatus.loading || !couponCode.trim() ? 0.5 : 1 }}>
                  {couponStatus.loading ? '...' : 'APPLY'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Profile Ring Button ── */}
        {user && (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowMenu(v => !v)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              title={timeLimits ? `${remMins} min remaining (${pct}%)` : 'Profile'}
              style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RingAvatar pct={pct} initial={initial} color={timeLimits ? ringColor : accent} size={44} />

              {/* Hover tooltip showing % */}
              {hovered && !showMenu && timeLimits && (
                <div style={{
                  position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', pointerEvents: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {pct}% left · {remMins}m
                </div>
              )}
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
