const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('Freedom Quiz Winners & Participant list.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

const certificates = {};
let idCounter = 1;

// Skip row 0 (headers) and rows 1, 2, 3 (first three people)
for (let i = 4; i < data.length; i++) {
  const row = data[i];
  if (!row[1] || typeof row[1] !== 'string') continue;
  
  const email = row[1].toLowerCase().trim();
  const name = row[3];
  let remarks = row[8] || '';
  
  let status = null;
  if (remarks.toLowerCase().includes('appreciation')) {
    status = 'appreciation';
  } else if (remarks.toLowerCase().includes('participation')) {
    status = 'participation';
  }
  
  if (status && email && name) {
    const id = `FQC-${idCounter.toString().padStart(4, '0')}`;
    idCounter++;
    certificates[email] = {
      name: name.trim(),
      status: status,
      id: id
    };
  }
}

fs.writeFileSync('freedom_quiz_certificates.json', JSON.stringify(certificates, null, 2));
console.log('Created freedom_quiz_certificates.json with', Object.keys(certificates).length, 'entries.');
