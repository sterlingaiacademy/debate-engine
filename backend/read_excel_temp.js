const xlsx = require('xlsx');
const path = require('path');

function printHeaders(filename) {
  try {
    const workbook = xlsx.readFile(path.join(__dirname, '../frontend/public', filename));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\nHeaders for ${filename}:`);
    console.log(data[0]);
    console.log('First data row:');
    console.log(data[1]);
  } catch(e) {
    console.error(`Error reading ${filename}:`, e.message);
  }
}

printHeaders('Mini MUN M4.xlsx');
printHeaders('World Teachers\' Challenge Participants.xlsx');
