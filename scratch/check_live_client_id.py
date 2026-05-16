import urllib.request
import re

url = "https://graceandforce.com/login"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        
    js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)
    
    for js in js_files:
        js_url = "https://graceandforce.com" + js
        with urllib.request.urlopen(js_url) as js_res:
            js_content = js_res.read().decode('utf-8')
            if '624023459084' in js_content:
                print(f"Found Client ID in {js}")
                matches = re.findall(r'624023459084-[a-zA-Z0-9]+.apps.googleusercontent.com', js_content)
                print(matches)
                
except Exception as e:
    print("Error:", str(e))
