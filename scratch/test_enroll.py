import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)

def run(cmd, label=''):
    if label: print(f'\n>>> {label}')
    i, o, e = c.exec_command(f'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; {cmd}')
    out = o.read().decode('utf-8', 'replace')
    err = e.read().decode('utf-8', 'replace')
    if out.strip(): print(out[:2000])
    if err.strip(): print('ERR:', err[:500])

# Test the enroll endpoint
run("""curl -s -X POST http://localhost:5000/api/enroll -H 'Content-Type: application/json' -d '{"studentId":"hanan","studentName":"hanan","grade":"Class 11","parentPhone":"7894561230","school":"kendriya"}'""", "Direct test of /api/enroll")

# Check PM2 error logs
run("tail -20 /home/graceandforce/.pm2/logs/grace-api-error.log", "PM2 error logs")

# Check if route exists in deployed server.js
run("grep -n 'api/enroll' /home/graceandforce/debate-engine/backend/server.js", "enroll route in server.js on server")

c.close()
