import os
import paramiko
from stat import S_ISDIR

def upload_dir(sftp, local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass
        
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item
        
        if os.path.isfile(local_path):
            sftp.put(local_path, remote_path)
            print(f"Uploaded: {local_path} -> {remote_path}")
        elif os.path.isdir(local_path):
            upload_dir(sftp, local_path, remote_path)

def sync_frontend():
    host = "65.20.85.75"
    port = 22
    username = "graceandforce"
    password = "wvpi2!ZnTcV];ncy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, port, username, password, timeout=10)
        sftp = client.open_sftp()
        
        # clean remote temp dir
        client.exec_command("rm -rf /home/graceandforce/frontend_dist")
        
        local_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
        remote_dist = "/home/graceandforce/frontend_dist"
        
        print("Uploading frontend dist...")
        upload_dir(sftp, local_dist, remote_dist)
        sftp.close()
        
        print("Deploying to Nginx web root...")
        script = r"""
echo 'wvpi2!ZnTcV];ncy' | sudo -S rm -rf /var/www/grace-and-force/frontend/*
echo 'wvpi2!ZnTcV];ncy' | sudo -S cp -r /home/graceandforce/frontend_dist/* /var/www/grace-and-force/frontend/
echo 'wvpi2!ZnTcV];ncy' | sudo -S chown -R www-data:www-data /var/www/grace-and-force/frontend
"""
        stdin, stdout, stderr = client.exec_command(script)
        for line in iter(stdout.readline, ""):
            pass
        for line in iter(stderr.readline, ""):
            if "password" not in line.lower():
                print("ERROR: " + line.encode('utf-8', 'ignore').decode('utf-8'), end="")

        print("Frontend deployed successfully!")
    except Exception as e:
        print(f"Failed to execute: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    sync_frontend()
