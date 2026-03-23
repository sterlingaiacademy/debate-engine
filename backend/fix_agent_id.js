const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const sqlite = new Database(dbPath);

console.log('Updating Level 5 agent IDs...');
const info = sqlite.prepare('UPDATE users SET assignedAgentId = ? WHERE classLevel = ?').run('agent_3801km7h68pbfn1t8m52ny028t6w', 'Level 5');
console.log('Updated users:', info.changes);
