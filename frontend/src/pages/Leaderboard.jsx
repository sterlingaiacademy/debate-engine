import { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ user }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isJunior = user.classLevel === 'Class 1-3';

  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then((r) => r.json())
      .then((data) => { setLeaders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <Trophy size={30} color="#f59e0b" />
          Leaderboard — Grace and Force AI
        </h2>
        <p className="text-secondary">Top-performing debaters ranked by score</p>
      </div>

      {/* Top 3 Podium (when data available) */}
      {leaders.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
          {[leaders[1], leaders[0], leaders[2]].map((leader, podiumIdx) => {
            const realRank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
            const heights = ['100px', '140px', '80px'];
            return (
              <div key={realRank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{RANK_EMOJIS[realRank]}</span>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem', textAlign: 'center', maxWidth: '100px' }}>{leader?.name}</p>
                <p className="text-muted text-xs">{Math.round(leader?.averageScore)}%</p>
                <div style={{
                  width: '80px',
                  height: heights[podiumIdx],
                  background: `linear-gradient(180deg, ${RANK_COLORS[realRank]}33 0%, ${RANK_COLORS[realRank]}99 100%)`,
                  border: `2px solid ${RANK_COLORS[realRank]}`,
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {realRank + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto' }} />
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Debates</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaders.length > 0 ? leaders.map((leader, i) => {
                  const isMe = leader.name === user.name;
                  return (
                    <tr key={i} style={{ background: isMe ? 'var(--accent-light)' : undefined }}>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: i < 3 ? '1.25rem' : '1rem', color: i < 3 ? RANK_COLORS[i] : 'var(--text-primary)' }}>
                          {i < 3 ? RANK_EMOJIS[i] : `#${i + 1}`}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: isMe ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.875rem',
                            color: isMe ? 'var(--accent)' : 'var(--text-secondary)',
                            flexShrink: 0,
                          }}>
                            {leader.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>
                            {leader.name}
                            {isMe && <span className="badge badge-blue" style={{ marginLeft: '0.5rem' }}>You</span>}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${leader.classLevel === 'Class 1-3' ? 'badge-purple' : 'badge-blue'}`}>
                          {leader.classLevel}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{leader.debatesCompleted}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: 60, height: 6, background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent)', width: `${leader.averageScore}%`, borderRadius: '99px' }} />
                          </div>
                          <span style={{ fontWeight: 700, minWidth: '40px' }}>{Math.round(leader.averageScore)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No data yet. Complete your first debate to appear here!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
