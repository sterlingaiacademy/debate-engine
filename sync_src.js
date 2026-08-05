const { execSync } = require('child_process');
const { Client } = require('ssh2');

console.log("Tarring frontend/src...");
execSync('tar -czf src.tar.gz -C frontend src', { stdio: 'inherit' });

console.log("Connecting via SSH to deploy src...");
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready, uploading...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('src.tar.gz', '/home/graceandforce/debate-engine/frontend/src.tar.gz', (err) => {
      if (err) throw err;
      console.log('Upload complete, extracting on server...');
      conn.exec("cd /home/graceandforce/debate-engine/frontend && tar -xzf src.tar.gz && rm src.tar.gz", (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('Extracted src successfully!');
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
