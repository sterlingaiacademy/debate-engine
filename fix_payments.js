require('dotenv').config();
const db = require('./database');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SpxzVJVdO5A5xr',
  key_secret: process.env.RAZORPAY_SECRET || 'KTWnYhmt800Y7TSQ6Cc6TBpF'
});

async function run() {
  try {
    const res = await db.query("SELECT id, student_name, razorpay_order_id FROM gforce.mini_mun_registrations WHERE payment_status = 'pending' AND module = 3");
    console.log(`Found ${res.rows.length} pending registrations.`);
    let fixedCount = 0;
    
    for (const row of res.rows) {
      if (!row.razorpay_order_id) continue;
      try {
        const order = await razorpay.orders.fetch(row.razorpay_order_id);
        if (order.status === 'paid') {
          console.log(`[SUCCESS] Updating ${row.student_name} to paid!`);
          await db.query("UPDATE gforce.mini_mun_registrations SET payment_status = 'paid' WHERE id = $1", [row.id]);
          fixedCount++;
        } else {
          console.log(`[PENDING] ${row.student_name} is ${order.status}`);
        }
      } catch (err) {
        console.error(`Razorpay fetch error for ${row.razorpay_order_id}:`, err.message);
      }
    }
    console.log(`Successfully fixed ${fixedCount} payments!`);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
