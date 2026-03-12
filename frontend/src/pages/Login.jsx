import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const res = await fetch('http://localhost:5000/api/login', {
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #dbeafe 0%, #f8fafc 40%, #ede9fe 100%)',
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ width: '100%', maxWidth: '430px' }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
          <span style={{
            display: 'block',
            fontSize: '2.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}>
            Grace and Force AI
          </span>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
            AI Debate Training Platform for Students
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px 0 rgba(0,0,0,0.12)',
          padding: '2.5rem',
          border: '1px solid rgba(226,232,240,0.8)',
        }} className="animate-slide-up">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label className="input-label">Student ID Card</label>
              <input type="text" className="input-field" value={studentId}
                onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. STU12345" required />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input-field" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', marginTop: '0.25rem' }}>
              {loading ? 'Logging in…' : 'Login'}
            </button>

            <div className="divider">or</div>

            <Link to="/register" className="btn btn-secondary btn-lg"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              Create Account
            </Link>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem', marginTop: '1.5rem' }}>
          © 2026 Grace and Force AI · All rights reserved
        </p>
      </div>
    </div>
  );
}
