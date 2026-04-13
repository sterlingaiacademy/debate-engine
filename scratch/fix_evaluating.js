const fs = require('fs');
const path = '../frontend/src/pages/ConversationalAgent.jsx';
let c = fs.readFileSync(path, 'utf8');
c = c.replace(/status === 'evaluating'/g, "status === 'ended'");
fs.writeFileSync(path, c);
console.log('Fixed evaluating state');
