"""
Fix: Install missing Python dependencies on Vultr server
Run this from your local machine via SSH
"""
import subprocess

SERVER = "root@65.20.85.75"  # Your Vultr server IP

commands = [
    # Install missing supabase python package and dependencies
    "pip3 install supabase python-dotenv httpx",
    # Verify installation
    "python3 -c \"import supabase; print('supabase OK')\"",
    "python3 -c \"import dotenv; print('dotenv OK')\"",
    # Restart PM2 to pick up any env changes
    "pm2 restart all",
    "pm2 status",
]

print("Connecting to Vultr server and installing dependencies...\n")
for cmd in commands:
    print(f">>> {cmd}")
    result = subprocess.run(
        ["ssh", "-o", "StrictHostKeyChecking=no", SERVER, cmd],
        capture_output=True, text=True
    )
    print(result.stdout or "(no output)")
    if result.stderr:
        print("STDERR:", result.stderr[:300])
    print()
