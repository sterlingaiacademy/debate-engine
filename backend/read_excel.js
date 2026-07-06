const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const workbook = xlsx.readFile(path.join(__dirname, '../frontend/public/Mini MUN Module 1 participants.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
// Using header: 1 means we get an array of arrays
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log("First 5 rows:");
console.log(data.slice(0, 5));

const jsonOutput = {};
let counter = 1;
data.forEach(row => {
  if (row.length >= 3) {
    const name = row[1];
    const email = row[2];
    if (typeof email === 'string' && email.includes('@')) {
      const idStr = `MM1-${counter.toString().padStart(3, '0')}`;
      jsonOutput[email.toLowerCase().trim()] = { name: name.trim(), id: idStr };
      counter++;
    }
  }
});

fs.writeFileSync(path.join(__dirname, 'minimun_mod1_certificates.json'), JSON.stringify(jsonOutput, null, 2));
console.log(`Wrote ${Object.keys(jsonOutput).length} entries to minimun_mod1_certificates.json`);
