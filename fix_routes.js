const fs = require('fs');
const file = 'backend/server.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const routesStart = lines.findIndex(l => l.includes('SECTION: English Session Registrations'));
const portStart = lines.findIndex(l => l.includes('const PORT = process.env.PORT || 5000;'));

if (routesStart > 0 && portStart > routesStart) {
  // Extract lines
  const routes = lines.splice(routesStart, portStart - routesStart);
  
  // Find where express.json is
  let insertIdx = lines.findIndex(l => l.includes('app.use(express.json('));
  while (!lines[insertIdx].includes('}))') && insertIdx < lines.length) {
    insertIdx++;
  }
  insertIdx++; // Go after the closing of express.json
  
  lines.splice(insertIdx, 0, '', ...routes);
  
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Fixed server.js');
} else {
  console.log('Could not find sections.');
}
