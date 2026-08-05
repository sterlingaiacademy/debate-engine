const fs = require('fs');

const path = 'src/pages/Dashboard.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. Remove line 803 (index 802)
// But wait! Index 802 might have shifted if we don't do it carefully.
// Let's just find the exact lines and modify them.

for (let i = 0; i < lines.length; i++) {
  if (i === 802 && lines[i].includes('</div>')) {
    lines[i] = ''; // Remove the closing div for Top Row
  }
  if (i === 886 && lines[i].includes('</div>')) {
    lines[i] = ''; // Remove the first trailing div
  }
  if (i === 887 && lines[i].includes('</div>')) {
    lines[i] = ''; // Remove the second trailing div
  }
  if (i === 964 && lines[i].includes('</div>') && lines[i+2].includes('Charts Row')) {
    lines[i] = '      </div>\\n      </div>'; // Add the second closing div here!
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed tags!');
