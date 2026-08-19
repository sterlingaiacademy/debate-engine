const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    // Upload AdminDashboard.jsx
    sftp.fastPut('frontend/src/pages/AdminDashboard.jsx', '/home/graceandforce/debate-engine/frontend/src/pages/AdminDashboard.jsx', (err) => {
      if (err) throw err;
      console.log('Frontend uploaded.');
      
      // Upload server_prod.js
      sftp.fastPut('backend/server_prod.js', '/home/graceandforce/debate-engine/backend/server_prod.js', (err) => {
        if (err) throw err;
        console.log('Backend uploaded.');
        
        console.log('Building frontend and restarting backend...');
        conn.exec('cd /home/graceandforce/debate-engine/frontend && source ~/.nvm/nvm.sh && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && cd ../backend && pm2 restart server_prod', (err, stream) => {
          if (err) throw err;
          stream.on('data', d => process.stdout.write(d.toString()))
                .stderr.on('data', d => process.stderr.write(d.toString()))
                .on('close', () => {
                  console.log('DEPLOYMENT COMPLETE');
                  conn.end();
                });
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
