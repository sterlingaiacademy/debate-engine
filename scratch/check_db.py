import psycopg2

conn = psycopg2.connect(
    dbname='gforce',
    user='graceandforce',
    password='wvpi2!ZnTcV];ncy',
    host='localhost'
)
cur = conn.cursor()
cur.execute('SELECT name, "studentId", password, auth_provider FROM users ORDER BY created_at DESC LIMIT 5')
for r in cur.fetchall():
    print(r)
