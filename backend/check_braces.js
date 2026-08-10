const fs = require('fs');

const code = fs.readFileSync('server.js', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;

const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
  }
}

console.log({ braces, parens, brackets });
