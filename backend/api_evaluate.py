import sys
import json
import os
from dotenv import load_dotenv
from leaderboard import Leaderboard
from debate_judge import DebateJudge

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def evaluate_and_submit(transcript_file, user_id, username, class_level, topic=None):
    try:
        judge = DebateJudge()
        lb = Leaderboard()
        
        result = judge.judge_file(transcript_file, output_format="dict")
        
        # Override the AI-extracted topic with the actual assigned topic
        # (Removed: We now want to strictly use the motion extracted by the judge)
        # if topic and topic != "Unknown Motion":
        #     result["motion"] = topic

        # Only submit if it's a valid judgement and not skipped for junior levels
        if "error" not in result and not result.get("skipped"):
            lb_res = lb.submit_result(
                user_id=user_id,
                username=username,
                result=result,
                metadata={"class": class_level}
            )
            # Attach leaderboard ranking / elo updates to the result payload for the frontend
            result["leaderboard_update"] = lb_res
            
        # Ensure utf-8 encoding for reliable IPC on Windows
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
        
    transcript_file = sys.argv[1]
    user_id = sys.argv[2]
    username = sys.argv[3]
    class_level = sys.argv[4]
    topic = sys.argv[5] if len(sys.argv) > 5 else None
    
    evaluate_and_submit(transcript_file, user_id, username, class_level, topic)
