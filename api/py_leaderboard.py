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
from api_leaderboard import get_lb

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            
            # Build params dict matching what api_leaderboard.py expects
            params = {
                'level': query_params.get('level', [''])[0] or '',
                'timeframe': query_params.get('timeframe', [''])[0] or '',
                'category': query_params.get('category', [''])[0] or '',
                'school': query_params.get('school', [''])[0] or '',
                'limit': int(query_params.get('limit', ['50'])[0] or 50),
                'offset': int(query_params.get('offset', ['0'])[0] or 0),
            }
            
            # Clean up empty/undefined values
            if params['level'] == 'undefined':
                params['level'] = ''
                
            with Capturing() as output:
                get_lb(params)
                
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
