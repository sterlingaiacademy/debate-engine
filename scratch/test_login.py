import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy', timeout=10)

cmd = """curl -s -X POST http://localhost:5000/api/login -H 'Content-Type: application/json' -d '{"studentId":"hanan","password":"test123"}'"""
i, o, e = c.exec_command(cmd)
print("Login response:", o.read().decode('utf-8', errors='replace'))
print("Errors:", e.read().decode('utf-8', errors='replace'))
c.close()
