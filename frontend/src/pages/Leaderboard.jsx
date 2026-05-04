import { useState, useEffect } from 'react';
import {
  Trophy, Medal, Star, Shield, Award, Gem, Sparkles, Crown,
  TrendingUp, Mic, Globe, Filter, ChevronLeft, ChevronRight, Zap, Flame
} from 'lucide-react';
import { API_BASE } from '../api';

const TIER_COLORS = {
  Unranked: '#64748b', Bronze: '#cd7f32', Silver: '#94a3b8',
  Gold: '#f59e0b', Platinum: '#38bdf8', Diamond: '#818cf8',
  Master: '#f97316', Grandmaster: '#ec4899',
};
const TIER_ICONS = {
  Unranked: Shield, Bronze: Medal, Silver: Award, Gold: Star,
  Platinum: Gem, Diamond: Sparkles, Master: Trophy, Grandmaster: Crown,
};

const CATEGORY_TABS = [
  { id: 'global',      label: 'Global',       icon: Globe },
  { id: 'top_streaks', label: 'Streaks',      icon: Flame },
  { id: 'avg_argument',label: 'Top Arguers',  icon: Shield },
  { id: 'avg_rebuttal',label: 'Rebuttlers',   icon: Zap },
  { id: 'avg_fluency', label: 'Fluency',      icon: Mic },
];

const TIME_TABS = [
  { id: 'all_time', label: 'All Time' },
  { id: 'season',   label: 'Season' },
  { id: 'month',    label: 'Month' },
  { id: 'week',     label: 'Week' },
];

const leaderboardCache = new Map();
const countCache = new Map();

export default function Leaderboard({ user }) {
  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);

  const [classFilter]   = useState(user?.classLevel || '');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [timeframe,    setTimeframe]    = useState('all_time');
  const [category,    setCategory]     = useState('global');
  const [page,        setPage]         = useState(1);
  const limit = 50;

  const buildKey = () => {
    const p = new URLSearchParams();
    if (timeframe !== 'all_time') p.append('timeframe', timeframe);
    if (category !== 'global')  p.append('category', category);
    if (classFilter)             p.append('level', classFilter);
    if (schoolFilter)            p.append('school', schoolFilter);
    p.append('limit', limit);
    p.append('offset', (page - 1) * limit);
    return p.toString();
  };

  const [leaders,    setLeaders]    = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let cancelled = false;
    const key = buildKey();
    if (leaderboardCache.has(key)) {
      setLeaders(leaderboardCache.get(key));
      setTotalCount(countCache.get(key) || 0);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/leaderboard?${key}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (cancelled) return;
        const rows = data.leaderboard || [];
        const cnt  = data.total_count || 0;
        leaderboardCache.set(key, rows);
        countCache.set(key, cnt);
        setLeaders(rows);
        setTotalCount(cnt);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [timeframe, category, classFilter, schoolFilter, page]);

  const currentUserEntry = leaders.find(l => l.user_id === user.studentId || l.username === user.name);

  const accentColor = isJunior ? '#7c3aed' : '#FF6B00';
  const accentBg    = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,107,0,0.1)';
  const accentBorder= isJunior ? 'rgba(124,58,237,0.25)' : 'rgba(255,107,0,0.25)';

  const tabBtn = (active, label, icon, onClick) => {
    const Icon = icon;
    return (
      <button
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1.1rem', borderRadius: 99,
          background: active ? accentColor : 'transparent',
          color: active ? '#fff' : 'var(--text-secondary)',
          border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
          fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <Icon size={15} /> {label}
      </button>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1100, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 8px 32px rgba(245,158,11,0.4)', marginBottom: '1rem' }}>
          <Trophy size={32} color="#fff" strokeWidth={2} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, margin: '0 0 0.4rem', letterSpacing: '-0.03em' }}>
          {isJunior ? 'Top Debaters' : 'Debate Arena Rankings'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
          Compete globally and climb the tiers.
        </p>
      </div>

      {/* ── Tab Controls ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
          {CATEGORY_TABS.map(t => tabBtn(category === t.id, t.label, t.icon, () => { setCategory(t.id); setPage(1); }))}
        </div>

        {/* Timeframe tabs */}
        <div style={{
          display: 'flex', gap: '0.2rem',
          background: isJunior ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isJunior ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 99, padding: '0.2rem',
        }}>
          {TIME_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTimeframe(t.id); setPage(1); }}
              style={{
                padding: '0.4rem 1rem', borderRadius: 99,
                background: timeframe === t.id ? accentColor : 'transparent',
                color: timeframe === t.id ? '#fff' : 'var(--text-muted)',
                border: 'none', fontWeight: 700, fontSize: '0.825rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── School Filter ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 99, padding: '0.3rem 0.85rem' }}>
          <Filter size={13} />
          {user?.grade
            ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
            : (user?.classLevel || 'All Levels')}
        </div>
        <input
          type="text"
          placeholder="Filter by school..."
          value={schoolFilter}
          onChange={e => { setSchoolFilter(e.target.value); setPage(1); }}
          className="input-field"
          style={{ width: 180, padding: '0.4rem 0.875rem', fontSize: '0.85rem', borderRadius: 99 }}
        />
      </div>

      {/* ── Main Table ── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
            <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.07)', borderTopColor: accentColor, borderRadius: '50%' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading rankings...</span>
          </div>
        ) : leaders.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trophy size={28} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No leaders found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Try adjusting your filters or time period.</p>
          </div>
        ) : (
          <>
            {/* ── Podium (page 1, global) ── */}
            {page === 1 && category === 'global' && leaders.length >= 3 && (
              <div style={{
                padding: '2rem 1rem 0',
                background: isJunior
                  ? 'linear-gradient(180deg, rgba(124,58,237,0.06), transparent)'
                  : 'linear-gradient(180deg, rgba(245,158,11,0.06), transparent)',
                borderBottom: `1px solid ${isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'clamp(0.6rem, 3vw, 2rem)', paddingBottom: '0' }}>
                  {/* Render: 2nd, 1st, 3rd */}
                  {[leaders[1], leaders[0], leaders[2]].map((leader, podIdx) => {
                    const realRank = [1, 0, 2][podIdx]; // index into leaders[]
                    const displayRank = realRank + 1;
                    const podClass = ['silver','gold','bronze'][podIdx];
                    const podH = [80, 110, 60][podIdx];
                    const goldColors = ['#C0C0C0', '#FFD700', '#CD7F32'];
                    const glowColors = ['rgba(192,192,192,0.3)', 'rgba(255,215,0,0.5)', 'rgba(205,127,50,0.3)'];
                    const tierColor = TIER_COLORS[leader?.tier?.name] || '#64748b';
                    const TierIcon = TIER_ICONS[leader?.tier?.name] || Shield;
                    return (
                      <div key={realRank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: 'clamp(80px, 14vw, 120px)' }}>
                        {/* Avatar */}
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${goldColors[podIdx]}40, ${goldColors[podIdx]}20)`,
                          border: `2.5px solid ${goldColors[podIdx]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1.3rem', color: goldColors[podIdx],
                          boxShadow: `0 4px 20px ${glowColors[podIdx]}`,
                          flexShrink: 0,
                        }}>
                          {leader?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                            {leader?.username}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: tierColor, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                            <TierIcon size={11} /> {leader?.tier?.name || 'Unranked'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {Math.round(leader?.gforce_tokens || 0)} pts
                          </div>
                        </div>
                        {/* Platform */}
                        <div style={{
                          width: '100%', height: podH,
                          background: `linear-gradient(180deg, ${goldColors[podIdx]}30, ${goldColors[podIdx]}10)`,
                          border: `1.5px solid ${goldColors[podIdx]}40`,
                          borderBottom: 'none',
                          borderRadius: '10px 10px 0 0',
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                          paddingTop: '0.6rem',
                          fontSize: '1.6rem', fontWeight: 900, color: goldColors[podIdx],
                          boxShadow: `0 -4px 24px ${glowColors[podIdx]}`,
                        }}>
                          {displayRank}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Main Table ── */}
            <div style={{ padding: '0.75rem 0' }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 100px 80px 120px',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderBottom: `1px solid ${isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.05)'}`,
                fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.07em', color: 'var(--text-muted)',
              }}>
                <div style={{ textAlign: 'center' }}>Rank</div>
                <div>Debater</div>
                <div className="hide-mobile">Grade</div>
                <div style={{ textAlign: 'center' }}>Debates</div>
                <div style={{ textAlign: 'right' }}>
                  {category === 'global' ? 'Tokens' : category === 'top_streaks' ? 'Streak' : 'Avg Score'}
                </div>
              </div>

              {/* Rows */}
              {leaders.map((leader, i) => {
                const actualRank = leader.rank || ((page - 1) * limit + i + 1);
                const isMe = leader.user_id === user.studentId || leader.username === user.name;
                const tierC = TIER_COLORS[leader.tier?.name] || '#64748b';
                const TierIcon = TIER_ICONS[leader.tier?.name] || Shield;
                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                const isTop3 = actualRank <= 3 && page === 1;

                return (
                  <div
                    key={i}
                    className={`rank-row ${isMe ? 'is-me' : ''}`}
                    style={{
                      gridTemplateColumns: '56px 1fr 100px 80px 120px',
                      display: 'grid',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      '--row-delay': `${i * 30}ms`,
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isTop3 ? (
                        <span style={{ fontWeight: 900, fontSize: '1.3rem', color: rankColors[actualRank - 1] }}>{actualRank}</span>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>#{actualRank}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: isMe
                          ? (isJunior ? 'linear-gradient(135deg, #7c3aed, #e879f9)' : 'linear-gradient(135deg, #E8392A, #FF6B00)')
                          : (isTop3 ? `${rankColors[actualRank - 1]}25` : 'rgba(255,255,255,0.06)'),
                        border: isTop3 ? `1.5px solid ${rankColors[actualRank - 1]}50` : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.9rem',
                        color: isMe ? '#fff' : (isTop3 ? rankColors[actualRank - 1] : 'var(--text-muted)'),
                      }}>
                        {leader.username?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {leader.username}
                          {isMe && (
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, background: accentColor, color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 4, letterSpacing: '0.04em' }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: tierC, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <TierIcon size={10} /> {leader.tier?.name || 'Unranked'}
                        </div>
                      </div>
                    </div>

                    {/* Grade */}
                    <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {leader.grade
                        ? (leader.grade.startsWith('Class') ? leader.grade.replace('Class', 'Grade') : leader.grade)
                        : (leader.class || '—')}
                    </div>

                    {/* Debates */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {leader.total_debates}
                    </div>

                    {/* Value */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {category === 'global' ? (
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: isTop3 ? rankColors[actualRank - 1] : 'var(--text-primary)' }}>
                          {Math.round(leader.gforce_tokens)}
                        </span>
                      ) : category === 'top_streaks' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, fontSize: '0.95rem', color: '#f97316' }}>
                          <Flame size={14} strokeWidth={2.5} />
                          {leader.longest_streak || leader.current_streak || 0}d
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: accentColor, width: `${(leader.avg_score / 10) * 100}%`, borderRadius: 99, transition: 'width 0.6s' }} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: accentColor }}>
                            {leader.avg_score ? leader.avg_score.toFixed(1) : '—'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalCount > limit && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderTop: `1px solid ${isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.05)'}`,
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {(page - 1) * limit + 1} – {Math.min(page * limit, totalCount)} of {totalCount}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[{ icon: ChevronLeft, disabled: page === 1, onClick: () => setPage(p => p - 1) },
                    { icon: ChevronRight, disabled: page * limit >= totalCount, onClick: () => setPage(p => p + 1) }
                  ].map(({ icon: Icon, disabled, onClick }, i) => (
                    <button key={i} disabled={disabled} onClick={onClick} style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: isJunior ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isJunior ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.08)'}`,
                      color: 'var(--text-secondary)', cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky "You are not on page" banner */}
      {!loading && !currentUserEntry && page === 1 && (
        <div style={{
          position: 'sticky', bottom: '1.5rem',
          background: isJunior ? 'rgba(255,255,255,0.95)' : 'rgba(15,15,15,0.95)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${accentBorder}`,
          borderRadius: 16, padding: '1rem 1.25rem',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {user.name} <span style={{ fontSize: '0.65rem', fontWeight: 800, background: accentColor, color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 4 }}>YOU</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not in the top {limit} for this filter.</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Tokens</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accentColor }}>{user.stats?.gforce_tokens ? Math.round(user.stats.gforce_tokens) : '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
