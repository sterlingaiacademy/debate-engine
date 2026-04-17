import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Trophy, TrendingUp, BarChart2, Star, Zap, Award, Clock, MessageSquare, Mic,
  Flame, Shield, Crown, Sparkles, Target, Heart, Cpu, Sword, BookOpen, FileText, Medal,
  Gem, RefreshCw, Dumbbell, MessageCircle, Brain } from 'lucide-react';
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

export default function Dashboard({ user, setUser }) {
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
      const combinedData = { ...analyticsData, timeLimits: timeData || { remainingRanked: 600, remainingPersona: 600, error: true } };
      cachedStats = combinedData;
      cachedStudentId = activeId;
      setStats(combinedData);
      // Push live token + streak into shared user state so Layout header shows them
      if (setUser) {
        setUser(prev => {
          const updated = { ...prev, gforceTokens: Math.round(combinedData.gforce_tokens || 0), streak: combinedData.current_streak || 0, rank: combinedData.tier?.name || null };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
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
  const gforce = Math.round(stats.gforce_tokens || 0);
  const tier = stats.tier || { name: 'Unranked', icon: '⬜', color: '#94a3b8' };
  // Tier icon mapping — Lucide icons only, no emojis
  const TIER_ICON_MAP = {
    'Unranked':    <Shield size={22} color="#94a3b8" strokeWidth={2} />,
    'Bronze':      <Medal size={22} color="#cd7f32" strokeWidth={2} />,
    'Silver':      <Award size={22} color="#94a3b8" strokeWidth={2} />,
    'Gold':        <Star size={22} color="#eab308" strokeWidth={2} />,
    'Platinum':    <Gem size={22} color="#38bdf8" strokeWidth={2} />,
    'Diamond':     <Sparkles size={22} color="#818cf8" strokeWidth={2} />,
    'Master':      <Trophy size={22} color="#f97316" strokeWidth={2} />,
    'Grandmaster': <Crown size={22} color="#ec4899" strokeWidth={2} />,
  };
  const TierIcon = () => TIER_ICON_MAP[tier.name] || <Shield size={22} color={tier.color} strokeWidth={2} />;
  const dailyMins = stats?.timeLimits && !stats.timeLimits.error ? Math.floor(stats.timeLimits.remainingRanked / 60) : null;
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

  // Full badge catalog — mirrors backend leaderboard.py award() calls
  // Badge icon component lookup — NO emojis, only Lucide icons
  const BADGE_ICON_MAP = {
    first_debate:     (p) => <Flame {...p} />,
    ten_debates:      (p) => <Dumbbell {...p} />,
    fifty_debates:    (p) => <Shield {...p} />,
    hundred_debates:  (p) => <Crown {...p} />,
    score_8_plus:     (p) => <Star {...p} />,
    score_9_plus:     (p) => <Sparkles {...p} />,
    all_above_5:      (p) => <Target {...p} />,
    all_above_7:      (p) => <Gem {...p} />,
    perfect_respect:  (p) => <Heart {...p} />,
    argument_master:  (p) => <Brain {...p} />,
    rebuttal_master:  (p) => <Sword {...p} />,
    fluency_master:   (p) => <Mic {...p} />,
    evidence_master:  (p) => <BookOpen {...p} />,
    persuasion_master:(p) => <MessageSquare {...p} />,
    streak_3:         (p) => <Flame {...p} />,
    streak_5:         (p) => <Zap {...p} />,
    streak_10:        (p) => <Trophy {...p} />,
    big_improvement:  (p) => <TrendingUp {...p} />,
    words_10k:        (p) => <MessageCircle {...p} />,
    words_50k:        (p) => <FileText {...p} />,
    elo_1200:         (p) => <Medal {...p} />,
    elo_1500:         (p) => <Award {...p} />,
    elo_1800:         (p) => <Star {...p} />,
    elo_2000:         (p) => <Gem {...p} />,
    elo_2200:         (p) => <Crown {...p} />,
  };
  const ALL_BADGES = [
    { id: 'first_debate',     name: 'First Flame',    desc: 'Complete your first debate',            cat: 'Debates', color: '#f97316' },
    { id: 'ten_debates',      name: 'Contender',      desc: 'Complete 10 debates',                   cat: 'Debates', color: '#f97316' },
    { id: 'fifty_debates',    name: 'Gladiator',      desc: 'Complete 50 debates',                   cat: 'Debates', color: '#ef4444' },
    { id: 'hundred_debates',  name: 'Conqueror',      desc: 'Complete 100 debates',                  cat: 'Debates', color: '#eab308' },
    { id: 'score_8_plus',     name: 'Sharp Mind',     desc: 'Score 8.0+ in a debate',                cat: 'Quality', color: '#facc15' },
    { id: 'score_9_plus',     name: 'Elite Debater',  desc: 'Score 9.0+ in a debate',                cat: 'Quality', color: '#a855f7' },
    { id: 'all_above_5',      name: 'All-Rounder',    desc: 'Score 5+ across all categories',        cat: 'Quality', color: '#06b6d4' },
    { id: 'all_above_7',      name: 'Diamond Mind',   desc: 'Score 7+ across all categories',        cat: 'Quality', color: '#8b5cf6' },
    { id: 'perfect_respect',  name: 'Diplomat',       desc: 'Score 10/10 in Respectfulness',         cat: 'Skills',  color: '#10b981' },
    { id: 'argument_master',  name: 'The Arguer',     desc: 'Score 9+ in Argument Quality',          cat: 'Skills',  color: '#6366f1' },
    { id: 'rebuttal_master',  name: 'Rebuttal King',  desc: 'Score 9+ in Rebuttal & Engagement',     cat: 'Skills',  color: '#ef4444' },
    { id: 'fluency_master',   name: 'Orator',         desc: 'Score 9+ in Speech Fluency',            cat: 'Skills',  color: '#f59e0b' },
    { id: 'evidence_master',  name: 'Scholar',        desc: 'Score 9+ in Knowledge & Evidence',      cat: 'Skills',  color: '#0ea5e9' },
    { id: 'persuasion_master',name: 'Persuader',      desc: 'Score 9+ in Persuasiveness',            cat: 'Skills',  color: '#d946ef' },
    { id: 'streak_3',         name: 'On a Roll',      desc: 'Debate 3 days in a row',                cat: 'Streaks', color: '#f97316' },
    { id: 'streak_5',         name: 'Fire Streak',    desc: 'Debate 5 days in a row',                cat: 'Streaks', color: '#ef4444' },
    { id: 'streak_10',        name: 'Unstoppable',    desc: 'Debate 10 days in a row',               cat: 'Streaks', color: '#eab308' },
    { id: 'big_improvement',  name: 'Rising Star',    desc: 'Improve score 2+ pts in a row',         cat: 'Growth',  color: '#10b981' },
    { id: 'words_10k',        name: 'Wordsmith',      desc: 'Speak 10,000+ words total',             cat: 'Growth',  color: '#06b6d4' },
    { id: 'words_50k',        name: 'Grand Orator',   desc: 'Speak 50,000+ words total',             cat: 'Growth',  color: '#8b5cf6' },
    { id: 'elo_1200',         name: 'Bronze Mind',    desc: 'Reach 1,200 Gforce Tokens',             cat: 'Tokens',  color: '#cd7f32' },
    { id: 'elo_1500',         name: 'Silver Tongue',  desc: 'Reach 1,500 Gforce Tokens',             cat: 'Tokens',  color: '#94a3b8' },
    { id: 'elo_1800',         name: 'Gold Debater',   desc: 'Reach 1,800 Gforce Tokens',             cat: 'Tokens',  color: '#eab308' },
    { id: 'elo_2000',         name: 'Sapphire Elite', desc: 'Reach 2,000 Gforce Tokens',             cat: 'Tokens',  color: '#38bdf8' },
    { id: 'elo_2200',         name: 'Amethyst',       desc: 'Reach 2,200 Gforce Tokens',             cat: 'Tokens',  color: '#a855f7' },
  ];
  const earnedSet = new Set((stats.badges || []).map(b => b.id || b));

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
      
      {/* ═══ COMPACT HERO CARD — profile + all stats in one row ═══ */}
      <div className="card" style={{
        background: `linear-gradient(135deg, ${tier.color}12 0%, var(--bg-tertiary) 100%)`,
        borderLeft: `5px solid ${tier.color}`,
        padding: '1.25rem 1.5rem',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem'
      }}>
        {/* LEFT: Avatar + Name + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            background: `linear-gradient(135deg, ${tier.color}66, ${tier.color}33)`,
            border: `2px solid ${tier.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 900, color: '#fff',
            overflow: 'hidden'
          }}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user.name?.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{user.name}</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Debater</span>
              {user.classLevel && <><span style={{ opacity: 0.4 }}>•</span><span style={{ color: tier.color, fontWeight: 700 }}>{user.grade ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade) : user.classLevel.replace('Level', 'Grade')}</span></>}
            </p>
          </div>
        </div>

        {/* RIGHT: Compact stat chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Tokens */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: '12px', padding: '0.5rem 0.85rem'
          }}>
            <Zap size={15} color="#a78bfa" strokeWidth={2.5} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Tokens</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{gforce.toLocaleString()}</div>
            </div>
          </div>

          {/* Tier */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: `${tier.color}12`, border: `1px solid ${tier.color}33`,
            borderRadius: '12px', padding: '0.5rem 0.85rem'
          }}>
            <TierIcon />
            <div>
              <div style={{ fontSize: '0.62rem', color: tier.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Rank</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{tier.name}</div>
            </div>
          </div>

          {/* Debates */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '12px', padding: '0.5rem 0.85rem'
          }}>
            <Trophy size={15} color="#34d399" strokeWidth={2.5} />
            <div>
              <div style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Debates</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{stats.total_debates || 0}</div>
            </div>
          </div>

          {/* Daily Time */}
          {dailyMins !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)',
              borderRadius: '12px', padding: '0.5rem 0.85rem'
            }}>
              <Clock size={15} color="#7c3aed" strokeWidth={2.5} />
              <div>
                <div style={{ fontSize: '0.62rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Free Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{dailyMins}m</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEBATE MODE TILES — always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
        
        {/* TILE 1: Debate Arena */}
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
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Ranked Match</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              {isJunior ? 'Fun Debate Practice' : 'Debate Arena'}
            </h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.85, margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
              {isJunior 
                ? 'Have a fun voice debate with your very own AI buddy. Practice speaking and learn new ideas!'
                : 'Go head-to-head with the AI in a competitive ranked debate. Earn Gforce Tokens and climb the leaderboard.'}
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

        {/* TILE 3: Model UN — Level 5 Premium only */}
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

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(251,191,36,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🏛️
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fbbf24', opacity: 0.9 }}>UN Simulation</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: '#fef3c7' }}>Model UN</h2>
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

        {/* TILE 4: Super Tutor (Levels 3, 4, 5) */}
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
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Conversational AI</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Super Tutor</h2>
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
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Complete your first debate to unlock analytics, Gforce Tokens, and skill breakdowns.</p>
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


          {/* SECTION: Referral Gamification Widget */}
          <div className="card" style={{ 
            marginTop: '1rem', marginBottom: '1rem', padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(232,57,42,0.1) 100%)', 
            border: '1px solid rgba(249,115,22,0.3)', borderRadius: '16px',
            display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
                <Zap size={20} color="#f97316" /> Refer Friends to Earn Tokens
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '450px', lineHeight: 1.5 }}>
                Share your unique code with friends. When they sign up using your code, they get early access capital (+150 Tokens) and you instantly receive <strong style={{color:'#f97316'}}>+200 Gforce Tokens!</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Your Referral Code</span>
                <span style={{ fontSize: '1.15rem', color: '#f97316', fontWeight: 800, letterSpacing: '2px', userSelect: 'all' }}>
                  {user?.studentId || user?.username || 'GFORCE'}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  navigator.clipboard.writeText(user?.studentId || user?.username || '');
                  const originalText = e.currentTarget.innerText;
                  e.currentTarget.innerText = 'Copied!';
                  setTimeout(() => e.currentTarget.innerText = originalText, 2000);
                }} 
                style={{ 
                  marginLeft: '0.5rem', background: '#f97316', color: '#fff', border: 'none', 
                  borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, 
                  cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap'
                }}>
                Copy Link
              </button>
            </div>
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

               {/* SECTION 6: Badge Wall — All 25 Badges Always Visible */}
               <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Award size={18} color="#7c3aed" /> Achievement Badges
                    </h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {earnedSet.size}/{ALL_BADGES.length} Earned
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
                    {ALL_BADGES.map((badge) => {
                      const earned = earnedSet.has(badge.id);
                      return (
                        <div key={badge.id} title={badge.desc} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                          padding: '0.85rem 0.5rem', borderRadius: '14px',
                          background: earned ? `linear-gradient(135deg, ${badge.color}22 0%, var(--bg-tertiary) 100%)` : 'var(--bg-tertiary)',
                          border: earned ? `1px solid ${badge.color}66` : '1px dashed rgba(255,255,255,0.08)',
                          transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'help',
                          opacity: earned ? 1 : 0.38,
                          position: 'relative',
                          boxShadow: earned ? `0 4px 12px ${badge.color}22` : 'none'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = earned ? '1' : '0.38'; }}
                        >
                          {earned && <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '0.5rem', color: badge.color, fontWeight: 900 }}>✓</div>}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: earned ? badge.color + '22' : 'rgba(255,255,255,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: earned ? '1px solid ' + badge.color + '55' : '1px solid rgba(255,255,255,0.08)',
                          }}>
                            {BADGE_ICON_MAP[badge.id]?.({ size: 18, color: earned ? badge.color : '#475569', strokeWidth: 2 })}
                          </div>
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, textAlign: 'center', color: earned ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.2 }}>{badge.name}</span>
                          {!earned && <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>—</div>}
                        </div>
                      );
                    })}
                  </div>
               </div>

          </div>
        </>
      )}

      {/* REFERRAL SHARE & EARN WIDGET */}
      {!isJunior && (() => {
        const refCode = user?.studentId || user?.username || '';
        const refUrl = `https://graceandforce.com/register?ref=${refCode}`;
        const waMsg = encodeURIComponent(`Join me on G Force AI! Use my link to get +150 bonus tokens: ${refUrl}`);
        return (
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div>
                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>🎁 Share & Earn Gforce Tokens</h3>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Invite friends. They get <strong style={{color:'#a78bfa'}}>+150 Tokens</strong>, you get <strong style={{color:'#34d399'}}>+200 Tokens</strong>!</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                   <code style={{ background: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent)', border: '1px solid var(--border)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {refUrl}
                   </code>
                   <button
                      onClick={() => { navigator.clipboard.writeText(refUrl); }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', fontWeight: 700 }}
                   >
                      📋 Copy Link
                   </button>
                   <a
                      href={`https://wa.me/?text=${waMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#25D366', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
                   >
                      📲 WhatsApp
                   </a>
                </div>
             </div>
          </div>
        );
      })()}
    </div>
  );
}
