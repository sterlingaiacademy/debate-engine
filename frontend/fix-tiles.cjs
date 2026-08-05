const fs = require('fs');
const path = 'src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change grid to auto-fill
content = content.replace(
  "gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))'",
  "gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))'"
);

// 2. Fix ThinkQuest Centering
// Find: <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginBottom: '0.85rem' }}>
// And: textAlign: 'center'
content = content.replace(
  /<div style={{ display: 'flex', justifyContent: 'center', gap: '0\.5rem', alignItems: 'center', marginBottom: '0\.85rem' }}>/g,
  "<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>"
);
content = content.replace(
  /<div style={{ fontSize: '1\.15rem', fontWeight: 900, color: '#fff', marginBottom: '0\.25rem', letterSpacing: '-0\.01em', textAlign: 'center' }}>/g,
  "<div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>"
);
content = content.replace(
  /<div style={{ fontSize: '0\.8rem', color: 'var\(--text-secondary, #94a3b8\)', marginBottom: '1rem', lineHeight: 1\.5, textAlign: 'center' }}>/g,
  "<div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '1rem', lineHeight: 1.5 }}>"
);
content = content.replace(
  /<div style={{ fontSize: '0\.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1\.5, textAlign: 'center' }}>/g,
  "<div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>"
);
content = content.replace(
  /<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0\.4rem', fontSize: '0\.82rem', fontWeight: 700, color: '#ef4444' }}>/g,
  "<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>"
);
content = content.replace(
  /<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0\.4rem', fontSize: '0\.82rem', fontWeight: 700, color: '#eab308' }}>/g,
  "<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#eab308' }}>"
);

// 3. Change "Speak English Without Fear" color from blue to teal (#14b8a6)
// The English Session Tile currently uses blue (#3b82f6, #60a5fa, #93c5fd, #1e3a8a, #020617)
// Let's replace the block for English Session.
const englishSessionStart = content.indexOf('{/* English Session Tile */}');
const nextTile = content.indexOf('{/* Freedom Quiz Tile */}');
if (englishSessionStart !== -1 && nextTile !== -1) {
  let englishBlock = content.substring(englishSessionStart, nextTile);
  
  // Replace colors in this block
  englishBlock = englishBlock.replace(/#1e3a8a/g, '#0f766e'); // Background gradient end (teal-700)
  englishBlock = englishBlock.replace(/#020617/g, '#042f2e'); // Background gradient start (teal-950)
  englishBlock = englishBlock.replace(/#3b82f6/g, '#0d9488'); // border, line start, line end (teal-600)
  englishBlock = englishBlock.replace(/#60a5fa/g, '#2dd4bf'); // text, icon, line end (teal-400)
  englishBlock = englishBlock.replace(/#93c5fd/g, '#5eead4'); // line end (teal-300)
  
  content = content.substring(0, englishSessionStart) + englishBlock + content.substring(nextTile);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed styling and colors!');
