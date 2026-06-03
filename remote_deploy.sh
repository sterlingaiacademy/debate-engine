#!/bin/bash
set -e
APP_DIR="/home/graceandforce/debate-engine"
echo "[1/6] Pulling latest code..."
cd $APP_DIR
git fetch origin
git reset --hard origin/main
echo "[2/6] Installing backend deps..."
cd $APP_DIR/backend
npm install --production --silent
echo "[3/6] Building frontend..."
cd $APP_DIR/frontend
npm install --silent
npm run build
echo "[4/6] Deploying frontend to web root..."
rsync -a --delete $APP_DIR/frontend/dist/ /var/www/grace-and-force/frontend/
echo "[5/6] Restarting backend (PM2)..."
cd $APP_DIR/backend
pm2 restart grace-api 2>/dev/null || pm2 start server.js --name grace-api
pm2 save
echo "[6/6] Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo "DEPLOY_SUCCESS"
