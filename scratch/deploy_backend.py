import paramiko
import os

def deploy_backend():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    print("Connecting to Vultr server via SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        print("Uploading backend files...")
        sftp = client.open_sftp()
        sftp.put("backend/server.js", "/home/graceandforce/debate-engine/backend/server.js")
        sftp.put("backend/package.json", "/home/graceandforce/debate-engine/backend/package.json")
        sftp.put("backend/package-lock.json", "/home/graceandforce/debate-engine/backend/package-lock.json")
        sftp.close()

        print("Restarting PM2 backend...")
        
        script = f"""
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /home/graceandforce/debate-engine/backend
npm install
pm2 restart grace-api
"""

        stdin, stdout, stderr = client.exec_command(script)
        
        for line in iter(stdout.readline, ""):
            print(line.encode('utf-8', 'ignore').decode('utf-8'), end="")
            
        for line in iter(stderr.readline, ""):
            print("ERROR: " + line.encode('utf-8', 'ignore').decode('utf-8'), end="")

        exit_status = stdout.channel.recv_exit_status()
        print(f"\\nCommand finished with exit status: {exit_status}")
        
    except Exception as e:
        print(f"Failed to execute: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    deploy_backend()
