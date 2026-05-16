import urllib.request, json

req = urllib.request.Request(
    'https://graceandforce.com/api/auth/google',
    data=json.dumps({"access_token": "fake"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Data:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Data:", e.read().decode())
except Exception as e:
    print("Error:", str(e))
