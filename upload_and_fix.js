const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const password = 'wvpi2!ZnTcV];ncy';

const localBackendPath = path.join(__dirname, 'backend');
const localFrontendPath = path.join(__dirname, 'frontend');

const remoteScript = `
set -e
source ~/.profile || true
source ~/.bashrc || true
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

APP_DIR="/home/graceandforce/debate-engine"

echo "──────────────────────────────────────────────"
echo "  [1/4] Building frontend..."
cd $APP_DIR/frontend
npm run build

echo "──────────────────────────────────────────────"
echo "  [2/4] Deploying frontend to web root..."
rsync -a --delete $APP_DIR/frontend/dist/ /var/www/grace-and-force/frontend/

echo "──────────────────────────────────────────────"
echo "  [3/4] Restarting backend (PM2)..."
cd $APP_DIR/backend
pm2 restart grace-api

echo "──────────────────────────────────────────────"
echo "  [4/4] Running fix_pending_payments.js..."
node fix_pending_payments.js

echo "──────────────────────────────────────────────"
echo "  ✅ ALL DONE!"
`;

conn.on('ready', () => {
  console.log('Connected to Vultr successfully.');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    console.log('SFTP session started. Uploading files...');
    
    const uploads = [
      {
        local: path.join(localBackendPath, 'server.js'),
        remote: '/home/graceandforce/debate-engine/backend/server.js'
      },
      {
        local: path.join(localBackendPath, 'fix_pending_payments.js'),
        remote: '/home/graceandforce/debate-engine/backend/fix_pending_payments.js'
      },
      {
        local: path.join(localFrontendPath, 'src', 'pages', 'AdminDashboard.jsx'),
        remote: '/home/graceandforce/debate-engine/frontend/src/pages/AdminDashboard.jsx'
      }
    ];
    
    let uploaded = 0;
    
    uploads.forEach(file => {
      sftp.fastPut(file.local, file.remote, (err) => {
        if (err) {
          console.error(`Failed to upload ${file.local} to ${file.remote}:`, err);
          return;
        }
        console.log(`Uploaded ${file.local}`);
        uploaded++;
        
        if (uploaded === uploads.length) {
          console.log('All files uploaded. Executing remote build script...');
          conn.exec(remoteScript, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
              console.log('Remote script finished with code:', code);
              conn.end();
            }).on('data', (data) => {
              process.stdout.write(data);
            }).stderr.on('data', (data) => {
              process.stderr.write(data);
            });
          });
        }
      });
    });
  });

}).on('error', (err) => {
  console.error('Connection error:', err);
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: password
});
