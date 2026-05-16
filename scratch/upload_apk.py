import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PORT     = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
NGINX_ROOT = "/var/www/grace-and-force/frontend"
APK_URL  = sys.argv[1] if len(sys.argv) > 1 else None

if not APK_URL:
    print("Please provide the APK URL as an argument.")
    sys.exit(1)

print(f"Connecting to {HOST}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)

def run(cmd, label=""):
    print(f"\n>>> {label or cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    for line in iter(stdout.readline, ""):
        print("  " + line.rstrip())
    for line in iter(stderr.readline, ""):
        print("  ERR: " + line.rstrip())
    return stdout.channel.recv_exit_status()

print(f"Downloading new APK on the server...")
run(f"wget -O {NGINX_ROOT}/grace-and-force.apk {APK_URL}", "Download APK to nginx root")

print("Fixing permissions...")
run(f"echo '{PASSWORD}' | sudo -S chown graceandforce:graceandforce {NGINX_ROOT}/grace-and-force.apk", "Fix permissions")

print("Done! The 'Download Android App' button will now serve the newest version.")
client.close()
