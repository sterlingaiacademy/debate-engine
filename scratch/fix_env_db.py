import paramiko

def fix_env():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        script = r"""
cd /home/graceandforce/debate-engine/backend
sed -i 's|DATABASE_URL=postgresql://graceandforce_user:Pck/aawJlsLFZxWu3CG7aw==@localhost:5432/graceandforce_db|DATABASE_URL=postgresql://graceandforce_user:Pck%2FaawJlsLFZxWu3CG7aw%3D%3D@localhost:5432/graceandforce_db|g' .env

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

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
    fix_env()
