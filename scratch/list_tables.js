const { Client } = require('pg');

const connectionString = 'postgresql://postgres.whfmuswqbsgbmaramuhi:sterlingvoiceorders%40123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function listTables() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log("Tables in public schema:");
    res.rows.forEach(row => console.log(row.tablename));
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

listTables();
