const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const workbook = xlsx.readFile(path.join(__dirname, 'teacher_2030.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
// Using header: 1 means we get an array of arrays
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log("First 5 rows:");
console.log(data.slice(0, 5));

const jsonOutput = {};
let counter = 1;
// We assume it has a header row. Let's find out where Name and Email are.
// Usually Name is index 1, Email is index 2, but we'll print the first row to be sure.

// A generic parse:
data.forEach((row, i) => {
  if (i === 0) return; // Skip header
  if (!row || row.length < 2) return;
  
  // Try to find email
  let email = null;
  let name = null;
  
  for(let j=0; j<row.length; j++) {
    if (typeof row[j] === 'string' && row[j].includes('@')) {
      email = row[j];
      // Name is usually the previous column
      name = row[j-1] || row[j+1] || `Participant ${counter}`;
      break;
    }
  }

  if (email) {
    const idStr = `T2030-${counter.toString().padStart(3, '0')}`;
    jsonOutput[email.toLowerCase().trim()] = { name: (name || '').toString().trim(), id: idStr, status: 'participation' };
    counter++;
  }
});

fs.writeFileSync(path.join(__dirname, 'teacher2030_certificates.json'), JSON.stringify(jsonOutput, null, 2));
console.log(`Wrote ${Object.keys(jsonOutput).length} entries to teacher2030_certificates.json`);
