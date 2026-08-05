import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Monitor, Trophy, ChevronRight, CheckCircle2, Award } from 'lucide-react';
import { API_BASE } from '../api';

const PRIZES = [
  { rank: 'WINNER', label: 'First Prize', reward: 'SMART PHONE', color: '#D4AF37', bar: 'linear-gradient(135deg, #D4AF37, #FBBF24)' },
  { rank: '1ST RUNNER-UP', label: 'Second Prize', reward: 'SMART WATCH', color: '#94a3b8', bar: 'linear-gradient(135deg, #94a3b8, #cbd5e1)' },
  { rank: '2ND RUNNER-UP', label: 'Third Prize', reward: 'BLUETOOTH SPEAKER', color: '#CD7F32', bar: 'linear-gradient(135deg, #CD7F32, #f59e0b)' },
];

const DOMAINS = [
  'NEP 2020 & NCF',
  'CT & AI',
  'SKILL EDUCATION',
  'PEDAGOGY',
  'CHILD PSYCHOLOGY'
];

export default function ITORegister({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    subjectRole: '',
    schoolName: user?.school || '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.subjectRole || !form.schoolName) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/ito/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          subjectOrRole: form.subjectRole,
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
    borderRadius: 8,
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
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
  };

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = 'rgba(212,175,55,0.05)'; },
    onBlur: e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; },
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 500, width: '100%', background: '#18181b', borderRadius: 24, padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: '#f8fafc' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you for registering for the World Teachers' Challenge 2026. We have sent the event details to your email address.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '1rem', background: '#f8fafc', color: '#0f172a', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = '#e2e8f0'}
            onMouseOut={e => e.target.style.background = '#f8fafc'}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 500, width: '100%', background: '#18181b', borderRadius: 24, padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Monitor size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: '#f8fafc' }}>Already Registered</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            You have already registered for the World Teachers' Challenge 2026. Please check your email for the event details.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = '#2563eb'}
            onMouseOut={e => e.target.style.background = '#3b82f6'}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: '"Inter", sans-serif' }}>
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(to right, #4A142D, #2D0B1C)', 
        borderBottom: '4px solid #D4AF37',
        padding: '6rem 2rem 7rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract shapes */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '40%', height: '200%', background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)', transform: 'rotate(-45deg)' }} />
        <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '40%', height: '200%', background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)', transform: 'rotate(-45deg)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <h3 style={{ color: '#14b8a6', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Celebrating Knowledge
          </h3>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em', textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            WORLD TEACHERS'<br />CHALLENGE 2026
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', fontWeight: 500, fontStyle: 'italic', maxWidth: 600, margin: '0 auto' }}>
            Test Your Knowledge. Challenge Your Potential.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative', top: '-4rem', zIndex: 10 }}>
        
        {/* Info Cards Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '4rem' }}>
          <div style={{ flex: 1, minWidth: 200, background: '#1e293b', border: '1px solid #D4AF37', borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>100</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Questions</div>
          </div>
          <div style={{ flex: 1, minWidth: 200, background: '#1e293b', border: '1px solid #14b8a6', borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>40</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Minutes</div>
          </div>
          <div style={{ flex: 1, minWidth: 200, background: '#1e293b', border: '1px solid #ec4899', borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem', marginTop: '0.4rem' }}>ONLINE</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mode</div>
          </div>
          <div style={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #D4AF37, #FBBF24)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4A142D', marginBottom: '0.25rem', marginTop: '0.4rem' }}>FREE</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4A142D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Participation</div>
          </div>
        </div>

        {/* Date Banner */}
        <div style={{ background: '#D4AF37', borderRadius: 100, padding: '1.25rem', textAlign: 'center', color: '#4A142D', fontWeight: 800, fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', letterSpacing: '0.05em', marginBottom: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', maxWidth: 650, margin: '0 auto 5rem' }}>
          <Calendar size={24} /> 09 AUG 2026 &nbsp;&bull;&nbsp; <Clock size={24} /> 12:00 NOON
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 'clamp(3rem, 6vw, 5rem)', alignItems: 'start' }}>
          
          {/* Left Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            
            {/* Quiz Domains */}
            <div>
              <div style={{ background: '#4A142D', borderRadius: 16, padding: '2.5rem 2rem', border: '1px solid #D4AF37' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D4AF37', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quiz Domains</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                  {DOMAINS.map((domain, i) => (
                    <span key={i} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: 100, fontSize: '0.875rem', fontWeight: 600, color: '#fff', border: '1px solid rgba(212,175,55,0.3)' }}>
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Exciting Prizes */}
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D4AF37', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Exciting Prizes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                {PRIZES.map((prize, i) => (
                  <div key={i} style={{ background: '#1e293b', border: `1px solid ${prize.color}`, borderRadius: 16, padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: prize.bar, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800, boxShadow: `0 0 20px ${prize.color}40` }}>
                      <Trophy size={20} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: prize.color, marginBottom: '0.25rem' }}>{prize.rank}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{prize.reward}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', background: '#D4AF37', color: '#4A142D', padding: '1rem', borderRadius: 12, textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Award size={20} /> PARTICIPATION CERTIFICATES FOR ALL
              </div>
            </div>

          </div>

          {/* Right Column: Registration Form */}
          <div style={{ background: '#1e293b', borderRadius: 24, padding: 'clamp(2rem, 6vw, 3.5rem)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Register Now</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>Fill in your details to participate in the World Teachers' Challenge 2026.</p>
            
            {errorMsg && (
              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 12, fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input required type="text" name="fullName" value={form.fullName} onChange={handleChange} style={fieldStyle} {...focusHandlers} placeholder="John Doe" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input required type="email" name="email" value={form.email} onChange={handleChange} style={fieldStyle} {...focusHandlers} placeholder="john@example.com" />
                </div>
                <div>
                  <label style={labelStyle}>Mobile Number *</label>
                  <input required type="tel" name="mobile" value={form.mobile} onChange={handleChange} style={fieldStyle} {...focusHandlers} placeholder="+1 234 567 8900" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Subject / Role *</label>
                <input required type="text" name="subjectRole" value={form.subjectRole} onChange={handleChange} style={fieldStyle} {...focusHandlers} placeholder="e.g. Math Teacher, Principal" />
              </div>

              <div>
                <label style={labelStyle}>School/Institution Name *</label>
                <input required type="text" name="schoolName" value={form.schoolName} onChange={handleChange} style={fieldStyle} {...focusHandlers} placeholder="Global International School" />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} style={fieldStyle} {...focusHandlers} placeholder="New York" />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #D4AF37, #FBBF24)',
                  color: '#4A142D',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 20px rgba(212,175,55,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={e => { if(!submitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={e => { if(!submitting) e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {submitting ? 'Processing...' : 'REGISTER FOR FREE'} <ChevronRight size={20} />
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
      {/* Footer minimal */}
      <div style={{ marginTop: 'auto', textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} GraceAndForce.com. All rights reserved.
      </div>
    </div>
  );
}
