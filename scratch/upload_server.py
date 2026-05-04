import paramiko
import os

def upload_server_js():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        sftp = client.open_sftp()
        
        local_path = os.path.join(os.path.dirname(__file__), "..", "backend", "server.js")
        remote_path = "/home/graceandforce/debate-engine/backend/server.js"
        
        sftp.put(local_path, remote_path)
        print("Uploaded server.js successfully.")
        
        # also upload package.json because we installed google-auth-library
        local_pkg = os.path.join(os.path.dirname(__file__), "..", "backend", "package.json")
        remote_pkg = "/home/graceandforce/debate-engine/backend/package.json"
        sftp.put(local_pkg, remote_pkg)
        print("Uploaded package.json successfully.")

        sftp.close()
        
        # npm install to get google-auth-library, then restart
        script = r"""
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

    except Exception as e:
        print(f"Failed to execute: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    upload_server_js()
