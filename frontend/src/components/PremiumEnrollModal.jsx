import { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { Crown, Clock, Sparkles, CheckCircle, X, BatteryCharging, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PremiumEnrollModal({ user, onDismiss, mode = 'limit' }) {
  const [submitting, setSubmitting] = useState(false);
  const [yearly, setYearly] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');
  const navigate = useNavigate();

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 2999,
      yearlyPrice: 29999,
      desc: '20 mins daily · Priority Support',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
      icon: <Crown size={20} color="#fff" />
    },
    {
      id: 'max',
      name: 'Max',
      monthlyPrice: 8999,
      yearlyPrice: 89999,
      desc: '60 mins daily · Full Access',
      gradient: 'linear-gradient(135deg, #f97316 0%, #e8392a 100%)',
      icon: <Sparkles size={20} color="#fff" />
    }
  ];

  // Dynamically filter available plans based on what the user already has
  // NOTE: Use subscription_plan for UI filtering (shows correct options visually).
  // The actual payment endpoint (create vs upgrade) is separately guarded by subscription_status.
  const availablePlans = plans.filter(p => {
    // If user has no plan or a free plan, show everything
    if (!user?.subscription_plan || user?.subscription_plan === 'free') return true;

    const currentPlan = user.subscription_plan;
    const currentPeriod = user.subscription_period || 'monthly';
    const selectedPeriod = yearly ? 'yearly' : 'monthly';

    // If user is on MAX
    if (currentPlan === 'max') {
      // Always hide Pro (downgrade)
      if (p.id === 'pro') return false;
      // Show Max ONLY as an upgrade path: monthly → yearly
      if (p.id === 'max') return currentPeriod === 'monthly' && selectedPeriod === 'yearly';
    }

    // If user is on PRO
    if (currentPlan === 'pro') {
      // Always show Max (upgrade)
      if (p.id === 'max') return true;
      // Show Pro ONLY as monthly → yearly upgrade
      if (p.id === 'pro') return currentPeriod === 'monthly' && selectedPeriod === 'yearly';
    }

    return true;
  });

  // Load Razorpay Script
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== 'undefined' && !!window.Razorpay);
  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; } // already loaded
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => console.error('Failed to load Razorpay SDK');
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const handleTopUp = async (amount, hours) => {
    setPaymentError('');
    if (!razorpayReady || !window.Razorpay) {
      setPaymentError('Payment system loading. Please try again.');
      return;
    }
    setTopupSubmitting(true);
    try {
      const studentId = user?.studentId || user?.username;
      const orderRes = await fetch(`${API_BASE}/api/payment/create-topup-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, studentId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr',
        amount: amount * 100,
        currency: 'INR',
        name: 'G Force AI',
        description: `Top Up — ${hours}`,
        order_id: orderData.id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify-topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId, amount,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setTopupSubmitting(false);
            setTopupSuccess(`⚡ ${hours} added! You can continue practising now.`);
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setTopupSubmitting(false);
            setPaymentError('Top-up verification failed: ' + (verifyData.error || 'Unknown error'));
          }
        },
        modal: { ondismiss: () => setTopupSubmitting(false) },
        prefill: { name: user?.name, email: user?.email || '', contact: user?.phone || '' },
        theme: { color: amount === 999 ? '#8b5cf6' : '#f97316' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        setTopupSubmitting(false);
        setPaymentError('Payment failed: ' + r.error.description);
      });
      rzp.open();
    } catch (err) {
      setTopupSubmitting(false);
      setPaymentError(err.message || 'Error initiating payment');
    }
  };

  const handlePayment = async (plan) => {
    setPaymentError('');
    if (!razorpayReady || !window.Razorpay) {
      setPaymentError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }
    setSubmitting(true);
    try {
      const amount = yearly ? plan.yearlyPrice : plan.monthlyPrice;
      const period = yearly ? 'yearly' : 'monthly';

      // isUpgrade = true only when the user has a genuinely active subscription on the server
      // We rely on subscription_status synced from /api/me, NOT just the plan name in localStorage
      const isUpgrade = user?.subscription_plan &&
                        user.subscription_plan !== 'free' &&
                        user?.subscription_status === 'active';
      const endpoint = isUpgrade ? `${API_BASE}/api/payment/update-subscription` : `${API_BASE}/api/payment/create-subscription`;

      // 1. Create or Update subscription
      const subRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, period, studentId: user?.studentId || user?.username })
      });
      const isJson = subRes.headers.get('content-type')?.includes('application/json');
      const subData = isJson ? await subRes.json() : null;
      
      if (!subRes.ok) {
        throw new Error(subData?.error || `Server error (${subRes.status}). Please try again.`);
      }

      if (isUpgrade) {
        // Subscription Updated! Razorpay automatically prorates and charges the vaulted card.
        if (!subRes.ok) {
          throw new Error(subData.error || 'Failed to update subscription on server');
        }
        try {
          const currentUser = JSON.parse(localStorage.getItem('user')) || {};
          currentUser.subscription_plan = plan.id;
          currentUser.subscription_period = period;
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (e) { console.error('Failed to update local storage', e); }
        window.location.href = `/premium-success?plan=${plan.id}`;
        return;
      }

      // 2. Open Razorpay Checkout for NEW subscriptions
      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr', // Public Key — safe to expose client-side
        name: 'G Force AI',
        description: `Upgrade to ${plan.name} (${period})`,
        subscription_id: subData.id,
        handler: async function (response) {
          // 3. Verify Payment
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId: user?.studentId || user?.username,
              plan: plan.id,
              period: period
            })
          });
          const isVerifyJson = verifyRes.headers.get('content-type')?.includes('application/json');
          const verifyData = isVerifyJson ? await verifyRes.json() : null;

          if (verifyRes.ok && verifyData?.success) {
            // Update local storage so the global app state picks it up on reload
            try {
              const currentUser = JSON.parse(localStorage.getItem('user')) || {};
              currentUser.subscription_plan = plan.id;
              currentUser.subscription_period = period; // also persist the billing period
              localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (e) { console.error('Failed to update local storage', e); }
            
            // Navigate to the success page (stays within the app — user stays logged in)
            window.location.href = `/premium-success?plan=${plan.id}`;
          } else {
            setSubmitting(false);
            setPaymentError('Payment verification failed: ' + verifyData.error);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay modal without paying — reset button state
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: plan.id === 'max' ? '#f97316' : '#8b5cf6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setSubmitting(false);
        setPaymentError('Payment failed: ' + response.error.description);
      });
      rzp.open();
      // NOTE: do NOT setSubmitting(false) here — the modal is still open
      // It resets in: handler (success), modal.ondismiss, payment.failed
    } catch (err) {
      setSubmitting(false);
      setPaymentError(err.message || 'Error initiating payment');
    }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      padding: '2.5rem 1.5rem', gap: '1.5rem', overflowY: 'auto', maxWidth: '520px', margin: '0 auto', width: '100%',
      position: 'relative'
    }}>
      {/* ── Close Button (if overlay) ── */}
      {mode !== 'settings' && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', zIndex: 10
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Daily Limit Banner ── */}
      {mode === 'limit' && (
        <>
          <div style={{
            width: '100%', background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(249,115,22,0.08) 100%)',
            border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: '20px', padding: '1.75rem 1.5rem 1.5rem',
            textAlign: 'center', animation: 'fadeIn 0.4s ease',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏱️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
              You've used today's practice time
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Your daily limit has been reached.<br />
              <strong style={{ color: 'var(--text-primary)' }}>You can continue at 12:00 AM IST tomorrow.</strong>
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '99px', padding: '0.35rem 0.9rem',
              marginTop: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626',
            }}>
              <Clock size={13} /> Resets at midnight IST
            </div>
          </div>

          {/* ── Top Up Section ── */}
          {topupSuccess ? (
            <div style={{
              width: '100%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 16, padding: '1rem 1.25rem', textAlign: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: '#10b981',
            }}>
              {topupSuccess}
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <BatteryCharging size={16} color="#fb923c" strokeWidth={2.5} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fb923c' }}>Quick Top-Up — Continue Now</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {[{ amount: 499, hours: '2.5 hrs', emoji: '⚡' }, { amount: 999, hours: '5 hrs', emoji: '🚀', popular: true }].map(t => (
                  <button
                    key={t.amount}
                    onClick={() => handleTopUp(t.amount, t.hours)}
                    disabled={topupSubmitting || !razorpayReady}
                    style={{
                      position: 'relative',
                      background: t.popular
                        ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))'
                        : 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.06))',
                      border: t.popular ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(249,115,22,0.25)',
                      borderRadius: 14, padding: '0.85rem 0.75rem',
                      cursor: topupSubmitting ? 'not-allowed' : 'pointer',
                      opacity: topupSubmitting ? 0.7 : 1,
                      transition: 'all 0.2s', textAlign: 'center',
                    }}
                  >
                    {t.popular && (
                      <div style={{
                        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        borderRadius: 99, fontSize: '0.55rem', fontWeight: 800, color: '#fff',
                        padding: '0.1rem 0.55rem', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                      }}>BEST VALUE</div>
                    )}
                    <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{t.emoji}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>₹{t.amount}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.popular ? '#a78bfa' : '#fb923c' }}>+{t.hours}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>one-time</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              OR UPGRADE FOR DAILY TIME
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </>
      )}

      {/* ── Upgrade Banner (Manual Trigger) ── */}
      {mode === 'upgrade' && (
        <div style={{ textAlign: 'center', marginBottom: '0.5rem', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', marginBottom: '1rem' }}>
            <Crown size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Upgrade to Premium
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
            Unlock unlimited practice time, priority AI access, and exclusive features.
          </p>
          {/* Top-up section on upgrade modal */}
          <div style={{
            background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)',
            borderRadius: 16, padding: '1rem', textAlign: 'left', marginBottom: '0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BatteryCharging size={15} color="#fb923c" strokeWidth={2.5} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fb923c' }}>Need time today? Quick Top-Up</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[{ amount: 499, hours: '2.5 hrs', emoji: '⚡' }, { amount: 999, hours: '5 hrs', emoji: '🚀' }].map(t => (
                <button
                  key={t.amount}
                  onClick={() => handleTopUp(t.amount, t.hours)}
                  disabled={topupSubmitting || !razorpayReady}
                  style={{
                    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                    borderRadius: 10, padding: '0.65rem 0.5rem',
                    cursor: topupSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    opacity: topupSubmitting ? 0.7 : 1, textAlign: 'center',
                  }}
                  onMouseEnter={e => { if (!topupSubmitting) e.currentTarget.style.background = 'rgba(249,115,22,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }}
                >
                  <div style={{ fontSize: '1.1rem' }}>{t.emoji}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>₹{t.amount}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fb923c' }}>+{t.hours}</div>
                </button>
              ))}
            </div>
            {topupSuccess && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', fontWeight: 700, color: '#10b981', textAlign: 'center' }}>{topupSuccess}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Error Message ── */}
      {paymentError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', width: '100%', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.9rem' }}>
          {paymentError}
        </div>
      )}

      {/* ── Toggle ── */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', padding: '4px', gap: '4px' }}>
        <button onClick={() => setYearly(false)} style={{
          padding: '0.4rem 1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.25s',
          background: !yearly ? '#fff' : 'transparent', color: !yearly ? '#0a0a0a' : '#94a3b8'
        }}>Monthly</button>
        <button onClick={() => setYearly(true)} style={{
          padding: '0.4rem 1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: yearly ? 'linear-gradient(90deg,#E8392A,#F97316)' : 'transparent', color: yearly ? '#fff' : '#94a3b8'
        }}>
          Yearly <span style={{ background: yearly ? 'rgba(255,255,255,0.25)' : 'rgba(249,115,22,0.15)', color: yearly ? '#fff' : '#F97316', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>Save 17%</span>
        </button>
      </div>

      {/* ── Plans ── */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {availablePlans.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem' }}>
            You are already on the highest plan for this billing cycle!
          </div>
        ) : (
          availablePlans.map(plan => (
            <div key={plan.id} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px',
              padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: plan.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {plan.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{plan.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{plan.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{(yearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString()}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/{yearly ? 'year' : 'month'}</div>
              </div>
            </div>
            
            <button
              disabled={submitting || !razorpayReady}
              onClick={() => handlePayment(plan)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none',
                background: plan.gradient, color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: (submitting || !razorpayReady) ? 'not-allowed' : 'pointer', opacity: (submitting || !razorpayReady) ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
              }}
            >
              {!razorpayReady ? 'Loading...' : submitting ? 'Processing...' : `Upgrade to ${plan.name} ${yearly ? 'Yearly' : 'Monthly'}`}
            </button>
          </div>
          ))
        )}
      </div>

      {mode === 'limit' && (
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem',
          cursor: 'pointer', textDecoration: 'underline'
        }}>
          Maybe later, take me back to Dashboard
        </button>
      )}
    </div>
  );
}
