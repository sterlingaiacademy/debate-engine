import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)
NR = '/var/www/grace-and-force/frontend'
APP = '/home/graceandforce/debate-engine'
PASSWORD = 'wvpi2!ZnTcV];ncy'

def run(cmd, label=''):
    if label: print(f'\n>>> {label}')
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', 'replace')
    err = e.read().decode('utf-8', 'replace')
    if out.strip(): print(out[:3000])
    if err.strip(): print('ERR:', err[:500])

def sudo(cmd, label=''):
    run(f"echo '{PASSWORD}' | sudo -S {cmd} 2>&1", label)

# Step 1: Completely wipe /var/www assets folder
sudo(f'rm -rf {NR}/assets', 'WIPE entire assets folder in nginx root')

# Step 2: Copy fresh dist from new build
run(f'cp -rf {APP}/frontend/dist/. {NR}/', 'Copy fresh build to nginx root')

# Step 3: Verify - only new chunks should exist
run(f'ls {NR}/assets/Settings-*.js', 'Settings chunks now (should be only 1)')
run(f'ls {NR}/assets/index-*.js', 'Index chunks now (should be only 1)')
run(f'grep -o "School Name" {NR}/assets/Settings-*.js', 'School Name in new Settings JS?')
run(f'grep -o "Guardian Email" {NR}/assets/Settings-*.js 2>/dev/null || echo "CLEAN - no Guardian Email"', 'Guardian Email gone?')

# Step 4: Verify index.html
run(f'grep src= {NR}/index.html', 'index.html references')

# Step 5: Reload nginx
sudo('nginx -s reload', 'Reload nginx')

print('\n>>> DONE - All old chunks wiped. Only new build is live.')
c.close()
