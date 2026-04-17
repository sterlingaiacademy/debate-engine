const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

const tokenCard = `
      {/* GFORCE TOKEN HERO CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: '1rem'
      }}>
        {/* Token Balance */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #0f172a 100%)',
          border: '1px solid rgba(139,92,246,0.35)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(139,92,246,0.08)' }} />
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(139,92,246,0.4)', flexShrink: 0
          }}>
            <span style={{ fontSize: '1.6rem' }}>⚡</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#a78bfa' }}>Gforce Tokens</p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{gforce.toLocaleString()}</p>
          </div>
        </div>

        {/* Tier Card */}
        <div style={{
          background: \`linear-gradient(135deg, \${tier.color}22 0%, #0f172a 100%)\`,
          border: \`1px solid \${tier.color}55\`,
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: \`\${tier.color}10\` }} />
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: \`linear-gradient(135deg, \${tier.color}99, \${tier.color})\`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: \`0 4px 20px \${tier.color}55\`, flexShrink: 0, fontSize: '2rem'
          }}>
            {tier.icon}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: tier.color }}>Current Tier</p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{tier.name}</p>
          </div>
        </div>

        {/* Debates stat */}
        <div style={{
          background: 'linear-gradient(135deg, #0c1a12 0%, #0f172a 100%)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16,185,129,0.06)' }} />
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(16,185,129,0.4)', flexShrink: 0
          }}>
            <span style={{ fontSize: '1.6rem' }}>🏆</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#34d399' }}>Debates</p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{stats.total_debates || 0}</p>
          </div>
        </div>
      </div>
\r`;

// Insert after the profile header closing div (line 150-151 area)
const marker = '      </div>\r\n\r\n      {/* DEBATE MODE TILES';
const replacement = '      </div>\r\n' + tokenCard + '\r\n      {/* DEBATE MODE TILES';
if (c.includes(marker)) {
  c = c.replace(marker, replacement);
  fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);
  console.log('Token cards injected:', c.includes('Gforce Tokens'));
} else {
  console.log('Marker not found, trying alternate...');
  // Try with different line endings
  const marker2 = '      </div>\n\n      {/* DEBATE MODE TILES';
  const rep2 = '      </div>\n' + tokenCard.replace(/\r/g, '') + '\n      {/* DEBATE MODE TILES';
  if (c.includes(marker2)) {
    c = c.replace(marker2, rep2);
    fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);
    console.log('Token cards injected (LF):', c.includes('Gforce Tokens'));
  } else {
    console.log('Still not found, dumping nearby content...');
    const idx = c.indexOf('DEBATE MODE TILES');
    console.log(JSON.stringify(c.substring(idx - 100, idx + 50)));
  }
}
