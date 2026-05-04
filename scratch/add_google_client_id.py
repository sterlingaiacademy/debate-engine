import paramiko

def add_google_client_id():
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

# Add GOOGLE_CLIENT_ID to .env if not exists
if ! grep -q "GOOGLE_CLIENT_ID" .env; then
  echo "GOOGLE_CLIENT_ID=624023459084-o1l7b425m8sqo35o25hf3jllrj0165oo.apps.googleusercontent.com" >> .env
else
  sed -i 's/^GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=624023459084-o1l7b425m8sqo35o25hf3jllrj0165oo.apps.googleusercontent.com/' .env
fi

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
    add_google_client_id()
