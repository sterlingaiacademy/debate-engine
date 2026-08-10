require('dotenv').config();
const db = require('./database');
db.query(`UPDATE users SET school_id = NULL, olympiad_registered = false, "classLevel" = NULL, age = NULL, parent_name = NULL, parent_phone = NULL WHERE username = 'hananphashim1' RETURNING email`)
  .then(res => { console.log('Reset for:', res.rows); process.exit(0); })
  .catch(err => console.error(err));
