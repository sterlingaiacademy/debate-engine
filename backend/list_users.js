const db = require('./database');
db.query('SELECT name, "studentId", "classLevel" FROM users ORDER BY name')
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
