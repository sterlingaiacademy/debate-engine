const fs = require('fs');

// ============================================================
// DASHBOARD REDESIGN — compact hero card, no space waste
// RULE: NEVER change the color palette
// ============================================================

let dash = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// 1. Add tier icon mapping right after tier definition (line ~103)
const oldTierDef = `const tier = stats.tier || { name: 'Unranked', icon: '⬜', color: '#94a3b8' };`;
const newTierDef = `const tier = stats.tier || { name: 'Unranked', icon: '⬜', color: '#94a3b8' };
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
  const dailyMins = stats?.timeLimits && !stats.timeLimits.error ? Math.floor(stats.timeLimits.remainingRanked / 60) : null;`;

if (dash.includes(oldTierDef)) {
  dash = dash.replace(oldTierDef, newTierDef);
  console.log('Tier defs: OK');
} else {
  console.log('WARN: tier def not found');
}

// 2. Replace Section 1 (profile card) + GFORCE TOKEN HERO CARDS with new compact hero card
// Find from "SECTION 1: Profile Header" to end of the stats grid closing </div> + blank line before DEBATE MODE TILES
const SECTION1_START = `      {/* SECTION 1: Profile Header & Actions */}`;
const SECTION1_END = `\r\r\n      {/* DEBATE MODE TILES — always visible */}`;
const SECTION1_END_ALT = `\r\n\r\n\r\n      {/* DEBATE MODE TILES — always visible */}`;
const SECTION1_END_ALT2 = `\n\n      {/* DEBATE MODE TILES — always visible */}`;

const newHeroCard = `      {/* ═══ COMPACT HERO CARD — profile + all stats in one row ═══ */}
      <div className="card" style={{
        background: \`linear-gradient(135deg, \${tier.color}12 0%, var(--bg-tertiary) 100%)\`,
        borderLeft: \`5px solid \${tier.color}\`,
        padding: '1.25rem 1.5rem',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem'
      }}>
        {/* LEFT: Avatar + Name + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            background: \`linear-gradient(135deg, \${tier.color}66, \${tier.color}33)\`,
            border: \`2px solid \${tier.color}55\`,
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
              {user.classLevel && <><span style={{ opacity: 0.4 }}>•</span><span style={{ color: tier.color, fontWeight: 700 }}>{user.classLevel}</span></>}
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
            background: \`\${tier.color}12\`, border: \`1px solid \${tier.color}33\`,
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

`;

let found = false;
const idx1 = dash.indexOf(SECTION1_START);
let idx2 = dash.indexOf(SECTION1_END, idx1);
if (idx2 === -1) idx2 = dash.indexOf(SECTION1_END_ALT, idx1);
if (idx2 === -1) idx2 = dash.indexOf(SECTION1_END_ALT2, idx1);

if (idx1 !== -1 && idx2 !== -1) {
  dash = dash.substring(0, idx1) + newHeroCard + '      {/* DEBATE MODE TILES — always visible */' + dash.substring(idx2 + SECTION1_END.length);
  found = true;
  console.log('Hero card replaced: OK');
} else {
  console.log('Section markers not found. idx1:', idx1, 'idx2:', idx2);
  // Show what we find near DEBATE MODE TILES for debugging
  const di = dash.indexOf('DEBATE MODE TILES');
  console.log('DEBATE MODE context:', JSON.stringify(dash.substring(di - 50, di)));
}

if (found) {
  fs.writeFileSync('frontend/src/pages/Dashboard.jsx', dash);
  console.log('Dashboard saved');
  console.log('Has TierIcon:', dash.includes('<TierIcon />'));
  console.log('Has hero card:', dash.includes('COMPACT HERO CARD'));
}
