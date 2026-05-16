import { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { Crown, Clock, Sparkles, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PremiumEnrollModal({ user, onDismiss, mode = 'limit' }) {
  const [submitting, setSubmitting] = useState(false);
  const [yearly, setYearly] = useState(true);
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
  ].filter(p => !(user?.subscription_plan === 'pro' && p.id === 'pro') && !(user?.subscription_plan === 'max'));

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePayment = async (plan) => {
    setSubmitting(true);
    try {
      const amount = yearly ? plan.yearlyPrice : plan.monthlyPrice;
      const period = yearly ? 'yearly' : 'monthly';

      const isUpgrade = user?.subscription_plan && user.subscription_plan !== 'free';
      const endpoint = isUpgrade ? `${API_BASE}/api/payment/update-subscription` : `${API_BASE}/api/payment/create-subscription`;

      // 1. Create or Update subscription
      const subRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, period, studentId: user?.studentId || user?.username })
      });
      const subData = await subRes.json();
      
      if (!subRes.ok) throw new Error(subData.error || `Failed to ${isUpgrade ? 'update' : 'create'} subscription`);

      if (isUpgrade) {
        // Subscription Updated! Razorpay automatically prorates and charges the vaulted card.
        try {
          const currentUser = JSON.parse(localStorage.getItem('user')) || {};
          currentUser.subscription_plan = plan.id;
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (e) { console.error('Failed to update local storage', e); }
        window.location.href = `/premium-success?plan=${plan.id}`;
        return;
      }

      // 2. Open Razorpay Checkout for NEW subscriptions
      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr', // Public Key
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
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            // Update local storage so the global app state picks it up on reload
            try {
              const currentUser = JSON.parse(localStorage.getItem('user')) || {};
              currentUser.subscription_plan = plan.id;
              localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (e) { console.error('Failed to update local storage', e); }
            
            // Navigate to the success page (stays within the app — user stays logged in)
            window.location.href = `/premium-success?plan=${plan.id}`;
          } else {
            alert('Payment verification failed: ' + verifyData.error);
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
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      alert('Error initiating payment: ' + err.message);
    } finally {
      setSubmitting(false);
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

          {/* ── Divider ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              OR UPGRADE TO CONTINUE INSTANTLY
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
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Unlock unlimited practice time, priority AI access, and exclusive features.
          </p>
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
        {plans.map(plan => (
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
              disabled={submitting}
              onClick={() => handlePayment(plan)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none',
                background: plan.gradient, color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
              }}
            >
              {submitting ? 'Processing...' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
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
