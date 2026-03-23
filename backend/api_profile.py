import sys
import json
import os
from dotenv import load_dotenv
from leaderboard import Leaderboard
from datetime import datetime

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class CustomJSONEncoder(json.JSONEncoder):
    """Fallback encoder to suppress serialization errors on unexpected data types."""
    def default(self, obj):
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

def get_profile(user_id):
    try:
        lb = Leaderboard()
        profile = lb.get_user_profile(user_id)
        sys.stdout.reconfigure(encoding='utf-8')
        if not profile:
            print(json.dumps({"error": "User not found"}))
        else:
            print(json.dumps(profile, cls=CustomJSONEncoder))
    except Exception as e:
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_profile(sys.argv[1])
    else:
        print(json.dumps({"error": "Missing user_id"}))
