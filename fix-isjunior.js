const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

const updateFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /const isJunior\s*=\s*\[[^\]]+\]\.includes\(user\?\.classLevel\);/g;
  
  if (regex.test(content)) {
    const updatedContent = content.replace(
      regex, 
      "const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel) && !['Professional', 'College Student'].includes(user?.grade);"
    );
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${filePath}`);
  }
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') return;
    }
  });
  return filelist;
};

const files = walkSync(srcDir).filter(f => f.endsWith('.jsx'));
files.forEach(updateFile);

console.log("Done");
