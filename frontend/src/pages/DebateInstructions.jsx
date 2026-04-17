import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Headphones, CheckCircle2, Mic } from 'lucide-react';

export default function DebateInstructions({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const nextPath = searchParams.get('next') || '/dashboard';

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', textAlign: 'center', padding: '2rem', width: '100%', margin: 0
    }}>
      <div style={{
        padding: '3rem', maxWidth: '600px', width: '100%',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
        }}>
          <Headphones size={40} color="#3b82f6" strokeWidth={2} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Environment Check
        </h1>
        
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          You're about to enter an advanced debate session. For the best experience and optimal AI speech recognition, please follow these instructions:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sit in a quiet room with no background noise</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mic size={20} color="#10b981" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Use a headset or earphones with a good mic</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(nextPath)}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '2.5rem', padding: '1rem', fontSize: '1.1rem' }}
        >
          I'm Ready, Enter Arena
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
