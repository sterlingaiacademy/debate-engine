import paramiko

HOST     = "65.20.85.75"
PORT     = 22
USERNAME = "graceandforce"
PASSWORD = "wvpi2!ZnTcV];ncy"
APP_DIR  = "/home/graceandforce/debate-engine"

def run(client, cmd, label=""):
    print(f"\n>>> {label or cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode("utf-8", "ignore").strip()
    err = stderr.read().decode("utf-8", "ignore").strip()
    if out:
        print(out)
    if err:
        print("STDERR:", err)
    return out

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f"Connecting to {HOST}...")
    client.connect(HOST, PORT, USERNAME, PASSWORD, timeout=20)
    print("Connected!\n")

    nvm = 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'

    # 1. Git pull
    run(client, f"cd {APP_DIR} && git pull origin main", "git pull")

    # 2. Install any new npm deps (quick, skips if nothing changed)
    run(client, f'{nvm}; cd {APP_DIR}/backend && npm install --production', "npm install")

    # 3. Restart PM2
    run(client, f'{nvm}; pm2 restart grace-api', "pm2 restart")

    # 4. Status
    run(client, f'{nvm}; pm2 status', "pm2 status")

    # 5. Quick smoke test of evaluate endpoint
    run(client,
        'curl -s -X POST http://localhost:5000/api/evaluate '
        '-H "Content-Type: application/json" '
        '-d \'{"transcript":[{"role":"agent","text":"Do you agree?"},{"role":"user","text":"Yes I strongly agree because social media connects people and helps share ideas globally."}],'
        '"topic":"Social media","isJunior":false,"studentId":"test","name":"Test","classLevel":"Level 3"}\' '
        '| python3 -c "import sys,json; r=json.load(sys.stdin); print(\'OK - Score:\', r.get(\'overall_score\', r.get(\'error\',\'??\')))"',
        "smoke test evaluate endpoint"
    )

    client.close()
    print("\nDone!")

if __name__ == "__main__":
    deploy()
