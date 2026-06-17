import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Monitor, Trophy, ChevronRight, CheckCircle2, Globe, Zap } from 'lucide-react';
import { API_BASE } from '../api';

const GRADES = [
  'Class KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

const PRIZES = [
  { rank: '01', label: 'First Prize', reward: 'Smart Watch + Certificate', color: '#F59E0B', bar: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  { rank: '02', label: 'Second Prize', reward: 'Tablet + Certificate', color: '#94a3b8', bar: 'linear-gradient(135deg, #94a3b8, #cbd5e1)' },
  { rank: '03', label: 'Third Prize', reward: 'Bluetooth Speaker + Certificate', color: '#CD7F32', bar: 'linear-gradient(135deg, #CD7F32, #f59e0b)' },
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
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
    onFocus: e => { e.target.style.borderColor = '#F97316'; e.target.style.background = 'rgba(249,115,22,0.04)'; },
    onBlur: e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; },
  };

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
        <div style={{
          textAlign: 'center', maxWidth: 480, width: '100%',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 24, padding: '3.5rem 2.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #00d4ff)' }} />
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle2 size={30} color="#10b981" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
            Registration Confirmed
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 0.75rem' }}>
            You are registered for the <strong style={{ color: '#fff' }}>UN Quiz Contest</strong> on
          </p>
          <div style={{
            display: 'inline-block', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 8, padding: '0.5rem 1.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#F97316',
            margin: '0 0 1.25rem',
          }}>
            Sunday, 28 June 2026 — 10:00 AM IST
          </div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 2.5rem', lineHeight: 1.6 }}>
            A confirmation will be shared via email. Login to graceandforce.com on the day to participate.
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

  if (status === 'already') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
        <div style={{
          textAlign: 'center', maxWidth: 440, width: '100%',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 24, padding: '3.5rem 2.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #F97316, #FBBF24)' }} />
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(249,115,22,0.1)', border: '2px solid rgba(249,115,22,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Zap size={30} color="#F97316" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
            Already Registered
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 2.5rem' }}>
            You have already registered for the UN Quiz Contest. See you on <strong style={{ color: '#F97316' }}>28 June 2026</strong> at 10:00 AM IST.
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

      {/* ── HERO BANNER ── */}
      <div style={{
        borderRadius: 24, marginBottom: '2rem',
        background: 'linear-gradient(135deg, #0c0e1a 0%, #0e1525 50%, #0c0e1a 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #E8392A, #F97316, #FBBF24)' }} />

        {/* Radial glows */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2.5rem 2rem' }}>

          {/* Brand label */}
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F97316', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            GraceandForce.com Presents
          </div>

          {/* Main title */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: 'clamp(2.5rem, 7vw, 3.75rem)',
              fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
              color: '#fff',
            }}>
              UN{' '}
            </span>
            <span style={{
              fontSize: 'clamp(2.5rem, 7vw, 3.75rem)',
              fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              QUIZ
            </span>
            <span style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1,
              color: 'rgba(255,255,255,0.8)', display: 'block', marginTop: '0.15rem',
            }}>
              CONTEST
            </span>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0.75rem 0 2rem' }}>
            Know the World &middot; Understand the UN &middot; Be the Change
          </p>

          {/* Date / Time / Mode cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { Icon: Calendar, label: 'Date', value: 'Sunday, 28 June 2026', color: '#F97316' },
              { Icon: Clock, label: 'Time', value: '10:00 AM IST', color: '#FBBF24' },
              { Icon: Monitor, label: 'Mode', value: 'Online', color: '#10b981' },
            ].map(({ Icon, label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '1rem 1.1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${color}14`,
                  border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={color} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color, lineHeight: 1.3, marginTop: '0.1rem' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prizes section */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Trophy size={16} color="#F59E0B" strokeWidth={2.5} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Attractive Prizes</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PRIZES.map(p => (
                <div key={p.rank} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${p.color}12`,
                    border: `1px solid ${p.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 900, color: p.color, letterSpacing: '0.05em',
                  }}>
                    {p.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginTop: '0.1rem' }}>{p.reward}</div>
                  </div>
                  <div style={{ width: 60, height: 4, borderRadius: 99, background: p.bar, flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '1.25rem', paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.78rem', fontWeight: 700,
              color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Globe size={13} color="#10b981" strokeWidth={2.5} />
              E-Certificates for all participants
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
            {['Enhance Knowledge', 'Understand Global Issues', 'Compete with Young Minds', 'Win Exciting Prizes'].map(tag => (
              <span key={tag} style={{
                fontSize: '0.72rem', fontWeight: 600, color: '#64748b',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 99, padding: '0.3rem 0.75rem',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── REGISTRATION FORM ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: '2.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #F97316, #FBBF24)' }} />

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
            Register for the Contest
          </h2>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
            Fill in your details below. Registration is completely free and open to all students.
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
              <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" style={fieldStyle} {...focusHandlers} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" style={fieldStyle} {...focusHandlers} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Class / Grade *</label>
              <select name="classGrade" value={form.classGrade} onChange={handleChange} style={{ ...fieldStyle, cursor: 'pointer' }} {...focusHandlers} required>
                <option value="" style={{ background: '#0c0e1a' }}>Select your class</option>
                {GRADES.map(g => (
                  <option key={g} value={g} style={{ background: '#0c0e1a' }}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Your city" style={fieldStyle} {...focusHandlers} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>School Name *</label>
            <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="Full name of your school" style={fieldStyle} {...focusHandlers} required />
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, padding: '0.85rem 1.1rem',
              color: '#fca5a5', fontSize: '0.875rem', fontWeight: 600,
            }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting
                ? 'rgba(249,115,22,0.4)'
                : 'linear-gradient(135deg, #E8392A 0%, #F97316 50%, #FBBF24 100%)',
              backgroundSize: '200% 200%',
              color: '#fff', border: 'none',
              padding: '1.05rem 2rem', borderRadius: 14,
              fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 24px rgba(249,115,22,0.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {submitting ? 'Registering...' : (
              <>
                Register for UN Quiz Contest
                <ChevronRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.75rem', margin: 0, letterSpacing: '0.03em' }}>
            Learn. Lead. Impact. — Free registration, open to all students.
          </p>
        </form>
      </div>
    </div>
  );
}
