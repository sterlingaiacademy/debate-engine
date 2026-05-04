import paramiko

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
        print("Connected successfully! Configuring Nginx and PM2 startup with sudo...")
        
        # We use sudo -S to read the password from stdin
        script = f"""
set -e
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "{password}" | sudo -S echo "Sudo access confirmed!"

echo ">>> Installing Nginx..."
echo "{password}" | sudo -S apt-get update -y
echo "{password}" | sudo -S apt-get install -y nginx

echo ">>> Configuring Nginx..."
cat << 'NGINX' > /tmp/graceandforce.conf
server {{
    listen 80;
    server_name graceandforce.com www.graceandforce.com 65.20.85.75;
    location / {{
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }}
}}
NGINX

echo "{password}" | sudo -S cp /tmp/graceandforce.conf /etc/nginx/sites-available/graceandforce
echo "{password}" | sudo -S ln -sf /etc/nginx/sites-available/graceandforce /etc/nginx/sites-enabled/
echo "{password}" | sudo -S rm -f /etc/nginx/sites-enabled/default
echo "{password}" | sudo -S systemctl reload nginx

echo ">>> Setting up PM2 Startup Script..."
npx pm2 save
env PATH=$PATH:/usr/bin /home/graceandforce/.nvm/versions/node/v20.12.2/bin/pm2 startup systemd -u graceandforce --hp /home/graceandforce | grep "sudo env PATH" > /tmp/pm2_startup.sh
chmod +x /tmp/pm2_startup.sh
echo "{password}" | sudo -S bash /tmp/pm2_startup.sh

echo "=== PRODUCTION DEPLOYMENT FULLY COMPLETE ==="
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
    deploy()
