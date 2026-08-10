const { Client } = require('ssh2');

console.log("Connecting via SSH to deploy backend...");
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready, uploading...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('database.js', '/home/graceandforce/debate-engine/backend/database.js', (err) => {
      if (err) throw err;
      console.log('database.js uploaded.');
      sftp.fastPut('server_prod.js', '/home/graceandforce/debate-engine/backend/server_prod.js', (err) => {
        if (err) throw err;
        console.log('server_prod.js uploaded.');
        console.log('Upload complete, restarting pm2...');
        conn.exec("source ~/.nvm/nvm.sh && pm2 restart grace-api", (err, stream) => {
          if (err) throw err;
          stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code);
            conn.end();
          }).on('data', (data) => {
            console.log('STDOUT: ' + data);
          }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
          });
        });
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
