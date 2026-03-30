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
  'Freedom Fighter': { bg: 'rgba(251, 146, 60, 0.08)', border: '#fb923c', text: '#fdba74' },
  'Civil Rights':    { bg: 'rgba(245, 158, 11, 0.08)', border: '#f59e0b', text: '#fcd34d' },
  'Humanitarian':    { bg: 'rgba(236, 72, 153, 0.08)', border: '#ec4899', text: '#f9a8d4' },
  'Spiritual Leader':{ bg: 'rgba(52, 211, 153, 0.08)', border: '#34d399', text: '#6ee7b7' },
  'Statesman':       { bg: 'rgba(96, 165, 250, 0.08)', border: '#60a5fa', text: '#93c5fd' },
  'Reformer':        { bg: 'rgba(167, 139, 250, 0.08)', border: '#a78bfa', text: '#c4b5fd' },
  'Scientist':       { bg: 'rgba(34, 211, 238, 0.08)', border: '#22d3ee', text: '#67e8f9' },
  'Visionary':       { bg: 'rgba(56, 189, 248, 0.08)', border: '#38bdf8', text: '#7dd3fc' },
  'Philosopher':     { bg: 'rgba(250, 204, 21, 0.08)', border: '#facc15', text: '#fef08a' },
  'Activist':        { bg: 'rgba(251, 113, 133, 0.08)', border: '#fb7185', text: '#fda4af' },
  'Artist & Scientist': { bg: 'rgba(192, 132, 252, 0.08)', border: '#c084fc', text: '#d8b4fe' },
  'Business Leader': { bg: 'rgba(148, 163, 184, 0.08)', border: '#94a3b8', text: '#cbd5e1' },
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
                border: `2px solid ${isLive ? colors.border : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '16px',
                padding: '1.25rem 0.75rem 1rem',
                background: isLive ? colors.bg : 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.625rem',
                textAlign: 'center',
                transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                boxShadow: isLive ? `0 2px 12px ${colors.border}15` : 'none',
                opacity: isLive ? 1 : 0.65,
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isLive) return;
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 10px 28px ${colors.border}40`;
                e.currentTarget.style.background = `rgba(${colors.bg.substring(5, colors.bg.length - 6)}, 0.15)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = isLive ? `0 2px 12px ${colors.border}15` : 'none';
                e.currentTarget.style.background = isLive ? colors.bg : 'rgba(255,255,255,0.02)';
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
                background: isLive ? `linear-gradient(135deg, ${colors.border}33, ${colors.border}66)` : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${isLive ? colors.border : 'rgba(255,255,255,0.1)'}`,
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
                background: isLive ? `${colors.border}22` : 'rgba(255,255,255,0.03)',
                color: isLive ? colors.text : 'rgba(255,255,255,0.5)',
                border: `1px solid ${isLive ? colors.border : 'rgba(255,255,255,0.1)'}`,
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
