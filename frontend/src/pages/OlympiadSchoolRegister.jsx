import React, { useState } from 'react';
import { API_BASE } from '../api';
import { useNavigate } from 'react-router-dom';
import { COUNTRY_CODES } from '../countryCodes';

export default function OlympiadSchoolRegister() {
  const [formData, setFormData] = useState({
    name: '',
    principal_name: '',
    coordinator_name: '',
    contact_email: '',
    contact_phone_code: '+91',
    contact_phone_number: '',
    expected_students: '',
    class_from: '',
    class_to: ''
  });
  const [selectedEvents, setSelectedEvents] = useState({ thinkquest: false, indusmun: false });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleEvent = (key) => setSelectedEvents(prev => ({ ...prev, [key]: !prev[key] }));

  const getEventsValue = () => {
    if (selectedEvents.thinkquest && selectedEvents.indusmun) return 'both';
    if (selectedEvents.thinkquest) return 'thinkquest';
    if (selectedEvents.indusmun) return 'indusmun';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventsValue = getEventsValue();
    if (!eventsValue) {
      setError('Please select at least one event to register for.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        contact_phone: `${formData.contact_phone_code} ${formData.contact_phone_number}`,
        classes_participating: (formData.class_from && formData.class_to) ? `${formData.class_from} to ${formData.class_to}` : '',
        events: eventsValue,
      };
      const res = await fetch(`${API_BASE}/api/olympiad/school/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Registration<br/>Submitted</h2>
            <div style={{ width: '60px', height: '5px', background: THEME.red, marginBottom: '2rem', borderRadius: '3px' }}></div>
            <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: THEME.textMuted, lineHeight: '1.6' }}>{successData.message}</p>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderLeft: `5px solid ${THEME.red}`, marginBottom: '3rem', borderRadius: '0 12px 12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ marginBottom: '0.75rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>Pending Verification</p>
              <p style={{ color: THEME.textMuted, fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>Our team will review your application. Please monitor your contact email for further instructions and your official School Code.</p>
            </div>

            <button onClick={() => navigate('/')} className="oly-btn" style={{ padding: '1.2rem 3rem', background: THEME.red, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Return to Home
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>School<br/>Registration</h2>
          <div style={{ width: '70px', height: '5px', background: THEME.red, marginBottom: '2rem', borderRadius: '3px' }}></div>
          
          {error && <div style={{ background: 'rgba(218, 41, 28, 0.1)', borderLeft: `4px solid ${THEME.red}`, color: '#fca5a5', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem', borderRadius: '0 8px 8px 0' }}>
            {error}
          </div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>School Name *</label>
              <input required className="oly-input" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Enter official school name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Principal Name</label>
                <input className="oly-input" name="principal_name" value={formData.principal_name} onChange={handleChange} style={inputStyle} placeholder="Dr. Jane Doe" />
              </div>
              <div>
                <label style={labelStyle}>Coordinator Name *</label>
                <input required className="oly-input" name="coordinator_name" value={formData.coordinator_name} onChange={handleChange} style={inputStyle} placeholder="John Smith" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Contact Email *</label>
                <input required className="oly-input" type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} style={inputStyle} placeholder="admin@school.edu" />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select className="oly-input oly-select" name="contact_phone_code" value={formData.contact_phone_code} onChange={handleChange} style={{ ...inputStyle, width: '130px' }}>
                    {COUNTRY_CODES.map((c, idx) => <option key={`${c.code}-${idx}`} value={c.code}>{c.code} {c.name}</option>)}
                  </select>
                  <input required className="oly-input" name="contact_phone_number" value={formData.contact_phone_number} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} placeholder="Phone number" />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Expected Students</label>
                <input className="oly-input" type="number" name="expected_students" value={formData.expected_students} onChange={handleChange} style={inputStyle} placeholder="e.g. 500" />
              </div>
              <div>
                <label style={labelStyle}>Classes Participating</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select className="oly-input oly-select" name="class_from" value={formData.class_from} onChange={handleChange} style={{ ...inputStyle }}>
                    <option value="">From</option>
                    {grades.map(g => <option key={`from-${g}`} value={`Grade ${g}`}>Grade {g}</option>)}
                  </select>
                  <span style={{ color: THEME.textMuted, fontWeight: 800 }}>-</span>
                  <select className="oly-input oly-select" name="class_to" value={formData.class_to} onChange={handleChange} style={{ ...inputStyle }}>
                    <option value="">To</option>
                    {grades.map(g => <option key={`to-${g}`} value={`Grade ${g}`}>Grade {g}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Event Selection */}
            <div style={{ marginTop: '0.5rem' }}>
              <label style={labelStyle}>Register For *</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'thinkquest', label: 'ThinkQuest Olympiad' },
                  { key: 'indusmun', label: 'Indus MUN' },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    onClick={() => toggleEvent(key)}
                    style={{
                      flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.9rem 1.25rem', borderRadius: 10, cursor: 'pointer', userSelect: 'none',
                      border: `1.5px solid ${selectedEvents[key] ? THEME.red : THEME.inputBorder}`,
                      background: selectedEvents[key] ? 'rgba(218,41,28,0.08)' : THEME.inputBg,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0, border: `2px solid ${selectedEvents[key] ? THEME.red : '#4b5563'}`,
                      background: selectedEvents[key] ? THEME.red : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                      {selectedEvents[key] && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ color: selectedEvents[key] ? '#fff' : THEME.textMuted, fontWeight: 700, fontSize: '0.9rem' }}>{label}</span>
                  </div>
                ))}
              </div>
              {!getEventsValue() && error && error.includes('event') && (
                <div style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.4rem' }}>Please select at least one event.</div>
              )}
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
