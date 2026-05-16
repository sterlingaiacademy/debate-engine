import os
import paramiko

HOST = "65.20.85.75"
PORT = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
LOCAL_DIST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'dist'))
REMOTE_NGINX = "/var/www/grace-and-force/frontend"

print("Building local frontend...")
os.system(f"cd {os.path.join(LOCAL_DIST, '..')} && npm run build")

print("Connecting to Vultr...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)

# Clear remote Nginx dir
client.exec_command(f"echo '{PASSWORD}' | sudo -S rm -rf {REMOTE_NGINX}/*")

sftp = client.open_sftp()

print("Uploading backend server.js...")
LOCAL_BACKEND = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
sftp.put(os.path.join(LOCAL_BACKEND, 'server.js'), "/home/graceandforce/debate-engine/backend/server.js")
print("Restarting PM2 backend...")
client.exec_command("export NVM_DIR=\"$HOME/.nvm\"; [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"; pm2 restart grace-api")

print(f"Uploading from {LOCAL_DIST} to {REMOTE_NGINX}...")

def put_dir(local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item
        if os.path.isdir(local_path):
            put_dir(local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)
            print(f"Uploaded {item}")

put_dir(LOCAL_DIST, REMOTE_NGINX)

# Fix permissions
client.exec_command(f"echo '{PASSWORD}' | sudo -S chown -R graceandforce:graceandforce {REMOTE_NGINX}")
client.exec_command(f"echo '{PASSWORD}' | sudo -S nginx -s reload")

print("Deployment complete!")
client.close()
