const fs = require('fs');
let layout = fs.readFileSync('frontend/src/components/Layout.jsx', 'utf8');

// Add tier pill between token pill and streak pill
const oldTokenPill = `                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: '20px', padding: '0.3rem 0.65rem',
                  fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa'
                }}>
                  <Zap size={13} strokeWidth={2.5} />
                  {(user.gforceTokens || 0).toLocaleString()}
                </div>`;

const newTokenAndRankPill = `                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: '20px', padding: '0.3rem 0.65rem',
                  fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa'
                }}>
                  <Zap size={13} strokeWidth={2.5} />
                  {(user.gforceTokens || 0).toLocaleString()}
                </div>
                {user.rank && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
                    borderRadius: '20px', padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem', fontWeight: 800, color: '#facc15'
                  }}>
                    <Award size={13} strokeWidth={2.5} />
                    {user.rank}
                  </div>
                )}`;

if (layout.includes(oldTokenPill)) {
  layout = layout.replace(oldTokenPill, newTokenAndRankPill);
  console.log('Rank pill added: OK');
} else {
  console.log('Token pill not found');
}

fs.writeFileSync('frontend/src/components/Layout.jsx', layout);
console.log('Layout saved. Has rank pill:', layout.includes('user.rank'));
