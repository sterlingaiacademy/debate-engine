const fs = require('fs');

let file = "../frontend/src/pages/Dashboard.jsx";
let content = fs.readFileSync(file, 'utf8');

// Line 135
content = content.replace(
  `<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.classLevel}</span> &bull; {user.school || 'Debate Arena'}`,
  `<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Debater</span> &bull; {user.school || 'Debate Arena'}`
);

// Line 181
content = content.replace(
  `<span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>{user?.classLevel || 'Level 4'}</span>`,
  `<span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Persona Match</span>`
);

fs.writeFileSync(file, content);
console.log('Dashboard.jsx Level mentions removed!');
