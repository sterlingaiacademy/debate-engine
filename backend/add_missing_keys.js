const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
cd /home/graceandforce/debate-engine/backend

# Add ASSEMBLYAI_API_KEY if missing
if ! grep -q "ASSEMBLYAI_API_KEY" .env; then
  echo "ASSEMBLYAI_API_KEY=f3dc6e80f8354e4998755cdb10b90445" >> .env
  echo "Added ASSEMBLYAI_API_KEY"
else
  sed -i 's/ASSEMBLYAI_API_KEY=.*/ASSEMBLYAI_API_KEY=f3dc6e80f8354e4998755cdb10b90445/' .env
  echo "Updated ASSEMBLYAI_API_KEY"
fi

# Add ANTHROPIC_API_KEY if missing
if ! grep -q "ANTHROPIC_API_KEY" .env; then
  echo "ANTHROPIC_API_KEY=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" >> .env
  echo "Added ANTHROPIC_API_KEY"
else
  sed -i 's/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=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/' .env
  echo "Updated ANTHROPIC_API_KEY"
fi

# Restart pm2 to pick up new env vars
source ~/.nvm/nvm.sh && pm2 restart all && echo "PM2 restarted successfully"
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => { conn.end(); })
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
