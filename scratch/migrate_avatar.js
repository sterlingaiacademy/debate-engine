const db = require('./backend/database'); 

async function run() { 
  try { 
    // Add avatar to users
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
    console.log('Migration successful'); 
    process.exit(0); 
  } catch(err) { 
    console.error('Migration failed:', err); 
    process.exit(1); 
  } 
} 

run();
