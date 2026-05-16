import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)

def run(cmd, label=''):
    if label: print(f'\n>>> {label}')
    i, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8', 'replace')
    if out.strip(): print(out[:2000])

# Fix the DB table - drop NOT NULL on parent_email and add default
run("""PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -U graceandforce_user -d graceandforce_db -h localhost -c "
ALTER TABLE gforce.enrollment_requests ALTER COLUMN parent_email DROP NOT NULL;
ALTER TABLE gforce.enrollment_requests ALTER COLUMN parent_email SET DEFAULT '';
SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='gforce' AND table_name='enrollment_requests' ORDER BY ordinal_position;
" """, "Fix parent_email NOT NULL constraint")

c.close()
