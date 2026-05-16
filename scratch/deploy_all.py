"""
deploy_all.py - Full deployment script for Grace & Force
- Uploads backend files via SFTP (server.js, database.js)
- Git pull on frontend source only
- Rebuilds frontend on server
- Restarts PM2 (grace-api)

Run from the grace-and-force root:
  py scratch/deploy_all.py
"""

import paramiko
import os
import io
import sys

# Force stdout to use utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PORT     = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"

def run(client, cmd, label=""):
    print(f"\n>>> {label or cmd}")
    stdin, stdout, stderr = client.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}',
        get_pty=False
    )
    for line in iter(stdout.readline, ""):
        try:
            print("  " + line.rstrip())
        except Exception:
            pass
    for line in iter(stderr.readline, ""):
        try:
            print("  ERR: " + line.rstrip())
        except Exception:
            pass
    return stdout.channel.recv_exit_status()

def main():
    print("Connecting to Vultr server...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)

    # 1. Upload backend files directly via SFTP
    print("\n>>> Uploading backend files via SFTP...")
    sftp = client.open_sftp()
    local_backend = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
    for fname in ['server.js', 'database.js', 'package.json']:
        local_path  = os.path.join(local_backend, fname)
        remote_path = f"{APP_DIR}/backend/{fname}"
        print(f"  {fname} -> {remote_path}")
        sftp.put(local_path, remote_path)
    sftp.close()
    print("  Backend files uploaded OK.")

    # 2. Restart PM2 with new backend
    run(client, "pm2 restart grace-api", "Restart PM2 backend")

    # 3. Git fetch + reset to get latest frontend source (handles forced pushes)
    run(client, f"cd {APP_DIR} && git fetch origin main && git reset --hard origin/main", "Git fetch + hard reset latest (frontend source)")

    # 4. Rebuild frontend
    run(client, f"cd {APP_DIR}/frontend && npm install", "npm install frontend")
    run(client, f"chmod +x {APP_DIR}/frontend/node_modules/.bin/vite", "Fix vite permissions")
    run(client, f"cd {APP_DIR}/frontend && ./node_modules/.bin/vite build", "Build frontend (~1 min)")

    # 5. Fix permissions on nginx root and copy new build there
    NGINX_ROOT = "/var/www/grace-and-force/frontend"
    run(client, f"echo '{PASSWORD}' | sudo -S chown -R graceandforce:graceandforce {NGINX_ROOT} 2>&1", "Fix nginx root permissions")
    run(client, f"cp -rf {APP_DIR}/frontend/dist/. {NGINX_ROOT}/", "Copy new build to nginx root")
    run(client, f"grep 'src=' {NGINX_ROOT}/index.html", "Verify new index.html in nginx root")

    # 6. Reload nginx
    run(client, f"echo '{PASSWORD}' | sudo -S nginx -s reload 2>&1", "Reload nginx")

    print("\n>>> Deployment complete! graceandforce.com is now updated.")
    client.close()

if __name__ == "__main__":
    main()
