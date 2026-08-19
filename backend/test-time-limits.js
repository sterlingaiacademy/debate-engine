const { Pool } = require('pg');
const pool = new Pool({
  user: 'graceandforce_user',
  host: 'localhost',
  database: 'graceandforce_db',
  password: 'Pck/aawJlsLFZxWu3CG7aw==',
  port: 5432,
});

async function run() {
  const studentId = 'nimeshumeshu';
  try {
    const result = await pool.query(`SELECT * FROM users WHERE "studentId" = $1`, [studentId]);
    if (!result.rows.length) {
      console.log('User not found');
      return;
    }
    
    let user = result.rows[0];
    const currentDateIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).toISOString().split('T')[0];
    
    console.log("lastDebateDate:", user.lastDebateDate, "currentDateIST:", currentDateIST);
    
    let LIMIT = 600; 
    if (user.subscription_plan === 'pro') LIMIT = 1200; 
    if (user.subscription_plan === 'max') LIMIT = 3600; 
    
    const topupRes = await pool.query(`
      SELECT SUM(seconds_added) as total 
      FROM topup_credits 
      WHERE user_id = $1 AND expires_at > NOW()
    `, [studentId]);
    
    let totalTopupSeconds = 0;
    if (topupRes.rows[0] && topupRes.rows[0].total) {
      totalTopupSeconds = parseInt(topupRes.rows[0].total, 10);
    }
    console.log("Topup seconds:", totalTopupSeconds);
    
    const used = parseInt(user.dailyPersonaTime || 0, 10);
    const totalAllowed = LIMIT + totalTopupSeconds;
    const remainingPersona = Math.max(0, totalAllowed - used);
    
    console.log("LIMIT:", LIMIT, "used:", used, "remaining:", remainingPersona);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
