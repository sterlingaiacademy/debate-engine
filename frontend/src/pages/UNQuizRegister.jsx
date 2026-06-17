import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

const GRADES = [
  'Class KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

export default function UNQuizRegister({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    classGrade: user?.grade || user?.classLevel || '',
    schoolName: user?.school || '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'already' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.classGrade || !form.schoolName) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/quiz/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.studentId || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          classGrade: form.classGrade,
          schoolName: form.schoolName,
          city: form.city,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else if (res.status === 409) {
        setStatus('already');
      } else {
        setErrorMsg(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '0.85rem 1rem',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
  };

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
        <div style={{
          textAlign: 'center', maxWidth: 480,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,212,255,0.05))',
          border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, padding: '3rem 2.5rem',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '0 0 0.75rem' }}>
            Registration Confirmed!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            You are registered for the <strong style={{ color: '#fff' }}>UN Quiz Contest</strong> on
            <strong style={{ color: '#FBBF24' }}> Sunday, 28 June 2026</strong> at 10:00 AM IST (Online).
          </p>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 2rem' }}>
            A confirmation will be shared via email. Login to graceandforce.com on the day to participate.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #00d4ff)',
              color: '#fff', border: 'none', padding: '0.85rem 2rem',
              borderRadius: 99, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
        <div style={{
          textAlign: 'center', maxWidth: 440,
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 24, padding: '3rem 2.5rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FBBF24', margin: '0 0 0.75rem' }}>
            Already Registered
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
            You have already registered for the UN Quiz Contest. We will see you on <strong style={{ color: '#fff' }}>28 June 2026</strong> at 10:00 AM IST!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              color: '#fff', border: 'none', padding: '0.85rem 2rem',
              borderRadius: 99, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Contest Banner */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', marginBottom: '2rem',
        background: 'linear-gradient(135deg, #0a0f2c 0%, #051230 40%, #0c1a4a 100%)',
        border: '1px solid rgba(100,150,255,0.2)',
        position: 'relative',
      }}>
        {/* Stars/glow effect */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(0,80,200,0.25) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 30%, rgba(251,191,36,0.12) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2rem 1.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F97316', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              GraceandForce.com Presents
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>UN</span>
              <span style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 900, color: '#FBBF24', letterSpacing: '-0.02em' }}>QUIZ</span>
              <span style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', opacity: 0.9 }}>CONTEST</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginTop: '0.4rem', letterSpacing: '0.05em' }}>
              KNOW THE WORLD. UNDERSTAND THE UN. BE THE CHANGE.
            </div>
          </div>

          {/* UN Globe icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a5fb4, #3584e4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 30px rgba(53,132,228,0.5)',
              fontSize: '2.2rem',
            }}>
              🌐
            </div>
          </div>

          {/* Contest Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Date', value: 'Sunday, 28 June 2026', icon: '📅' },
              { label: 'Time', value: '10:00 AM IST', icon: '🕙' },
              { label: 'Mode', value: 'Online', icon: '💻' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FBBF24' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prizes */}
          <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#FBBF24', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Attractive Prizes
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { pos: '1st', prize: 'Smart Watch + Certificate', color: '#FBBF24' },
                { pos: '2nd', prize: 'Tablet + Certificate', color: '#94a3b8' },
                { pos: '3rd', prize: 'Bluetooth Speaker + Certificate', color: '#cd7f32' },
              ].map(p => (
                <div key={p.pos} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: p.color }}>{p.pos}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: 100 }}>{p.prize}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
              E-Certificates for all participants
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['Enhance Knowledge', 'Global Issues', 'Win Prizes', 'Public Speaking'].map(t => (
              <div key={t} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: '#F97316' }}>•</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '2rem',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem' }}>
          Register for the Contest
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.75rem' }}>
          Fill in your details to secure your spot. Registration is free.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number *</label>
              <input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Class / Grade *</label>
              <select
                name="classGrade"
                value={form.classGrade}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                required
              >
                <option value="" style={{ background: '#0a0a0a' }}>Select your class</option>
                {GRADES.map(g => (
                  <option key={g} value={g} style={{ background: '#0a0a0a' }}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Your city"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>School Name *</label>
            <input
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
              placeholder="Full name of your school"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F97316'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              required
            />
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, #E8392A, #F97316)',
              color: '#fff', border: 'none', padding: '1rem 2rem',
              borderRadius: 12, fontWeight: 800, fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {submitting ? 'Registering...' : 'Register for UN Quiz Contest'}
          </button>

          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', margin: 0 }}>
            Learn. Lead. Impact. — Free registration, open to all students.
          </p>
        </form>
      </div>
    </div>
  );
}
