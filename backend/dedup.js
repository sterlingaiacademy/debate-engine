const db = require('./database');

async function run() {
  try {
    const result = await db.query(`
      DELETE FROM indus_mun_registrations a USING (
        SELECT MIN(id) as id, email
        FROM indus_mun_registrations 
        GROUP BY email HAVING COUNT(*) > 1
      ) b
      WHERE a.email = b.email 
      AND a.id <> b.id;
    `);
    console.log(`Deleted ${result.rowCount} duplicate email entries.`);

    const resultMobile = await db.query(`
      DELETE FROM indus_mun_registrations a USING (
        SELECT MIN(id) as id, mobile
        FROM indus_mun_registrations 
        GROUP BY mobile HAVING COUNT(*) > 1
      ) b
      WHERE a.mobile = b.mobile 
      AND a.id <> b.id;
    `);
    console.log(`Deleted ${resultMobile.rowCount} duplicate mobile entries.`);
  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

run();
