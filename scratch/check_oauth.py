import urllib.request
import json

url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=624023459084-o1l7b425m8sqo35o25hf3jllrj0165oo.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fgraceandforce.com%2Fgoogle-callback&response_type=token&scope=email%20profile&prompt=select_account"

req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
        print(response.status)
        print("OK!")
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print(str(e))
