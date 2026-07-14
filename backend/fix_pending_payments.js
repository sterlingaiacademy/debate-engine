require('dotenv').config();
const { Pool } = require('pg');
const Razorpay = require('razorpay');

// Parse connection string manually to avoid URL encoding issues
function parseDbUrl(url) {
  try {
    const clean = url.replace(/^postgresql:\/\//, '').replace(/^postgres:\/\//, '');
    const atIdx = clean.lastIndexOf('@');
    const userInfo = clean.slice(0, atIdx);
    const hostInfo = clean.slice(atIdx + 1);
    const colonIdx = userInfo.indexOf(':');
    const user = userInfo.slice(0, colonIdx);
    const password = userInfo.slice(colonIdx + 1);
    const [hostPort, database] = hostInfo.split('/');
    const [host, port] = hostPort.split(':');
    return { user, password, host, port: parseInt(port) || 5432, database };
  } catch (e) {
    return {
      user: 'graceandforce_user',
      password: 'Pck/aawJlsLFZxWu3CG7aw==',
      host: 'localhost',
      port: 5432,
      database: 'graceandforce_db',
    };
  }
}

const dbUrl = process.env.DATABASE_URL || 'postgresql://graceandforce_user:Pck/aawJlsLFZxWu3CG7aw==@localhost:5432/graceandforce_db';
const connParams = parseDbUrl(dbUrl);
const isLocal = connParams.host === 'localhost' || connParams.host === '127.0.0.1';

const pool = new Pool({
  ...connParams,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SpxzVJVdO5A5xr',
  key_secret: process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF',
});

async function fixPendingPayments() {
  console.log('Fetching pending registrations from the database...');
  try {
    // 1. Fetch pending mini_mun_registrations
    const res = await pool.query(`SELECT id, razorpay_order_id, email, student_name FROM mini_mun_registrations WHERE payment_status = 'pending' AND razorpay_order_id IS NOT NULL`);
    const pendingOrders = res.rows;
    console.log(`Found ${pendingOrders.length} pending Mini MUN registrations.`);

    let fixedCount = 0;

    for (const reg of pendingOrders) {
      if (!reg.razorpay_order_id) continue;
      
      try {
        const order = await razorpayInstance.orders.fetch(reg.razorpay_order_id);
        if (order && order.status === 'paid') {
          console.log(`[FIXING] Order ${order.id} for ${reg.email} is paid in Razorpay. Updating database...`);
          
          // Fetch payment to get razorpay_payment_id
          const payments = await razorpayInstance.orders.fetchPayments(reg.razorpay_order_id);
          const capturedPayment = payments.items.find(p => p.status === 'captured');
          const paymentId = capturedPayment ? capturedPayment.id : null;

          const updateRes = await pool.query(
            `UPDATE mini_mun_registrations SET payment_status = 'paid', razorpay_payment_id = COALESCE($1, razorpay_payment_id) WHERE id = $2 RETURNING user_id`,
            [paymentId, reg.id]
          );

          const userId = updateRes.rows[0]?.user_id;
          if (userId && paymentId) {
             // Top-up credits allocation
             await pool.query(`
                CREATE TABLE IF NOT EXISTS topup_credits (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                bonus_seconds INTEGER NOT NULL,
                effect_date TEXT NOT NULL,
                source TEXT DEFAULT 'payment',
                razorpay_payment_id TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
                )
             `);
             const effectDate = new Date().toISOString().slice(0, 10);
             await pool.query(`
                INSERT INTO topup_credits (user_id, bonus_seconds, effect_date, source, razorpay_payment_id)
                VALUES ($1, 1800, $2, 'minimun', $3)
             `, [userId, effectDate, paymentId]);
          }

          fixedCount++;
        }
      } catch (err) {
        console.error(`Error checking order ${reg.razorpay_order_id}:`, err.message);
      }
    }

    console.log(`\nFinished! Fixed ${fixedCount} registrations that were out of sync.`);

  } catch (e) {
    console.error('Database Error:', e);
  } finally {
    pool.end();
  }
}

fixPendingPayments();
