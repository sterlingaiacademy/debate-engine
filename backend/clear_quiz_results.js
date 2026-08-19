const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.whfmuswqbsgbmaramuhi:sterlingvoiceorders%40123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});
async function run() {
  const res = await pool.query("SELECT id, name, email FROM users WHERE name ILIKE '%hanan%' OR email ILIKE '%hanan%'");
  console.log('Users:', res.rows);
  
  if (res.rows.length > 0) {
     const email = res.rows.find(r => r.email && r.email.includes('hananphashim1'))?.email || res.rows[0].email;
     console.log('Target Email:', email);
     
     const delRes = await pool.query("DELETE FROM olympiad_quiz_results WHERE user_email = $1 RETURNING *", [email]);
     console.log('Deleted rows:', delRes.rowCount);
  }
  pool.end();
}
run();
