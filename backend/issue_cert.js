const fs = require('fs');
const path = require('path');

const certPath = path.join(__dirname, 'minimun_mod1_certificates.json');

try {
  let certs = {};
  if (fs.existsSync(certPath)) {
    certs = JSON.parse(fs.readFileSync(certPath, 'utf8'));
  }

  // Find the highest ID
  let maxIdNum = 0;
  for (const email in certs) {
    const id = certs[email].id;
    if (id && id.startsWith('MM1-')) {
      const num = parseInt(id.split('-')[1], 10);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  }

  const nextIdNum = maxIdNum + 1;
  const newId = `MM1-${String(nextIdNum).padStart(3, '0')}`;

  certs['aaryandewade@gmail.com'] = {
    name: 'Aaryan Dewade',
    id: newId
  };

  fs.writeFileSync(certPath, JSON.stringify(certs, null, 2));
  console.log(`Successfully issued certificate ${newId} to aaryandewade@gmail.com`);

} catch(e) {
  console.error("Error updating certificates:", e);
}
