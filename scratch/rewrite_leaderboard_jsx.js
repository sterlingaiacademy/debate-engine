const fs = require('fs');

let file = "frontend/src/pages/Leaderboard.jsx";
let content = fs.readFileSync(file, 'utf8');

// Replace "ELO Rating" with "Gforce Tokens"
content = content.replace(/'ELO Rating'/g, "'Gforce Tokens'");

// Replace leader.elo_rating with leader.gforce_tokens
content = content.replace(/leader\.elo_rating/g, "leader.gforce_tokens");

fs.writeFileSync(file, content);
console.log('Leaderboard.jsx rewritten!');
