require('dotenv').config();
const { Pool } = require('pg');
const Razorpay = require('razorpay');

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

async function run() {
  const res = await db.query("SELECT id, student_name, razorpay_order_id FROM gforce.mini_mun_registrations WHERE payment_status = 'pending' AND module = 3");
  console.log(`Found ${res.rows.length} pending registrations.`);
  
  for (const row of res.rows) {
    if (!row.razorpay_order_id) continue;
    try {
      const order = await razorpay.orders.fetch(row.razorpay_order_id);
      if (order.status === 'paid') {
        console.log(`[SUCCESS] Updating ${row.student_name} (${row.razorpay_order_id}) to paid!`);
        // We could also fetch the payment ID if needed, but for now just update status
        await db.query("UPDATE gforce.mini_mun_registrations SET payment_status = 'paid' WHERE id = $1", [row.id]);
      } else {
        console.log(`[PENDING] ${row.student_name} order status is ${order.status}`);
      }
    } catch (err) {
      console.error(`Error fetching order ${row.razorpay_order_id}:`, err.message);
    }
  }
  process.exit(0);
}
run();
