# =============================================================
# Grace & Force — Vultr Deploy Script (PowerShell / Windows)
# Run this from your LOCAL machine in PowerShell or Terminal
# Usage: .\deploy.ps1
# =============================================================

$SERVER = "graceandforce@65.20.85.75"
$APP_DIR = "/home/graceandforce/debate-engine"
$BRANCH = "main"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Grace & Force — Deploying to Vultr      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Connecting to Vultr: $SERVER" -ForegroundColor Yellow
Write-Host ""

$REMOTE_SCRIPT = @"
set -e

echo ""
echo "──────────────────────────────────────────────"
echo "  [1/6] Pulling latest code from GitHub..."
echo "──────────────────────────────────────────────"
cd $APP_DIR
git fetch origin
git reset --hard origin/$BRANCH
git pull origin $BRANCH
echo "✅ Code updated to: \$(git log --oneline -1)"

echo ""
echo "──────────────────────────────────────────────"
echo "  [2/6] Installing backend dependencies..."
echo "──────────────────────────────────────────────"
cd $APP_DIR/backend
npm install --production --silent
echo "✅ Backend dependencies installed."

echo ""
echo "──────────────────────────────────────────────"
echo "  [3/6] Building frontend..."
echo "──────────────────────────────────────────────"
cd $APP_DIR/frontend
npm install --silent
npm run build
echo "✅ Frontend built successfully."

echo ""
echo "──────────────────────────────────────────────"
echo "  [4/6] Deploying frontend to web root..."
echo "──────────────────────────────────────────────"
rsync -a --delete $APP_DIR/frontend/dist/ /var/www/grace-and-force/frontend/
echo "✅ Frontend files deployed."

echo ""
echo "──────────────────────────────────────────────"
echo "  [5/6] Restarting backend (PM2)..."
echo "──────────────────────────────────────────────"
cd $APP_DIR/backend
pm2 restart grace-api 2>/dev/null || pm2 start server.js --name grace-api
pm2 save
echo "✅ Backend restarted."

echo ""
echo "──────────────────────────────────────────────"
echo "  [6/6] Reloading Nginx..."
echo "──────────────────────────────────────────────"
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx reloaded."

echo ""
echo "══════════════════════════════════════════════"
echo "  ✅ DEPLOY COMPLETE!"
echo "  🌐 https://graceandforce.com"
echo "══════════════════════════════════════════════"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📋 Last 15 log lines:"
pm2 logs grace-api --lines 15 --nostream
"@

# Run the remote script over SSH
ssh $SERVER $REMOTE_SCRIPT

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deployment successful! Visit https://graceandforce.com" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error output above." -ForegroundColor Red
    exit 1
}
