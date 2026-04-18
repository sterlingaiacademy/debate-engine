const db = require('../backend/database.js'); 
setTimeout(async () => { 
  try { 
    await db.query(`UPDATE users SET grade = 'Class 11' WHERE "studentId" = 'hanan'`); 
    console.log('Fixed hanan grade'); 
  } catch(e) { 
    console.error(e) 
  } 
  process.exit(); 
}, 2000);
