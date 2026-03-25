import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Shield, Filter, Search, ChevronLeft, ChevronRight, BarChart2, TrendingUp, Mic, Globe } from 'lucide-react';

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

// Fallback Zap icon
const Zap = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

const CATEGORY_TABS = [
  { id: 'global', label: 'Global Rank', icon: Globe },
  { id: 'avg_argument', label: 'Top Arguers', icon: Shield },
  { id: 'avg_rebuttal', label: 'Best Rebuttlers', icon: Zap }, // We need to import Zap if used
  { id: 'avg_fluency', label: 'Most Fluent', icon: Mic },
];

const TIME_TABS = [
  { id: 'all_time', label: 'All Time' },
  { id: 'season', label: 'This Season' },
  { id: 'month', label: 'This Month' },
  { id: 'week', label: 'This Week' }
];

// Module-level caches
const leaderboardCache = new Map();
const countCache = new Map();

export default function Leaderboard({ user }) {
  const [classFilter] = useState(user?.classLevel || '');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [timeframe, setTimeframe] = useState('all_time');
  const [category, setCategory] = useState('global');
  const [page, setPage] = useState(1);
  const limit = 50;

  const defaultCacheKey = `timeframe=${timeframe}&category=${category}&level=${classFilter}&limit=${limit}&offset=${(page - 1) * limit}`;

  const [leaders, setLeaders] = useState(() => leaderboardCache.get(defaultCacheKey) || []);
  const [totalCount, setTotalCount] = useState(() => countCache.get(defaultCacheKey) || 0);
  const [loading, setLoading] = useState(!leaderboardCache.has(defaultCacheKey));
  
  // Filters & Pagination State

  useEffect(() => {
    const fetchLeaders = async () => {
      // Build query string
      const params = new URLSearchParams();
      if (timeframe !== 'all_time') params.append('timeframe', timeframe);
      if (category !== 'global') params.append('category', category);
      if (classFilter) params.append('level', classFilter);
      if (schoolFilter) params.append('school', schoolFilter);
      params.append('limit', limit);
      params.append('offset', (page - 1) * limit);

      const cacheKey = params.toString();
      
      if (leaderboardCache.has(cacheKey)) {
        setLeaders(leaderboardCache.get(cacheKey));
        setTotalCount(countCache.get(cacheKey) || 0);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(`/api/leaderboard?${cacheKey}`);
        if (res.ok) {
          const data = await res.json();
          const pLeaders = data.leaderboard || [];
          const pCount = data.total_count || 0;
          
          leaderboardCache.set(cacheKey, pLeaders);
          countCache.set(cacheKey, pCount);
          
          setLeaders(pLeaders);
          setTotalCount(pCount);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [timeframe, category, classFilter, schoolFilter, page]);

  // Find current user position if they are in the current page results
  const currentUserEntry = leaders.find(l => l.user_id === user.studentId || l.username === user.name);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
      
      {/* Header & Basic Info */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Trophy size={32} color="#f59e0b" />
          Debate Arena Rankings
        </h2>
        <p className="text-secondary" style={{ fontSize: '1.05rem' }}>Compete globally and climb the tiers.</p>
      </div>

      {/* SECTION 1: Time Period Tabs & Category Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         {/* Categories */}
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
           {CATEGORY_TABS.map(tab => {
             const active = category === tab.id;
             const TabIcon = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => { setCategory(tab.id); setPage(1); }}
                 style={{
                   display: 'flex', alignItems: 'center', gap: '0.4rem',
                   padding: '0.6rem 1.25rem', borderRadius: '99px',
                   background: active ? 'var(--accent)' : 'var(--bg-primary)',
                   color: active ? '#fff' : 'var(--text-secondary)',
                   border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                   fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                   boxShadow: active ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
                   transition: 'all 0.2s'
                 }}
               >
                 <TabIcon size={16} color={active ? '#fff' : 'var(--text-muted)'} /> {tab.label}
               </button>
             )
           })}
         </div>

         {/* Timeframes */}
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', width: 'fit-content', margin: '0 auto' }}>
           {TIME_TABS.map(tab => (
             <button
               key={tab.id}
               onClick={() => { setTimeframe(tab.id); setPage(1); }}
               style={{
                 padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
                 background: timeframe === tab.id ? 'var(--bg-primary)' : 'transparent',
                 color: timeframe === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                 border: 'none', fontWeight: timeframe === tab.id ? 700 : 500,
                 fontSize: '0.85rem', cursor: 'pointer',
                 boxShadow: timeframe === tab.id ? 'var(--shadow-sm)' : 'none',
                 transition: 'all 0.2s'
               }}
             >
               {tab.label}
             </button>
           ))}
         </div>
      </div>

      {/* SECTION 3: Filters */}
      <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
           <Filter size={16} /> Filters:
         </div>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '0.3rem 0.75rem', borderRadius: '4px' }}>
              {user?.classLevel || 'Level Rank'}
            </span>
            <input 
              type="text" 
              placeholder="Search School..." 
              value={schoolFilter}
              onChange={(e) => { setSchoolFilter(e.target.value); setPage(1); }}
              className="input-field"
              style={{ width: '160px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
         </div>
      </div>

      {/* SECTION 4: Leaderboard Table Structure */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto' }} />
          </div>
        ) : leaders.length > 0 ? (
          <>
            {/* Top 3 Podium only on page 1 and Global */}
            {page === 1 && category === 'global' && classFilter === '' && leaders.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'clamp(0.5rem, 2vw, 1.5rem)', padding: '2rem 0.5rem 0 0.5rem', background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)', borderBottom: '1px solid var(--border)' }}>
                {[leaders[1], leaders[0], leaders[2]].map((leader, podiumIdx) => {
                  const realRank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
                  const heights = ['110px', '150px', '90px'];
                  return (
                    <div key={realRank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: 'clamp(80px, 20vw, 120px)' }}>
                      <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{RANK_EMOJIS[realRank]}</span>
                      <div style={{
                         width: 48, height: 48, borderRadius: '50%',
                         background: 'var(--bg-primary)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontWeight: 800, fontSize: '1.25rem', color: RANK_COLORS[realRank],
                         boxShadow: 'var(--shadow-sm)', border: `2px solid ${RANK_COLORS[realRank]}`
                      }}>
                         {leader?.username?.charAt(0).toUpperCase()}
                      </div>
                      <p style={{ fontWeight: 800, fontSize: '1rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{leader?.username}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', marginBottom: '0.5rem' }}>
                        <p className="text-secondary text-xs" style={{ fontWeight: 700 }}>{Math.round(leader?.elo_rating)} ELO</p>
                      </div>
                      <div style={{
                        width: '100%',
                        height: heights[podiumIdx],
                        background: `linear-gradient(180deg, ${RANK_COLORS[realRank]}22 0%, ${RANK_COLORS[realRank]}11 100%)`,
                        border: `2px solid ${RANK_COLORS[realRank]}40`,
                        borderBottom: 'none',
                        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                        fontSize: '1.75rem', fontWeight: 800, color: RANK_COLORS[realRank], paddingTop: '0.5rem'
                      }}>
                        {realRank + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead style={{ background: 'var(--bg-primary)' }}>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                    <th>Debater</th>
                    <th className="hide-mobile">Level</th>
                    <th style={{ textAlign: 'center' }}>Debates</th>
                    <th className="hide-mobile" style={{ textAlign: 'center' }}>Win Rate</th>
                    <th style={{ textAlign: 'right' }}>{category === 'global' ? 'ELO Rating' : 'Avg Score'}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, i) => {
                    const actualRank = leader.rank || ((page - 1) * limit + i + 1);
                    const isMe = leader.user_id === user.studentId || leader.username === user.name;
                    
                    return (
                      <tr key={i} style={{ 
                        background: isMe ? 'var(--accent-light)' : undefined,
                        borderLeft: isMe ? '4px solid var(--accent)' : '4px solid transparent',
                        transition: 'all 0.2s', cursor: 'pointer'
                      }} onMouseEnter={e => e.currentTarget.style.background = isMe ? 'var(--accent-light)' : 'var(--bg-tertiary)'} onMouseLeave={e => e.currentTarget.style.background = isMe ? 'var(--accent-light)' : 'transparent'}>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            fontWeight: 800, fontSize: actualRank <= 3 && page === 1 ? '1.25rem' : '1rem', 
                            color: actualRank <= 3 && page === 1 ? RANK_COLORS[actualRank - 1] : 'var(--text-secondary)' 
                          }}>
                            {actualRank <= 3 && page === 1 ? RANK_EMOJIS[actualRank - 1] : `#${actualRank}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: isMe ? 'var(--accent)' : 'var(--bg-tertiary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.85rem',
                              color: isMe ? '#fff' : 'var(--text-secondary)',
                            }}>
                              {leader.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: isMe ? 'var(--accent-dark)' : 'var(--text-primary)' }}>
                                {leader.username}
                                {isMe && <span className="badge badge-blue" style={{ marginLeft: '0.5rem', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>YOU</span>}
                              </span>
                              {(leader.school || leader.tier?.name) && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {leader.tier?.icon} {leader.tier?.name || 'Unranked'} &bull; {leader.school || 'Debate Arena'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hide-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{leader.class || 'Class 1-3'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>{leader.total_debates}</td>
                        <td className="hide-mobile" style={{ textAlign: 'center' }}>
                          <span style={{ 
                             background: leader.win_rate >= 50 ? '#ecfdf5' : '#fef2f2',
                             color: leader.win_rate >= 50 ? '#059669' : '#dc2626',
                             padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700
                          }}>
                            {leader.win_rate}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {category === 'global' ? (
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{Math.round(leader.elo_rating)}</span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                               <div style={{ width: 40, height: 6, background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                                 <div style={{ height: '100%', background: 'var(--accent)', width: `${(leader.avg_score / 10) * 100}%` }} />
                               </div>
                               <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent)' }}>{leader.avg_score ? leader.avg_score.toFixed(1) : '0.0'}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SECTION 6: Pagination */}
            {totalCount > limit && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                 <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                   Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount}
                 </span>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button 
                     disabled={page === 1}
                     onClick={() => setPage(p => p - 1)}
                     style={{ padding: '0.4rem 0.5rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                   ><ChevronLeft size={16} /></button>
                   <button 
                     disabled={page * limit >= totalCount}
                     onClick={() => setPage(p => p + 1)}
                     style={{ padding: '0.4rem 0.5rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', cursor: page * limit >= totalCount ? 'not-allowed' : 'pointer', opacity: page * limit >= totalCount ? 0.5 : 1 }}
                   ><ChevronRight size={16} /></button>
                 </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No leaders found</h3>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or time period.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: Sticky Current User Position Banner */}
      {!loading && !currentUserEntry && page === 1 && (
         <div style={{
            position: 'sticky', bottom: '1.5rem', left: 0, right: 0,
            background: 'var(--bg-primary)', border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-lg)', padding: '1rem',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 10
         }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem'
               }}>{user.name.charAt(0).toUpperCase()}</div>
               <div>
                 <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name} <span className="badge badge-blue ml-2">YOU</span></p>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You are not in the top {limit} for this filter.</p>
               </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your ELO</span>
               <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user.stats?.elo_rating ? Math.round(user.stats.elo_rating) : 'Unranked'}</span>
            </div>
         </div>
      )}

    </div>
  );
}
