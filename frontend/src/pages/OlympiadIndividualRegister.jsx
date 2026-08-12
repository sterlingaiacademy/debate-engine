import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Monitor, Award, ChevronRight, CheckCircle2, Globe, Users, Play, Shield } from 'lucide-react';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function OlympiadIndividualRegister({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    countryCode: '+91',
    schoolName: user?.school || '',
    category: 'Student',
    grade: '',
    city: '',
    state: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.email || !form.mobile || !form.grade || !form.schoolName || !form.city) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          school_code: 'INDIVIDUAL', // Special code for individual registrations
          name: form.studentName,
          classLevel: form.grade,
          age: null,
          city: form.city,
          contactEmail: form.email,
          parentPhone: `${form.countryCode} ${form.mobile.trim()}`,
          parentName: form.schoolName // Using parentName to store org/school temporarily or we can add orgName field
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to register.');

      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Network error. Please try again.');
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
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.5rem',
  };

  const focusHandlers = {
    onFocus: e => {
      e.target.style.borderColor = '#ef4444';
      e.target.style.background = 'rgba(239,68,68,0.05)';
    },
    onBlur: e => {
      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
      e.target.style.background = 'rgba(255,255,255,0.04)';
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '3rem', borderRadius: 24, textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={40} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem' }}>Registration Successful!</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            You have successfully registered for the <strong>ThinkQuest Olympiad</strong> as an individual participant.
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1c', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2 }}>G FORCE</div>
            <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, letterSpacing: '0.1em' }}>THINKQUEST OLYMPIAD</div>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
          Back to Dashboard
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '4rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: INFO */}
        <div style={{ position: 'sticky', top: '7rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.8rem', borderRadius: 99, color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
            <Globe size={14} /> INDIVIDUAL REGISTRATION
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 1.5rem', letterSpacing: '-0.03em' }}>
            ThinkQuest <span style={{ color: '#ef4444' }}>Olympiad</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
            Join the ultimate intellectual showdown. Compete with top minds, enhance your critical thinking, and claim the championship.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={24} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>NATIONAL RECOGNITION</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Compete at a national level and earn a verified certificate of excellence.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Play size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>PRACTICE & PREPARE</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Get access to Olympiad Arena to practice and hone your skills before the real test.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={24} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>COMPREHENSIVE REPORT</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Receive a detailed AI-driven report card analyzing your performance across various metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REGISTRATION FORM COLUMN */}
        <div>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Register Now
            </h2>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="studentName" value={form.studentName} onChange={handleChange} placeholder="e.g. Rahul Sharma" style={fieldStyle} {...focusHandlers} required />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. rahul@example.com" style={fieldStyle} {...focusHandlers} required />
              </div>

              <div>
                <label style={labelStyle}>WhatsApp Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select name="countryCode" value={form.countryCode} onChange={handleChange} style={{ ...fieldStyle, width: '120px', cursor: 'pointer' }} {...focusHandlers}>
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} style={{ background: '#1e293b', color: '#fff' }}>{c.code} {c.name}</option>
                    ))}
                  </select>
                  <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter your number" style={{ ...fieldStyle, flex: 1 }} {...focusHandlers} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Category</label>
                  <select name="category" value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value, grade: '' }))} style={fieldStyle} {...focusHandlers} required>
                    <option value="" disabled>Select Category</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>School / Org Name</label>
                  <input type="text" name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="e.g. DPS" style={fieldStyle} {...focusHandlers} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>
                    {form.category === 'Professional' ? 'Designation' : 'Grade / Class'}
                  </label>
                  {form.category === 'Student' ? (
                    <select name="grade" value={form.grade} onChange={handleChange} style={fieldStyle} {...focusHandlers} required>
                      <option value="" disabled>Select Grade</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="College">College</option>
                    </select>
                  ) : form.category === 'Professional' ? (
                    <select name="grade" value={form.grade} onChange={handleChange} style={fieldStyle} {...focusHandlers} required>
                      <option value="" disabled>Select Designation</option>
                      <option value="School Educator">School Educator</option>
                      <option value="College Educator">College Educator</option>
                      <option value="Educational Leader">Educational Leader</option>
                      <option value="Teacher Trainer">Teacher Trainer</option>
                      <option value="Corporate Professional">Corporate Professional</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Graduate">Graduate</option>
                      <option value="UPSC Aspirant">UPSC Aspirant</option>
                      <option value="Others">Others</option>
                    </select>
                  ) : form.category === 'Other' ? (
                    <input type="text" name="grade" value={form.grade} onChange={handleChange} placeholder="Specify here..." style={fieldStyle} {...focusHandlers} required />
                  ) : (
                    <select name="grade" value={form.grade} disabled style={{ ...fieldStyle, opacity: 0.5 }} {...focusHandlers} required>
                      <option value="" disabled>Select Category First</option>
                    </select>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" style={fieldStyle} {...focusHandlers} required />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                    color: '#fff',
                    border: 'none',
                    padding: '1.1rem',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={e => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {submitting ? 'Processing...' : 'Complete Registration'}
                  {!submitting && <ChevronRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
