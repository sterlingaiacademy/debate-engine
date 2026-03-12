import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const isJunior = user.classLevel === 'Class 1-3';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Combined Dashboard Tile */}
      <div className="card" style={{
        background: isJunior
          ? 'linear-gradient(135deg, #fdf4ff 0%, #eff6ff 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: `2px solid ${isJunior ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.15)'}`,
        textAlign: 'center',
        padding: '4rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {isJunior ? '👋 ' : ''}Welcome back, {user.name}!
        </h2>
        <p className="text-secondary" style={{ fontSize: '1.125rem', marginBottom: '2.5rem' }}>
          <span className={`badge ${isJunior ? 'badge-purple' : 'badge-blue'}`} style={{ marginRight: '0.5rem' }}>
            {user.classLevel}
          </span>
          {isJunior ? 'Junior Debate Engine' : 'Senior Debate Engine'}
        </p>

        {isJunior && (
          <div style={{ marginBottom: '3rem' }}>
            <div className="animate-bounce" style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '1.5rem' }}>🦁</div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4c1d95', marginBottom: '0.5rem' }}>Ready to debate?</h3>
            <p style={{ color: '#6d28d9', fontSize: '1.125rem' }}>Your debate buddy is waiting for you!</p>
          </div>
        )}

        <button className="btn btn-primary btn-lg" onClick={() => navigate('/debate')} style={{ gap: '0.625rem', padding: '1rem 3rem', fontSize: '1.25rem' }}>
          <Play size={22} fill="currentColor" />
          Start Debate!
        </button>
      </div>

      {/* Quick tips / Senior only */}
      {!isJunior && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>Tips for Great Debating</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { icon: '🎯', title: 'Stay on Topic', desc: 'Keep your arguments relevant to the debate question.' },
              { icon: '🧩', title: 'Use Evidence', desc: 'Support your claims with facts and reasoning.' },
              { icon: '🎤', title: 'Speak Clearly', desc: 'Pace yourself and enunciate your words well.' },
              { icon: '🤝', title: 'Be Respectful', desc: 'Address the argument, not the person.' },
            ].map((tip) => (
              <div key={tip.title} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: '1.375rem' }}>{tip.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{tip.title}</p>
                  <p className="text-secondary text-sm">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
