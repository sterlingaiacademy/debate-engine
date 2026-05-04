import paramiko

def fix_nginx():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        # We will use raw string WITHOUT f-string to prevent Python from parsing anything.
        # But we need {password} for sudo. So we format only the password.
        
        config_content = r"""
server {
    server_name graceandforce.com www.graceandforce.com 65.20.85.75;
    
    root /var/www/grace-and-force/frontend;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/graceandforce.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/graceandforce.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.graceandforce.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = graceandforce.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name graceandforce.com www.graceandforce.com 65.20.85.75;
    return 404; # managed by Certbot
}
"""

        # Upload the config file directly via SFTP instead of bash hacks!
        sftp = client.open_sftp()
        with open("graceandforce_tmp.conf", "w") as f:
            f.write(config_content)
        sftp.put("graceandforce_tmp.conf", "/tmp/graceandforce.conf")
        sftp.close()

        script = f"""
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
    fix_nginx()
