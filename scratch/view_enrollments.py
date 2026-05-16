import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)

def run(cmd, label=''):
    if label: print(f'\n=== {label} ===')
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', 'replace')
    print(out if out.strip() else '(empty)')

# View all enrollment submissions
run("""PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -U graceandforce_user -d graceandforce_db -h localhost -c "SELECT id, student_name, grade, school, parent_phone, created_at FROM enrollment_requests ORDER BY created_at DESC LIMIT 20;" """, "All enrollment submissions")

c.close()
