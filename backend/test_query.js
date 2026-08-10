require('dotenv').config();
const db = require('./database');

async function run() {
  try {
    const res = await db.query(`SELECT id, name, "classLevel" as class, email, olympiad_registered, age, parent_name, parent_phone, city, state, contact_email
       FROM users LIMIT 1`);
    console.log("Success:", res.rows);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
