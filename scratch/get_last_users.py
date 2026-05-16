import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('65.20.85.75', 22, 'graceandforce', 'wvpi2!ZnTcV];ncy')

stdin, stdout, stderr = client.exec_command("PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -h localhost -U graceandforce_user -d graceandforce_db -c 'SELECT \"studentId\", email, auth_provider FROM users ORDER BY \"createdAt\" DESC LIMIT 5;'")
print(stdout.read().decode())
print(stderr.read().decode())
