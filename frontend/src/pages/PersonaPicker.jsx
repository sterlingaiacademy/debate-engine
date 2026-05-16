import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Lock } from 'lucide-react';

const LEVEL_4_PERSONAS = [
  { 
    name: 'Mahatma Gandhi', 
    image: '/gandhi_avatar_1773899586119.png', 
    agentId: 'agent_9701krh3ng1medhb7cnjqynhhjnh', 
    category: 'Freedom Fighter' 
  },
  { 
    name: 'Winston Churchill', 
    image: '/churchill_avatar_1773899602534.png', 
    agentId: 'agent_1101krh3zz8ff4gan1t659m93gr2', 
    category: 'Statesman' 
  },
  { 
    name: 'Abraham Lincoln', 
    image: '/lincoln_avatar_1773899618273.png', 
    agentId: 'agent_6901krh4be2re97ra9zhcgs03a1r', 
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

  const getNormalizedLevel = (cls) => {
    if (!cls) return 'Level 1';
    if (cls.startsWith('Level ')) return cls;
    if (['KG', 'Class 1', 'Class 2', 'Class KG', 'KG-2'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
    return 'Level 1';
  };
  const normalizedLevel = getNormalizedLevel(user?.classLevel);

  const handleSelect = (persona) => {
    navigate(
      `/persona-debate?name=${encodeURIComponent(persona.name)}&image=${encodeURIComponent(persona.image)}&agentId=${persona.agentId}`
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100vh', overflowY: 'auto', padding: '1.5rem 1rem', paddingBottom: '6rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
            {user?.grade ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade) : (user?.classLevel || 'Grade 4')} • Wisdom Arena
          </span>
        </div>
        <div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, margin: 0 }}>Choose a Persona</h2>
          <p className="text-secondary" style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
            Pick a leader and start a live voice conversation
          </p>
        </div>
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

      {/* Carousel */}
      <style>{`
        .carousel-hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="carousel-hide-scroll" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1.5rem',
        paddingBottom: '2rem',
      }}>
        {(normalizedLevel === 'Level 5' ? LEVEL_5_PERSONAS : LEVEL_4_PERSONAS).map((persona) => {
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
                scrollSnapAlign: 'center',
                flexShrink: 0,
                width: '260px',
                border: `2px solid ${isLive ? colors.border : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                background: isLive ? `linear-gradient(160deg, ${colors.bg} 0%, rgba(0,0,0,0.5) 100%)` : 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                textAlign: 'center',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s',
                boxShadow: isLive ? `0 12px 32px ${colors.border}25` : 'none',
                opacity: isLive ? 1 : 0.65,
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isLive) return;
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 16px 40px ${colors.border}40`;
              }}
              onMouseLeave={e => {
                if (!isLive) return;
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = `0 12px 32px ${colors.border}25`;
              }}
            >
              {/* LIVE dot */}
              {isLive && (
                <span style={{
                  position: 'absolute', top: 18, right: 18,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                }} />
              )}

              {/* Avatar / Image */}
              <div style={{
                width: 130, height: 130,
                borderRadius: '50%',
                background: isLive ? `linear-gradient(135deg, ${colors.border}55, ${colors.border}11)` : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `4px solid ${isLive ? colors.border : 'rgba(255,255,255,0.1)'}`,
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: isLive ? `0 8px 30px ${colors.border}60` : 'none',
              }}>
                <img src={persona.image} alt={persona.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Name */}
              <p style={{
                fontWeight: 800,
                fontSize: '1rem',
                lineHeight: 1.3,
                color: isLive ? colors.text : '#64748b',
                margin: 0,
              }}>
                {persona.name}
              </p>

              {/* Category tag */}
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                background: isLive ? `${colors.border}22` : 'rgba(255,255,255,0.03)',
                color: isLive ? colors.text : 'rgba(255,255,255,0.5)',
                border: `1px solid ${isLive ? colors.border : 'rgba(255,255,255,0.1)'}`,
              }}>
                {persona.category}
              </span>

              {/* CTA */}
              <div style={{
                marginTop: '0.25rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: isLive ? colors.border : 'rgba(255,255,255,0.05)',
                color: isLive ? '#000' : 'rgba(255,255,255,0.5)',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: isLive ? `0 4px 14px ${colors.border}40` : 'none',
              }}>
                {isLive ? <><Mic size={16} /> Talk Now</> : <><Lock size={16} /> Coming Soon</>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
