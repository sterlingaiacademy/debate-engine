import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)

def run(cmd, label=''):
    if label: print(f'\n>>> {label}')
    i, o, e = c.exec_command(f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}')
    out = o.read().decode('utf-8', 'replace')
    if out.strip(): print(out[:2000])

# Verify grade is in server.js response
run("grep -n 'grade' /home/graceandforce/debate-engine/backend/server.js | head -10", "grade in server.js")

# Check PM2 errors
run("tail -5 /home/graceandforce/.pm2/logs/grace-api-error.log", "PM2 recent errors")

# Test login with actual user (test with a known username - will fail auth but check the code path)
run("""curl -s -X POST http://localhost:5000/api/login -H 'Content-Type: application/json' -d '{"studentId":"hanan","password":"wrongpwd"}' """, "Login API response shape")

c.close()
print('\n>>> IMPORTANT: User must LOG OUT and LOG BACK IN at graceandforce.com/login')
print('>>> After re-login, the Class field will show Class 11 instead of Level 5')
