// ecosystem.config.js — PM2 process config
// NOTE: Secrets are NOT stored here. Set them on the server via:
//   pm2 set grace-api:RAZORPAY_KEY_ID <value>
// Or edit /home/graceandforce/.pm2/dump.pm2 directly.
//
// Required env vars on server:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
//   PLAN_PRO_MONTHLY, PLAN_PRO_YEARLY, PLAN_MAX_MONTHLY, PLAN_MAX_YEARLY
//   ANTHROPIC_API_KEY, ASSEMBLYAI_API_KEY
//   ADMIN_USERNAME, ADMIN_PASSWORD

module.exports = {
  apps: [{
    name: 'grace-api',
    script: './backend/server_prod.js',
    cwd: '/home/graceandforce/debate-engine',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
