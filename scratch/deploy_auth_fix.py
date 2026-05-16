"""
deploy_auth_fix.py - Upload all auth-related files and rebuild
"""
import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"
NGINX_ROOT = "/var/www/grace-and-force/frontend"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, 'graceandforce', PASSWORD, timeout=30)

sftp = c.open_sftp()
files = [
    ("frontend/src/pages/Login.jsx",           f"{APP_DIR}/frontend/src/pages/Login.jsx"),
    ("frontend/src/pages/Register.jsx",        f"{APP_DIR}/frontend/src/pages/Register.jsx"),
    ("frontend/src/pages/GoogleCallback.jsx",  f"{APP_DIR}/frontend/src/pages/GoogleCallback.jsx"),
    ("frontend/src/App.jsx",                   f"{APP_DIR}/frontend/src/App.jsx"),
]
for local, remote in files:
    print(f"Uploading {local}")
    sftp.put(local, remote)
sftp.close()

def run(cmd, label=""):
    if label: print(f"\n>>> {label}")
    i, o, e = c.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}'
    )
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if out.strip(): print(out[:3000])
    if err.strip(): print("ERR:", err[:500])

def sudo(cmd, label=""):
    run(f"echo '{PASSWORD}' | sudo -S {cmd} 2>&1", label)

run(f"cd {APP_DIR}/frontend && npm run build", "Rebuilding frontend")
sudo(f"cp -rf {APP_DIR}/frontend/dist/. {NGINX_ROOT}/", "Copy to nginx")
sudo(f"chown -R graceandforce:graceandforce {NGINX_ROOT}", "Fix permissions")
sudo("nginx -s reload", "Reload nginx")

print("\n>>> DONE! Google Sign-In callback should now work.")
c.close()
