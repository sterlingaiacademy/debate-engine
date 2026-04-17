const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Target the exact line "      setStats(combinedData);\r\n      setLoading(false);"
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setStats(combinedData)')) {
    console.log('Found at line', i+1, ':', JSON.stringify(lines[i]));
    // Insert after this line
    const injection = `      // Push live token + streak into shared user state so Layout header shows them
      if (setUser) {
        setUser(prev => {
          const updated = { ...prev, gforceTokens: Math.round(combinedData.gforce_tokens || 0), streak: combinedData.current_streak || 0 };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }`;
    lines.splice(i + 1, 0, injection);
    console.log('Injected after line', i+1);
    break;
  }
}

c = lines.join('\n');
fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);
console.log('setUser push:', c.includes('gforceTokens: Math.round'));
