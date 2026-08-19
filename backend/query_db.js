const db = require('./db.js');
db.query("SELECT id, name, email, \"classLevel\" FROM users WHERE email = 'ashiqh84@gmail.com'").then(res => {
  console.log(res.rows);
  process.exit(0);
}).catch(console.error);
