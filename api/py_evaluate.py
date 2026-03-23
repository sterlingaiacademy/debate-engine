from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import tempfile
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

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from api_evaluate import evaluate_and_submit

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            transcript = data.get('transcript', [])
            is_junior = data.get('isJunior', False)
            if is_junior:
                resp = {
                  "skipped": True,
                  "overall_score": 10.0,
                  "grade": "N/A",
                  "strengths": ["Great effort!", "Keep practicing your speaking skills."],
                  "weaknesses": [],
                  "areas_to_improve": ["Speak a bit louder next time."],
                  "categories": [],
                  "fallacies_detected": [],
                  "persuasion_techniques": [],
                  "disfluency_report": { "total": 0 },
                  "key_moments": [],
                  "ai_challenges_summary": [],
                  "stats": { "total_turns": len(transcript), "total_words": sum(len(m.get('text', '').split(' ')) for m in transcript) }
                }
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode('utf-8'))
                return

            raw_text = ''
            for msg in transcript:
                raw_text += f"\n{msg.get('text', '')}\n"
                raw_text += 'ASR\n' if msg.get('role', '') == 'user' else 'LLM\n'
                
            with tempfile.NamedTemporaryFile(delete=False, mode='w', encoding='utf-8') as f:
                f.write(raw_text.strip())
                filename = f.name
                
            student_id = data.get('studentId', 'unknown')
            name = data.get('name', 'Anon')
            class_level = data.get('classLevel', 'unknown')
            topic = data.get('topic', 'Unknown Motion')
            
            with Capturing() as output:
                evaluate_and_submit(filename, student_id, name, class_level, topic)
                
            try:
                os.remove(filename)
            except:
                pass
                
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
