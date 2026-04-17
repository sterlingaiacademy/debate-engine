const fs = require('fs');

let file = "frontend/src/pages/Results.jsx";
let content = fs.readFileSync(file, 'utf8');

// Replace new_elo with new_tokens
content = content.replace(/evaluation\.leaderboard_update\.new_elo/g, "evaluation.leaderboard_update.new_tokens");
// Replace elo_change with tokens_earned
content = content.replace(/evaluation\.leaderboard_update\.elo_change/g, "evaluation.leaderboard_update.tokens_earned");
// Replace "New Rating" with "Gforce Tokens"
content = content.replace(/>New Rating</g, ">Gforce Tokens<");
// Fix the CSS logic for Token earned (always positive)
content = content.replace(/evaluation\.leaderboard_update\.tokens_earned >= 0 \? '#10b981' : '#ef4444'/g, "'#8b5cf6'");
content = content.replace(/evaluation\.leaderboard_update\.tokens_earned > 0 \? '\+' : ''/g, "'+'");

fs.writeFileSync(file, content);
console.log('Results.jsx rewritten!');
