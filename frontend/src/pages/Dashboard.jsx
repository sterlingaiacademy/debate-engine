import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Trophy, TrendingUp, BarChart2, Star, Zap, Award, Clock, MessageSquare, Mic } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Helper to format category names for charts
const formatCategory = (key) => {
  const map = {
    avg_argument: 'Argument Quality',
    avg_rebuttal: 'Rebuttal',
    avg_clarity: 'Clarity',
    avg_fluency: 'Speech Fluency',
    avg_persuasiveness: 'Persuasiveness',
    avg_knowledge: 'Knowledge',
    avg_respect: 'Respectfulness',
    avg_consistency: 'Consistency',
    // Also map full backend names to short display names
    'Argument Quality': 'Argument Quality',
    'Rebuttal & Engagement': 'Rebuttal',
    'Clarity & Coherence': 'Clarity',
    'Speech Fluency': 'Speech Fluency',
    'Persuasiveness': 'Persuasiveness',
    'Knowledge & Evidence': 'Knowledge',
    'Respectfulness & Tone': 'Respectfulness',
    'Consistency & Position': 'Consistency',
  };
  return map[key] || key;
};

// Module-level cache to prevent reloading spinners on rapid navigation
let cachedStats = null;
let cachedStudentId = null;

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(() => ((user?.studentId || user?.username) === cachedStudentId ? cachedStats : null));
  const [loading, setLoading] = useState(!stats);

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);
  const isPersona = ['Level 4', 'Level 5'].includes(user?.classLevel);

  useEffect(() => {
    const activeId = user?.studentId || user?.username;
    if (!activeId) return;
    
    // If we have cached stats for this user, use them and still refetch in background
    if (activeId === cachedStudentId && cachedStats) {
      setStats(cachedStats);
      setLoading(false);
    }
    
    Promise.all([
      fetch(`/api/analytics/${activeId}`).then((r) => {
        if (!r.ok) throw new Error('Analytics failed');
        return r.json();
      }),
      fetch(`/api/time-limits/${activeId}`).then((r) => {
        if (!r.ok) throw new Error('Time limits failed');
        return r.json();
      }).catch(() => null)
    ])
    .then(([analyticsData, timeData]) => {
      // If analytics failed gracefully returning fallback, total_debates might be 0
      const combinedData = { ...analyticsData, timeLimits: timeData || { remainingRanked: 1200, remainingPersona: 1200, error: true } };
      cachedStats = combinedData;
      cachedStudentId = activeId;
      setStats(combinedData);
      setLoading(false);
    })
    .catch((e) => {
      console.error(e);
      setStats(prev => prev || { error: true });
      setLoading(false);
    });
  }, [user?.studentId, user?.username]);

  // Guard against null/undefined user (can happen briefly before redirect)
  if (!user) return null;

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
      </div>
    );
  }

  // Fallback for new users
  const elo = Math.round(stats.elo_rating || 1000);
  const tier = stats.tier || { name: 'Unranked', icon: '⬜', color: '#94a3b8' };
  const recentScoresData = (stats.score_trend || []).map((d, i) => ({
    name: `Debate ${i + 1}`,
    score: d.overall_score
  }));
  
  const skillData = Object.entries(stats.category_averages || {})
    .filter(([_, val]) => val !== null)
    .map(([key, val]) => ({
      subject: formatCategory(key),
      A: val,
      fullMark: 10,
    }));

  const allBadges = stats.badge_details || []; // assuming backend returns all badges with a 'locked' bool, or just earned ones for now
  
  // Custom tooltips
  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</p>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)' }}>Score: {payload[0].value.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* SECTION 1: Profile Header & Actions */}
      <div className="card" style={{ 
        display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${tier.color}15 0%, var(--bg-tertiary) 100%)`, 
        borderLeft: `6px solid ${tier.color}`
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <div>
               <h1 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.75rem)', fontWeight: 800, margin: '0 0 0.25rem 0', wordBreak: 'break-word' }}>{user.name}</h1>
               <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.classLevel}</span> &bull; {user.school || 'Debate Arena'}
               </p>
             </div>
          </div>
          {stats?.timeLimits && !stats.timeLimits.error && stats.timeLimits.remainingRanked !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7c3aed' }}>Daily Free Time</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={22} color="var(--accent)" strokeWidth={2.5} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {Math.floor(stats.timeLimits.remainingRanked / 60)} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>mins</span>
                </span>
              </div>
            </div>
          )}
      </div>

      {/* DEBATE MODE TILES — always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
        
        {/* TILE 1: Ranked Match */}
        <div
          onClick={() => navigate(isJunior ? '/debate' : '/debate-instructions?next=/debate')}
          style={{
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            borderRadius: '20px', padding: '2.5rem 2rem',
            background: isJunior ? 'linear-gradient(135deg, var(--j-pink) 0%, var(--j-purple) 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #172554 50%, #0f172a 100%)',
            border: isJunior ? 'none' : '1px solid rgba(59,130,246,0.3)',
            color: '#fff', minHeight: '220px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: isJunior ? '0 8px 32px rgba(59,130,246,0.35)' : '0 8px 32px rgba(59,130,246,0.15)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = isJunior ? '0 16px 48px rgba(168,85,247,0.45)' : '0 16px 48px rgba(59,130,246,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = isJunior ? '0 8px 32px rgba(168,85,247,0.35)' : '0 8px 32px rgba(59,130,246,0.15)'; }}
        >
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', right: '40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '20px', right: '25px', fontSize: '4rem', opacity: 0.15 }}>⚡</div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>{user?.classLevel || 'Level 4'}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              {isJunior ? 'Fun Debate Practice' : 'Ranked Match'}
            </h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
              {isJunior 
                ? 'Have a fun voice debate with your very own AI buddy. Practice speaking and learn new ideas!'
                : 'Go head-to-head with the AI in a competitive ranked debate. Earn ELO and climb the leaderboard.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>Start Debate</span>
            <Play size={16} fill="#fff" />
          </div>
        </div>

        {/* TILE 2: Persona Battle */}
        {user?.classLevel === 'Level 4' && (
        <div
          onClick={() => navigate('/debate-instructions?next=/persona')}
          style={{
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            borderRadius: '20px', padding: '2.5rem 2rem',
            background: isJunior ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #ec4899 100%)' : 'linear-gradient(135deg, #4c1d95 0%, #3b0764 50%, #0f172a 100%)',
            border: isJunior ? 'none' : '1px solid rgba(168,85,247,0.3)',
            color: '#fff', minHeight: '220px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: isJunior ? '0 8px 32px rgba(168,85,247,0.35)' : '0 8px 32px rgba(168,85,247,0.15)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = isJunior ? '0 16px 48px rgba(168,85,247,0.45)' : '0 16px 48px rgba(168,85,247,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = isJunior ? '0 8px 32px rgba(168,85,247,0.35)' : '0 8px 32px rgba(168,85,247,0.15)'; }}
        >
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '20px', right: '25px', fontSize: '4rem', opacity: 0.15 }}>🎭</div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Persona Mode</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Persona Battle</h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
              Debate as a legendary figure — Gandhi, Einstein, Cleopatra and more. Channel their voice and style.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>Choose Persona</span>
            <Play size={16} fill="#fff" />
          </div>
        </div>
        )}

        {/* TILE 3: Mock UN — Level 5 Premium only */}
        {user?.classLevel === 'Level 5' && (
        <div
          onClick={() => navigate('/debate-instructions?next=/mock-un')}
          style={{
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            borderRadius: '20px', padding: '2.5rem 2rem',
            background: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #1c1917 100%)',
            border: '1px solid rgba(251,191,36,0.25)',
            color: '#fff', minHeight: '220px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(217,119,6,0.2)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(217,119,6,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(217,119,6,0.2)'; }}
        >
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(251,191,36,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '20px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(251,191,36,0.04)' }} />
          <div style={{ position: 'absolute', top: '18px', right: '22px', fontSize: '4rem', opacity: 0.18 }}>🌐</div>

          {/* Premium badge */}
          <div style={{
            position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #d97706, #fbbf24)',
            borderRadius: '99px', padding: '0.2rem 0.75rem',
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#000',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>⭐ Premium</div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251,191,36,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🏛️
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fbbf24', opacity: 0.9 }}>UN Simulation</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: '#fef3c7' }}>Mock UN</h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.8, margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
              Debate real-world UN topics — climate, AI warfare, nuclear disarmament, and more.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fbbf24' }}>Enter the Chamber</span>
            <Play size={16} fill="#fbbf24" />
          </div>
        </div>
        )}

        {/* TILE 4: Conversational Agent (Levels 3, 4, 5) */}
        {!isJunior && (
        <div
          onClick={() => navigate('/conversational-agent')}
          style={{
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            borderRadius: '20px', padding: '2.5rem 2rem',
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
            border: '1px solid rgba(52,211,153,0.3)',
            color: '#fff', minHeight: '220px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(16,185,129,0.2)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(16,185,129,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.2)'; }}
        >
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '20px', right: '25px', fontSize: '4rem', opacity: 0.15 }}>💬</div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={24} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Helper Bot</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Conversational AI</h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
              Upload files, take quizzes, ask questions, or just have a casual talk with your dedicated AI tutor.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>Start Chat</span>
            <Play size={16} fill="#fff" />
          </div>
        </div>
        )}
      </div>

      {isJunior ? null : stats.total_debates === 0 ? (
         <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', background: isJunior ? 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)' : 'var(--bg-tertiary)', border: '1px dashed var(--border)' }}>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your stats will appear here</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Complete your first debate to unlock analytics, ELO rating, and skill breakdowns.</p>
         </div>
      ) : (
        <>
          {/* SECTION 4: Stat Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Debates', val: stats.total_debates, icon: MessageSquare, color: '#3b82f6' },
              { label: 'Avg Score', val: stats.avg_score?.toFixed(1) || '0.0', icon: Star, color: '#f59e0b' },
              { label: 'Win Rate', val: `${stats.win_rate || 0}%`, icon: Trophy, color: '#10b981' },
              { label: 'Current Streak', val: stats.current_streak, icon: Zap, color: '#8b5cf6' },
              { label: 'Best Score', val: stats.best_score?.toFixed(1) || '0.0', icon: Award, color: '#ec4899' },
              { label: 'Total Words', val: stats.total_words_spoken || 0, icon: Mic, color: '#14b8a6' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <s.icon size={24} color={s.color} style={{ marginBottom: '0.25rem' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>{s.val}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.5rem' }}>
             
             {/* SECTION 2: Score Trend Chart */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Performance Trend</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your overall scores over your last few debates.</p>
                <div style={{ width: '100%', height: 280, minHeight: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recentScoresData} margin={{ top: 15, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<CustomLineTooltip />} />
                      <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={4} dot={{ r: 5, fill: 'var(--accent)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* SECTION 3: Category Radar Chart */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Skill Breakdown Radar</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0rem' }}>Your average performance across all 8 skill axes.</p>
                <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="55%" data={skillData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar name="My Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
            
               {/* SECTION 5: Strongest/Weakest Callouts */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
                 <div className="card" style={{ background: isJunior ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, var(--bg-primary) 100%)', border: '1px solid #10b981', borderLeft: '6px solid #10b981' }}>
                   <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Strongest Attribute</p>
                   <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                     {stats.strongest_category ? formatCategory(stats.strongest_category) : 'N/A'}
                   </h4>
                   <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                     Avg Score: <strong style={{ color: '#10b981' }}>{stats.strongest_category && stats.category_averages ? (stats.category_averages[stats.strongest_category] || 0).toFixed(1) : '0.0'}/10</strong>
                   </p>
                 </div>

                 <div className="card" style={{ background: isJunior ? 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' : 'linear-gradient(135deg, rgba(234,88,12,0.1) 0%, var(--bg-primary) 100%)', border: '1px solid #f97316', borderLeft: '6px solid #f97316' }}>
                   <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Focus Area</p>
                   <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                     {stats.weakest_category ? formatCategory(stats.weakest_category) : 'N/A'}
                   </h4>
                   <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                     Avg Score: <strong style={{ color: '#ea580c' }}>{stats.weakest_category && stats.category_averages ? (stats.category_averages[stats.weakest_category] || 0).toFixed(1) : '0.0'}/10</strong>
                   </p>
                 </div>
               </div>

               {/* SECTION 6: Badges Collection */}
               <div className="card">
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} color="#7c3aed" /> Achievement Badges
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '1rem' }}>
                   {allBadges.length > 0 ? allBadges.map((badge, i) => (
                     <div key={i} title={badge.desc} style={{
                       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                       padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)',
                       background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                       transition: 'transform 0.2s', cursor: 'help'
                     }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                       <span style={{ fontSize: '2rem' }}>🏅</span>
                       <span style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)', lineHeight: 1.2 }}>{badge.name}</span>
                     </div>
                   )) : (
                     <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
                       You haven't earned any badges yet. Keep debating!
                     </div>
                   )}
                 </div>
               </div>

          </div>
        </>
      )}
    </div>
  );
}
