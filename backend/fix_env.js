const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cd /home/graceandforce/debate-engine/backend && sed -i 's/gforce_admin_2026ASSEMBLYAI_API_KEY/gforce_admin_2026\\nASSEMBLYAI_API_KEY/' .env && . ~/.nvm/nvm.sh && pm2 restart grace-api --update-env`, (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d))
          .stderr.on('data', (d) => process.stderr.write(d))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
