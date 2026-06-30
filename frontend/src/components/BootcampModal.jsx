import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE } from '../api';
import { X, CheckCircle, ChevronRight, Loader } from 'lucide-react';
import { COUNTRY_CODES } from '../countryCodes';

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

const HEAR_ABOUT_OPTIONS = [
  'Social Media (Instagram, Facebook, etc.)',
  'School/Institution Announcement',
  'Referral from a Friend/Colleague',
  'Reference',
  'Online Search Engine',
  'Previous Participant',
];

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.7rem 1rem',
  borderRadius: 10,
  fontSize: '0.88rem',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary, #f1f5f9)',
  border: `1.5px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border 0.2s',
});

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#94a3b8',
  display: 'block',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const errorStyle = { color: '#ef4444', fontSize: '0.72rem', marginTop: '0.25rem' };

export default function BootcampModal({ user, onDismiss, cohort = 'cohort-1' }) {
  const [step, setStep] = useState('info'); // 'info' | 'form' | 'paying' | 'success'
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    countryCode: '+91',
    school: user?.school_name || '',
    grade: user?.grade || user?.classLevel || '',
    city: '',
    category: '',
    achievements: '',
    hearAbout: '',
    questions: '',
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

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Enter a valid number';
    if (!form.school.trim()) e.school = 'Required';
    if (!form.grade.trim()) e.grade = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.achievements.trim()) e.achievements = 'Required';
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
          cohort,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: `${form.countryCode} ${form.phone.trim()}`,
          school: form.school.trim(),
          grade: form.grade.trim(),
          city: form.city.trim(),
          category: form.category,
          achievements: form.achievements.trim(),
          hearAbout: form.hearAbout,
          questions: form.questions.trim(),
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
        prefill: { name: form.name, email: form.email, contact: `${form.countryCode}${form.phone}` },
        theme: { color: '#FF6B00' },
        notes: { programme: 'G-Talk Cohort 1', school: form.school, grade: form.grade, city: form.city },
      };

      // No setStep('paying') here, just keep the button disabled with setSubmitting(true)
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

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflowY: 'auto',
      padding: 'max(1.5rem, env(safe-area-inset-top, 1.5rem)) 1rem max(4rem, env(safe-area-inset-bottom, 4rem))',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        width: '100%', maxWidth: 580, borderRadius: 24,
        background: '#0d0d0d',
        border: '1px solid rgba(255,107,0,0.25)',
        boxShadow: '0 24px 80px rgba(255,107,0,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Orange top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #ef4444, #FF6B00, #FFa600)' }} />

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

          {/* ── INFO STEP ── */}
          {step === 'info' && (
            <div>
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
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
                  4 Weeks to <span style={{ color: '#FF6B00', fontWeight: 700 }}>Speak with Confidence</span>. Debate with Purpose. Lead with Impact.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[['📅', '4 Weeks | Online'], ['⏰', '1 Hr Daily @ 7PM IST'], ['📹', 'Live on Zoom']].map(([icon, label]) => (
                    <span key={label} style={{ fontSize: '0.73rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '0.28rem 0.7rem', color: '#cbd5e1' }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights grid */}
              <div style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.15)', borderRadius: 14, padding: '1.1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Programme Highlights</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {HIGHLIGHTS.map(h => (
                    <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✅</span>{h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Join */}
              <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 14, padding: '1.1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Why Join?</div>
                {WHY_JOIN.map(w => (
                  <div key={w} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.45rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#00d4ff', flexShrink: 0, marginTop: 1 }}>✔</span>{w}
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FF6B00' }}>₹499</span>
                  <span style={{ fontSize: '0.85rem', color: '#475569', marginLeft: '0.5rem', textDecoration: 'line-through' }}>₹4,999</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '0.2rem 0.5rem', marginLeft: '0.5rem' }}>90% OFF</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1.25rem' }}>Inaugural Cohort Pricing · Limited Seats Available</div>
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
                <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '0.75rem' }}>🔒 Secure payment powered by Razorpay</div>
              </div>
            </div>
          )}

          {/* ── FORM STEP ── */}
          {step === 'form' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.25rem', color: '#fff' }}>Register for G-Talk</h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Fill in your details to reserve your seat in Cohort 1</p>
              </div>

              {paymentError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.83rem' }}>
                  {paymentError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Name */}
                <div>
                  <label style={labelStyle}>Name of the Participant *</label>
                  <input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} style={inputStyle(errors.name)} />
                  {errors.name && <div style={errorStyle}>{errors.name}</div>}
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Primary Email Address *</label>
                  <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} style={inputStyle(errors.email)} />
                  {errors.email && <div style={errorStyle}>{errors.email}</div>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label style={labelStyle}>WhatsApp Number *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={form.countryCode}
                      onChange={set('countryCode')}
                      style={{ ...inputStyle(false), width: '90px', padding: '0.7rem 0.5rem', cursor: 'pointer' }}
                    >
                      {COUNTRY_CODES.map((c, i) => (
                        <option key={i} value={c.code} style={{ background: '#0d0d0d', color: '#fff' }}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Enter mobile number"
                      value={form.phone}
                      onChange={set('phone')}
                      style={{ ...inputStyle(errors.phone), flex: 1 }}
                    />
                  </div>
                  {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
                </div>

                {/* School */}
                <div>
                  <label style={labelStyle}>Name of School / Institution *</label>
                  <input type="text" placeholder="Your school or college name" value={form.school} onChange={set('school')} style={inputStyle(errors.school)} />
                  {errors.school && <div style={errorStyle}>{errors.school}</div>}
                </div>

                {/* Class & City — side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Class *</label>
                    <input type="text" placeholder="e.g. Class 9" value={form.grade} onChange={set('grade')} style={inputStyle(errors.grade)} />
                    {errors.grade && <div style={errorStyle}>{errors.grade}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>City and State *</label>
                    <input type="text" placeholder="e.g. Mumbai, MH" value={form.city} onChange={set('city')} style={inputStyle(errors.city)} />
                    {errors.city && <div style={errorStyle}>{errors.city}</div>}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Which category applies to you? *</label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                    {['Beginner', 'Intermediate', 'Advanced'].map(cat => (
                      <label key={cat} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: 99, cursor: 'pointer',
                        border: `1.5px solid ${form.category === cat ? '#FF6B00' : 'rgba(255,255,255,0.1)'}`,
                        background: form.category === cat ? 'rgba(255,107,0,0.12)' : 'rgba(255,255,255,0.03)',
                        fontSize: '0.83rem', fontWeight: 600,
                        color: form.category === cat ? '#FF6B00' : '#94a3b8',
                        transition: 'all 0.15s',
                      }}>
                        <input
                          type="radio" name="category" value={cat}
                          checked={form.category === cat}
                          onChange={set('category')}
                          style={{ display: 'none' }}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                  {errors.category && <div style={errorStyle}>{errors.category}</div>}
                </div>

                {/* Achievements */}
                <div>
                  <label style={labelStyle}>Previous achievements in MUN / Debate / Public Speaking *</label>
                  <textarea
                    placeholder="e.g. Won school debate, participated in MUN, no prior experience..."
                    value={form.achievements}
                    onChange={set('achievements')}
                    rows={3}
                    style={{ ...inputStyle(errors.achievements), resize: 'vertical', minHeight: 72 }}
                  />
                  {errors.achievements && <div style={errorStyle}>{errors.achievements}</div>}
                </div>

                {/* Hear About */}
                <div>
                  <label style={labelStyle}>How did you hear about our programmes?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.1rem' }}>
                    {HEAR_ABOUT_OPTIONS.map(opt => (
                      <label key={opt} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.45rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${form.hearAbout === opt ? '#FF6B00' : 'rgba(255,255,255,0.08)'}`,
                        background: form.hearAbout === opt ? 'rgba(255,107,0,0.1)' : 'transparent',
                        fontSize: '0.82rem', color: form.hearAbout === opt ? '#FF6B00' : '#94a3b8',
                        fontWeight: form.hearAbout === opt ? 700 : 500,
                        transition: 'all 0.15s',
                      }}>
                        <input type="radio" name="hearAbout" value={opt} checked={form.hearAbout === opt} onChange={set('hearAbout')} style={{ display: 'none' }} />
                        <span style={{
                          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${form.hearAbout === opt ? '#FF6B00' : '#475569'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {form.hearAbout === opt && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B00', display: 'block' }} />}
                        </span>
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <label style={labelStyle}>Your questions related to Speech & Debate <span style={{ fontWeight: 400, textTransform: 'none', color: '#475569' }}>(optional)</span></label>
                  <textarea
                    placeholder="Any questions or things you'd like to learn..."
                    value={form.questions}
                    onChange={set('questions')}
                    rows={3}
                    style={{ ...inputStyle(false), resize: 'vertical', minHeight: 72 }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setStep('info')}
                  style={{
                    flex: '0 0 auto', padding: '0.8rem 1.25rem', borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  }}
                >← Back</button>
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
                  {submitting
                    ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                    : <>Pay ₹499 & Register <ChevronRight size={16} /></>}
                </button>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#334155', textAlign: 'center', marginTop: '0.65rem' }}>
                🔒 Secure · Limited Seats · Instant Confirmation
              </div>
            </div>
          )}

          {/* ── SUCCESS STEP ── */}
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
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
                Welcome to <strong style={{ color: '#FF6B00' }}>G-Talk Cohort 1</strong>!<br />
                Your seat is confirmed. You will receive details via WhatsApp &amp; Email shortly.
              </p>
              <div style={{
                background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.2)',
                borderRadius: 14, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left',
              }}>
                {[
                  ['📅', 'Duration', '4 Weeks · 1 Hour Daily'],
                  ['⏰', 'Time', '7:00 PM IST on Zoom'],
                  ['🎓', 'Certificate', 'Participation Certificate included'],
                  ['🤖', 'Bonus', 'AI Practice via G-Force AI'],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                Think Deeply. Speak Boldly. Act Ethically. Lead Globally. 🌏
              </div>
              <button
                onClick={onDismiss}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #FF6B00, #FFa600)',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                }}
              >Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
