import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Trophy, TrendingUp, BarChart2, Star, Zap, Award, Clock,
  MessageSquare, Mic, Flame, Shield, Crown, Sparkles, Target, Heart,
  Sword, BookOpen, FileText, Medal, Gem, RefreshCw, Dumbbell, MessageCircle,
  Brain, Globe, Users, ChevronRight, Cpu, Radio
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import HUDCard from '../components/HUDCard';
import { API_BASE } from '../api';
import PremiumEnrollModal from '../components/PremiumEnrollModal';

/* ─── Helpers ─── */
const formatCategory = (key) => {
  const map = {
    avg_argument: 'Argument', avg_rebuttal: 'Rebuttal', avg_clarity: 'Clarity',
    avg_fluency: 'Fluency', avg_persuasiveness: 'Persuasion', avg_knowledge: 'Knowledge',
    avg_respect: 'Respect', avg_consistency: 'Consistency',
    'Argument Quality': 'Argument', 'Rebuttal & Engagement': 'Rebuttal',
    'Clarity & Coherence': 'Clarity', 'Speech Fluency': 'Fluency',
    'Persuasiveness': 'Persuasion', 'Knowledge & Evidence': 'Knowledge',
    'Respectfulness & Tone': 'Respect', 'Consistency & Position': 'Consistency',
  };
  return map[key] || key;
};

function getScoreBar(val, color) {
  return (
    <div className="skill-bar-track" style={{ height: 6, marginTop: 4 }}>
      <div
        className="skill-bar-fill"
        style={{
          width: `${(val / 10) * 100}%`,
          background: color,
          '--bar-delay': '100ms',
        }}
      />
    </div>
  );
}

let cachedStats = null;
let cachedStudentId = null;

/* ─── Mode card data ─── */
const SENIOR_MODES = [
  {
    id: 'debate',
    title: 'Debate Arena',
    desc: '1-on-1 ranked debate with AI. Earn GForce tokens and climb the global leaderboard.',
    tag: 'RANKED',
    icon: Zap,
    color: '#FF6B00',
    grad: 'linear-gradient(135deg, #1c0a00, #3d1200)',
    glow: 'rgba(255,107,0,0.35)',
    available: true,
    path: (isJunior) => isJunior ? '/debate' : '/debate-instructions?next=/debate',
  },
  {
    id: 'mock-un',
    title: 'Model UN',
    desc: 'Represent your country in a global diplomacy session. Negotiate, persuade, and lead.',
    tag: 'WORLD STAGE',
    icon: Globe,
    color: '#00d4ff',
    grad: 'linear-gradient(135deg, #00101a, #001f36)',
    glow: 'rgba(0,212,255,0.25)',
    path: () => '/debate-instructions?next=/mock-un',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
  {
    id: 'persona',
    title: 'Wisdom Arena',
    desc: 'Step into the shoes of historical legends — debate as Gandhi, Churchill, or Lincoln.',
    tag: 'ROLEPLAY',
    icon: Users,
    color: '#a855f7',
    grad: 'linear-gradient(135deg, #0d001a, #1b0036)',
    glow: 'rgba(168,85,247,0.3)',
    path: () => '/debate-instructions?next=/persona',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
  {
    id: 'supertutor',
    title: 'Super Tutor',
    desc: 'Your personal AI coach. Ask questions, drill concepts, and sharpen your technique.',
    tag: 'COACHING',
    icon: Brain,
    color: '#10b981',
    grad: 'linear-gradient(135deg, #001a11, #002a1a)',
    glow: 'rgba(16,185,129,0.25)',
    path: () => '/conversational-agent',
    available: true,
  },
  {
    id: 'speech-coach',
    title: 'Speech Coach',
    desc: 'Work on your vocal clarity, pacing, and delivery with your personal AI speech trainer.',
    tag: 'SPEECH',
    icon: Radio,
    color: '#e879f9',
    grad: 'linear-gradient(135deg, #1a001f, #2d0040)',
    glow: 'rgba(232,121,249,0.25)',
    path: () => '/speech-coach',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
];

const JUNIOR_MODES = [
  { id: 'debate', title: 'Debate Practice', desc: 'Talk with your AI friend and practice speaking!', color: '#7c3aed', grad: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: Mic, path: () => '/debate' },
  { id: 'mock-un', title: 'Model UN', desc: 'Be a world leader and discuss big ideas!', color: '#0ea5e9', grad: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', icon: Globe, path: () => '/mock-un', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'persona', title: 'Famous Figures', desc: 'Debate as legendary heroes from history!', color: '#d946ef', grad: 'linear-gradient(135deg, #d946ef, #a855f7)', icon: Users, path: () => '/persona', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'supertutor', title: 'Super Tutor', desc: 'Ask your AI any question — it always helps!', color: '#10b981', grad: 'linear-gradient(135deg, #10b981, #34d399)', icon: Brain, path: () => '/conversational-agent' },
  { id: 'speech-coach', title: 'Speech Coach', desc: 'Improve your speaking skills with AI voice training!', color: '#e879f9', grad: 'linear-gradient(135deg, #e879f9, #a855f7)', icon: Radio, path: () => '/speech-coach', levels: ['Level 3', 'Level 4', 'Level 5'] },
];

const BADGE_ICON_MAP = {
  first_debate: Flame, ten_debates: Dumbbell, fifty_debates: Shield, hundred_debates: Crown,
  score_8_plus: Star, score_9_plus: Sparkles, all_above_5: Target, all_above_7: Gem,
  perfect_respect: Heart, argument_master: Brain, rebuttal_master: Sword, fluency_master: Mic,
  evidence_master: BookOpen, persuasion_master: MessageSquare, streak_3: Flame, streak_5: Zap,
  streak_10: Trophy, big_improvement: TrendingUp, words_10k: MessageCircle, words_50k: FileText,
  elo_1200: Medal, elo_1500: Award, elo_1800: Star, elo_2000: Gem, elo_2200: Crown,
};

const ALL_BADGES = [
  { id: 'first_debate',     name: 'First Flame',    desc: 'Complete your first debate',           color: '#f97316' },
  { id: 'ten_debates',      name: 'Contender',      desc: 'Complete 10 debates',                  color: '#f97316' },
  { id: 'fifty_debates',    name: 'Gladiator',      desc: 'Complete 50 debates',                  color: '#ef4444' },
  { id: 'hundred_debates',  name: 'Conqueror',      desc: 'Complete 100 debates',                 color: '#eab308' },
  { id: 'score_8_plus',     name: 'Sharp Mind',     desc: 'Score 8.0+ in a debate',               color: '#facc15' },
  { id: 'score_9_plus',     name: 'Elite Debater',  desc: 'Score 9.0+ in a debate',               color: '#a855f7' },
  { id: 'all_above_5',      name: 'All-Rounder',    desc: 'Score 5+ in all categories',           color: '#06b6d4' },
  { id: 'all_above_7',      name: 'Diamond Mind',   desc: 'Score 7+ in all categories',           color: '#8b5cf6' },
  { id: 'perfect_respect',  name: 'Diplomat',       desc: 'Score 10/10 in Respectfulness',        color: '#10b981' },
  { id: 'argument_master',  name: 'The Arguer',     desc: 'Score 9+ in Argument Quality',         color: '#6366f1' },
  { id: 'rebuttal_master',  name: 'Rebuttal King',  desc: 'Score 9+ in Rebuttal',                 color: '#ef4444' },
  { id: 'fluency_master',   name: 'Orator',         desc: 'Score 9+ in Speech Fluency',           color: '#f59e0b' },
  { id: 'evidence_master',  name: 'Scholar',        desc: 'Score 9+ in Knowledge',                color: '#0ea5e9' },
  { id: 'persuasion_master',name: 'Persuader',      desc: 'Score 9+ in Persuasiveness',           color: '#d946ef' },
  { id: 'streak_3',         name: 'On a Roll',      desc: 'Debate 3 days in a row',               color: '#f97316' },
  { id: 'streak_5',         name: 'Fire Streak',    desc: 'Debate 5 days in a row',               color: '#ef4444' },
  { id: 'streak_10',        name: 'Unstoppable',    desc: 'Debate 10 days in a row',              color: '#eab308' },
  { id: 'big_improvement',  name: 'Rising Star',    desc: 'Improve score 2+ pts in a row',        color: '#10b981' },
  { id: 'words_10k',        name: 'Wordsmith',      desc: 'Speak 10k+ words total',               color: '#06b6d4' },
  { id: 'words_50k',        name: 'Grand Orator',   desc: 'Speak 50k+ words total',               color: '#8b5cf6' },
  { id: 'elo_1200',         name: 'Bronze Mind',    desc: 'Reach 1,200 tokens',                   color: '#cd7f32' },
  { id: 'elo_1500',         name: 'Silver Tongue',  desc: 'Reach 1,500 tokens',                   color: '#94a3b8' },
  { id: 'elo_1800',         name: 'Gold Debater',   desc: 'Reach 1,800 tokens',                   color: '#eab308' },
  { id: 'elo_2000',         name: 'Sapphire Elite', desc: 'Reach 2,000 tokens',                   color: '#38bdf8' },
  { id: 'elo_2200',         name: 'Amethyst',       desc: 'Reach 2,200 tokens',                   color: '#a855f7' },
];

const TIER_ICON_MAP = {
  Unranked: <Shield size={20} color="#64748b" strokeWidth={2} />,
  Bronze:   <Medal size={20} color="#cd7f32" strokeWidth={2} />,
  Silver:   <Award size={20} color="#94a3b8" strokeWidth={2} />,
  Gold:     <Star  size={20} color="#eab308" strokeWidth={2} />,
  Platinum: <Gem   size={20} color="#38bdf8" strokeWidth={2} />,
  Diamond:  <Sparkles size={20} color="#818cf8" strokeWidth={2} />,
  Master:   <Trophy size={20} color="#f97316" strokeWidth={2} />,
  Grandmaster: <Crown size={20} color="#ec4899" strokeWidth={2} />,
};

const StatBadge = ({ icon: Icon, label, value, color, isJunior }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: isJunior ? '#fff' : `${color}10`, 
    border: `1.5px solid ${color}30`,
    padding: '0.5rem 0.85rem', borderRadius: 16,
    whiteSpace: 'nowrap', flexShrink: 0,
    boxShadow: isJunior ? `0 4px 12px ${color}15` : 'none',
  }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color={color} strokeWidth={2.5} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: isJunior ? 'var(--j-text)' : 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isJunior ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                            */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(() =>
    (user?.studentId || user?.username) === cachedStudentId ? cachedStats : null
  );
  const [loading, setLoading] = useState(!stats);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, msg: '', type: '' });

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus({ loading: true, msg: '', type: '' });
    try {
      const activeId = user?.studentId || user?.username;
      const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: activeId, couponCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponStatus({ loading: false, msg: data.message, type: 'success' });
        setCouponCode('');
        // School/plan upgrade code
        if (data.plan) {
          const updatedUser = { ...user, subscription_plan: data.plan, subscription_status: 'active' };
          if (setUser) setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Clear stats cache so dashboard re-fetches fresh time limits on return
          cachedStats = null;
          cachedStudentId = null;
          // Navigate to the congratulations page (same as Razorpay flow)
          setTimeout(() => navigate(`/premium-success?plan=${data.plan}`), 800);
        } else {
          // Regular time coupon — optimistically add seconds
          if (stats && stats.timeLimits && !stats.timeLimits.error) {
            const bonusSeconds = couponCode.toUpperCase() === 'VVIP30' ? 1800 : 600;
            setStats(prev => ({
              ...prev,
              timeLimits: {
                ...prev.timeLimits,
                remainingRanked: prev.timeLimits.remainingRanked + bonusSeconds,
                limitTotal: prev.timeLimits.limitTotal + bonusSeconds
              }
            }));
          }
          setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
        }
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Failed to redeem', type: 'error' });
        setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
      }
    } catch (err) {
      setCouponStatus({ loading: false, msg: 'Network error', type: 'error' });
    }
  };

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);

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
  const isBasicLevel = ['Level 1', 'Level 2'].includes(normalizedLevel);

  useEffect(() => {
    const activeId = user?.studentId || user?.username;
    if (!activeId) return;
    if (activeId === cachedStudentId && cachedStats) {
      setStats(cachedStats); setLoading(false);
    }
    Promise.all([
      fetch(`${API_BASE}/api/analytics/${activeId}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API_BASE}/api/time-limits/${activeId}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => null),
    ]).then(([analyticsData, timeData]) => {
      const combined = { ...analyticsData, timeLimits: timeData || { remainingRanked: 600, error: true } };
      cachedStats = combined; cachedStudentId = activeId;
      setStats(combined);
      if (setUser) setUser(prev => {
        const updated = { ...prev, gforceTokens: Math.round(combined.gforce_tokens || 0), streak: combined.current_streak || 0, rank: combined.tier?.name || null };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      setLoading(false);
    }).catch(() => { setStats(prev => prev || { error: true }); setLoading(false); });
  }, [user?.studentId, user?.username]);

  if (!user) return null;

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: isJunior ? '#7c3aed' : '#FF6B00', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Loading your stats...</span>
      </div>
    );
  }

  /* ─── Data ─── */
  const gforce = Math.round(stats.gforce_tokens || 0);
  const tier = stats.tier || { name: 'Unranked', color: '#64748b' };
  const TierIcon = () => TIER_ICON_MAP[tier.name] || <Shield size={20} color={tier.color} />;
  const dailyMins = stats?.timeLimits && !stats.timeLimits.error ? Math.floor(stats.timeLimits.remainingRanked / 60) : null;
  const earnedSet = new Set((stats.badges || []).map(b => b.id || b));
  const earnedBadges = ALL_BADGES.filter(b => earnedSet.has(b.id));
  const lockedBadges = ALL_BADGES.filter(b => !earnedSet.has(b.id));
  const displayBadges = [...earnedBadges, ...lockedBadges].slice(0, 12);

  const recentScoresData = (stats.score_trend || []).map((d, i) => ({ name: `#${i + 1}`, score: d.overall_score }));
  const skillData = Object.entries(stats.category_averages || {})
    .filter(([, val]) => val !== null)
    .map(([key, val]) => ({ subject: formatCategory(key), A: val, fullMark: 10 }));

  const modes = isJunior ? JUNIOR_MODES : SENIOR_MODES;
  const availableModes = modes.filter(m => {
    // Level 1 & 2 only have one debate agent — hide Super Tutor and Speech Coach
    if (isBasicLevel && (m.id === 'supertutor' || m.id === 'speech-coach')) return false;
    // If mode has a levels array, only show for those levels
    if (m.levels) return m.levels.includes(normalizedLevel);
    // If mode has an accessKey, only show for that exact level
    if (m.accessKey) {
      return normalizedLevel === m.accessKey;
    }
    return true; // no accessKey = always available
  });

  /* ─── Chart theming ─── */
  const chartBg    = isJunior ? '#fff' : 'transparent';
  const gridColor  = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.05)';
  const axisColor  = isJunior ? '#a78bfa' : '#334155';
  const lineColor  = isJunior ? '#7c3aed' : '#FF6B00';
  const radarFill  = isJunior ? 'rgba(124,58,237,0.12)' : 'rgba(255,107,0,0.1)';
  const radarStroke= isJunior ? '#7c3aed' : '#FF6B00';

  /* ══════════════════════════════════════════════════════════
     SENIOR DASHBOARD
  ══════════════════════════════════════════════════════════ */
  if (!isJunior) return (
    <>
      {showPremiumModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.85)', overflowY: 'auto' }}>
          <PremiumEnrollModal user={user} onDismiss={() => setShowPremiumModal(false)} />
        </div>
      )}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '4rem' }}>

      {/* ── Hero Greeting ── */}
      <div className="welcome-card" style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 24, padding: '2rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(0,0,0,0) 60%)',
        border: '1px solid rgba(255,107,0,0.12)',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
              Welcome back
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              <span className="gradient-text">{user.name}</span>
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.2rem' }}>
              @{user.studentId}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#fb923c', lineHeight: 1, height: 26, boxSizing: 'border-box' }}>
                <Flame size={12} strokeWidth={2.5} />
                {stats.current_streak || 0} Day Streak
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: `${tier.color}15`, border: `1px solid ${tier.color}30`, borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: tier.color }}>
                <TierIcon />
                {tier.name}
              </div>
              {user.classLevel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    {user.grade
                      ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                      : user.classLevel}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', color: '#FF6B00', padding: '0.1rem 0.4rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                    {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'PRO' : 'DEMO'}
                  </div>
                </div>
              )}
              
              {/* Redeem Coupon Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
                {!showCoupon ? (
                  <div
                    onClick={() => setShowCoupon(true)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: 99, padding: '3px 10px',
                      fontSize: 12, fontWeight: 700, color: '#fb923c',
                      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                      lineHeight: 1, height: 26, boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; }}
                  >
                    Redeem
                  </div>
                ) : couponStatus.msg ? (
                  // Inline success/error message inside the pill
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: couponStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${couponStatus.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 99, padding: '3px 10px',
                    fontSize: 12, fontWeight: 700,
                    color: couponStatus.type === 'success' ? '#10b981' : '#ef4444',
                    lineHeight: 1, height: 26, boxSizing: 'border-box', whiteSpace: 'nowrap',
                  }}>
                    {couponStatus.msg}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.25)',
                    borderRadius: 99, padding: '0.15rem 0.3rem 0.15rem 0.65rem',
                    animation: 'fadeIn 0.2s'
                  }}>
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        background: 'transparent', border: 'none', color: '#FF6B00', width: '90px', fontSize: '0.72rem',
                        fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none', letterSpacing: '0.05em',
                      }}
                      autoFocus
                      onBlur={() => { if (!couponCode && !couponStatus.loading) setShowCoupon(false); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
                    />
                    <button
                      onClick={handleRedeemCoupon}
                      disabled={couponStatus.loading || !couponCode.trim()}
                      style={{
                        background: couponCode.trim() ? '#FF6B00' : 'rgba(255,255,255,0.08)',
                        color: '#fff', border: 'none', padding: '0.2rem 0.65rem', borderRadius: 99,
                        fontSize: '0.7rem', fontWeight: 800,
                        cursor: couponStatus.loading || !couponCode.trim() ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s', opacity: couponCode.trim() ? 1 : 0.5,
                      }}
                    >
                      {couponStatus.loading ? '...' : 'APPLY'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {dailyMins !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Daily Time Left</span>
                <span style={{ color: '#FF6B00' }}>{dailyMins}m</span>
              </div>
              <div className="xp-track" style={{ height: 6 }}>
                <div className="xp-fill" style={{ width: `${Math.min((dailyMins / 60) * 100, 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Demo Account Upgrade Banner (Senior) */}
        {(!user?.subscription_plan || user?.subscription_plan === 'free') && stats?.timeLimits && stats.timeLimits.remainingRanked <= 0 && (
          <div 
            onClick={() => setShowPremiumModal(true)}
            style={{ 
              position: 'relative', zIndex: 2, marginTop: '2rem', padding: '1rem 1.25rem', borderRadius: 16, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.05))',
              border: '1px solid rgba(255,107,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(255,107,0,0.1)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,107,0,0.08))'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.05))'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: 'rgba(255,107,0,0.2)', color: '#FF6B00', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Crown size={22} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.01em' }}>Demo Account</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upgrade to Pro to unlock unlimited time and features!</span>
              </div>
            </div>
            <div style={{ background: '#FF6B00', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}>
              Upgrade Now <ChevronRight size={16} />
            </div>
          </div>
        )}
      </div>

      {/* ── Event Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Mini MUN Sunday Tile */}
        <div
          onClick={() => navigate('/mini-mun')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(59,130,246,0.18)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #ef4444)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              LIVE SESSIONS
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#3b82f6" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            <span style={{ color: '#3b82f6' }}>Mini</span> MUN <span style={{ color: '#ef4444' }}>Sunday</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
            MUN lessons for students every Sunday 10am to 11am. Practice speech, debate, and diplomacy!
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6' }}>
            Register Now (₹99) <ChevronRight size={14} />
          </div>
        </div>

        {/* MUN Mentor Master Class Tile */}
        <div
          onClick={() => navigate('/mun-mentor')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #0c0e1a 0%, #0e1525 100%)',
            border: '1px solid rgba(251,191,36,0.18)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(251,191,36,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FBBF24, #F97316)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              MASTER CLASS
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color="#FBBF24" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            MUN <span style={{ color: '#FBBF24' }}>Mentor</span> Master Class
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
            A Certificate Programme for Teachers & MUN Coordinators. Duration: 10 Days • Fridays & Saturdays Evening.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#FBBF24' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>

        {/* G-Talk Cohort Tile */}
        <div
          onClick={() => navigate('/cohort')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e0f2d 0%, #291244 100%)',
            border: '1px solid rgba(168,85,247,0.18)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,85,247,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #a855f7, #d946ef)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#a855f7', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              LIVE COHORT 2.0
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#a855f7" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            G-Talk <span style={{ color: '#a855f7' }}>Cohort 2</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
            Master Public Speaking & Debating with live online sessions, interactive exercises, and peer feedback.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#a855f7' }}>
            Learn More <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* ── Mode Cards ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Choose Your Mode</h2>
        </div>
        <div className="no-scrollbar modes-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px), 1fr))', gap: '1rem' }}>
          {availableModes.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => navigate(mode.path(isJunior))}
                className="mode-card"
                style={{
                  '--mode-glow': `0 0 40px ${mode.glow || 'transparent'}`,
                  background: mode.grad,
                  border: `1px solid ${mode.color}25`,
                  color: '#fff',
                  minHeight: 200,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  animation: `cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                }}
              >
                {/* Top dec */}
                <div style={{ position: 'absolute', top: -24, right: -24, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${mode.color}1a 0%, transparent 70%)`, pointerEvents: 'none' }} />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${mode.color}25`, border: `1px solid ${mode.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={mode.color} strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: mode.color, background: `${mode.color}18`, border: `1px solid ${mode.color}30`, padding: '0.2rem 0.6rem', borderRadius: 99 }}>
                      {mode.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>{mode.title}</h3>
                  <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0, lineHeight: 1.55 }}>{mode.desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: mode.color }}>
                  <span>Start Now</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Stats (Minimized) ── */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <StatBadge icon={Trophy} label="Total Debates" value={stats.total_debates || 0} color="#FF6B00" />
        <StatBadge icon={Star} label="Avg Score" value={stats.avg_score ? `${stats.avg_score.toFixed(1)}` : '—'} color="#00d4ff" />
        <StatBadge icon={Flame} label="Best Streak" value={`${stats.best_streak || 0}d`} color="#f59e0b" />
        <StatBadge icon={Zap} label="GForce Tokens" value={gforce.toLocaleString()} color="#a855f7" />
      </div>

      {/* ── Charts Row ── */}
      {(skillData.length > 0 || recentScoresData.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px), 1fr))', gap: '1.25rem' }}>

          {/* Radar — Skill Profile */}
          {skillData.length >= 3 && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Skill Profile</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Debate Skills Radar</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={skillData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="A" stroke={radarStroke} fill={radarFill} strokeWidth={2} dot={{ fill: radarStroke, r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line — Score Trend */}
          {recentScoresData.length > 0 && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Performance</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Score Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={recentScoresData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9' }}
                    formatter={(v) => [v.toFixed(1), 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke={lineColor} strokeWidth={2.5} dot={{ fill: lineColor, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Badges ── */}
      {displayBadges.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Achievements</h2>
            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{earnedBadges.length} / {ALL_BADGES.length} unlocked</span>
          </div>
          <div className="no-scrollbar" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', width: 'max-content' }}>
              {displayBadges.map(badge => {
                const isEarned = earnedSet.has(badge.id);
                const BIcon = BADGE_ICON_MAP[badge.id] || Star;
                return (
                  <div key={badge.id} className={`badge-slot ${isEarned ? 'earned' : 'locked'}`} title={badge.desc}>
                    <div className="badge-icon-wrap" style={{ background: isEarned ? `${badge.color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${isEarned ? badge.color + '35' : 'rgba(255,255,255,0.06)'}`, color: badge.color }}>
                      <BIcon size={24} strokeWidth={2} color={isEarned ? badge.color : '#475569'} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isEarned ? '#e2e8f0' : '#334155', textAlign: 'center', maxWidth: 76, lineHeight: 1.25 }}>
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );

  /* ══════════════════════════════════════════════════════════
     JUNIOR DASHBOARD
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      {showPremiumModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', overflowY: 'auto' }}>
          <PremiumEnrollModal user={user} onDismiss={() => setShowPremiumModal(false)} />
        </div>
      )}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* ── Hero Welcome Card ── */}
      <div className="welcome-card" style={{
        borderRadius: 28, padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #e879f9 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(124,58,237,0.4)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0 }}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : user.name?.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.1rem' }}>Welcome back!</div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{user.name}</h1>
            <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700, marginTop: '0.1rem' }}>
              @{user.studentId}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                <Flame size={12} />
                {stats.current_streak || 0} Day Streak
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                  {user.grade
                    ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                    : user.classLevel}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, background: '#fff', color: '#7c3aed', padding: '0.1rem 0.4rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                  {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'PRO' : 'DEMO'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Account Upgrade Banner (Junior) */}
        {(!user?.subscription_plan || user?.subscription_plan === 'free') && stats?.timeLimits && stats.timeLimits.remainingRanked <= 0 && (
          <div 
            onClick={() => setShowPremiumModal(true)}
            style={{ 
              position: 'relative', zIndex: 2, marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 20, cursor: 'pointer',
              background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#fff', color: '#7c3aed', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Crown size={24} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Demo Account</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Upgrade to Pro for unlimited fun!</span>
              </div>
            </div>
            <div style={{ background: '#fff', color: '#7c3aed', padding: '0.6rem 1.25rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Upgrade <ChevronRight size={16} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* ── Mode Cards ── */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 1rem', color: 'var(--j-text)' }}>Let's Practice!</h2>
        <div className="no-scrollbar modes-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px), 1fr))', gap: '1rem' }}>
          {availableModes.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => navigate(mode.path(true))}
                style={{
                  background: mode.grad,
                  borderRadius: 24, padding: '1.5rem',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  minHeight: 160,
                  boxShadow: `0 6px 24px ${mode.color}30`,
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
                  position: 'relative', overflow: 'hidden',
                  animation: `cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 40px ${mode.color}45`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${mode.color}30`; }}
              >
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{mode.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.45 }}>{mode.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Stats (Minimized) ── */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <StatBadge icon={Trophy} label="Debates" value={stats.total_debates || 0} color="#7c3aed" isJunior />
        <StatBadge icon={Star} label="Avg Score" value={stats.avg_score ? `${stats.avg_score.toFixed(1)}` : '—'} color="#f43f5e" isJunior />
        <StatBadge icon={Zap} label="Tokens" value={gforce.toLocaleString()} color="#f59e0b" isJunior />
      </div>

      {/* ── Skill Radar (Junior) ── */}
      {skillData.length >= 3 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--j-text)' }}>Your Skills</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#7c3aed', fontSize: 11, fontWeight: 700 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="You" dataKey="A" stroke="#7c3aed" fill="rgba(124,58,237,0.12)" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Badges ── */}
      {displayBadges.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--j-text)' }}>Your Badges</h2>
            <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700 }}>{earnedBadges.length} earned</span>
          </div>
          <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', width: 'max-content' }}>
              {displayBadges.map(badge => {
                const isEarned = earnedSet.has(badge.id);
                const BIcon = BADGE_ICON_MAP[badge.id] || Star;
                return (
                  <div key={badge.id} className={`badge-slot ${isEarned ? 'earned' : 'locked'}`} title={badge.desc}
                    style={isEarned ? { animation: 'badgeUnlock 0.5s cubic-bezier(0.16,1,0.3,1) both' } : {}}>
                    <div className="badge-icon-wrap" style={{ background: `${badge.color}15`, border: `1.5px solid ${badge.color}30`, borderRadius: 14 }}>
                      <BIcon size={24} strokeWidth={2} color={isEarned ? badge.color : '#a78bfa'} />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isEarned ? 'var(--j-text)' : '#a78bfa', textAlign: 'center', maxWidth: 76, lineHeight: 1.25 }}>
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
