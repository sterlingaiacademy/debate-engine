import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Monitor, Award, ChevronRight, CheckCircle2, Globe, Users, BookOpen } from 'lucide-react';
import { API_BASE } from '../api';

const ROLES = [
  'Teacher', 'MUN Coordinator', 'Principal', 'Other'
];

export default function MUNMentorRegister({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    schoolName: user?.school || '',
    city: '',
    role: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.role || !form.schoolName) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/munmentor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          role: form.role,
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

  const fieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '0.875rem 1.1rem',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '0.45rem',
  };

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#FBBF24'; e.target.style.background = 'rgba(251,191,36,0.04)'; },
    onBlur: e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; },
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 24, padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
          <CheckCircle2 size={72} color="#10b981" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Registration Successful!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
            Thank you for registering for the <strong>MUN Mentor Master Class</strong>. We will contact you soon with further details.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', padding: '1rem 2.5rem',
              borderRadius: 99, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
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
      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 24, padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #F97316, #ea580c)' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Already Registered
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 2.5rem' }}>
            You have already registered for the MUN Mentor Master Class.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              color: '#fff', border: 'none', padding: '0.9rem 2.5rem',
              borderRadius: 99, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* ── POSTER IMAGE ── */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        lineHeight: 0,
      }}>
        <img
          src="/mun-mentor-poster.jpg"
          alt="MUN Mentor Master Class"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* ── REGISTRATION FORM ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: '2.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FBBF24, #F97316)' }} />

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
            Register for the Master Class
          </h2>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
            Fill in your details below to register. We will reach out to you with the payment link for the INR 999/- fee.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" style={fieldStyle} {...focusHandlers} required />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number *</label>
              <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="Mobile number" style={fieldStyle} {...focusHandlers} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" style={fieldStyle} {...focusHandlers} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Role / Designation *</label>
              <select name="role" value={form.role} onChange={handleChange} style={{ ...fieldStyle, cursor: 'pointer' }} {...focusHandlers} required>
                <option value="" style={{ background: '#0a0a0a' }}>Select your role</option>
                {ROLES.map(r => (
                  <option key={r} value={r} style={{ background: '#0a0a0a' }}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Your city" style={fieldStyle} {...focusHandlers} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>School / Institution Name *</label>
            <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="Full name of your school" style={fieldStyle} {...focusHandlers} required />
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
              background: submitting ? 'rgba(251,191,36,0.5)' : 'linear-gradient(135deg, #FBBF24, #F59E0B)',
              color: '#1a1a1a', border: 'none', padding: '1rem 2rem',
              borderRadius: 12, fontWeight: 900, fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(251,191,36,0.3)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
              marginTop: '0.5rem'
            }}
          >
            {submitting ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
