const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Fix the broken line and restart
  const cmd = `
cd /home/graceandforce/debate-engine/backend

# Fix broken line - remove the broken entries first, then add cleanly
sed -i 's/ADMIN_SECRET=gforce_admin_2026ASSEMBLYAI_API_KEY=.*/ADMIN_SECRET=gforce_admin_2026/' .env
sed -i '/^ASSEMBLYAI_API_KEY=/d' .env
sed -i '/^ANTHROPIC_API_KEY=/d' .env

# Add a newline at end if not present, then add the keys cleanly
echo "" >> .env
echo "ASSEMBLYAI_API_KEY=f3dc6e80f8354e4998755cdb10b90445" >> .env
echo "ANTHROPIC_API_KEY=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" >> .env

echo "=== .env now contains ==="
cat .env
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => { conn.end(); })
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
});
conn.connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
