const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    sftp.fastPut('backend/server.js', '/home/graceandforce/debate-engine/backend/server.js', (err) => {
      if (err) throw err;
      console.log('Uploaded server.js');
      
      conn.exec('cd /home/graceandforce/debate-engine/backend && source ~/.nvm/nvm.sh && pm2 restart server', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d.toString()))
              .stderr.on('data', d => process.stderr.write(d.toString()))
              .on('close', () => {
                console.log('Backend restarted!');
                conn.end();
              });
      });
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
