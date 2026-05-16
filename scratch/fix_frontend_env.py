"""
fix_frontend_env.py - Add VITE_GOOGLE_CLIENT_ID to frontend .env on server, rebuild and redeploy
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
c.connect(HOST, 22, 'graceandforce', PASSWORD, timeout=15)

def run(cmd, label=""):
    print(f"\n>>> {label}")
    i, o, e = c.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}'
    )
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if out.strip(): print(out[:2000])
    if err.strip(): print("ERR:", err[:500])

def sudo(cmd, label=""):
    run(f"echo '{PASSWORD}' | sudo -S {cmd} 2>&1", label)

# 1. Write frontend .env with VITE_GOOGLE_CLIENT_ID
print("\n>>> Writing frontend .env with VITE_GOOGLE_CLIENT_ID")
env_content = f"VITE_GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}\nVITE_API_BASE_URL=https://graceandforce.com\n"
i, o, e = c.exec_command(f"cat > {APP_DIR}/frontend/.env << 'EOF'\n{env_content}EOF")
o.read(); e.read()

# Verify
run(f"cat {APP_DIR}/frontend/.env", "Frontend .env contents")

# 2. Rebuild frontend with the env var baked in
run(f"chmod +x {APP_DIR}/frontend/node_modules/.bin/vite", "Fix vite permissions")
run(f"cd {APP_DIR}/frontend && ./node_modules/.bin/vite build", "Rebuild frontend (~1 min)")

# 3. Fix permissions and copy to nginx root
sudo(f"chown -R graceandforce:graceandforce {NGINX_ROOT}", "Fix nginx root permissions")
run(f"cp -rf {APP_DIR}/frontend/dist/. {NGINX_ROOT}/", "Copy new build to nginx root")

# 4. Verify new index.html
run(f"grep 'src=' {NGINX_ROOT}/index.html", "Verify new index.html")

# 5. Reload nginx
sudo("nginx -s reload", "Reload nginx")

print("\n>>> DONE! Try graceandforce.com/login now - should NOT show black screen")
c.close()
