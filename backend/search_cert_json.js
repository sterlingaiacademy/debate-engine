const fs = require('fs');
const path = require('path');

const certFiles = [
  'quiz_certificates.json',
  'minimun_mod1_certificates.json',
  'minimun_mod2_certificates.json',
  'minimun_mod3_certificates.json'
];

function run() {
  const email = 'aaryandewade@gmail.com';
  console.log(`Searching for ${email} in certificate JSONs...`);

  certFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const found = Object.values(data).filter(c => 
          (c.email && c.email.toLowerCase() === email.toLowerCase()) || 
          (c['Email ID'] && c['Email ID'].toLowerCase() === email.toLowerCase()) ||
          (c['Email Address'] && c['Email Address'].toLowerCase() === email.toLowerCase())
        );
        if (found.length > 0) {
          console.log(`\nFound in ${file}:`);
          console.log(JSON.stringify(found, null, 2));
        } else {
            // let's do a loose string search just in case the key is weird
            const raw = fs.readFileSync(fullPath, 'utf8');
            if (raw.toLowerCase().includes(email.toLowerCase())) {
                console.log(`\nEmail string exists in ${file} but wasn't matched strictly. Key format might be different.`);
            }
        }
      } catch(e) {
        console.error(`Error parsing ${file}`);
      }
    } else {
        console.log(`${file} does not exist.`);
    }
  });
}
run();
