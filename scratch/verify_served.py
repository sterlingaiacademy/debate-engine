import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)
NR = '/var/www/grace-and-force/frontend'
APP = '/home/graceandforce/debate-engine'

def run(cmd, label):
    print(f'\n=== {label} ===')
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', 'replace')
    print(out[:2000] if out.strip() else '(empty)')

run(f'grep src= {NR}/index.html', 'index.html main bundle reference')
run(f'ls {NR}/assets/Settings-*.js', 'Settings JS chunks in nginx root')
run(f'grep -o "School Name" {NR}/assets/Settings-*.js | head -5', 'School Name in served Settings JS?')
run(f'grep -o "Guardian Email" {NR}/assets/Settings-*.js | head -5', 'Guardian Email in served Settings JS?')
run(f'grep -c "parentPhone" {NR}/assets/Settings-*.js', 'parentPhone in served Settings JS?')
run(f'grep -n "School\|school\|parentPhone\|Guardian\|parentEmail" {APP}/frontend/src/pages/Settings.jsx | head -20', 'Source Settings.jsx field check')

c.close()
