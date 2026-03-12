import { useState, useEffect } from 'react';
import { Trophy, Clock, BarChart2, TrendingUp } from 'lucide-react';

export default function Analytics({ user }) {
  const [stats, setStats] = useState(null);
  const isJunior = user.classLevel === 'Class 1-3';

  useEffect(() => {
    fetch(`http://localhost:5000/api/analytics/${user.studentId}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ averageScore: 0, debatesCompleted: 0, speakingTime: 0 }));
  }, [user.studentId]);

  if (!stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
      </div>
    );
  }

  const summaryCards = [
    { icon: Trophy,    iconClass: 'orange', label: 'Total Debates',   value: stats.debatesCompleted },
    { icon: BarChart2, iconClass: 'blue',   label: 'Average Score',   value: `${Math.round(stats.averageScore)}%` },
    { icon: Clock,     iconClass: 'purple', label: 'Speaking Time',   value: `${Math.floor(stats.speakingTime / 60)}m` },
    { icon: TrendingUp,iconClass: 'green',  label: 'Improvement Rate',value: '+12%' },
  ];

  const mockChartData = [42, 58, 55, 72, 68, 81, 85];
  const maxH = Math.max(...mockChartData);

  const badges = [
    { emoji: '🏅', title: 'First Debate', earned: stats.debatesCompleted >= 1 },
    { emoji: '🥇', title: 'Top Scorer',   earned: stats.averageScore >= 80 },
    { emoji: '🎤', title: 'Speaker',      earned: stats.speakingTime >= 300 },
    { emoji: '⭐', title: 'Star Student', earned: stats.debatesCompleted >= 5 },
  ];

  const skillBreakdown = [
    { name: 'Argument Strength', val: 72 },
    { name: 'Logical Reasoning', val: 80 },
    { name: 'Confidence',        val: 65 },
    { name: 'Persuasiveness',    val: 77 },
    { name: 'Clarity',           val: 83 },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            {isJunior ? '⭐ My Progress' : 'Analytics'}
          </h2>
          <p className="text-secondary">Track your debate journey — Grace and Force AI</p>
        </div>
        {isJunior && (
          <span style={{ fontSize: '2.5rem' }} className="animate-bounce">🌟</span>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid-4">
        {summaryCards.map(({ icon: Icon, iconClass, label, value }) => (
          <div className="stats-card" key={label}>
            <div className={`stats-icon ${iconClass}`}><Icon size={20} /></div>
            <div className="stats-value">{value}</div>
            <div className="stats-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Chart and Skill breakdown */}
      <div className="grid-2">
        {/* Bar Chart */}
        <div className="card">
          <p style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>Performance Trend</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '160px', padding: '0 0.5rem' }}>
            {mockChartData.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}%</span>
                <div style={{
                  width: '100%',
                  height: `${(h / maxH) * 130}px`,
                  background: isJunior
                    ? `linear-gradient(180deg, #fb7185 0%, #a855f7 100%)`
                    : `linear-gradient(180deg, var(--accent) 0%, #6366f1 100%)`,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.6s ease',
                  cursor: 'pointer',
                  opacity: i === mockChartData.length - 1 ? 1 : 0.7,
                }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>D{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-muted text-xs" style={{ textAlign: 'center', marginTop: '0.75rem' }}>Last 7 debate sessions</p>
        </div>

        {/* Badges / Skills */}
        <div className="card">
          {isJunior ? (
            <>
              <p style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>🏆 Achievement Badges</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {badges.map(({ emoji, title, earned }) => (
                  <div key={title} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
                    padding: '1rem', borderRadius: 'var(--radius-lg)',
                    background: earned ? 'linear-gradient(135deg, #fdf4ff, #eff6ff)' : 'var(--bg-tertiary)',
                    border: `1.5px solid ${earned ? 'rgba(168,85,247,0.25)' : 'var(--border)'}`,
                    opacity: earned ? 1 : 0.45,
                    transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: '2rem' }}>{emoji}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: earned ? '#7c3aed' : 'var(--text-muted)' }}>{title}</span>
                    {earned && <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 600 }}>Earned!</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>Skill Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {skillBreakdown.map(({ name, val }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{val}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
