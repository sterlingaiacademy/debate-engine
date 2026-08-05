const { execSync } = require('child_process');
const { Client } = require('ssh2');

console.log("Building frontend...");
execSync('npm run build', { stdio: 'inherit' });

console.log("Tarring dist...");
execSync('tar -czf dist.tar.gz -C dist .', { stdio: 'inherit' });

console.log("Connecting via SSH to deploy to correct path...");
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready, uploading...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('dist.tar.gz', '/home/graceandforce/dist.tar.gz', (err) => {
      if (err) throw err;
      console.log('Upload complete, extracting...');
      // IMPORTANT: Deploy to /var/www/grace-and-force/frontend
      conn.exec("echo 'wvpi2!ZnTcV];ncy' | sudo -S rm -rf /var/www/grace-and-force/frontend/* && echo 'wvpi2!ZnTcV];ncy' | sudo -S tar -xzf /home/graceandforce/dist.tar.gz -C /var/www/grace-and-force/frontend/ && echo 'wvpi2!ZnTcV];ncy' | sudo -S chown -R www-data:www-data /var/www/grace-and-force/frontend", (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('Deployed frontend to CORRECT PATH successfully!');
          conn.end();
        });
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
      });
    });
  });
});

conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
