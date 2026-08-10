const db = require('./database');

async function run() {
  try {
    const certsRes = await db.query(`SELECT * FROM un_certificates WHERE email = $1 OR email = 'aaryandewade'`, ['aaryandewade@gmail.com']);
    console.log('un_certificates:', certsRes.rows);
  } catch(e) { console.log('un_certificates error'); }
  
  try {
    const certsRes2 = await db.query(`SELECT * FROM certificates WHERE email = $1 OR student_id = 216 OR user_id = 216`, ['aaryandewade@gmail.com']);
    console.log('certificates:', certsRes2.rows);
  } catch(e) { console.log('certificates error'); }

  try {
    const certsRes3 = await db.query(`SELECT * FROM minimun_certificates WHERE email = $1 OR student_id = 216`, ['aaryandewade@gmail.com']);
    console.log('minimun_certificates:', certsRes3.rows);
  } catch(e) { console.log('minimun_certificates error'); }

  try {
    const certsRes4 = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_name ILIKE '%cert%'`);
    console.log('Tables containing cert:', certsRes4.rows);
  } catch(e) { console.log('info schema error'); }

  process.exit(0);
}
run();
