import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = "65.20.85.75"
PASSWORD = "wvpi2!ZnTcV];ncy"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, 'graceandforce', PASSWORD, timeout=15)

def run(cmd, label=""):
    if label: print(f"\n>>> {label}")
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', errors='replace')
    err = e.read().decode('utf-8', errors='replace')
    if out.strip(): print(out[:3000])
    if err.strip(): print("ERR:", err[:500])

run("cat /home/graceandforce/debate-engine/backend/.env", "Backend .env")
run("cat /home/graceandforce/debate-engine/frontend/.env", "Frontend .env")
run("grep -c '624023459084' /var/www/grace-and-force/frontend/assets/*.js 2>/dev/null | head -5", "Client ID in built JS")

c.close()
