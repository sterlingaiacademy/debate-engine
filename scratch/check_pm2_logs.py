"""
check_pm2_logs.py - Check PM2 error logs on Vultr
"""
import paramiko
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PORT     = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)

def run(cmd, label=""):
    print(f"\n>>> {label or cmd}")
    stdin, stdout, stderr = client.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}'
    )
    for line in iter(stdout.readline, ""):
        try: print("  " + line.rstrip())
        except: pass
    for line in iter(stderr.readline, ""):
        try: print("  ERR: " + line.rstrip())
        except: pass

run("pm2 list", "PM2 Status")
run("pm2 logs grace-api --lines 50 --nostream", "Last 50 PM2 log lines")

client.close()
