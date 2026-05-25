import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Sparkles, Lock, Target, Scroll, ArrowLeft, CheckCircle } from 'lucide-react';
import { API_BASE } from '../api';

const FEATURE_CONFIG = {
  mun30: {
    icon: Target,
    emoji: '🎯',
    name: 'MUN 30 Boot Camp',
    tagline: 'Master Model UN in 30 days',
    description: 'A structured 30-day program to build your Model UN skills from the ground up — research, debate, resolution writing, and more.',
    requiredPlan: 'Pro',
    requiredPlanId: 'pro',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    perks: [
      '30 structured daily lessons',
      'AI-powered resolution feedback',
      'Country-specific debate coaching',
      'Progress tracking & streaks',
      'Certificate on completion',
    ],
  },
  diplomat365: {
    icon: Scroll,
    emoji: '🌐',
    name: 'Diplomat 365',
    tagline: '365 days of diplomatic mastery',
    description: 'An immersive year-long diplomatic training program covering international relations, negotiation, and global policy across 12 modules.',
    requiredPlan: 'Max',
    requiredPlanId: 'max',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #e8392a 100%)',
    perks: [
      '365 daily diplomatic exercises',
      'Real-world policy scenarios',
      'Advanced debate and negotiation',
      'Vienna Score leaderboard',
      'Monthly cohort challenges',
    ],
  },
};

export default function UpgradeRequired({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const featureKey = searchParams.get('feature') || 'mun30';
  const feature = FEATURE_CONFIG[featureKey] || FEATURE_CONFIG.mun30;

  const [yearly, setYearly] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== 'undefined' && !!window.Razorpay);

  const FeatureIcon = feature.icon;

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 2999,
      yearlyPrice: 29999,
      desc: '20 mins daily · MUN 30 Boot Camp',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
      icon: <Crown size={20} color="#fff" />,
    },
    {
      id: 'max',
      name: 'Max',
      monthlyPrice: 8999,
      yearlyPrice: 89999,
      desc: '60 mins daily · All features including Diplomat 365',
      gradient: 'linear-gradient(135deg, #f97316 0%, #e8392a 100%)',
      icon: <Sparkles size={20} color="#fff" />,
    },
  ];

  // Show only plans that unlock this feature
  const availablePlans = feature.requiredPlanId === 'max'
    ? plans.filter(p => p.id === 'max')
    : plans; // for pro, show both pro and max

  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const handlePayment = async (plan) => {
    setPaymentError('');
    if (!razorpayReady || !window.Razorpay) {
      setPaymentError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }
    setSubmitting(true);
    try {
      const period = yearly ? 'yearly' : 'monthly';
      const isUpgrade = user?.subscription_plan && user.subscription_plan !== 'free' && user?.subscription_status === 'active';
      const endpoint = isUpgrade
        ? `${API_BASE}/api/payment/update-subscription`
        : `${API_BASE}/api/payment/create-subscription`;

      const subRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, period, studentId: user?.studentId || user?.username }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData?.error || `Server error (${subRes.status})`);

      if (isUpgrade) {
        try {
          const cu = JSON.parse(localStorage.getItem('user')) || {};
          cu.subscription_plan = plan.id;
          cu.subscription_period = period;
          localStorage.setItem('user', JSON.stringify(cu));
        } catch (_) {}
        window.location.href = `/premium-success?plan=${plan.id}`;
        return;
      }

      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr',
        name: 'G Force AI',
        description: `Upgrade to ${plan.name} (${period})`,
        subscription_id: subData.id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId: user?.studentId || user?.username,
              plan: plan.id,
              period,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData?.success) {
            try {
              const cu = JSON.parse(localStorage.getItem('user')) || {};
              cu.subscription_plan = plan.id;
              cu.subscription_period = period;
              localStorage.setItem('user', JSON.stringify(cu));
            } catch (_) {}
            window.location.href = `/premium-success?plan=${plan.id}`;
          } else {
            setSubmitting(false);
            setPaymentError('Payment verification failed: ' + verifyData.error);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        prefill: { name: user?.name, email: user?.email || '', contact: user?.phone || '' },
        theme: { color: plan.id === 'max' ? '#f97316' : '#8b5cf6' },
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

  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', padding: '2rem 1rem', gap: '1.5rem',
    }}>

      {/* Back button */}
      <div style={{ width: '100%', maxWidth: 560 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0.45rem 1rem', color: '#94a3b8',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Feature Hero Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${feature.color}40`,
          borderRadius: 24,
          padding: '2rem 1.75rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow blob */}
          <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 200, borderRadius: '50%',
            background: `${feature.color}20`,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }} />

          {/* Lock badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 99, padding: '0.3rem 0.9rem', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 700, color: '#f87171',
          }}>
            <Lock size={12} strokeWidth={2.5} /> {feature.requiredPlan} Plan Required
          </div>

          {/* Icon */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20,
            background: feature.gradient,
            boxShadow: `0 8px 24px ${feature.color}40`,
            marginBottom: '1rem',
          }}>
            <FeatureIcon size={34} color="#fff" strokeWidth={2} />
          </div>

          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, color: '#fff',
            margin: '0 0 0.4rem', letterSpacing: '-0.02em',
          }}>
            {feature.name}
          </h1>
          <p style={{
            fontSize: '1rem', fontWeight: 600, color: feature.color,
            margin: '0 0 0.75rem',
          }}>
            {feature.tagline}
          </p>
          <p style={{
            fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.7,
            maxWidth: 380, marginInline: 'auto',
          }}>
            {feature.description}
          </p>

          {/* Perks */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            marginTop: '1.5rem', textAlign: 'left',
          }}>
            {feature.perks.map((perk, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 500,
              }}>
                <CheckCircle size={15} color={feature.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)',
            borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', padding: 4, gap: 4,
          }}>
            <button onClick={() => setYearly(false)} style={{
              padding: '0.4rem 1.5rem', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.25s',
              background: !yearly ? '#fff' : 'transparent', color: !yearly ? '#0a0a0a' : '#94a3b8',
            }}>Monthly</button>
            <button onClick={() => setYearly(true)} style={{
              padding: '0.4rem 1.5rem', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: yearly ? 'linear-gradient(90deg,#E8392A,#F97316)' : 'transparent',
              color: yearly ? '#fff' : '#94a3b8',
            }}>
              Yearly{' '}
              <span style={{
                background: yearly ? 'rgba(255,255,255,0.25)' : 'rgba(249,115,22,0.15)',
                color: yearly ? '#fff' : '#F97316',
                fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: 999,
              }}>Save 17%</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {paymentError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            padding: '1rem', borderRadius: 12, textAlign: 'center',
            border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.9rem',
          }}>
            {paymentError}
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {availablePlans.map(plan => (
            <div key={plan.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${plan.id === 'max' ? '#f97316' : '#8b5cf6'}50`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: plan.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 12px ${plan.id === 'max' ? '#f9731640' : '#8b5cf640'}`,
                  flexShrink: 0,
                }}>
                  {plan.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{plan.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{plan.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                    ₹{(yearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>/{yearly ? 'year' : 'month'}</div>
                </div>
              </div>
              <button
                disabled={submitting || !razorpayReady}
                onClick={() => handlePayment(plan)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: 12, border: 'none',
                  background: plan.gradient, color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  cursor: (submitting || !razorpayReady) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || !razorpayReady) ? 0.7 : 1,
                  boxShadow: `0 4px 16px ${plan.id === 'max' ? '#f9731630' : '#8b5cf630'}`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${plan.id === 'max' ? '#f9731650' : '#8b5cf650'}`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${plan.id === 'max' ? '#f9731630' : '#8b5cf630'}`; }}
              >
                {!razorpayReady ? 'Loading...' : submitting ? 'Processing...' : `Upgrade to ${plan.name} — ${yearly ? 'Yearly' : 'Monthly'}`}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', fontSize: '0.78rem', color: '#475569',
          margin: 0, lineHeight: 1.6,
        }}>
          Secure payment via Razorpay · Cancel anytime · Instant access after payment
        </p>

      </div>
    </div>
  );
}
