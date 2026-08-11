import React, { useState } from 'react';
import { API_BASE } from '../api';
import { useNavigate } from 'react-router-dom';

export default function OlympiadStudentRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school_code: '',
    grade: '',
    age: '',
    parent_name: '',
    parent_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccessData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const THEME = {
    bg: '#1A1A1A',
    bgDark: '#0d0d0d',
    red: '#DA291C',
    text: '#FFFFFF',
    textMuted: '#9CA3AF',
    inputBg: 'rgba(255, 255, 255, 0.03)',
    inputBorder: 'rgba(255, 255, 255, 0.1)'
  };

  const inputStyle = {
    width: '100%', padding: '0.85rem 1.25rem', borderRadius: '10px',
    border: `1px solid ${THEME.inputBorder}`, background: THEME.inputBg,
    color: THEME.text, fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box', fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.5rem', color: THEME.textMuted,
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
  };

  const grades = Array.from({length: 8}, (_, i) => i + 5);

  const LeftPane = () => (
    <div className="oly-left" style={{ flex: 1, backgroundColor: THEME.bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem 3rem', height: '100vh', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '400px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', aspectRatio: '1 / 1', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          {/* Row 1 */}
          <div style={{ background: '#18181b', padding: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '0.02em', color: '#fff', textAlign: 'center' }}>
              THINK<br/>BETTER.
            </h1>
          </div>
          <div style={{ background: THEME.red, padding: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '0.02em', color: '#fff', textAlign: 'center' }}>
              LEARN<br/>BETTER.
            </h1>
          </div>
          {/* Row 2 */}
          <div style={{ background: THEME.red, padding: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '0.02em', color: '#fff', textAlign: 'center' }}>
              LEAD<br/>BETTER.
            </h1>
          </div>
        </div>
      </div>

      <div className="oly-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#888', lineHeight: 1.5, letterSpacing: '0.02em', gap: '1rem' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          Building India's<br/>Next Generation of<br/>Thinkers, Innovators<br/>and Problem Solvers
        </div>
        
        <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: THEME.red, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 25px rgba(218,41,28,0.3)' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M25 20 H75 V50 H55 V65 H35 V45 H55 V35 H25 V20 Z" fill="#fff" />
              <circle cx="45" cy="85" r="9" fill="#fff" />
            </svg>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '0.75rem', marginTop: '0.4rem', textAlign: 'center', lineHeight: 1, letterSpacing: '0.05em' }}>
              THINK<br/>QUEST
            </div>
        </div>

        <div style={{ flex: 1, textAlign: 'right' }}>
          A premium national<br/>Olympiad designed to<br/>develop critical<br/>thinking, creativity,<br/>reasoning, innovation<br/>and real-world<br/>problem-solving<br/>abilities in children.
        </div>
      </div>
    </div>
  );

  const FormStyles = () => (
    <style>{`
      .oly-input {
         appearance: none;
      }
      .oly-select {
         background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
         background-repeat: no-repeat;
         background-position: right 0.75rem center;
         background-size: 1.2rem;
         padding-right: 2.5rem !important;
      }
      .oly-input:hover { 
         border-color: rgba(255,255,255,0.25); 
         background: rgba(255,255,255,0.05);
      }
      .oly-input:focus { 
         border-color: ${THEME.red} !important; 
         background: rgba(255,255,255,0.08) !important; 
         box-shadow: 0 0 0 4px rgba(218, 41, 28, 0.15);
      }
      .oly-btn {
         border-radius: 10px;
         box-shadow: 0 4px 15px rgba(218, 41, 28, 0.2);
         position: relative;
         overflow: hidden;
      }
      .oly-btn::after {
         content: '';
         position: absolute;
         top: 0; left: -100%; width: 100%; height: 100%;
         background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
         transition: 0.5s;
      }
      .oly-btn:hover::after {
         left: 100%;
      }
      .oly-btn:hover { 
         background: #e62c1f !important; 
         transform: translateY(-2px);
         box-shadow: 0 8px 25px rgba(218, 41, 28, 0.4);
      }
      .oly-btn:active {
         transform: translateY(1px);
      }
      @media (max-width: 1000px) {
         .oly-split { flex-direction: column !important; height: auto !important; min-height: 100vh !important; }
         .oly-left { width: 100% !important; min-height: auto !important; height: auto !important; padding: 2rem !important; }
         .oly-right { width: 100% !important; height: auto !important; padding: 2rem !important; }
         .oly-footer { flex-direction: column !important; align-items: center !important; text-align: center !important; }
         .oly-footer > div { text-align: center !important; }
      }
    `}</style>
  );

  if (successData) {
    return (
      <div className="oly-split" style={{ height: '100vh', display: 'flex', background: THEME.bgDark, color: THEME.text, fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}>
        <FormStyles />
        <LeftPane />
        <div className="oly-right" style={{ flex: 1, backgroundColor: THEME.bgDark, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 4rem', height: '100vh', overflowY: 'auto' }}>
          <div style={{ maxWidth: '650px', width: '100%', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'inline-block', background: THEME.red, padding: '1rem', marginBottom: '2rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(218,41,28,0.3)' }}>
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="square"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Registration<br/>Successful</h2>
            <div style={{ width: '60px', height: '5px', background: THEME.red, marginBottom: '2rem', borderRadius: '3px' }}></div>
            <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: THEME.textMuted, lineHeight: '1.6' }}>{successData.message}</p>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderLeft: `5px solid ${THEME.red}`, marginBottom: '3rem', borderRadius: '0 12px 12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ marginBottom: '0.75rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>Access Credentials</p>
              <div style={{ color: THEME.textMuted, fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                <div>Username: <strong style={{ color: '#fff' }}>{successData.user.username}</strong></div>
                <div>Password: <strong style={{ color: '#fff' }}>{successData.password}</strong></div>
              </div>
            </div>

            <button onClick={() => navigate('/login')} className="oly-btn" style={{ padding: '1.2rem 3rem', background: THEME.red, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Proceed to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="oly-split" style={{ height: '100vh', display: 'flex', background: THEME.bgDark, color: THEME.text, fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}>
      <FormStyles />
      
      <LeftPane />
      
      <div className="oly-right" style={{ flex: 1, backgroundColor: THEME.bgDark, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 4rem', height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: '650px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>Student<br/>Registration</h2>
          <div style={{ width: '70px', height: '5px', background: THEME.red, marginBottom: '2rem', borderRadius: '3px' }}></div>
          
          {error && <div style={{ background: 'rgba(218, 41, 28, 0.1)', borderLeft: `4px solid ${THEME.red}`, color: '#fca5a5', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem', borderRadius: '0 8px 8px 0' }}>
            {error}
          </div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input required className="oly-input" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Enter your full name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input required type="email" className="oly-input" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="student@example.com" />
              </div>
              <div>
                <label style={labelStyle}>School Code *</label>
                <input required className="oly-input" name="school_code" value={formData.school_code} onChange={handleChange} style={inputStyle} placeholder="Code provided by school" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Grade/Class *</label>
                <select required className="oly-input oly-select" name="grade" value={formData.grade} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Grade</option>
                  {grades.map(g => <option key={`grade-${g}`} value={`Grade ${g}`}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Age *</label>
                <input required className="oly-input" type="number" name="age" value={formData.age} onChange={handleChange} style={inputStyle} placeholder="e.g. 15" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Parent Name *</label>
                <input required className="oly-input" name="parent_name" value={formData.parent_name} onChange={handleChange} style={inputStyle} placeholder="Parent's full name" />
              </div>
              <div>
                <label style={labelStyle}>Parent Phone *</label>
                <input required className="oly-input" name="parent_phone" value={formData.parent_phone} onChange={handleChange} style={inputStyle} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            
            <button className="oly-btn" disabled={loading} type="submit" style={{ marginTop: '1rem', padding: '1.25rem', background: THEME.red, color: 'white', fontWeight: 800, border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '1.05rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {loading ? 'Processing...' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
