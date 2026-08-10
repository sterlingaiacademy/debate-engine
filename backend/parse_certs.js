const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

function parseMiniMunM4() {
  const filename = 'Mini MUN M4.xlsx';
  try {
    const workbook = xlsx.readFile(path.join(__dirname, '../frontend/public', filename));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    const jsonOutput = {};
    let counter = 1;
    
    // First row is data, not headers, based on previous check
    data.forEach(row => {
      if (row.length >= 2) {
        const name = row[0];
        const email = row[1];
        if (typeof email === 'string' && email.includes('@')) {
          const idStr = `MM4-${counter.toString().padStart(3, '0')}`;
          // Set type to appreciation by default, or participation if you want. Let's do participation.
          jsonOutput[email.toLowerCase().trim()] = { name: name.trim(), id: idStr, type: 'participation' };
          counter++;
        }
      }
    });

    fs.writeFileSync(path.join(__dirname, 'minimun_mod4_certificates.json'), JSON.stringify(jsonOutput, null, 2));
    console.log(`Wrote ${Object.keys(jsonOutput).length} entries to minimun_mod4_certificates.json`);
  } catch(e) {
    console.error(`Error parsing ${filename}:`, e.message);
  }
}

function parseITO() {
  const filename = "World Teachers' Challenge Participants.xlsx";
  try {
    const workbook = xlsx.readFile(path.join(__dirname, '../frontend/public', filename));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    const jsonOutput = {};
    let counter = 1;
    
    // First row is headers
    data.slice(1).forEach(row => {
      if (row.length >= 2) {
        const email = row[0];
        const name = row[1];
        if (typeof email === 'string' && email.includes('@')) {
          const idStr = `ITO-${counter.toString().padStart(3, '0')}`;
          jsonOutput[email.toLowerCase().trim()] = { name: name.trim(), id: idStr, type: 'participation' };
          counter++;
        }
      }
    });

    fs.writeFileSync(path.join(__dirname, 'teachers_challenge_certificates.json'), JSON.stringify(jsonOutput, null, 2));
    console.log(`Wrote ${Object.keys(jsonOutput).length} entries to teachers_challenge_certificates.json`);
  } catch(e) {
    console.error(`Error parsing ${filename}:`, e.message);
  }
}

parseMiniMunM4();
parseITO();
