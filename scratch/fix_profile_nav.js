const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Replace the conditional navigation with direct href
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setProfilesToSelect(null);') && 
      i + 1 < lines.length && lines[i+1].includes("window.location.pathname === '/'")) {
    // Found the block: lines i, i+1, i+2, i+3, i+4
    lines[i] = '                     setProfilesToSelect(null);';
    lines[i+1] = "                     window.location.href = '/dashboard';";
    lines.splice(i+2, 3); // Remove the 3 extra lines (replaceState, dispatchEvent, closing })
    console.log('FIXED at line', i+1);
    break;
  }
}

fs.writeFileSync('frontend/src/App.jsx', lines.join('\n'));
console.log('Verification:', fs.readFileSync('frontend/src/App.jsx', 'utf8').includes("window.location.href = '/dashboard'"));
