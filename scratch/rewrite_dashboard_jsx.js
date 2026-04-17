const fs = require('fs');

let file = "frontend/src/pages/Dashboard.jsx";
let content = fs.readFileSync(file, 'utf8');

// Replace elo_rating logic
content = content.replace(/stats\.elo_rating \|\| 1000/g, "stats.gforce_tokens || 0");

// Replace ELO texts
content = content.replace(/'ELO Rating'/g, "'Gforce Tokens'");
content = content.replace(/>ELO Rating</g, ">Gforce Tokens<");
content = content.replace(/>Rating</g, ">Tokens<");

// The variable name "elo" is used in Dashboard.jsx, let's just leave the variable initialized or replace `const elo = ` to `const gforce = `
content = content.replace(/const elo = Math\.round/g, "const gforce = Math.round");
content = content.replace(/\{elo\}/g, "{gforce}");

fs.writeFileSync(file, content);
console.log('Dashboard.jsx rewritten!');
