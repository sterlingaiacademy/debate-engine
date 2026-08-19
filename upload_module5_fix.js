const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    const filesToUpload = [
      { local: 'frontend/src/pages/AdminDashboard.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/AdminDashboard.jsx' },
      { local: 'frontend/src/pages/MiniMunRegister.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/MiniMunRegister.jsx' }
    ];

    let uploadsCompleted = 0;

    filesToUpload.forEach(file => {
      sftp.fastPut(file.local, file.remote, (err) => {
        if (err) throw err;
        console.log(`Uploaded ${file.local}`);
        uploadsCompleted++;
        
        if (uploadsCompleted === filesToUpload.length) {
          console.log('All files uploaded. Building frontend...');
          conn.exec('cd /home/graceandforce/debate-engine/frontend && source ~/.nvm/nvm.sh && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo FRONTEND_DEPLOYED', (err, stream) => {
            if (err) throw err;
            stream.on('data', d => process.stdout.write(d.toString()))
                  .stderr.on('data', d => process.stderr.write(d.toString()))
                  .on('close', () => {
                    conn.end();
                  });
          });
        }
      });
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
