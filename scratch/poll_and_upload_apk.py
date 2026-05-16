import subprocess
import time
import re
import json

def get_latest_build_url():
    try:
        result = subprocess.run(
            ["npx", "eas-cli", "build:list", "--status", "finished", "--limit", "1", "--json", "--non-interactive"],
            cwd="c:\\Users\\hisha\\.gemini\\antigravity\\scratch\\grace-and-force\\mobile",
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            builds = json.loads(result.stdout)
            if builds and len(builds) > 0:
                # Make sure it's the build we just triggered (within last 30 mins)
                build = builds[0]
                if build.get('platform') == 'ANDROID' and build.get('artifacts') and build['artifacts'].get('buildUrl'):
                    return build['artifacts']['buildUrl']
    except Exception as e:
        print(f"Error checking build: {e}")
    return None

print("Polling Expo for the finished build URL...")
build_url = None
for _ in range(60): # Poll for up to 30 mins
    build_url = get_latest_build_url()
    if build_url:
        break
    time.sleep(30)

if build_url:
    print(f"Found build URL: {build_url}")
    print("Uploading to Vultr server...")
    subprocess.run(["python", "c:\\Users\\hisha\\.gemini\\antigravity\\scratch\\grace-and-force\\scratch\\upload_apk.py", build_url])
    print("Done!")
else:
    print("Timeout waiting for build.")
