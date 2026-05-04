import paramiko

def setup_ssl():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    print("Connecting to Vultr server via SSH to setup SSL...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        script = f"""
echo "{password}" | sudo -S apt-get update -y
echo "{password}" | sudo -S apt-get install -y certbot python3-certbot-nginx

# Request certificates and auto-configure Nginx
echo "{password}" | sudo -S certbot --nginx -n -d graceandforce.com -d www.graceandforce.com --agree-tos -m hisham@example.com --redirect
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
    setup_ssl()
