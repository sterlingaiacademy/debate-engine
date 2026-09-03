import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { API_BASE } from '../api';

export default function Topbar({ user, setUser, isCollapsed, setIsCollapsed, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Breadcrumb mapping
  const getBreadcrumb = (path) => {
    if (path.includes('dashboard')) return 'Home';
    if (path.includes('mock-un')) return 'Model UN';
    if (path.includes('persona')) return 'Famous Figures';
    if (path.includes('conversational-agent')) return 'Super Tutor';
    if (path.includes('speech-coach')) return 'Speech Coach';
    if (path.includes('speech-analysis')) return 'Speech Analysis';
    return 'Home';
  };

  const breadcrumbText = getBreadcrumb(location.pathname);

  // Stats / Time Limits logic
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const activeId = user?.studentId || user?.username;
    if (!activeId) return;
    
    // Fetch time limits
    fetch(`${API_BASE}/api/time-limits/${activeId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats({ timeLimits: data });
        }
      })
      .catch(() => {});
  }, [user]);

  const dailyMins = stats?.timeLimits ? Math.floor(stats.timeLimits.remainingRanked / 60) : null;

  // Coupon Logic
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
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
          if (stats && stats.timeLimits) {
            const bonusSeconds = couponCode.toUpperCase() === 'VVIP30' ? 1800 : 600;
            setStats(prev => ({
              ...prev,
              timeLimits: {
                ...prev.timeLimits,
                remainingRanked: prev.timeLimits.remainingRanked + bonusSeconds,
                limitTotal: prev.timeLimits.limitTotal + bonusSeconds
              }
            }));
          }
          setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
        }
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Failed to redeem', type: 'error' });
        setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
      }
    } catch (err) {
      setCouponStatus({ loading: false, msg: 'Network error', type: 'error' });
    }
  };

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel) && !['Professional', 'College Student'].includes(user?.grade);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      borderBottom: isJunior ? '2px solid rgba(124,58,237,0.08)' : '1px solid rgba(255,255,255,0.05)',
      flexShrink: 0,
      minHeight: '60px',
    }}>
      
      {/* LEFT SIDE: Toggle Switch & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: isJunior ? '#fff' : '#0a0a0a',
              border: isJunior ? '1px solid rgba(124,58,237,0.1)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              transition: 'all 0.2s ease',
            }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            onMouseEnter={e => {
              e.currentTarget.style.color = isJunior ? '#7c3aed' : '#fff';
              e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.1)';
            }}
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Breadcrumb */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: 700,
          color: isJunior ? '#1e293b' : '#f8fafc',
          letterSpacing: '-0.01em'
        }}>
          {breadcrumbText}
        </div>
      </div>

      {/* RIGHT SIDE: User Info, Redeem, Time Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Time Left */}
        {dailyMins !== null && !isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Daily Time Left</span>
              <span style={{ color: 'var(--text-primary)' }}>{dailyMins}m</span>
            </div>
            <div className="xp-track" style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div className="xp-fill" style={{ width: `${Math.min((dailyMins / 60) * 100, 100)}%`, background: 'var(--text-primary)', height: '100%' }} />
            </div>
          </div>
        )}

        {/* Separator */}
        {!isMobile && <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />}

        {/* User Stats/Pills */}
        {!isMobile && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user.classLevel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.grade
                    ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                    : user.classLevel}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', color: '#FF6B00', padding: '0.1rem 0.4rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                  {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'PRO' : 'DEMO'}
                </div>
              </div>
            )}

            {/* Redeem Coupon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
              {!showCoupon ? (
                <div
                  onClick={() => setShowCoupon(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                    borderRadius: 99, padding: '3px 10px',
                    fontSize: 12, fontWeight: 700, color: '#fb923c',
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                    lineHeight: 1, height: 26, boxSizing: 'border-box',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; }}
                >
                  Redeem
                </div>
              ) : couponStatus.msg ? (
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: couponStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${couponStatus.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  borderRadius: 99, padding: '3px 10px',
                  fontSize: 12, fontWeight: 700,
                  color: couponStatus.type === 'success' ? '#10b981' : '#ef4444',
                  lineHeight: 1, height: 26, boxSizing: 'border-box', whiteSpace: 'nowrap',
                }}>
                  {couponStatus.msg}
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.25)',
                  borderRadius: 99, padding: '0.15rem 0.3rem 0.15rem 0.65rem',
                  animation: 'fadeIn 0.2s'
                }}>
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      background: 'transparent', border: 'none', color: '#ffedd5', width: '90px', fontSize: '0.72rem',
                      fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none', letterSpacing: '0.05em',
                    }}
                    autoFocus
                    onBlur={() => { if (!couponCode && !couponStatus.loading) setShowCoupon(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
                  />
                  <button
                    onClick={handleRedeemCoupon}
                    disabled={couponStatus.loading || !couponCode.trim()}
                    style={{
                      background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                      color: '#fb923c', padding: '0.2rem 0.6rem', borderRadius: 99,
                      fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer',
                      opacity: couponStatus.loading || !couponCode.trim() ? 0.5 : 1
                    }}
                  >
                    {couponStatus.loading ? '...' : 'APPLY'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Info & Avatar */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  @{user.studentId || user.username}
                </div>
              </div>
            )}
            
            <div style={{ 
              width: 36, height: 36, borderRadius: '50%', 
              background: 'linear-gradient(135deg, #FF6B00 0%, #f97316 100%)', 
              border: '2px solid rgba(255,107,0,0.3)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.1rem', fontWeight: 900, color: '#fff', flexShrink: 0 
            }}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user.name?.charAt(0).toUpperCase()
              }
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
