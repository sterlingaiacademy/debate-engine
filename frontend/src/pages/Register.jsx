import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Zap, Trophy, ArrowRight, Sparkles, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    password: '',
    selectedClass: 'KG', // Default School Class
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  // Helper to map school class to debate level automatically
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
      const computedClassLevel = getLevelForClass(selectedClass); // Auto-assign the Level
      
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, studentId, classLevel: computedClassLevel, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Successfully registered and level assigned, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ 
      display: 'flex', minHeight: '100vh', width: '100%', fontFamily: 'var(--font-sans)', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      position: 'relative', overflow: 'auto'
    }}>
      
      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.4)', filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'rgba(236, 72, 153, 0.2)', filter: 'blur(120px)', borderRadius: '50%' }} />

      {/* LEFT PANE - Hero (Hidden on smaller screens, perfectly matching Login) */}
      <div className="login-left-pane animate-fade-in" style={{ 
        flex: 1, 
        position: 'relative', 
        background: 'transparent',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 2rem 2.5rem 3rem',
        zIndex: 1
      }}>
        {/* Main Content - Centered Vertically */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, maxWidth: '600px' }}>
          
          {/* Brand Logo tied to the Hero block */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Grace and Force AI</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', color: '#e0e7ff', backdropFilter: 'blur(10px)', width: 'fit-content' }}>
            <Sparkles size={16} color="#a855f7" /> Join the Debate Revolution
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
            Unlock your <span style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Potential</span>
          </h1>
          
          <p style={{ fontSize: '1.125rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.75rem', fontWeight: 400 }}>
            Create an account to debate advanced AI personas, test your logic, and rank up against students worldwide.
          </p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={16} color="#10b981" />
              </div>
              Instant Setup
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={16} color="#3b82f6" />
              </div>
              Voice Debates
            </div>
          </div>
        </div>

        {/* Footer info inside Left Pane */}
        <div style={{ zIndex: 10, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: '3rem' }}>
          © 2026 Grace and Force AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANE - Register Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
        background: 'transparent',
        zIndex: 1
      }}>
        <div className="animate-slide-up" style={{ 
          width: '100%', 
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          
          {/* Mobile-only logo (shows when left pane is hidden) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center' }} className="mobile-logo">
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
               <Mic size={18} color="#fff" />
             </div>
             <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>Grace and Force</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Create Account</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Join the ultimate AI debate platform.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {error && (
              <div className="alert alert-error" style={{ borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Full Name</label>
              <input 
                type="text" value={formData.name} onChange={set('name')} placeholder="Your full name" required 
                style={{
                  width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)', color: '#fff', transition: 'all 0.2s ease', outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.target.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              />
            </div>

            {/* Row for Student ID & Class */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Student ID</label>
                <input 
                  type="text" value={formData.studentId} onChange={set('studentId')} placeholder="STU12345" required 
                  style={{
                    width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)', color: '#fff', transition: 'all 0.2s ease', outline: 'none'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.target.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Class</label>
                <select 
                  value={formData.selectedClass} onChange={set('selectedClass')} required
                  style={{
                    width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.3)', color: '#fff', transition: 'all 0.2s ease', outline: 'none',
                    appearance: 'none', cursor: 'pointer'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                >
                  {['KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                    <option key={cls} value={cls} style={{ background: '#1e293b', color: '#fff' }}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Create Password</label>
              <input 
                type="password" value={formData.password} onChange={set('password')} placeholder="Create a strong password" required 
                style={{
                  width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)', color: '#fff', transition: 'all 0.2s ease', outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.target.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '1rem', marginTop: '0.25rem',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: '#fff', fontSize: '1.05rem', fontWeight: 700,
                border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => { if(!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(236, 72, 153, 0.5)'; } }}
              onMouseLeave={(e) => { if(!loading) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(236, 72, 153, 0.4)'; } }}
            >
              {loading ? 'Creating Account...' : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.25rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#cbd5e1' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#fbcfe8', fontWeight: 600, textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.textDecoration='underline'} onMouseLeave={(e) => e.target.style.textDecoration='none'}>
                Sign In Instead
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {/* Small inline style block to hide the mobile-logo on desktop where the left pane is visible */}
      <style>{`
        @media (min-width: 901px) {
          .mobile-logo { display: none !important; }
        }
        @media (max-width: 900px) {
          .login-wrapper { flex-direction: column !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
