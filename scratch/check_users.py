import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)

def run(cmd, label=''):
    if label: print(f'\n=== {label} ===')
    i, o, e = c.exec_command(cmd)
    print(o.read().decode('utf-8', 'replace'))

run("""PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -U graceandforce_user -d graceandforce_db -h localhost -c "SELECT \\\"studentId\\\", name, \\\"classLevel\\\", grade FROM users LIMIT 10;" """, "Users: classLevel vs grade field")

c.close()
