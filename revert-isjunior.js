const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

const revertFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  // Look for my changed line:
  const regex = /const isJunior\s*=\s*\[[^\]]+\]\.includes\(user\?\.classLevel\)\s*&&\s*!\['Professional',\s*'College Student'\]\.includes\(user\?\.grade\);/g;
  
  const original = "const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);";

  if (regex.test(content)) {
    const updated = content.replace(regex, original);
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Reverted ${filePath}`);
  }
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkSync(filePath);
    } else if (filePath.endsWith('.jsx')) {
      if (file !== 'Dashboard.jsx') { // KEEP MY FIX IN DASHBOARD
        revertFile(filePath);
      }
    }
  }
};

walkSync(srcDir);
