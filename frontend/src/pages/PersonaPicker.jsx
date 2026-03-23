import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LEVEL_4_PERSONAS = [
  { 
    name: 'Mahatma Gandhi', 
    image: '/gandhi_avatar_1773899586119.png', 
    agentId: 'agent_3201kkzwysdgfy0vrfet51npeds7', 
    category: 'Freedom Fighter' 
  },
  { 
    name: 'Winston Churchill', 
    image: '/churchill_avatar_1773899602534.png', 
    agentId: 'agent_3101km26fbt9eyxayad5xwwx1740', 
    category: 'Statesman' 
  },
  { 
    name: 'Abraham Lincoln', 
    image: '/lincoln_avatar_1773899618273.png', 
    agentId: 'agent_0301km28zy3ffxattettzq8jq9zv', 
    category: 'Statesman' 
  }
];

const LEVEL_5_PERSONAS = [
  { 
    name: 'Mahatma Gandhi (Senior)', 
    image: '/gandhi_avatar_1773899586119.png', 
    agentId: 'agent_3801km7h68pbfn1t8m52ny028t6w', 
    category: 'Freedom Fighter' 
  },
  { 
    name: 'Winston Churchill (Senior)', 
    image: '/churchill_avatar_1773899602534.png', 
    agentId: 'agent_3801km7h68pbfn1t8m52ny028t6w', 
    category: 'Statesman' 
  },
  { 
    name: 'Abraham Lincoln (Senior)', 
    image: '/lincoln_avatar_1773899618273.png', 
    agentId: 'agent_3801km7h68pbfn1t8m52ny028t6w', 
    category: 'Statesman' 
  }
];

// Unique colours per category
const CATEGORY_COLORS = {
  'Freedom Fighter': { bg: '#fff7ed', border: '#fb923c', text: '#c2410c' },
  'Civil Rights':    { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  'Humanitarian':    { bg: '#fdf2f8', border: '#ec4899', text: '#9d174d' },
  'Spiritual Leader':{ bg: '#f0fdf4', border: '#34d399', text: '#065f46' },
  'Statesman':       { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  'Reformer':        { bg: '#faf5ff', border: '#a78bfa', text: '#4c1d95' },
  'Scientist':       { bg: '#ecfeff', border: '#22d3ee', text: '#164e63' },
  'Visionary':       { bg: '#f0f9ff', border: '#38bdf8', text: '#0c4a6e' },
  'Philosopher':     { bg: '#fefce8', border: '#facc15', text: '#713f12' },
  'Activist':        { bg: '#fff1f2', border: '#fb7185', text: '#9f1239' },
  'Artist & Scientist': { bg: '#fdf4ff', border: '#c084fc', text: '#6b21a8' },
  'Business Leader': { bg: '#f8fafc', border: '#94a3b8', text: '#334155' },
};

export default function PersonaPicker({ user }) {
  const navigate = useNavigate();

  const handleSelect = (persona) => {
    navigate(
      `/persona-debate?name=${encodeURIComponent(persona.name)}&image=${encodeURIComponent(persona.image)}&agentId=${persona.agentId}`
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>🎭 Choose a Persona</h2>
          <p className="text-secondary" style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
            Pick a leader and start a live voice conversation
          </p>
        </div>
        <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{user?.classLevel || 'Level 4'} • Persona Mode</span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          LIVE — tap to talk
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
          Coming Soon
        </span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem',
      }}>
        {(user?.classLevel === 'Level 5' ? LEVEL_5_PERSONAS : LEVEL_4_PERSONAS).map((persona) => {
          const isLive = !!persona.agentId;
          const colors = CATEGORY_COLORS[persona.category] || CATEGORY_COLORS['Statesman'];

          return (
            <button
              key={persona.name}
              onClick={() => handleSelect(persona)}
              disabled={!isLive}
              title={isLive ? `Talk to ${persona.name}` : 'Coming Soon'}
              style={{
                cursor: isLive ? 'pointer' : 'not-allowed',
                border: `2px solid ${isLive ? colors.border : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '1.25rem 0.75rem 1rem',
                background: isLive ? colors.bg : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.625rem',
                textAlign: 'center',
                transition: 'transform 0.18s, box-shadow 0.18s',
                boxShadow: isLive ? `0 2px 12px ${colors.border}33` : '0 1px 4px rgba(0,0,0,0.06)',
                opacity: isLive ? 1 : 0.65,
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isLive) return;
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 10px 28px ${colors.border}55`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = isLive ? `0 2px 12px ${colors.border}33` : '0 1px 4px rgba(0,0,0,0.06)';
              }}
            >
              {/* LIVE dot */}
              {isLive && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 9, height: 9, borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }} />
              )}

              {/* Avatar / Image */}
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: isLive ? `linear-gradient(135deg, ${colors.border}33, ${colors.border}66)` : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${isLive ? colors.border : '#cbd5e1'}`,
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                <img src={persona.image} alt={persona.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Name */}
              <p style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                lineHeight: 1.3,
                color: isLive ? colors.text : '#64748b',
                margin: 0,
              }}>
                {persona.name}
              </p>

              {/* Category tag */}
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                background: isLive ? `${colors.border}22` : '#f1f5f9',
                color: isLive ? colors.text : '#94a3b8',
                border: `1px solid ${isLive ? colors.border : '#e2e8f0'}`,
              }}>
                {persona.category}
              </span>

              {/* CTA */}
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: isLive ? colors.text : '#94a3b8',
                marginTop: '0.1rem',
              }}>
                {isLive ? '🎙️ Talk Now' : '🔒 Soon'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
