const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

const startMark = '{/* SECTION 6: Badges Collection */}';
const endMark = '               </div>\r\n\r\n          </div>';

const startIdx = c.indexOf(startMark);
const endIdx = c.indexOf(endMark, startIdx);

console.log('Start:', startIdx, 'End:', endIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found');
  process.exit(1);
}

const newBadgeSection = `{/* SECTION 6: Badge Wall — All 25 Badges Always Visible */}
               <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Award size={18} color="#7c3aed" /> Achievement Badges
                    </h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {earnedIds.size}/{ALL_BADGES.length} Earned
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
                    {ALL_BADGES.map((badge) => {
                      const earned = earnedIds.has(badge.id);
                      return (
                        <div key={badge.id} title={badge.desc} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                          padding: '0.85rem 0.5rem', borderRadius: '14px',
                          background: earned ? \`linear-gradient(135deg, \${badge.color}22 0%, var(--bg-tertiary) 100%)\` : 'var(--bg-tertiary)',
                          border: earned ? \`1px solid \${badge.color}66\` : '1px dashed rgba(255,255,255,0.08)',
                          transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'help',
                          opacity: earned ? 1 : 0.38,
                          position: 'relative',
                          boxShadow: earned ? \`0 4px 12px \${badge.color}22\` : 'none'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = earned ? '1' : '0.38'; }}
                        >
                          {earned && <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '0.5rem', color: badge.color, fontWeight: 900 }}>✓</div>}
                          <span style={{ fontSize: '1.75rem', filter: earned ? 'none' : 'grayscale(100%)' }}>{badge.icon}</span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, textAlign: 'center', color: earned ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.2 }}>{badge.name}</span>
                          {!earned && <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>🔒</span>}
                        </div>
                      );
                    })}
                  </div>
               </div>\r\n\r\n          </div>`;

c = c.substring(0, startIdx) + newBadgeSection + c.substring(endIdx + endMark.length);
fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);

console.log('SUCCESS');
console.log('Has ALL_BADGES:', c.includes('ALL_BADGES'));
console.log('Has earnedIds.size:', c.includes('earnedIds.size'));
console.log('Has Conqueror:', c.includes('Conqueror'));
