const fs = require('fs');

let file = "../frontend/src/pages/Register.jsx";
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Class</label>`,
  `<label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Grade</label>`
);

content = content.replace(
  `<option key={\`Class \${i + 1}\`} value={\`Class \${i + 1}\`}>Class {i + 1}</option>`,
  `<option key={\`Class \${i + 1}\`} value={\`Class \${i + 1}\`}>Grade {i + 1}</option>`
);

fs.writeFileSync(file, content);
console.log('Register.jsx patched!');
