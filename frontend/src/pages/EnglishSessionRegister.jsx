import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ChevronRight, School, User, Phone, Mail, Users } from 'lucide-react';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function EnglishSessionRegister({ user }) {
  const navigate = useNavigate();
  // Only pre-fill grade if it's a valid number between 3 and 8
  const initialGrade = (user?.grade || user?.classLevel || '').toString();
  const validGrade = ['3', '4', '5', '6', '7', '8'].includes(initialGrade) ? initialGrade : '';

  const [form, setForm] = useState({
    studentName: user?.name || '',
    parentName: '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || '',
    countryCode: '+91',
    schoolName: user?.schoolName || user?.school || '',
    grade: validGrade,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.parentName || !form.email || !form.mobile || !form.schoolName || !form.grade) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }
    
    // Grade constraint check (3-8)
    const gradeNum = parseInt(form.grade.replace(/[^0-9]/g, ''), 10);
    if (isNaN(gradeNum) || gradeNum < 3 || gradeNum > 8) {
      setErrorMsg("This session is exclusively for students from Grade 3 to Grade 8.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/english-session/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          studentName: form.studentName,
          parentName: form.parentName,
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
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center', maxWidth: 480, margin: '2rem' }}>
          <CheckCircle2 size={64} color="#3b82f6" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            You have successfully registered for the "Speak English Without Fear" live session. See you on August 9th!
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
            Go to Dashboard <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center top, rgba(37, 99, 235, 0.15) 0%, #020617 70%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#dc2626', padding: '0.3rem 0.6rem', borderRadius: 4, fontWeight: 900, letterSpacing: '0.05em', fontSize: '0.9rem' }}>NANO SKOOL</div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em', fontSize: '1rem' }}>GRACE<span style={{ color: '#fff' }}>&</span>FORCE.COM</div>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #60a5fa, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem 0' }}>
            SPEAK ENGLISH
          </h1>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #38bdf8, #bae6fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem 0' }}>
            WITHOUT FEAR!
          </h1>
          <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #f97316, #ea580c)', padding: '0.5rem 1.5rem', borderRadius: 30, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#fff', marginBottom: '2rem' }}>
            Parent-Child Confidence-Building Session
          </div>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 2rem auto' }}>
            Experience AI-Powered English Speaking Practice. Overcome hesitation, speak clearly, and build confidence!
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#60a5fa' }}>
                <Users size={24} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Grades 3-8 & Parents</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#60a5fa' }}>
                <CheckCircle2 size={24} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>09 Aug 2026 • 4:00 PM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#60a5fa' }}>
                <User size={24} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ms Sohini Roy Biswas</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '-0.25rem' }}>English Faculty, 21K School</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div style={{ maxWidth: 600, margin: '-2rem auto 0 auto', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Free Live Practical Session</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Register below to secure your spot via Zoom</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Student Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required 
                    value={form.studentName}
                    onChange={e => setForm({...form, studentName: e.target.value})}
                    placeholder="E.g. Rahul Kumar"
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Parent Name</label>
                <div style={{ position: 'relative' }}>
                  <Users size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required 
                    value={form.parentName}
                    onChange={e => setForm({...form, parentName: e.target.value})}
                    placeholder="E.g. Amit Kumar"
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
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
                  placeholder="parent@example.com"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>WhatsApp Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  value={form.countryCode}
                  onChange={e => setForm({...form, countryCode: e.target.value})}
                  style={{ width: '100px', padding: '0.875rem 0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code} style={{ color: '#000' }}>{c.code} {c.country}</option>
                  ))}
                </select>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="tel" 
                    required 
                    value={form.mobile}
                    onChange={e => setForm({...form, mobile: e.target.value})}
                    placeholder="9876543210"
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
                  placeholder="Your School"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Grade</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <select 
                  required
                  value={form.grade}
                  onChange={e => setForm({...form, grade: e.target.value})}
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: form.grade ? '#fff' : '#64748b', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="" disabled>Select Grade (3 to 8 only)</option>
                  <option value="3" style={{ color: '#000' }}>Grade 3</option>
                  <option value="4" style={{ color: '#000' }}>Grade 4</option>
                  <option value="5" style={{ color: '#000' }}>Grade 5</option>
                  <option value="6" style={{ color: '#000' }}>Grade 6</option>
                  <option value="7" style={{ color: '#000' }}>Grade 7</option>
                  <option value="8" style={{ color: '#000' }}>Grade 8</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '1rem', background: 'linear-gradient(to right, #ea580c, #f97316)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)' }}
            >
              {loading ? 'Processing...' : 'Register Free at GraceandForce.com'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
