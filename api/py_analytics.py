from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import urlparse, parse_qs
import io

class Capturing(list):
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = self._stringio = io.StringIO()
        self._stringio.reconfigure = lambda *args, **kwargs: None
        return self
    def __exit__(self, *args):
        self.extend(self._stringio.getvalue().splitlines())
        del self._stringio
        sys.stdout = self._stdout

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from api_profile import get_profile

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            student_id = query_params.get('studentId', [None])[0]
            
            with Capturing() as output:
                if student_id:
                    get_profile(student_id)
                else:
                    print(json.dumps({"error": "Missing studentId"}))
                
            out_str = "\n".join(output)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(out_str.encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
