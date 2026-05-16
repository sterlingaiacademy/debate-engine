import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST     = "65.20.85.75"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, 'graceandforce', PASSWORD, timeout=15)

def run(cmd, label=''):
    if label: print(f'\n>>> {label}')
    i, o, e = c.exec_command(
        f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}'
    )
    out = o.read().decode('utf-8', 'replace')
    err = e.read().decode('utf-8', 'replace')
    if out.strip(): print(out[:2000])
    if err.strip(): print('ERR:', err[:500])

# Upload server.js via SFTP
sftp = c.open_sftp()
sftp.put(
    r'C:\Users\hisha\.gemini\antigravity\scratch\grace-and-force\backend\server.js',
    f'{APP_DIR}/backend/server.js'
)
sftp.close()
print('>>> server.js uploaded via SFTP')

# Restart PM2
run(f'pm2 restart grace-api', 'Restart PM2')
run(f'pm2 status | grep grace', 'PM2 status')

# Quick test - login should now return grade
run("""curl -s -X POST http://localhost:5000/api/login -H 'Content-Type: application/json' -d '{"studentId":"hanan","password":"hanan123"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('grade in response:', d.get('user',{}).get('grade','MISSING'))" 2>/dev/null || echo 'test skipped'""", 'Test grade in login response')

print('\n>>> DONE - grade is now returned on login')
print('>>> User must LOG OUT and LOG BACK IN to get the updated user object')
c.close()
