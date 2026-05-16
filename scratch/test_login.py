import urllib.request
import json
import urllib.error

API_URL = "https://graceandforce.com/api"

# 1. Register test user
reg_data = json.dumps({
    "name": "Test User",
    "studentId": "testuser999",
    "password": "Password@123",
    "classLevel": "Level 5",
    "grade": "Class 9",
    "authProvider": "google"
}).encode('utf-8')

req = urllib.request.Request(f"{API_URL}/register", data=reg_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Register:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Register Error:", e.read().decode())

# 2. Login test user
login_data = json.dumps({
    "studentId": "testuser999",
    "password": "Password@123"
}).encode('utf-8')

req2 = urllib.request.Request(f"{API_URL}/login", data=login_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req2) as response:
        print("Login:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Login Error:", e.read().decode())
