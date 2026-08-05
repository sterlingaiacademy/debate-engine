import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, ChevronRight, User, Phone, Mail, Calendar, Flag } from 'lucide-react';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function FreedomQuizRegister({ user }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || '',
    countryCode: '+91',
    city: '',
    age: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.city || !form.age) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/freedom-quiz/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: `${form.countryCode} ${form.mobile.trim()}`,
          city: form.city,
          age: form.age,
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
          <CheckCircle2 size={64} color="#f97316" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f97316', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Jai Hind! You have successfully registered for the Great India Freedom Challenge. Get ready for the quiz on August 15th!
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)' }}>
            Go to Dashboard <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center top, rgba(234, 88, 12, 0.15) 0%, #020617 70%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#dc2626', padding: '0.3rem 0.6rem', borderRadius: 4, fontWeight: 900, letterSpacing: '0.05em', fontSize: '0.9rem' }}>NANO SKOOL</div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontWeight: 800, color: '#ea580c', letterSpacing: '0.05em', fontSize: '1rem' }}>GRACE<span style={{ color: '#fff' }}>&</span>FORCE.COM</div>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #f97316, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem 0' }}>
            GREAT INDIA
          </h1>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #60a5fa, #fff, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem 0' }}>
            FREEDOM CHALLENGE
          </h1>
          <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #f97316, #ea580c)', padding: '0.5rem 1.5rem', borderRadius: 30, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#fff', marginBottom: '2rem' }}>
            ★ FREEDOM QUIZ ★
          </div>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 2rem auto' }}>
            Celebrate India's Heritage and Achievements! Exciting Cash Vouchers up to ₹10,000 for National Winners.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(234, 88, 12, 0.1)', padding: '1rem', borderRadius: '50%', color: '#fb923c' }}>
                <Flag size={24} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Indian Citizens</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(234, 88, 12, 0.1)', padding: '1rem', borderRadius: '50%', color: '#fb923c' }}>
                <Calendar size={24} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>15 August 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div style={{ maxWidth: 600, margin: '-2rem auto 0 auto', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Free Registration</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>No age limit. Participate from anywhere!</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  placeholder="E.g. Jai Kumar"
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
                  placeholder="citizen@india.com"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>City / State</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required 
                    value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})}
                    placeholder="E.g. Mumbai, MH"
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Age</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="number" 
                    required 
                    min="5"
                    max="100"
                    value={form.age}
                    onChange={e => setForm({...form, age: e.target.value})}
                    placeholder="E.g. 24"
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
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
              style={{ width: '100%', padding: '1rem', background: 'linear-gradient(to right, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}
            >
              {loading ? 'Processing...' : 'Register for Freedom Quiz'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
