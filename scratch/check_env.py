import paramiko
import sys

def check_env():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        
        script = """
source ~/.bashrc 2>/dev/null || true
source ~/.bash_profile 2>/dev/null || true
echo "PATH: $PATH"
which node || echo "node not in path"
which npm || echo "npm not in path"
ls -la ~/.nvm || echo "no nvm"
"""
        stdin, stdout, stderr = client.exec_command(script)
        print(stdout.read().decode())
        print(stderr.read().decode())
        
    except Exception as e:
        print(str(e))
    finally:
        client.close()

if __name__ == "__main__":
    check_env()
