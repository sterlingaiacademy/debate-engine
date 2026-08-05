const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    // We can just use scp or rsync via execSync from the local machine since we have the password? 
    // Actually no, rsync requires sshpass or key. Let's just create a tarball of dist, upload it, and extract.
    execSync('tar -czf dist.tar.gz -C frontend/dist .');
    
    sftp.fastPut(path.join(__dirname, 'dist.tar.gz'), '/home/graceandforce/dist.tar.gz', (err) => {
      if (err) throw err;
      console.log('Uploaded dist.tar.gz');
      
      const script = `
        mkdir -p /var/www/grace-and-force/frontend
        tar -xzf /home/graceandforce/dist.tar.gz -C /var/www/grace-and-force/frontend/
        rm /home/graceandforce/dist.tar.gz
        echo "Done!"
      `;
      conn.exec(script, (err, stream) => {
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
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
