import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, UserPlus, ArrowRight, Sparkles, Zap, Trophy, Shield } from 'lucide-react';
import logoImg from '../assets/logo.png';

const GOOGLE_SANS = "'Google Sans', 'Outfit', 'Product Sans', system-ui, sans-serif";

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', studentId: '', password: '', selectedClass: 'KG',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const getLevelForClass = (cls) => {
    if (['KG', 'Class 1', 'Class 2'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
    return 'Level 1';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { name, studentId, password, selectedClass } = formData;
      const computedClassLevel = getLevelForClass(selectedClass);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, studentId, classLevel: computedClassLevel, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100%',
      fontFamily: GOOGLE_SANS,
      background: '#06080F',
      position: 'relative', overflow: 'auto'
    }}>

      {/* Subtle background decoration */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(232,57,42,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* LEFT PANE — Brand Hero */}
      <div className="login-left-pane" style={{
        flex: 1, position: 'relative', zIndex: 1,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.0) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        padding: '2.5rem 3rem',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <img src={logoImg} alt="G Force AI" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '520px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
            padding: '0.45rem 1rem', borderRadius: '99px', fontSize: '0.825rem',
            fontWeight: 600, marginBottom: '1.5rem', color: '#ffedd5', width: 'fit-content'
          }}>
            <Sparkles size={14} color="#F97316" /> Start Your Debate Journey
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', fontWeight: 800,
            lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em',
            color: '#ffffff'
          }}>
            Unlock Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FF6B5A 0%, #F97316 60%, #FBBF24 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
              True Potential
            </span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 400 }}>
            Join thousands of students enhancing their public speaking skills. Personalized difficulty levels ensure you're always optimally challenged.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { icon: <Zap size={16} color="#F97316" />, label: 'Adaptive Levels', bg: 'rgba(249,115,22,0.15)' },
              { icon: <Trophy size={16} color="#E8392A" />, label: 'Compete Safely', bg: 'rgba(232,57,42,0.15)' },
              { icon: <Shield size={16} color="#10b981" />, label: 'Private & Secure', bg: 'rgba(16,185,129,0.15)' },
            ].map(({ icon, label, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
          © 2026 G Force AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANE — Auth Form */}
      <div className="login-right-pane" style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02) inset'
        }}>
          <div className="mobile-logo" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src={logoImg} alt="G Force AI" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              Create an account
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Your debate journey starts here.
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Student ID Card</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={set('studentId')}
                required
                style={{
                  padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  color: '#ffffff', fontSize: '0.9rem', fontFamily: GOOGLE_SANS,
                  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={set('name')}
                required
                style={{
                  padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  color: '#ffffff', fontSize: '0.9rem', fontFamily: GOOGLE_SANS,
                  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={set('password')}
                  required
                  style={{
                    padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    color: '#ffffff', fontSize: '0.9rem', fontFamily: GOOGLE_SANS,
                    transition: 'border-color 0.2s, background 0.2s', outline: 'none'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
                />
              </div>

              <div style={{ width: '110px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Class</label>
                <select
                  value={formData.selectedClass}
                  onChange={set('selectedClass')}
                  style={{
                    padding: '0.8rem', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    color: '#ffffff', fontSize: '0.9rem', fontFamily: GOOGLE_SANS,
                    transition: 'border-color 0.2s, background 0.2s', outline: 'none',
                    appearance: 'none', cursor: 'pointer'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <option value="KG-1" style={{ color: '#000' }}>KG-1</option>
                  <option value="1-3" style={{ color: '#000' }}>1-3</option>
                  <option value="4-5" style={{ color: '#000' }}>4-5</option>
                  <option value="6-8" style={{ color: '#000' }}>6-8</option>
                  <option value="9-12" style={{ color: '#000' }}>9-12</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: GOOGLE_SANS,
                boxShadow: '0 4px 14px rgba(232,57,42,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => { if(!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(232,57,42,0.5)'; } }}
              onMouseLeave={e => { if(!loading) { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 14px rgba(232,57,42,0.4)'; } }}
            >
              {loading ? 'Registering...' : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 700 }}>
              Sign in
            </Link>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>
              &larr; Back to Home
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-left-pane { display: none !important; }
        }
        @media (min-width: 901px) {
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
