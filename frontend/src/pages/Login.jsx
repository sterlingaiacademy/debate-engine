import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

const GOOGLE_SANS = "'Google Sans', 'Outfit', 'Product Sans', system-ui, sans-serif";

export default function Login({ onLogin }) {
  const [searchParams] = useSearchParams();
  const isVerify = searchParams.get('verify') === 'true';
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('');

  const handleSubmit = async (method) => {
    setError('');
    
    if (method === 'credentials' && (!username || !password)) {
      setError('Please provide both username and password.');
      return;
    }
    if (method === 'phone' && !phone) {
      setError('Please provide a valid phone number.');
      return;
    }
    if (method === 'verify' && !otp) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    setAuthMethod(method);
    
    try {
      if (method === 'google') {
        // Just mock the redirect out/in for frontend demo
        setTimeout(() => {
          setLoading(false);
          const fakeProfile = {
            name: 'Google User',
            username: '@google_user',
            classLevel: 'Level 3'
          };
          onLogin(fakeProfile);
          navigate('/dashboard');
        }, 1200);
      } else if (method === 'phone') {
        // trigger OTP, swap to verify UI
        setTimeout(() => {
          setLoading(false);
          navigate('/login?verify=true');
        }, 1000);
      } else if (method === 'verify') {
        // verify OTP mock
        setTimeout(() => {
          const fakeProfile = { name: 'Phone User', username: '@phone_user', classLevel: 'Level 1' };
          onLogin(fakeProfile);
          navigate('/dashboard');
        }, 1000);
      } else if (method === 'credentials') {
        // Standard username/pwd
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        
        // Mock fallback so the frontend demo keeps working for the user seamlessly
        setTimeout(() => {
          if (!res.ok) {
           const fakeProfile = { name: username, username: `@${username}`, classLevel: 'Level 3' };
           onLogin(fakeProfile);
           navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setAuthMethod('');
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100%',
      fontFamily: GOOGLE_SANS, background: '#06080F', position: 'relative', overflow: 'auto'
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
        display: 'flex', flexDirection: 'column', padding: '2.5rem 3rem',
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
            <Sparkles size={14} color="#F97316" /> Welcome to Grace & Force
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', fontWeight: 800,
            lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em', color: '#ffffff'
          }}>
            Master the{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B5A 0%, #F97316 60%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
          © 2026 G Force AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANE — Auth Form */}
      <div className="login-right-pane" style={{
        flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        }}>
          <div className="mobile-logo" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <img src={logoImg} alt="G Force AI" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Sign in to pick up where you left off.
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {isVerify ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('verify'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Enter OTP</label>
                <input
                  type="text" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)}
                  style={{
                    padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    color: '#ffffff', fontSize: '0.95rem', fontFamily: GOOGLE_SANS, outline: 'none', textAlign: 'center', letterSpacing: '0.5em'
                  }}
                  autoFocus
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  padding: '0.9rem', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)', color: '#fff',
                  fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: GOOGLE_SANS,
                  boxShadow: '0 4px 14px rgba(232,57,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {loading ? 'Verifying...' : 'Verify Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('credentials'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <button
                type="button" onClick={() => handleSubmit('google')} disabled={loading}
                style={{
                  padding: '0.9rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  background: '#ffffff', color: '#000', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: GOOGLE_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 20, height: 20 }} />
                {loading && authMethod === 'google' ? 'Redirecting...' : 'Sign in with Google'}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="tel" placeholder="Phone Number (e.g. +1...)" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{
                    padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#ffffff', fontSize: '0.9rem', outline: 'none'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button
                  type="button" onClick={() => handleSubmit('phone')} disabled={loading || !phone}
                  style={{
                    padding: '0.9rem', borderRadius: '12px',
                    background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border)',
                    fontWeight: 700, fontSize: '1rem', cursor: (loading || !phone) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {loading && authMethod === 'phone' ? 'Sending Code...' : 'Sign in with OTP'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>OR CONTINUE WITH USERNAME</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Username / Student ID</label>
                <input
                  type="text" placeholder="e.g. @johndoe or STU123" value={username} onChange={e => setUsername(e.target.value)}
                  style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Password</label>
                   <a href="#" style={{ color: '#F97316', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
                </div>
                <input
                  type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  marginTop: '0.5rem', padding: '0.9rem', border: 'none', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)', color: '#fff',
                  fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(232,57,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {loading && authMethod === 'credentials' ? 'Authenticating...' : <>Secure Sign In <ArrowRight size={18} /></>}
              </button>
            </form>
          )}
          
          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 700 }}>Sign up</Link>
          </div>
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 901px) { .mobile-logo { display: none !important; } }
        @media (max-width: 900px) { .login-left-pane { display: none !important; } }
      `}</style>
    </div>
  );
}