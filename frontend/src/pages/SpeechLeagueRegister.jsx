import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Trophy, Star, Calendar, CheckCircle2, ChevronRight, User, Phone, Mail, School, Users } from 'lucide-react';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function SpeechLeagueRegister({ user }) {
  const navigate = useNavigate();
  const initialGrade = (user?.grade || user?.classLevel || '').toString();

  const [form, setForm] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || '',
    countryCode: '+91',
    schoolName: user?.schoolName || user?.school || '',
    grade: initialGrade,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.email || !form.mobile || !form.schoolName || !form.grade) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/speech-league/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          studentName: form.studentName,
          email: form.email,
          mobile: `${form.countryCode} ${form.mobile.trim()}`,
          schoolName: form.schoolName,
          grade: form.grade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#081734', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center', maxWidth: 480, margin: '2rem' }}>
          <CheckCircle2 size={64} color="#eab308" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Welcome to the Monthly Speech League. Your registration has been received successfully. Prepare to speak, persuade, and shine!
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(135deg, #eab308, #d97706)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(234,179,8,0.3)' }}>
            Go to Dashboard <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050c1f', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div style={{ padding: '6rem 2rem 4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center top, rgba(30, 64, 175, 0.25) 0%, #050c1f 70%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#e11d48', padding: '0.4rem 0.8rem', borderRadius: 4, fontWeight: 900, letterSpacing: '0.05em', fontSize: '1rem' }}>NANO SKOOL</div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em', fontSize: '1.1rem' }}>GRACE<span style={{ color: '#eab308' }}>&</span>FORCE</div>
          </div>
          
          <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #60a5fa, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem 0' }}>
            Monthly Speech League
          </h1>
          
          <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '0.1em', color: '#fde047', marginBottom: '3rem', fontFamily: 'serif', fontStyle: 'italic' }}>
            Speak. Persuade. Shine.
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <div style={{ flex: '1 1 250px', background: 'linear-gradient(180deg, rgba(29,78,216,0.15), rgba(0,0,0,0))', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1e3a8a', border: '2px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#fde047' }}>
                <Star size={36} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Top 10</h3>
              <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>Speakers of the Month</p>
            </div>

            <div style={{ flex: '1 1 250px', background: 'linear-gradient(180deg, rgba(29,78,216,0.15), rgba(0,0,0,0))', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1e3a8a', border: '2px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#fde047' }}>
                <Trophy size={36} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Most</h3>
              <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>Persuasive Speaker</p>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(90deg, #b91c1c, #ea580c, #b91c1c)', padding: '1rem 2rem', display: 'inline-block', borderRadius: 8, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', boxShadow: '0 10px 25px rgba(234,88,12,0.4)', marginBottom: '3rem', textTransform: 'uppercase' }}>
            Free Participation & Evaluation
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(30, 58, 138, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', padding: '1.5rem', borderRadius: 16, color: '#bfdbfe', fontSize: '1.2rem', fontWeight: 600, maxWidth: 400, margin: '0 auto' }}>
            <Calendar size={28} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>30.08.2026 • SUNDAY</div>
              <div style={{ color: '#93c5fd', marginTop: '0.25rem' }}>Starts 10:00 AM IST (All Day)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div style={{ maxWidth: 600, margin: '-2rem auto 0 auto', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Register Now</h2>
            <p style={{ color: '#eab308', fontWeight: 600 }}>Register free at GraceandForce.com</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.studentName}
                  onChange={e => setForm({...form, studentName: e.target.value})}
                  placeholder="Student Name"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  required 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="student@school.com"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Mobile Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={form.countryCode}
                  onChange={e => setForm({...form, countryCode: e.target.value})}
                  style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code} style={{ background: '#0f172a', color: '#fff' }}>
                      {c.code} ({c.name})
                    </option>
                  ))}
                </select>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="tel" 
                    required 
                    value={form.mobile}
                    onChange={e => setForm({...form, mobile: e.target.value})}
                    placeholder="Mobile Number"
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>School Name</label>
              <div style={{ position: 'relative' }}>
                <School size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.schoolName}
                  onChange={e => setForm({...form, schoolName: e.target.value})}
                  placeholder="School / Institution Name"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Grade / Class</label>
              <select
                required
                value={form.grade}
                onChange={e => setForm({...form, grade: e.target.value})}
                style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="" disabled style={{ background: '#0f172a', color: '#94a3b8' }}>Select your grade...</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i+5} value={i+5} style={{ background: '#0f172a' }}>Grade {i+5}</option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: loading ? '#475569' : 'linear-gradient(135deg, #eab308, #d97706)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', boxShadow: loading ? 'none' : '0 4px 15px rgba(234,179,8,0.3)' }}
            >
              {loading ? 'Submitting...' : 'Register Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
