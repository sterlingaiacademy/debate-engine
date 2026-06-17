const { Client } = require('ssh2');

const conn = new Client();
const password = 'wvpi2!ZnTcV];ncy';

const remoteScript = `
set -e
source ~/.profile || true
source ~/.bashrc || true
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

APP_DIR="/home/graceandforce/debate-engine"

echo "──────────────────────────────────────────────"
echo "  [1/6] Pulling latest code from GitHub..."
cd $APP_DIR
git fetch origin
git reset --hard origin/main

echo "──────────────────────────────────────────────"
echo "  [2/6] Installing backend dependencies..."
cd $APP_DIR/backend
npm install --production --silent

echo "──────────────────────────────────────────────"
echo "  [3/6] Building frontend..."
cd $APP_DIR/frontend
npm install --silent
chmod -R +x node_modules/.bin || true
npm run build

echo "──────────────────────────────────────────────"
echo "  [4/6] Deploying frontend to web root..."
rsync -a --delete $APP_DIR/frontend/dist/ /var/www/grace-and-force/frontend/

echo "──────────────────────────────────────────────"
echo "  [5/6] Restarting backend (PM2)..."
cd $APP_DIR/backend
pm2 restart grace-api 2>/dev/null || pm2 start server.js --name grace-api
pm2 save

echo "──────────────────────────────────────────────"
echo "  [6/6] Reloading Nginx..."
echo "${password}" | sudo -S nginx -t && echo "${password}" | sudo -S systemctl reload nginx

echo "──────────────────────────────────────────────"
echo "  ✅ DEPLOY COMPLETE!"
echo "──────────────────────────────────────────────"
pm2 status
`;

conn.on('ready', () => {
  console.log('Connected to Vultr successfully.');
  conn.exec(remoteScript, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code, signal) => {
      console.log('Stream closed. Code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
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
