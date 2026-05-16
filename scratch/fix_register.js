const fs = require('fs');
let c = fs.readFileSync('backend/server.js', 'utf8');
const old = "user: { name, studentId, classLevel, assignedAgentId, email, phone, grade: grade || '' }";
const replacement = "user: { name, studentId, classLevel, assignedAgentId, email, phone, grade: grade || '', subscription_plan: 'free' }";
if (c.includes(old)) {
  c = c.replace(old, replacement);
  fs.writeFileSync('backend/server.js', c);
  console.log('Fixed: Added subscription_plan to register response');
} else {
  console.log('Target not found or already fixed');
}
