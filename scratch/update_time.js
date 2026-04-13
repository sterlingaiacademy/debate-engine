const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const filesToUpdate = [
  'backend/server.js',
  'backend/setup_time.js',
  'frontend/src/pages/DebateArena.jsx',
  'frontend/src/pages/ConversationalAgent.jsx',
  'frontend/src/pages/PersonaDebate.jsx',
  'frontend/src/pages/MockUN.jsx',
  'frontend/src/pages/Dashboard.jsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(root, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Replace 1800 with 1200
    content = content.replace(/1800/g, '1200');
    // Replace 30-minute with 20-minute
    content = content.replace(/30-minute/g, '20-minute');
    // Replace 30 minutes with 20 minutes
    content = content.replace(/30 minutes/g, '20 minutes');
    
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
  } else {
    console.log('Skipped ' + file);
  }
});
