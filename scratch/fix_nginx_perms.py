import paramiko

def fix_nginx_permissions():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        script = f"""
echo "{password}" | sudo -S chmod -R 755 /var/www/grace-and-force
echo "{password}" | sudo -S chown -R www-data:www-data /var/www/grace-and-force

cat << 'NGINX' > /tmp/graceandforce.conf
server {{
    listen 80;
    server_name graceandforce.com www.graceandforce.com 65.20.85.75;
    
    root /var/www/grace-and-force/frontend;
    index index.html index.htm;

    location / {{
        try_files \$uri \$uri/ /index.html =404;
    }}

    location /api/ {{
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
echo "{password}" | sudo -S nginx -t
echo "{password}" | sudo -S systemctl reload nginx
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
    fix_nginx_permissions()
