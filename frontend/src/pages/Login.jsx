import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

const GOOGLE_SANS = "'Google Sans', 'Outfit', 'Product Sans', system-ui, sans-serif";

export default function Login({ onLogin }) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.user);
      navigate('/dashboard');
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
        {/* Subtle grid pattern */}
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

        {/* Center content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '520px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
            padding: '0.45rem 1rem', borderRadius: '99px', fontSize: '0.825rem',
            fontWeight: 600, marginBottom: '1.5rem', color: '#ffedd5', width: 'fit-content'
          }}>
            <Sparkles size={14} color="#F97316" /> The Ultimate Debate Training Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', fontWeight: 800,
            lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em',
            color: '#ffffff'
          }}>
            Master the{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FF6B5A 0%, #F97316 60%, #FBBF24 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
              Art of Debate
            </span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 400 }}>
            Engage with advanced AI personas, refine your argumentation skills, and climb the global leaderboards in real-time.
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { icon: <Zap size={16} color="#F97316" />, label: 'Real-time Analytics', bg: 'rgba(249,115,22,0.15)' },
              { icon: <Trophy size={16} color="#E8392A" />, label: 'Global Ranking', bg: 'rgba(232,57,42,0.15)' },
            ].map(({ icon, label, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </div>
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="https://whfmuswqbsgbmaramuhi.supabase.co/storage/v1/object/public/Downloads/grace-and-force.apk" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', borderRadius: '10px'
            }}>
              📱 Download for Android
            </a>
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
          borderRadius: '24px', padding: '3rem 2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02) inset'
        }}>
          {/* Mobile Logo */}
          <div className="mobile-logo" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <img src={logoImg} alt="G Force AI" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Enter your credentials to access your account.
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Student ID Card</label>
              <input
                type="text"
                placeholder="e.g. STU12345"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                required
                style={{
                  padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  color: '#ffffff', fontSize: '0.95rem', fontFamily: GOOGLE_SANS,
                  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                  color: '#ffffff', fontSize: '0.95rem', fontFamily: GOOGLE_SANS,
                  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
              />
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
              {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 901px) { .mobile-logo { display: none !important; } }
        @media (max-width: 900px) { .login-left-pane { display: none !important; } }
      `}</style>
    </div>
  );
}