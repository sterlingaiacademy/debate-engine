import { useState, useEffect } from 'react';
import { X, Zap, Clock, CheckCircle } from 'lucide-react';
import { API_BASE } from '../api';

const TOPUP_PLANS = [
  {
    id: 499,
    label: 'Quick Boost',
    hours: '2.5 Hours',
    seconds: 9000,
    price: '₹499',
    desc: 'Perfect for a focused practice session',
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    glow: 'rgba(249,115,22,0.35)',
    badge: '⚡',
    validity: '30 days',
  },
  {
    id: 999,
    label: 'Power Pack',
    hours: '5 Hours',
    seconds: 18000,
    price: '₹999',
    desc: 'Full day of unlimited debate practice',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    glow: 'rgba(139,92,246,0.35)',
    badge: '🚀',
    popular: true,
    validity: '30 days',
  },
];

export default function TopUpModal({ user, onDismiss, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, msg: '', type: '' });
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== 'undefined' && !!window.Razorpay);
  const [success, setSuccess] = useState(null); // { hours }

  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => console.error('Failed to load Razorpay SDK');
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const handleTopUp = async (plan) => {
    setPaymentError('');
    if (!razorpayReady || !window.Razorpay) {
      setPaymentError('Payment system loading. Please try again in a moment.');
      return;
    }
    setSubmitting(true);
    try {
      const studentId = user?.studentId || user?.username;

      // 1. Create Razorpay order
      const orderRes = await fetch(`${API_BASE}/api/payment/create-topup-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.id, studentId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay checkout
      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr',
        amount: plan.id * 100,
        currency: 'INR',
        name: 'G Force AI',
        description: `Top Up — ${plan.hours}`,
        order_id: orderData.id,
        handler: async (response) => {
          // 3. Verify payment
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify-topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId,
              amount: plan.id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setSubmitting(false);
            setSuccess({ hours: plan.hours });
            if (onSuccess) onSuccess(plan.seconds);
          } else {
            setSubmitting(false);
            setPaymentError('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        prefill: { name: user?.name, email: user?.email || '', contact: user?.phone || '' },
        theme: { color: plan.id === 999 ? '#8b5cf6' : '#f97316' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        setSubmitting(false);
        setPaymentError('Payment failed: ' + r.error.description);
      });
      rzp.open();
    } catch (err) {
      setSubmitting(false);
      setPaymentError(err.message || 'Error initiating payment');
    }
  };

  const handleCouponRedeem = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponStatus({ loading: true, msg: '', type: '' });
    try {
      const studentId = user?.studentId || user?.username;
      const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, couponCode: code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponStatus({ loading: false, msg: data.message, type: 'success' });
        setCouponCode('');
        const seconds = code === 'TOPUP999' ? 18000 : code === 'TOPUP499' ? 9000 : 0;
        if (seconds && onSuccess) setTimeout(() => onSuccess(seconds), 1500);
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Invalid code', type: 'error' });
      }
    } catch {
      setCouponStatus({ loading: false, msg: 'Network error', type: 'error' });
    }
  };

  // Success screen
  if (success) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
        padding: '1rem',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d0d0d, #1a0a00)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 28, padding: '3rem 2rem',
          maxWidth: 380, width: '100%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(249,115,22,0.2)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚡</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem' }}>Time Added!</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 1.5rem' }}>
            <strong style={{ color: '#fb923c' }}>{success.hours}</strong> has been added to your account for today.
          </p>
          <button
            onClick={() => { if (onDismiss) onDismiss(); window.location.reload(); }}
            style={{
              background: 'linear-gradient(135deg, #f97316, #fb923c)',
              border: 'none', borderRadius: 12, padding: '0.85rem 2rem',
              color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              width: '100%', boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
            }}
          >
            Let's Debate! 🔥
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      padding: '1rem', overflowY: 'auto',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss?.(); }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #111 0%, #0d0d0d 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 28, padding: '2rem 1.75rem',
        maxWidth: 460, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        position: 'relative',
        animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Close */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%',
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 99, padding: '0.3rem 0.9rem', marginBottom: '0.75rem',
            fontSize: '0.75rem', fontWeight: 700, color: '#fb923c',
          }}>
            <Zap size={12} strokeWidth={2.5} /> TOP UP TIME
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
            Add More Practice Time
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            One-time purchase · Valid for 30 days · Instant activation
          </p>
        </div>

        {/* Plan Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {TOPUP_PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: '1.1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                overflow: 'hidden',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = plan.id === 999 ? 'rgba(139,92,246,0.4)' : 'rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Glow */}
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                borderRadius: '50%', background: plan.glow, filter: 'blur(40px)', pointerEvents: 'none',
              }} />

              {/* Popular badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: 10, right: 12,
                  background: plan.gradient, borderRadius: 99,
                  fontSize: '0.6rem', fontWeight: 800, color: '#fff',
                  padding: '0.15rem 0.6rem', letterSpacing: '0.05em',
                }}>BEST VALUE</div>
              )}

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: plan.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
                boxShadow: `0 4px 16px ${plan.glow}`,
              }}>
                {plan.badge}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{plan.label}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.75rem', fontWeight: 700, color: '#fb923c',
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                    borderRadius: 99, padding: '0.1rem 0.5rem',
                  }}>
                    <Clock size={10} strokeWidth={2.5} /> {plan.hours}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{plan.desc}</div>
              </div>

              {/* Price + Button */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{plan.price}</div>
                <button
                  onClick={() => handleTopUp(plan)}
                  disabled={submitting || !razorpayReady}
                  style={{
                    marginTop: '0.5rem',
                    background: plan.gradient,
                    border: 'none', borderRadius: 10,
                    padding: '0.45rem 1rem',
                    color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                    cursor: (submitting || !razorpayReady) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || !razorpayReady) ? 0.7 : 1,
                    boxShadow: `0 4px 12px ${plan.glow}`,
                    transition: 'transform 0.15s, opacity 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {!razorpayReady ? 'Loading...' : submitting ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {paymentError && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem',
            color: '#ef4444', fontSize: '0.85rem', textAlign: 'center',
          }}>
            {paymentError}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>OR ENTER A COUPON CODE</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Coupon Input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="TOPUP499 / TOPUP999"
            value={couponCode}
            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus({ loading: false, msg: '', type: '' }); }}
            onKeyDown={e => e.key === 'Enter' && handleCouponRedeem()}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${couponStatus.type === 'error' ? 'rgba(239,68,68,0.4)' : couponStatus.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, padding: '0.65rem 1rem',
              color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace',
              letterSpacing: '0.05em', outline: 'none',
            }}
          />
          <button
            onClick={handleCouponRedeem}
            disabled={couponStatus.loading || !couponCode.trim()}
            style={{
              background: couponCode.trim() ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${couponCode.trim() ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, padding: '0.65rem 1.1rem',
              color: couponCode.trim() ? '#fb923c' : '#475569',
              fontWeight: 700, fontSize: '0.85rem', cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {couponStatus.loading ? '...' : 'Apply'}
          </button>
        </div>

        {/* Coupon status message */}
        {couponStatus.msg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginTop: '0.6rem', padding: '0.6rem 0.85rem',
            background: couponStatus.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${couponStatus.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: 10,
            fontSize: '0.82rem', fontWeight: 600,
            color: couponStatus.type === 'success' ? '#10b981' : '#ef4444',
          }}>
            {couponStatus.type === 'success' && <CheckCircle size={14} strokeWidth={2.5} />}
            {couponStatus.msg}
          </div>
        )}

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#334155', margin: '1rem 0 0' }}>
          Secure payment via Razorpay · One-time charge · Valid for 30 days · No subscription
        </p>
      </div>
    </div>
  );
}
