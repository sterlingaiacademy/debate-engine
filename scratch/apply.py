import paramiko

HOST     = "65.20.85.75"
PORT     = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"

def run(client, cmd):
    print(f">>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    # Ignore decode errors
    try:
        print(stdout.read().decode('utf-8', 'ignore'))
    except:
        pass
    try:
        err = stderr.read().decode('utf-8', 'ignore')
        if err:
            print("ERR:", err)
    except:
        pass

def main():
    print("Connecting...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=15)
    
    print("Copying to nginx...")
    NGINX_ROOT = "/var/www/grace-and-force/frontend"
    run(client, f"echo '{PASSWORD}' | sudo -S cp -rf {APP_DIR}/frontend/dist/. {NGINX_ROOT}/")
    run(client, f"echo '{PASSWORD}' | sudo -S chown -R graceandforce:graceandforce {NGINX_ROOT}")
    run(client, f"echo '{PASSWORD}' | sudo -S nginx -s reload")
    
    client.close()
    print("Done!")

if __name__ == '__main__':
    main()
