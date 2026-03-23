const db = require('./database');

async function fixAgentIds() {
  const query = `UPDATE users SET "assignedAgentId" = 'agent_5601kkx9fa95e9eswcm93gdmp18h' WHERE "classLevel" = 'Level 3'`;
  
  try {
    const result = await db.query(query);
    console.log(`Successfully updated ${result.rowCount} Level 3 users with the new Agent ID.`);
  } catch (err) {
    console.error('Error updating users:', err);
  }
  process.exit();
}

fixAgentIds();
