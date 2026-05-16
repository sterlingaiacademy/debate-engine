"""
fix_google_oauth.py - Add GOOGLE_CLIENT_ID to backend .env, and rebuild frontend with correct env
"""
import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"
NGINX_ROOT = "/var/www/grace-and-force/frontend"
GOOGLE_CLIENT_ID = "624023459084-o1l7b425m8sqo35o25hf3jllrj0165oo.apps.googleusercontent.com"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, 'graceandforce', PASSWORD, timeout=30)

def run(cmd, label=""):
    if label: print(f"\n>>> {label}")
    i, o, e = c.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}'
    )
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if out.strip(): print(out[:3000])
    if err.strip(): print("ERR:", err[:500])
    return out

def sudo(cmd, label=""):
    run(f"echo '{PASSWORD}' | sudo -S {cmd} 2>&1", label)

# 1. Add GOOGLE_CLIENT_ID to backend .env
print("\n>>> Adding GOOGLE_CLIENT_ID to backend .env")
i, o, e = c.exec_command(
    f"grep -q 'GOOGLE_CLIENT_ID' {APP_DIR}/backend/.env && "
    f"sed -i 's/^GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}/' {APP_DIR}/backend/.env || "
    f"echo 'GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}' >> {APP_DIR}/backend/.env"
)
o.read(); e.read()

# 2. Also add JWT_SECRET if missing
i, o, e = c.exec_command(
    f"grep -q 'JWT_SECRET' {APP_DIR}/backend/.env || "
    f"echo 'JWT_SECRET=gforce_super_secret_jwt_2024_xK9mPq' >> {APP_DIR}/backend/.env"
)
o.read(); e.read()

run(f"grep 'GOOGLE_CLIENT_ID' {APP_DIR}/backend/.env", "Verify backend .env")

# 3. Restart backend (PM2)
run("pm2 restart all", "Restart PM2 backend")

# 4. Write correct frontend .env
print("\n>>> Writing frontend .env")
env_content = f"VITE_GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}\nVITE_API_BASE_URL=https://graceandforce.com\n"
i, o, e = c.exec_command(f"printf '{env_content}' > {APP_DIR}/frontend/.env")
o.read(); e.read()
run(f"cat {APP_DIR}/frontend/.env", "Frontend .env contents")

# 5. Rebuild frontend (this bakes VITE_ env vars into the JS bundle)
run(f"cd {APP_DIR}/frontend && npm run build", "Rebuilding frontend (~1 min)")

# 6. Deploy to nginx
sudo(f"cp -rf {APP_DIR}/frontend/dist/. {NGINX_ROOT}/", "Copy to nginx")
sudo(f"chown -R graceandforce:graceandforce {NGINX_ROOT}", "Fix permissions")
sudo("nginx -s reload", "Reload nginx")

# 7. Verify client ID is now in built JS
run(f"grep -rl '{GOOGLE_CLIENT_ID[:12]}' {NGINX_ROOT}/assets/ 2>/dev/null | head -3", "Verify Client ID in built JS")

print("\n>>> DONE! Google OAuth should now work.")
c.close()
