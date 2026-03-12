import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    password: '',
    classLevel: 'Class 1-3',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const isJunior = formData.classLevel === 'Class 1-3';

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="login-hero animate-fade-in">
          <span className="login-logo">Grace and Force AI</span>
          <p className="login-tagline">Create your debate account – {isJunior ? '🦁 Junior Engine' : '🎓 Senior Engine'}</p>
        </div>

        <div className="login-card animate-slide-up">
          {/* Engine indicator */}
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            background: isJunior ? 'linear-gradient(135deg, #fdf4ff, #eff6ff)' : 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
            border: `1px solid ${isJunior ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isJunior ? '#7c3aed' : '#1d4ed8',
          }}>
            <span style={{ fontSize: '1.25rem' }}>{isJunior ? '🦁' : '🎓'}</span>
            {isJunior ? 'Junior Debate Engine (Class 1–3)' : 'Senior Debate Engine (Class 10–12)'}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={formData.name}
                onChange={set('name')} placeholder="Your full name" required />
            </div>

            <div className="input-group">
              <label className="input-label">Student ID Card</label>
              <input type="text" className="input-field" value={formData.studentId}
                onChange={set('studentId')} placeholder="e.g. STU12345" required />
            </div>

            <div className="input-group">
              <label className="input-label">Create Password</label>
              <input type="password" className="input-field" value={formData.password}
                onChange={set('password')} placeholder="Create a strong password" required />
            </div>

            <div className="input-group">
              <label className="input-label">Select Class</label>
              <select className="input-field" value={formData.classLevel} onChange={set('classLevel')}>
                <option value="Class 1-3">Class 1–3 (Junior Debate Engine)</option>
                <option value="Class 10-12">Class 10–12 (Senior Debate Engine)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <div className="divider">already have an account?</div>

            <Link to="/login" className="btn btn-secondary btn-lg w-full" style={{ justifyContent: 'center', textDecoration: 'none' }}>
              Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
