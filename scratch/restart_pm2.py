import paramiko, sys
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy')
def run(cmd):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = c.exec_command('export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; ' + cmd)
    for line in iter(stdout.readline, ""): sys.stdout.buffer.write(line.encode('utf-8'))
    for line in iter(stderr.readline, ""): sys.stdout.buffer.write(line.encode('utf-8'))
run('pm2 restart grace-api')
run('pm2 logs grace-api --lines 20 --nostream')
c.close()
