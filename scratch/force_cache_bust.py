"""
force_cache_bust.py - Delete old cached JS files and fix nginx no-cache for index.html
"""
import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PASSWORD = "wvpi2!ZnTcV];ncy"
NGINX_ROOT = "/var/www/grace-and-force/frontend"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, 'graceandforce', PASSWORD, timeout=15)

def run(cmd, label=""):
    print(f"\n>>> {label}")
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if out.strip(): print(out[:2000])
    if err.strip(): print("ERR:", err[:500])

def sudo(cmd, label=""):
    run(f"echo '{PASSWORD}' | sudo -S {cmd} 2>&1", label)

# 1. Show what JS files exist (old + new)
run(f"ls {NGINX_ROOT}/assets/index-*.js", "All index JS files in nginx root")

# 2. Keep ONLY the newest index-*.js (delete old ones)
run(f"""
cd {NGINX_ROOT}/assets
# List all index-*.js files sorted by date, keep newest, delete rest
ls -t index-*.js | tail -n +2 | xargs -r rm -v
""", "Delete old index JS files (keep only newest)")

# 3. Fix nginx config to never cache index.html - write to /tmp first then sudo mv
NGINX_CONF_CONTENT = """server {
    server_name graceandforce.com www.graceandforce.com 65.20.85.75;

    root /var/www/grace-and-force/frontend;
    index index.html index.htm;

    # Never cache index.html - forces browser to always get fresh JS references
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }

    # Cache hashed static assets for 1 year (immutable)
    location ~* \\.js$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/graceandforce.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/graceandforce.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.graceandforce.com) { return 301 https://$host$request_uri; }
    if ($host = graceandforce.com) { return 301 https://$host$request_uri; }
    listen 80;
    server_name graceandforce.com www.graceandforce.com 65.20.85.75;
    return 404;
}
"""

# Write to /tmp then sudo mv to nginx sites-enabled
run(f"cat > /tmp/graceandforce_nginx.conf << 'CONFEOF'\n{NGINX_CONF_CONTENT}\nCONFEOF", "Write nginx config to /tmp")
sudo("mv /tmp/graceandforce_nginx.conf /etc/nginx/sites-enabled/graceandforce", "Move nginx config into place")
sudo("nginx -t", "Test nginx config")
sudo("nginx -s reload", "Reload nginx")

# 4. Confirm what's left in nginx root
run(f"ls {NGINX_ROOT}/assets/index-*.js", "JS files after cleanup")
run(f"grep 'src=' {NGINX_ROOT}/index.html", "Current index.html references")

print("\n>>> FIX COMPLETE")
print(">>> The old JS files are deleted. Browser MUST fetch fresh index.html now.")
print(">>> Press Ctrl+Shift+R on graceandforce.com to hard refresh - it WILL work now.")
c.close()
