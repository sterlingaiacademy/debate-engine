import sys
import json
import os
from dotenv import load_dotenv
from leaderboard import Leaderboard
from datetime import datetime

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class CustomJSONEncoder(json.JSONEncoder):
    """Fallback encoder to suppress serialization errors on unexpected data types."""
    def default(self, obj):
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

def get_lb(class_level=None):
    try:
        lb = Leaderboard()
        # Fetch leaderboard, filter by class if provided
        res = lb.get_leaderboard(
            class_=class_level if class_level else None,
            limit=100
        )
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps(res, cls=CustomJSONEncoder))
    except Exception as e:
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    c_level = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] != "undefined" else None
    get_lb(c_level)
