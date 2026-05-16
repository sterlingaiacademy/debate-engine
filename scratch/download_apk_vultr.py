import paramiko

HOST = "65.20.85.75"
PORT = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
APK_URL = "https://expo.dev/artifacts/eas/ifv7VcHEnvRp7jdDVGP8NG.apk"
DEST_PATH = "/var/www/grace-and-force/frontend/grace-and-force.apk"

print(f"Connecting to {HOST}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)

print(f"Downloading APK to {DEST_PATH}...")
cmd = f"echo '{PASSWORD}' | sudo -S curl -L '{APK_URL}' -o '{DEST_PATH}'"
stdin, stdout, stderr = client.exec_command(cmd)

print("Stdout:", stdout.read().decode())
print("Stderr:", stderr.read().decode())

print("Setting permissions...")
cmd_perms = f"echo '{PASSWORD}' | sudo -S chown graceandforce:graceandforce '{DEST_PATH}'"
client.exec_command(cmd_perms)

print("Done!")
client.close()
