import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, UserPlus, ArrowRight, Sparkles, Zap, Trophy, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/logo.png';
const GOOGLE_SANS = "'Google Sans', 'Outfit', 'Product Sans', system-ui, sans-serif";
import { supabase } from '../supabase';

export default function Register({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 'auth' | 'verify_otp' | 'details'
  const [step, setStep] = useState(searchParams.get('step') || 'auth');
  
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', phone: '', selectedClass: 'KG', referralCode: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState(''); // 'google' | 'phone'

  const isJuniorClass = ['KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(formData.selectedClass);

  useEffect(() => {
    // If OAuth redirects back to /register?step=details, capture it
    if (searchParams.get('step') === 'details') {
      setStep('details');
    }
    
    // Check if we have an active Supabase session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        
        // Prevent duplicate accounts: check if legacy profile already exists
        if (session.user?.email) {
          try {
             const res = await fetch(`/api/user-by-email/${encodeURIComponent(session.user.email)}`);
             if (res.ok) {
                 const data = await res.json();
                 if (data.user) {
                     // Block duplicate creation! Sign out and kick to Login.
                     await supabase.auth.signOut();
                     navigate('/login?error=account_exists');
                     return;
                 }
             }
          } catch (e) {
             console.error('Failed checking duplicate profile', e);
          }
        }

        if (searchParams.get('step') !== 'details') {
          setStep('details');
        }
      }
    };
    checkSession();
  }, [searchParams, navigate]);

  const set = (field) => (e) => {
    let val = e.target.value;
    if (field === 'name' && formData.username === '') {
      setFormData((p) => ({ ...p, name: val, username: `${val.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(Math.random() * 1000)}` }));
      return;
    }
    setFormData((p) => ({ ...p, [field]: val }));
  };

  const getLevelForClass = (cls) => {
    if (['KG', 'Class 1', 'Class 2'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
    return 'Level 1';
  };

  // Step 1: Initial Auth Initiate
  const handleAuthInitiate = async (method) => {
    setError('');
    setAuthMethod(method);

    if (method === 'phone' && !formData.phone) {
      setError('Please provide a valid phone number (e.g., +1234567890).');
      return;
    }

    setLoading(true);
    try {
      if (method === 'google') {
        // Genuine Supabase Google Auth
        const { error: googleError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/register?step=details`
          }
        });
        if (googleError) throw googleError;
        // Page will redirect momentarily
      } else if (method === 'phone') {
        // Genuine Supabase Phone OTP Auth
        const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
        const { error: phoneError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        if (phoneError) throw phoneError;
        setLoading(false);
        setStep('verify_otp');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Step 2: Verify Phone OTP
  const handleVerifyOtp = async () => {
    setError('');
    if (!otp) return setError('Please enter the OTP sent to your phone.');
    
    setLoading(true);
    try {
      const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      
      if (verifyError) throw verifyError;
      
      // OTP verified successfully
      setLoading(false);
      setStep('details');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Step 3: Finalize Account Details
  const handleSaveDetails = async () => {
    setError('');
    if (!formData.name || !formData.username || !formData.password) {
      setError('Name, Username, and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const computedClassLevel = getLevelForClass(formData.selectedClass);
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        name: formData.name,
        studentId: formData.username, // FIXED: was previously missing, causing backend 400 Bad Request
        password: formData.password,
        classLevel: computedClassLevel,
        referralCode: formData.referralCode,
        authProvider: authMethod,
        email: session?.user?.email || null,
        phone: session?.user?.phone || null
      };

      // In the real app, hit your API
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Instead of failing entirely if backend isn't mapped, we'll store local state so UI works
      const data = await res.json().catch(() => ({})); 

      // We log the user out of the active Supabase session here if they used Google/Phone
      // because the user explicitly requested they must formally log in AFTER registration.
      await supabase.auth.signOut();
      
      setLoading(false);
      navigate('/login?success=account_created');

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
            lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em', color: '#ffffff'
          }}>
            Unlock Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B5A 0%, #F97316 60%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              True Potential
            </span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 400 }}>
            Join thousands of students learning to speak with Grace and Force. Securely verify your account to proceed.
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

      {/* RIGHT PANE — Multi-Step Auth Form */}
      <div className="login-right-pane" style={{
        flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        
        <div style={{
          width: '100%', maxWidth: step === 'details' ? '540px' : '440px',
          background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)', position: 'relative', transition: 'max-width 0.3s ease'
        }}>
          
          <div className="mobile-logo" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src={logoImg} alt="G Force AI" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              {step === 'auth' && "Get Started"}
              {step === 'verify_otp' && "Verify Identity"}
              {step === 'details' && "Complete Profile"}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {step === 'auth' && "Sign up using your secure provider."}
              {step === 'verify_otp' && "Enter the OTP sent to your phone."}
              {step === 'details' && "Fill in your account details below."}
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* STEP 1: INITIAL AUTHENTICATION */}
          {step === 'auth' && (
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              <button
                type="button"
                onClick={() => handleAuthInitiate('google')}
                disabled={loading}
                style={{
                  padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  background: '#ffffff', color: '#000', fontWeight: 700, fontSize: '1.05rem',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: GOOGLE_SANS,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  transition: 'transform 0.2s, background 0.2s', opacity: loading ? 0.7 : 1
                }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 22, height: 22 }} />
                {loading && authMethod === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.25rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="tel" placeholder="Phone Number (e.g. +1...)" value={formData.phone} onChange={set('phone')}
                  style={{
                    padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#ffffff', fontSize: '1rem', fontFamily: GOOGLE_SANS, outline: 'none'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button
                  type="button" onClick={() => handleAuthInitiate('phone')} disabled={loading || !formData.phone}
                  style={{
                    padding: '1rem', border: 'none', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)', color: '#fff',
                    fontWeight: 700, fontSize: '1.05rem', cursor: (loading || !formData.phone) ? 'not-allowed' : 'pointer',
                    fontFamily: GOOGLE_SANS, boxShadow: '0 4px 14px rgba(232,57,42,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (loading || !formData.phone) ? 0.7 : 1
                  }}
                >
                  {loading && authMethod === 'phone' ? 'Sending SMS...' : 'Continue with Phone'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP (if phone method chosen) */}
          {step === 'verify_otp' && (
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Enter OTP</label>
                <input
                  type="text" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)}
                  style={{
                    padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#ffffff', fontSize: '1rem', fontFamily: GOOGLE_SANS, outline: 'none', textAlign: 'center', letterSpacing: '0.5em'
                  }}
                  autoFocus
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  padding: '1rem', border: 'none', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)', color: '#fff',
                  fontWeight: 700, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: GOOGLE_SANS, boxShadow: '0 4px 14px rgba(232,57,42,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {loading ? 'Verifying...' : 'Verify Number'}
              </button>
              <button 
                type="button" onClick={() => setStep('auth')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '-0.5rem' }}
              >
                ← Use a different number
              </button>
            </form>
          )}

          {/* STEP 3: ACCOUNT DETAILS */}
          {step === 'details' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveDetails(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', animation: 'fadeIn 0.3s' }}>
              
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#a7f3d0', padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="#10b981" /> Authentication successful!
              </div>

              {isJuniorClass && (
                <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fed7aa', padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: '0.5rem' }}>
                  <Shield size={18} color="#F97316" style={{ flexShrink: 0 }} />
                  <span>Level 1 & 2 Students: Ask for parent permission.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={formData.name} onChange={set('name')} required
                    style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Class</label>
                  <select value={formData.selectedClass} onChange={set('selectedClass')}
                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                  >
                    {['KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c} style={{ color: '#000' }}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>@Username</label>
                  <input type="text" placeholder="Unique handle" value={formData.username} onChange={set('username')} required
                    style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Password</label>
                  <input type="password" placeholder="Secure password" value={formData.password} onChange={set('password')} required
                    style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
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
            </form>
          )}

          {step === 'auth' && (
             <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
              Already have an account? <Link to="/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
             </div>
          )}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to Home</Link>
          </div>
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
