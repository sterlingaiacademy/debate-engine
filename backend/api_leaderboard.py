import sys
import json
import os
from dotenv import load_dotenv
from leaderboard import Leaderboard, CATEGORY_COLUMN_MAP
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

# Map frontend category IDs to Python leaderboard sort columns
CATEGORY_SORT_MAP = {
    'avg_argument': 'score_argument_quality',
    'avg_rebuttal': 'score_rebuttal_engagement',
    'avg_fluency': 'score_speech_fluency',
}

def get_lb(params=None):
    try:
        lb = Leaderboard()
        
        if params is None:
            params = {}
        
        class_level = params.get('level', '') or None
        timeframe = params.get('timeframe', '') or None
        category = params.get('category', '') or None
        school = params.get('school', '') or None
        limit = params.get('limit', 50)
        offset = params.get('offset', 0)
        
        # Handle category-specific leaderboards
        if category and category != 'global':
            if category == 'top_streaks':
                res = lb.get_leaderboard(
                    sort_by='longest_streak',
                    class_=class_level if class_level else None,
                    school=school if school else None,
                    time_range=timeframe if timeframe else None,
                    limit=limit,
                    offset=offset,
                )
                sys.stdout.reconfigure(encoding='utf-8')
                print(json.dumps(res, cls=CustomJSONEncoder))
                return
            
            col = CATEGORY_SORT_MAP.get(category)
            if col:
                # Use category leaderboard - query debates table for category scores
                cat_name_map = {v: k for k, v in CATEGORY_COLUMN_MAP.items()}
                cat_name = cat_name_map.get(col, '')
                if cat_name:
                    res = lb.get_category_leaderboard(cat_name, limit=limit)
                    # Reshape for frontend compatibility
                    leaders = res.get('leaderboard', [])
                    for i, entry in enumerate(leaders):
                        entry['rank'] = i + 1
                        entry['total_debates'] = entry.get('debates_count', 0)
                        entry['win_rate'] = 0
                        entry['avg_score'] = entry.get('avg_category_score', 0)
                    sys.stdout.reconfigure(encoding='utf-8')
                    print(json.dumps({
                        'leaderboard': leaders,
                        'total_count': len(leaders),
                    }, cls=CustomJSONEncoder))
                    return
        
        # Standard leaderboard
        res = lb.get_leaderboard(
            class_=class_level if class_level else None,
            school=school if school else None,
            time_range=timeframe if timeframe else None,
            limit=limit,
            offset=offset,
        )
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps(res, cls=CustomJSONEncoder))
    except Exception as e:
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        # Try parsing as JSON first (new format)
        try:
            params = json.loads(arg)
            get_lb(params)
        except json.JSONDecodeError:
            # Fallback: old format (plain class level string)
            if arg == "undefined":
                get_lb()
            else:
                get_lb({'level': arg})
    else:
        get_lb()
