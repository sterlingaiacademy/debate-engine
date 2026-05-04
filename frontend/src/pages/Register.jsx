import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { ArrowRight, Sparkles, Zap, Trophy, Shield, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/logo.png';
const GOOGLE_SANS = "'Google Sans', 'Outfit', 'Product Sans', system-ui, sans-serif";
import { API_BASE } from '../api';

export default function Register({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('auth'); // 'auth' | 'details'
  const [googleProfile, setGoogleProfile] = useState(null); // { email, avatar, name }

  const [formData, setFormData] = useState({
    name: '', username: '', password: '', selectedClass: 'KG', referralCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic UI State
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameFormatError, setUsernameFormatError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isJuniorClass = ['KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(formData.selectedClass);

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) setFormData(p => ({ ...p, referralCode: refFromUrl }));
  }, [searchParams]);

  useEffect(() => {
    const p = formData.password;
    if (p.length > 0) {
      const hasUpper = /[A-Z]/.test(p);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
      if (p.length < 8) setPasswordError('Needs at least 8 characters');
      else if (!hasUpper) setPasswordError('Needs 1 uppercase letter');
      else if (!hasSpecial) setPasswordError('Needs 1 special character');
      else setPasswordError('');
    } else {
      setPasswordError('');
    }

    const u = formData.username;
    let hasFormatError = false;
    if (u.length > 0) {
      if (u.startsWith('.') || u.endsWith('.')) { setUsernameFormatError('Cannot start or end with a dot'); hasFormatError = true; }
      else if (u.includes('..')) { setUsernameFormatError('Cannot contain consecutive dots'); hasFormatError = true; }
      else if (/^[_.]+$/.test(u)) { setUsernameFormatError('Must contain at least one letter or number'); hasFormatError = true; }
      else setUsernameFormatError('');
    } else { setUsernameFormatError(''); }

    if (u.length >= 3 && !hasFormatError) {
      setIsCheckingUsername(true);
      const t = setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/check-username/${encodeURIComponent(u)}`);
          if (res.ok) { const d = await res.json(); setUsernameAvailable(d.available); }
        } catch { /* ignore */ } finally { setIsCheckingUsername(false); }
      }, 600);
      return () => clearTimeout(t);
    } else { setUsernameAvailable(null); }
  }, [formData.username, formData.password]);

  const set = (field) => (e) => {
    let val = e.target.value;
    if (field === 'username') val = val.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30);
    if (field === 'name' && formData.username === '') {
      setFormData(p => ({ ...p, name: val, username: `${val.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 26)}${Math.floor(Math.random() * 1000)}` }));
      return;
    }
    setFormData(p => ({ ...p, [field]: val }));
  };

  const getLevelForClass = (cls) => {
    if (['KG', 'Class 1', 'Class 2'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
    return 'Level 1';
  };

  // Step 1: Google sign-in → fetch profile → move to details
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!resp.ok) throw new Error('Failed to fetch Google profile');
        const profile = await resp.json();
        setGoogleProfile({ email: profile.email, avatar: profile.picture, name: profile.name, access_token: tokenResponse.access_token });
        // Pre-fill name from Google
        const suggestedName = profile.name || '';
        const suggestedUsername = suggestedName.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 26) + Math.floor(Math.random() * 1000);
        setFormData(p => ({ ...p, name: suggestedName, username: suggestedUsername }));
        setStep('details');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in was unsuccessful.')
  });

  // Step 2: Save details → register user
  const handleSaveDetails = async () => {
    setError('');
    if (!formData.name || !formData.username || !formData.password) {
      setError('Name, Username, and Password are required.');
      return;
    }
    const u = formData.username;
    if (u.startsWith('.') || u.endsWith('.') || u.includes('..') || /^[_.]+$/.test(u)) {
      setError('Username format is invalid.');
      return;
    }
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    if (formData.password.length < 8 || !hasUpper || !hasSpecial) {
      setError('Password must be 8+ chars with 1 uppercase and 1 special character.');
      return;
    }

    setLoading(true);
    try {
      const computedClassLevel = getLevelForClass(formData.selectedClass);
      const payload = {
        name: formData.name,
        studentId: formData.username,
        password: formData.password,
        classLevel: computedClassLevel,
        grade: formData.selectedClass,
        referralCode: formData.referralCode,
        authProvider: 'google',
        email: googleProfile?.email || null,
        avatar: googleProfile?.avatar || null,
      };

      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create account. Please try again.');

      localStorage.setItem('token', data.token);
      onLogin(data.user);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100%',
      fontFamily: GOOGLE_SANS, background: '#06080F', position: 'relative', overflow: 'auto'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(232,57,42,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* LEFT PANE */}
      <div className="login-left-pane" style={{
        flex: 1, position: 'relative', zIndex: 1,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.0) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', padding: '2.5rem 3rem',
      }}>
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
          <h1 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
            Unlock Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B5A 0%, #F97316 60%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              True Potential
            </span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 400 }}>
            Join thousands of students learning to speak with Grace and Force. Create your account securely to proceed.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { icon: <Zap size={16} color="#F97316" />, label: 'Adaptive Levels', bg: 'rgba(249,115,22,0.15)' },
              { icon: <Trophy size={16} color="#E8392A" />, label: 'Compete Safely', bg: 'rgba(232,57,42,0.15)' },
              { icon: <Shield size={16} color="#10b981" />, label: 'Private & Secure', bg: 'rgba(16,185,129,0.15)' },
            ].map(({ icon, label, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
          © 2026 G Force AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="login-right-pane" style={{
        flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{
          width: '100%', maxWidth: '540px',
          background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
        }}>
          <div className="mobile-logo" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src={logoImg} alt="G Force AI" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              {step === 'auth' ? 'Create Account' : 'Complete Your Profile'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {step === 'auth' ? 'Sign up with your Google account to get started.' : 'Just a few more details to set up your account.'}
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* STEP 1: Google Auth */}
          {step === 'auth' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                type="button" onClick={() => googleLogin()} disabled={loading}
                style={{
                  padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  background: '#ffffff', color: '#000', fontWeight: 700, fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: GOOGLE_SANS,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,255,255,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)'; }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 22, height: 22 }} />
                {loading ? 'Loading...' : 'Continue with Google'}
              </button>

              <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                Already have an account? <Link to="/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Link to="/" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>← Back to Home</Link>
              </div>
            </div>
          )}

          {/* STEP 2: Account Details Form */}
          {step === 'details' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveDetails(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
              
              <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 600 }}>Google authentication successful!</span>
              </div>

              {isJuniorClass && (
                <div style={{ padding: '0.85rem', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={18} color="#fb923c" />
                  <span style={{ fontSize: '0.85rem', color: '#fdba74', fontWeight: 600 }}>Level 1 & 2 Students: Ask for parent permission.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={formData.name} onChange={set('name')} required
                    style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Grade</label>
                  <select value={formData.selectedClass} onChange={set('selectedClass')}
                    style={{ padding: '0.8rem', background: '#0f1322', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                    <option value="KG">KG</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={`Class ${i + 1}`} value={`Class ${i + 1}`}>Grade {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Username</label>
                  <input type="text" placeholder="e.g. johndoe" value={formData.username} onChange={set('username')} required
                    style={{ padding: '0.8rem 1rem', background: (usernameAvailable === false || usernameFormatError) ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)', border: (usernameAvailable === false || usernameFormatError) ? '1px solid rgba(239, 68, 68, 0.5)' : usernameAvailable ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  {usernameFormatError && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.2rem' }}>{usernameFormatError}</span>}
                  {isCheckingUsername && !usernameFormatError && <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem' }}>Checking...</span>}
                  {usernameAvailable === true && !isCheckingUsername && !usernameFormatError && <span style={{ color: '#34d399', fontSize: '0.75rem', marginTop: '0.2rem' }}>Username available!</span>}
                  {usernameAvailable === false && !isCheckingUsername && !usernameFormatError && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.2rem' }}>Username already exists</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Password</label>
                  <input type="password" placeholder="Secure password" value={formData.password} onChange={set('password')} required
                    style={{ padding: '0.8rem 1rem', background: passwordError ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)', border: passwordError ? '1px solid rgba(239, 68, 68, 0.5)' : (!passwordError && formData.password.length > 0) ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  {passwordError && <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.2rem' }}>{passwordError}</span>}
                  {!passwordError && formData.password.length > 0 && <span style={{ color: '#34d399', fontSize: '0.75rem', marginTop: '0.2rem' }}>Strong password!</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Referral Code (Optional)</label>
                <input type="text" placeholder="Enter referral code" value={formData.referralCode} onChange={set('referralCode')}
                  style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F97316', fontSize: '0.9rem', outline: 'none', letterSpacing: '2px' }}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  marginTop: '0.5rem', padding: '1rem', border: 'none', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)', color: '#fff',
                  fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(232,57,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {loading ? 'Creating Account...' : <>Complete Sign Up <ArrowRight size={18} /></>}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => setStep('auth')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontFamily: GOOGLE_SANS }}>
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .login-left-pane { display: none !important; } }
        @media (min-width: 901px) { .mobile-logo { display: none !important; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
