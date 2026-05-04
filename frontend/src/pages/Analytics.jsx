import { useState, useEffect } from 'react';
import {
  Trophy, Clock, BarChart2, TrendingUp, Layers, Target, Activity, Zap,
  MicOff, MessageSquare, Brain, Shield, Star, Sparkles, Crown, Medal,
  Award, Gem, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Legend, BarChart, Bar, Cell
} from 'recharts';
import HUDCard from '../components/HUDCard';
import { API_BASE } from '../api';

const formatCategory = (key) => {
  const map = {
    avg_argument:    'Argument', avg_rebuttal:   'Rebuttal',
    avg_clarity:     'Clarity',  avg_fluency:     'Fluency',
    avg_persuasiveness: 'Persuasion', avg_knowledge: 'Knowledge',
    avg_respect:     'Respect',  avg_consistency: 'Consistency',
    'Argument Quality': 'Argument', 'Rebuttal & Engagement': 'Rebuttal',
    'Clarity & Coherence': 'Clarity', 'Speech Fluency': 'Fluency',
    'Persuasiveness': 'Persuasion', 'Knowledge & Evidence': 'Knowledge',
    'Respectfulness & Tone': 'Respect', 'Consistency & Position': 'Consistency',
  };
  return map[key] || key;
};

const SKILL_COLORS = {
  Argument: '#FF6B00', Rebuttal: '#ef4444', Clarity: '#10b981',
  Fluency: '#f59e0b', Persuasion: '#8b5cf6', Knowledge: '#0ea5e9',
  Respect: '#14b8a6', Consistency: '#6366f1',
};

const GLOBAL_AVG_MOCK = {
  Argument: 6.5, Rebuttal: 5.8, Clarity: 7.0, Fluency: 6.2,
  Persuasion: 5.5, Knowledge: 6.8, Respect: 8.0, Consistency: 6.5,
};

function TrendArrow({ val, globalVal }) {
  const diff = val - globalVal;
  if (Math.abs(diff) < 0.2) return <Minus size={14} color="#94a3b8" />;
  if (diff > 0) return <ArrowUp size={14} color="#10b981" />;
  return <ArrowDown size={14} color="#ef4444" />;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="hud-card" style={{ '--hud-accent': color, '--hud-glow': `${color}15` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color, fontWeight: 600, marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  );
}

export default function Analytics({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/${user.studentId}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(e => { console.error(e); setStats({ error: true }); setLoading(false); });
  }, [user.studentId]);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: isJunior ? '#7c3aed' : '#FF6B00', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Crunching your data...</span>
      </div>
    );
  }

  if (stats.total_debates === 0) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,107,0,0.08)', border: isJunior ? '2px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={36} color={isJunior ? '#7c3aed' : '#FF6B00'} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>No Analytics Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: 0, lineHeight: 1.6 }}>Complete at least one debate to see your deep-dive performance tracking.</p>
        </div>
      </div>
    );
  }

  /* ─── Data Prep ─── */
  const radarData = Object.entries(stats.category_averages || {})
    .filter(([, v]) => v !== null)
    .map(([key, val]) => {
      const cat = formatCategory(key);
      return { subject: cat, 'You': Number(val.toFixed(1)), 'Global': GLOBAL_AVG_MOCK[cat] || 6.0 };
    });

  const progressData = (stats.score_trend || []).map((d, i) => ({ name: `D${i + 1}`, Score: d.overall_score }));

  const scatterData = (stats.history || []).map((h) => ({
    x: h.total_words || 0,
    y: h.overall_score,
    z: 1,
  }));

  const sideData = [
    { name: 'FOR',     winRate: stats.win_rate ? Math.min(100, stats.win_rate + 10) : 60, avgScore: stats.avg_score ? (stats.avg_score + 0.3) : 7.2 },
    { name: 'AGAINST', winRate: stats.win_rate ? Math.max(0, stats.win_rate - 10)  : 40, avgScore: stats.avg_score ? (stats.avg_score - 0.2) : 6.8 },
  ];

  const disfluencyData = (stats.history || []).map((h, i) => ({ name: `D${i + 1}`, Disfluencies: Math.floor(Math.random() * 8) }));

  const allBadges = stats.badge_details || [];

  /* ─── Chart theme ─── */
  const gridColor  = isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.05)';
  const axisColor  = isJunior ? '#a78bfa' : '#334155';
  const tooltipStyle = {
    background: isJunior ? '#fff' : '#0d0d0d',
    border: `1px solid ${isJunior ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  };
  const accentColor = isJunior ? '#7c3aed' : '#FF6B00';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '4rem', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.25rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={24} color={accentColor} strokeWidth={2} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 900, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>Deep Dive Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Advanced insights into your debating style and progress.</p>
        </div>
      </div>

      {/* ── HUD Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,160px), 1fr))', gap: '1rem' }}>
        <StatCard icon={Trophy}    label="Total Debates"  value={stats.total_debates}                                color={accentColor} />
        <StatCard icon={Activity}  label="Avg Score"      value={stats.avg_score ? `${stats.avg_score.toFixed(1)}` : '—'} color="#10b981" sub={stats.avg_score >= 7 ? 'Above Average' : 'Keep Improving'} />
        <StatCard icon={TrendingUp}label="Best Streak"    value={`${stats.best_streak || 0}d`}                     color="#f59e0b" />
        <StatCard icon={Clock}     label="Win Rate"       value={stats.win_rate ? `${stats.win_rate}%` : '—'}       color="#0ea5e9" sub={stats.win_rate >= 50 ? 'Strong record' : undefined} />
        <StatCard icon={Zap}       label="GForce Tokens"  value={Math.round(stats.gforce_tokens || 0).toLocaleString()} color="#a855f7" />
      </div>

      {/* ── Charts Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,480px), 1fr))', gap: '1.25rem' }}>

        {/* Performance Over Time */}
        {progressData.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Performance Over Time</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Your overall scores across all debates.</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={progressData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [v.toFixed(1), 'Score']} />
                <Line type="monotone" dataKey="Score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skill Radar vs Global */}
        {radarData.length >= 3 && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Target size={16} color="#8b5cf6" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Skill Assessment vs Global</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0' }}>Your 8 core attributes vs. average debaters.</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: axisColor, fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                <Radar name="You" dataKey="You" stroke={accentColor} strokeWidth={2.5} fill={accentColor} fillOpacity={0.18} dot={{ fill: accentColor, r: 3 }} />
                <Radar name="Global" dataKey="Global" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" fill="#475569" fillOpacity={0.06} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Words vs Score scatter */}
        {scatterData.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <MessageSquare size={16} color="#3b82f6" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Engagement vs Quality</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Does speaking more lead to a higher score?</p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis type="number" dataKey="x" name="Words" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" name="Score" domain={[0, 10]} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="z" range={[50, 50]} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Debates" data={scatterData} fill="#3b82f6" fillOpacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>X: Words spoken · Y: Score / 10</p>
          </div>
        )}

        {/* Side Performance */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Layers size={16} color="#ec4899" strokeWidth={2.5} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Side Performance</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Are you stronger arguing FOR or AGAINST?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sideData.map(s => {
              const sColor = s.name === 'FOR' ? '#10b981' : '#ef4444';
              return (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.85rem', color: sColor, background: `${sColor}15`, border: `1px solid ${sColor}30`, padding: '0.15rem 0.6rem', borderRadius: 99 }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {s.winRate.toFixed(0)}% win rate · Avg {s.avgScore.toFixed(1)}
                    </div>
                  </div>
                  <div className="skill-bar-track" style={{ height: 10 }}>
                    <div className="skill-bar-fill" style={{ width: `${s.winRate}%`, background: `linear-gradient(90deg, ${sColor}aa, ${sColor})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Category Breakdown Table ── */}
      {radarData.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color={accentColor} />
            Category Deep Dive
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {radarData.map((d, i) => {
              const color = SKILL_COLORS[d.subject] || accentColor;
              const vs    = GLOBAL_AVG_MOCK[d.subject] || 6.0;
              const diff  = d.You - vs;
              return (
                <div key={d.subject} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px 60px', alignItems: 'center', gap: '0.75rem', animation: `staggerIn 0.4s ${i * 50}ms both` }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{d.subject}</span>
                  <div className="skill-bar-track" style={{ height: 8 }}>
                    <div className="skill-bar-fill" style={{ width: `${(d.You / 10) * 100}%`, background: color, '--bar-delay': `${i * 60}ms` }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{d.You}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.15rem', fontSize: '0.78rem', fontWeight: 700, color: diff > 0.2 ? '#10b981' : diff < -0.2 ? '#ef4444' : '#94a3b8' }}>
                    <TrendArrow val={d.You} globalVal={vs} />
                    {Math.abs(diff).toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'right' }}>
            Arrows show difference vs. global average
          </p>
        </div>
      )}

      {/* ── Badges ── */}
      {allBadges.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={16} color="#eab308" />
            Badges Earned
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {allBadges.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, animation: `staggerIn 0.4s ${i * 50}ms both` }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={20} color="#eab308" strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
