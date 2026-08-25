import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, School, User, Phone, Mail, Users, CheckCircle2, ChevronRight, MonitorPlay } from 'lucide-react';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function Teacher2030Register({ user }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || '',
    countryCode: '+91',
    schoolName: user?.schoolName || user?.school || '',
    designation: user?.designation || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.schoolName || !form.designation) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher2030/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: `${form.countryCode} ${form.mobile.trim()}`,
          schoolName: form.schoolName,
          designation: form.designation,
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
          <CheckCircle2 size={64} color="#eab308" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Thank you for registering for The Teacher of 2030 Panel Discussion. The Zoom link will be sent to your email.
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(135deg, #eab308, #d97706)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(234,179,8,0.3)' }}>
            Go to Dashboard <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050B14', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div style={{ padding: '6rem 2rem 4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center top, rgba(147, 51, 234, 0.15) 0%, #050B14 70%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#e11d48', padding: '0.4rem 0.8rem', borderRadius: 4, fontWeight: 900, letterSpacing: '0.05em', fontSize: '1rem' }}>NANO SKOOL</div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em', fontSize: '1.1rem' }}>GRACE<span style={{ color: '#eab308' }}>&</span>FORCE</div>
          </div>
          
          <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.2em', color: '#d8b4fe', marginBottom: '1rem', textTransform: 'uppercase' }}>
            PANEL DISCUSSION
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to bottom, #ffffff, #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem 0' }}>
            THE TEACHER OF 2030
          </h1>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
            Instructor, Facilitator or Learning Designer?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#a855f7', marginBottom: '3rem' }}>
            Three Educators. Three Perspectives. One Powerful Conversation.
          </p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '0.75rem 2rem', borderRadius: 50, color: '#d8b4fe', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: '4rem' }}>
            Sunday, 30.08.2026 • 11.00 AM IST
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.1), rgba(0,0,0,0))', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#3b0764', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#d8b4fe' }}>
                <MonitorPlay size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>ONLINE EVENT</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Live on Zoom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div style={{ maxWidth: 600, margin: '-2rem auto 0 auto', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: '#eab308', marginBottom: '1rem' }}>
              <Users size={24} />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Free Participation Certificate</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Register Now</h2>
            <p style={{ color: '#64748b' }}>Secure your spot for this exclusive panel discussion</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  placeholder="Your Full Name"
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
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Phone Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  value={form.countryCode} 
                  onChange={e => setForm({...form, countryCode: e.target.value})}
                  style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', width: '90px', flexShrink: 0 }}
                >
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
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
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>School/Institution Name</label>
              <div style={{ position: 'relative' }}>
                <School size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.schoolName}
                  onChange={e => setForm({...form, schoolName: e.target.value})}
                  placeholder="Your School or Institution"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Designation</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.designation}
                  onChange={e => setForm({...form, designation: e.target.value})}
                  placeholder="E.g., Principal, Teacher, Coordinator"
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
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
              style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', borderRadius: 12, border: 'none', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.02em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
            >
              {loading ? 'Processing...' : 'Complete Free Registration'}
              {!loading && <ChevronRight size={20} />}
            </button>
            
          </form>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
          Powered by GraceandForce.com
        </div>
      </div>
    </div>
  );
}
