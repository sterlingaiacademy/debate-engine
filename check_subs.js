const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:sterlingvoiceorders%40123@db.whfmuswqbsgbmaramuhi.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  // List all tables
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('All tables:', tables.rows.map(r => r.table_name));

  // Check subscriptions table
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions' ORDER BY ordinal_position");
    console.log('\nSubscription columns:', cols.rows.map(r => r.column_name));

    const res = await client.query('SELECT COUNT(*) as total FROM subscriptions');
    console.log('Total subscriptions:', res.rows[0].total);

    const byStatus = await client.query('SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status ORDER BY count DESC');
    console.log('By status:');
    byStatus.rows.forEach(r => console.log(' ', r.status, ':', r.count));

    const byPlan = await client.query('SELECT plan_id, COUNT(*) as count FROM subscriptions GROUP BY plan_id ORDER BY count DESC');
    console.log('By plan:');
    byPlan.rows.forEach(r => console.log(' ', r.plan_id, ':', r.count));
  } catch(e) {
    console.log('Subscriptions table error:', e.message);
  }

  // Check users table
  try {
    const users = await client.query('SELECT COUNT(*) as total FROM users');
    console.log('\nTotal users:', users.rows[0].total);

    const subUsers = await client.query("SELECT COUNT(*) as total FROM users WHERE subscription_status IS NOT NULL AND subscription_status != 'none' AND subscription_status != ''");
    console.log('Users with subscription:', subUsers.rows[0].total);

    const bySubStatus = await client.query("SELECT subscription_status, COUNT(*) as count FROM users GROUP BY subscription_status ORDER BY count DESC");
    console.log('Users by subscription_status:');
    bySubStatus.rows.forEach(r => console.log(' ', r.subscription_status, ':', r.count));
  } catch(e) {
    console.log('Users table error:', e.message);
  }

  await client.end();
}).catch(e => console.error('Connection error:', e.message));
