import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = "65.20.85.75"
SUDO_PASS = "wvpi2!ZnTcV];ncy"
NGINX_ROOT = "/var/www/grace-and-force/frontend"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, 'graceandforce', SUDO_PASS, timeout=10)

def run(cmd, label=""):
    print(f"\n>>> {label}")
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if out.strip(): print(out[:3000])
    if err.strip(): print("ERR:", err[:500])

# Check what JS files exist in nginx root
run(f"ls {NGINX_ROOT}/assets/*.js | head -20", "List JS files in nginx root")

# Check the main bundle for obvious errors - look for 'School' being undefined
run(f"grep -c 'School' {NGINX_ROOT}/assets/index-DKQQIQs5.js 2>/dev/null || echo 'not found'", "School in main bundle?")

# Check if there's a vite.svg (basic asset check)
run(f"ls {NGINX_ROOT}/", "Nginx root contents")

# Test serving the index.html directly
run(f"curl -sk https://graceandforce.com/ | head -20", "Curl main page")

# Check if the assets load correctly
run(f"curl -sk https://graceandforce.com/assets/index-DKQQIQs5.js | head -c 200", "First 200 chars of main JS bundle")

c.close()
