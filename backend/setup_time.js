const db = require('./database');
db.query('CREATE TABLE time_limits (id SERIAL PRIMARY KEY, "studentId" TEXT UNIQUE NOT NULL REFERENCES users("studentId") ON DELETE CASCADE, ranked_time_remaining INTEGER DEFAULT 600, persona_time_remaining INTEGER DEFAULT 600)')
  .then(() => { console.log('Table created!'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
