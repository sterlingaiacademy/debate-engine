const Razorpay = require('razorpay');

const rzp = new Razorpay({
  key_id: 'rzp_live_SpxzVJVdO5A5xr',
  key_secret: 'KTWnYhmt800Y7TSQ6Cc6TBpF'
});

async function createPlans() {
  try {
    console.log('Creating Razorpay Plans...');

    const plansToCreate = [
      { name: 'Pro Monthly', amount: 2999, period: 'monthly', plan_id: 'pro', internal_period: 'monthly' },
      { name: 'Pro Yearly', amount: 29999, period: 'yearly', plan_id: 'pro', internal_period: 'yearly' },
      { name: 'Max Monthly', amount: 8999, period: 'monthly', plan_id: 'max', internal_period: 'monthly' },
      { name: 'Max Yearly', amount: 89999, period: 'yearly', plan_id: 'max', internal_period: 'yearly' },
    ];

    const createdPlans = {};

    for (const plan of plansToCreate) {
      const response = await rzp.plans.create({
        period: plan.period,
        interval: 1,
        item: {
          name: plan.name,
          amount: plan.amount * 100, // paise
          currency: 'INR',
          description: `G Force AI ${plan.name} Subscription`
        }
      });
      console.log(`Created ${plan.name}: ${response.id}`);
      createdPlans[`${plan.plan_id}_${plan.internal_period}`] = response.id;
    }

    console.log('\n--- Save these IDs in your .env file or server.js ---\n');
    console.log(`PLAN_PRO_MONTHLY=${createdPlans['pro_monthly']}`);
    console.log(`PLAN_PRO_YEARLY=${createdPlans['pro_yearly']}`);
    console.log(`PLAN_MAX_MONTHLY=${createdPlans['max_monthly']}`);
    console.log(`PLAN_MAX_YEARLY=${createdPlans['max_yearly']}`);

  } catch (e) {
    console.error('Error creating plans:', e);
  }
}

createPlans();
