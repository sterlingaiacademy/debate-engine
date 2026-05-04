import paramiko

def run_certbot():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        script = f"""
echo "{password}" | sudo -S certbot --nginx -d graceandforce.com -d www.graceandforce.com --agree-tos -m graceandforce@gmail.com --redirect --non-interactive
"""

        stdin, stdout, stderr = client.exec_command(script)
        
        out = stdout.read().decode('utf-8', 'ignore')
        err = stderr.read().decode('utf-8', 'ignore')
        print(out)
        print("ERROR:", err)
        
    except Exception as e:
        print(f"Failed to execute: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    run_certbot()
