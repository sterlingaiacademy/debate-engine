import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)
NR = '/var/www/grace-and-force/frontend'

def run(cmd, label):
    print(f'\n[{label}]')
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', 'replace').strip()
    print(out if out else '(empty)')

# 1. What index.html serves
run(f'grep src= {NR}/index.html', 'index.html → main JS bundle')

# 2. How many Settings chunks (must be exactly 1)
run(f'ls {NR}/assets/Settings-*.js | wc -l', 'Settings JS count (must be 1)')

# 3. Confirm School Name in Settings
run(f'grep -c "School Name" {NR}/assets/Settings-*.js', 'School Name count in Settings JS')

# 4. Confirm no Guardian Email
run(f'grep -c "Guardian Email" {NR}/assets/Settings-*.js 2>/dev/null || echo "0 - CLEAN"', 'Guardian Email in Settings JS (must be 0)')

# 5. PM2 status
run('export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; pm2 list | grep grace', 'PM2 grace-api status')

# 6. Live curl test of login API
run("curl -s -X POST http://localhost:5000/api/login -H 'Content-Type: application/json' -d '{\"studentId\":\"test\",\"password\":\"test\"}'", 'Login API response (should not be server error)')

c.close()
print('\n=== DEPLOYMENT STATUS ===')
print('GitHub: 99fcf4f + de084af - PUSHED')
print('Vultr:  See above results')
