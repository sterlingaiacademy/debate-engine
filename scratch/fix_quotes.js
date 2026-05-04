const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace "${API_BASE}/something' with `${API_BASE}/something`
  content = content.replace(/"\$\{API_BASE\}([^"']*?)'/g, '`\$\{API_BASE\}$1`');
  
  // Replace '${API_BASE}/something" with `${API_BASE}/something`
  content = content.replace(/'\$\{API_BASE\}([^"']*?)"/g, '`\$\{API_BASE\}$1`');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
