import { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { X, CheckCircle, ChevronRight, Loader } from 'lucide-react';

const HIGHLIGHTS = [
  'Public Speaking & Stage Confidence',
  'Debate Skills & Rebuttal Techniques',
  'Extempore Speaking & Storytelling',
  'MUN (Model United Nations) Preparation',
  'Research & Position Paper Writing',
  'Diplomacy, Negotiation & Leadership Skills',
  'Vocabulary Building & Word Challenges',
  'Speech Coaching & Performance Analysis',
  'AI-Powered Practice through G-Force AI',
  'Weekly Activities, Assessments & Feedback',
  'Mock Debates & MUN Simulations',
  'Participation Certificate',
];

const WHY_JOIN = [
  'Improve communication and presentation skills',
  'Build confidence for school, competitions, interviews, and leadership roles',
  'Learn from structured activities and real-world discussions',
  'Prepare for debates, MUNs, public speaking competitions, and future careers',
  'Develop the skills needed to thrive in the AI era',
];

export default function BootcampModal({ user, onDismiss }) {
  const [step, setStep] = useState('info'); // 'info' | 'form' | 'paying' | 'success'
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    school: '',
    grade: user?.grade || user?.classLevel || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(!!window.Razorpay);

  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.school.trim()) e.school = 'School name is required';
    if (!form.grade.trim()) e.grade = 'Grade/Class is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    if (!razorpayReady) { setPaymentError('Payment is still loading. Please wait.'); return; }
    setSubmitting(true);
    setPaymentError('');
    try {
      const res = await fetch(`${API_BASE}/api/bootcamp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.studentId || user?.username || '',
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          school: form.school.trim(),
          grade: form.grade.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr',
        amount: data.amount,
        currency: 'INR',
        name: 'G-Talk Bootcamp',
        description: 'G-Talk Speech & Debate Programme – Cohort 1',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/bootcamp/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                registrationId: data.registrationId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setStep('success');
            } else {
              setPaymentError('Payment verification failed. Please contact support.');
            }
          } catch {
            setPaymentError('Verification error. Please contact support.');
          }
          setSubmitting(false);
        },
        modal: { ondismiss: () => { setSubmitting(false); setStep('form'); } },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#FF6B00' },
        notes: { programme: 'G-Talk Cohort 1', school: form.school, grade: form.grade },
      };

      setStep('paying');
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setSubmitting(false);
        setStep('form');
        setPaymentError('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      setSubmitting(false);
      setPaymentError(err.message || 'Something went wrong. Please try again.');
      setStep('form');
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.7rem 1rem', borderRadius: 12, fontSize: '0.9rem',
    background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
    border: `1.5px solid ${errors[field] ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border 0.2s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflowY: 'auto', padding: '1.5rem 1rem 4rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 560, borderRadius: 24,
        background: 'var(--bg-primary, #0a0a0a)',
        border: '1px solid rgba(255,107,0,0.25)',
        boxShadow: '0 24px 80px rgba(255,107,0,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow top bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #FF6B00, #FFa600, #FF6B00)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />

        {/* Close */}
        <button onClick={onDismiss} style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', cursor: 'pointer',
        }}>
          <X size={18} />
        </button>

        <div style={{ padding: '1.75rem 1.75rem 2rem' }}>

          {/* ── STEP: INFO ── */}
          {step === 'info' && (
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.3)',
                  borderRadius: 99, padding: '0.3rem 0.9rem', marginBottom: '1rem',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6B00', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Registrations Open · Cohort 1</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.4rem', letterSpacing: '-0.02em', color: '#fff' }}>
                  G-Talk Speech &<br />Debate Programme
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
                  4 Weeks to <span style={{ color: '#FF6B00', fontWeight: 700 }}>Speak with Confidence</span>. Debate with Purpose. Lead with Impact.
                </p>
                {/* Info pills */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[['📅', '4 Weeks | Online'], ['⏰', '1 Hr Daily @ 7PM IST'], ['📹', 'Live on Zoom']].map(([icon, label]) => (
                    <span key={label} style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '0.3rem 0.75rem', color: '#cbd5e1' }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.15)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Programme Highlights</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  {HIGHLIGHTS.map(h => (
                    <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✅</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Join */}
              <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Why Join?</div>
                {WHY_JOIN.map(w => (
                  <div key={w} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#00d4ff', flexShrink: 0, marginTop: 1 }}>✔</span>
                    {w}
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FF6B00' }}>₹499</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.5rem', textDecoration: 'line-through' }}>₹4,999</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '0.2rem 0.5rem', marginLeft: '0.5rem' }}>90% OFF</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>Inaugural Cohort Pricing · Limited Seats</div>
                <button
                  onClick={() => setStep('form')}
                  style={{
                    width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none',
                    background: 'linear-gradient(135deg, #FF6B00, #FFa600)',
                    color: '#fff', fontSize: '1rem', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
                  }}
                >
                  Register Now – ₹499 <ChevronRight size={18} />
                </button>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.75rem' }}>
                  🔒 Secure payment powered by Razorpay
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: FORM ── */}
          {step === 'form' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.3rem', color: '#fff' }}>Your Details</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Fill in your info to reserve your seat in G-Talk Cohort 1</p>
              </div>

              {paymentError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '0.9rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.85rem' }}>
                  {paymentError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle('name')}
                  />
                  {errors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.name}</div>}
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    style={inputStyle('phone')}
                  />
                  {errors.phone && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.phone}</div>}
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com (optional)"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle('email')}
                  />
                  {errors.email && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.email}</div>}
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>School Name *</label>
                  <input
                    type="text"
                    placeholder="Name of your school"
                    value={form.school}
                    onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                    style={inputStyle('school')}
                  />
                  {errors.school && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.school}</div>}
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class / Grade *</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 9, Grade 11"
                    value={form.grade}
                    onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    style={inputStyle('grade')}
                  />
                  {errors.grade && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.grade}</div>}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setStep('info')}
                  style={{
                    flex: '0 0 auto', padding: '0.8rem 1.25rem', borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handlePay}
                  disabled={submitting || !razorpayReady}
                  style={{
                    flex: 1, padding: '0.85rem', borderRadius: 12, border: 'none',
                    background: submitting ? 'rgba(255,107,0,0.5)' : 'linear-gradient(135deg, #FF6B00, #FFa600)',
                    color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 6px 20px rgba(255,107,0,0.3)',
                  }}
                >
                  {submitting ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <>Pay ₹499 & Register <ChevronRight size={16} /></>}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#334155', textAlign: 'center', marginTop: '0.75rem' }}>
                🔒 Secure · Limited Seats · Instant Confirmation
              </div>
            </div>
          )}

          {/* ── STEP: PAYING (Razorpay open) ── */}
          {step === 'paying' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader size={40} color="#FF6B00" style={{ animation: 'spin 1s linear infinite', marginBottom: '1.25rem' }} />
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Opening Payment...</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Please complete the payment in the Razorpay window.</p>
            </div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem 0.5rem' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                border: '2px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <CheckCircle size={44} color="#22c55e" strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem' }}>You're In! 🎉</h2>
              <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
                Welcome to <strong style={{ color: '#FF6B00' }}>G-Talk Cohort 1</strong>!<br />
                Your seat is confirmed. You will receive details via WhatsApp/Email.
              </p>

              <div style={{
                background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.2)',
                borderRadius: 16, padding: '1.1rem', marginBottom: '1.5rem', textAlign: 'left',
              }}>
                {[
                  ['📅', 'Duration', '4 Weeks · 1 Hour Daily'],
                  ['⏰', 'Time', '7:00 PM IST on Zoom'],
                  ['🎓', 'You get', 'Participation Certificate'],
                  ['🤖', 'Bonus', 'AI-Powered Practice via G-Force AI'],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1.5rem' }}>
                Think Deeply. Speak Boldly. Act Ethically. Lead Globally. 🌏
              </div>

              <button
                onClick={onDismiss}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #FF6B00, #FFa600)',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
