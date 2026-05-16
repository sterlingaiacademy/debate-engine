import paramiko
import sys

def deploy():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    print("Connecting to Vultr server via SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        print("Connected successfully!")
        
        script = """
set -e
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "=== Deploying Frontend ==="
cd ~/debate-engine
git pull origin main

cd frontend
npm install
npm run build
echo "wvpi2!ZnTcV];ncy" | sudo -S cp -r dist/* /var/www/html/
echo "=== Frontend Deployed ==="
"""
        print("Executing deployment script...")
        stdin, stdout, stderr = client.exec_command(script)
        
        for line in iter(stdout.readline, ""):
            try:
                print(line.encode('ascii', 'replace').decode('ascii'), end="")
            except Exception:
                pass
            
        for line in iter(stderr.readline, ""):
            try:
                print("ERROR: " + line.encode('ascii', 'replace').decode('ascii'), end="")
            except Exception:
                pass

        exit_status = stdout.channel.recv_exit_status()
        print(f"\\nCommand finished with exit status: {exit_status}")
        
    except Exception as e:
        print(f"Failed to connect or execute: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    deploy()
