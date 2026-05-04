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
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== Finalizing Deployment ==="
cd ~/debate-engine/backend

echo ">>> Installing Python dependencies..."
pip3 install --break-system-packages --quiet psycopg2-binary python-dotenv google-generativeai httpx

echo ">>> Starting Server with PM2..."
npx pm2 restart grace-api || npx pm2 start server.js --name grace-api
npx pm2 save
echo "=== USER DEPLOYMENT COMPLETE ==="
"""

        print("Executing deployment script...")
        stdin, stdout, stderr = client.exec_command(script)
        
        for line in iter(stdout.readline, ""):
            print(line.encode('utf-8', 'ignore').decode('utf-8'), end="")
            
        for line in iter(stderr.readline, ""):
            print("ERROR: " + line.encode('utf-8', 'ignore').decode('utf-8'), end="")

        exit_status = stdout.channel.recv_exit_status()
        print(f"\\nCommand finished with exit status: {exit_status}")
        
    except Exception as e:
        print(f"Failed to connect or execute: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    deploy()
