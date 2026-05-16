import paramiko
import os

HOST     = "65.20.85.75"
PORT     = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"

def run(client, cmd):
    print(f">>> {cmd}")
    stdin, stdout, stderr = client.exec_command(f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}')
    try:
        print(stdout.read().decode('utf-8', 'ignore'))
    except:
        pass
    try:
        err = stderr.read().decode('utf-8', 'ignore')
        if err:
            print("ERR:", err)
    except:
        pass

def main():
    print("Connecting...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)
    
    print("Uploading frontend files directly...")
    sftp = client.open_sftp()
    
    # Upload the changed files directly
    files_to_upload = [
        'frontend/src/pages/DebateArena.jsx',
        'frontend/src/components/GeminiWave.jsx',
        'frontend/src/components/AIAvatar.jsx',
        'frontend/src/pages/Dashboard.jsx',
        'frontend/src/pages/Settings.jsx',
        'frontend/src/index.css'
    ]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.normpath(os.path.join(base_dir, '..'))
    
    for f in files_to_upload:
        local_path = os.path.join(repo_dir, f)
        remote_path = f"{APP_DIR}/{f}"
        print(f"Uploading {local_path} -> {remote_path}")
        sftp.put(local_path, remote_path)
        
    sftp.close()
    print("Files uploaded.")
    
    print("Building frontend...")
    run(client, f"cd {APP_DIR}/frontend && npm run build")
    
    print("Copying to nginx...")
    NGINX_ROOT = "/var/www/grace-and-force/frontend"
    run(client, f"echo '{PASSWORD}' | sudo -S cp -rf {APP_DIR}/frontend/dist/. {NGINX_ROOT}/")
    run(client, f"echo '{PASSWORD}' | sudo -S chown -R graceandforce:graceandforce {NGINX_ROOT}")
    run(client, f"echo '{PASSWORD}' | sudo -S nginx -s reload")
    
    client.close()
    print("Done!")

if __name__ == '__main__':
    main()
