const { Client } = require('ssh2');
const fs = require('fs');

const filesToDeploy = [
  { local: 'frontend/src/pages/AdminDashboard.jsx', remote: 'frontend/src/pages/AdminDashboard.jsx' },
  { local: 'frontend/src/pages/OlympiadSchoolRegister.jsx', remote: 'frontend/src/pages/OlympiadSchoolRegister.jsx' },
  { local: 'backend/server.js', remote: 'backend/server.js' }
];

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to server');
  
  let count = 0;
  const uploadNext = () => {
    if (count >= filesToDeploy.length) {
      console.log('Building frontend and restarting backend...');
      const cmds = [
        'source ~/.nvm/nvm.sh',
        'cd /home/graceandforce/debate-engine/frontend',
        'npm run build',
        'cp -r dist/* /var/www/grace-and-force/frontend/',
        'cd /home/graceandforce/debate-engine/backend',
        'pm2 restart server',
        'echo "Deploy completed successfully!"'
      ];
      
      conn.exec(cmds.join(' && '), (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d.toString()))
              .on('error', err => console.error(err))
              .on('close', () => {
                console.log('Finished deployment');
                conn.end();
              });
      });
      return;
    }
    
    const file = filesToDeploy[count];
    const content = fs.readFileSync(file.local).toString('base64');
    const remotePath = `/home/graceandforce/debate-engine/${file.remote}`;
    
    // Using base64 to avoid escaping issues
    conn.exec(`echo "${content}" | base64 -d > ${remotePath}`, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code) => {
        if (code !== 0) console.error(`Failed to upload ${file.local}`);
        else {
          console.log(`Uploaded ${file.local}`);
          count++;
          uploadNext();
        }
      });
    });
  };
  
  uploadNext();
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
