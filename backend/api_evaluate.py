"""
Debate Evaluation Script — Vultr-only version
==============================================
Runs the rule-based DebateJudge on the transcript file and prints
the result as JSON to stdout.

All database writes (debates table, debate_users stats, streaks,
GForce tokens) are handled by server.js after it receives this output.
No Supabase, no external dependencies beyond the stdlib.
"""

import sys
import json
import os

from debate_judge import DebateJudge


def evaluate(transcript_file, user_id, username, class_level, topic=None):
    try:
        judge = DebateJudge()
        result = judge.judge_file(transcript_file, output_format="dict")

        # Ensure stdout is utf-8 safe (important on Windows servers)
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        sys.stdout.reconfigure(encoding='utf-8')
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Missing arguments. Usage: api_evaluate.py <transcript_file> <user_id> <username> <class_level> [topic]"}))
        sys.exit(1)

    transcript_file = sys.argv[1]
    user_id         = sys.argv[2]
    username        = sys.argv[3]
    class_level     = sys.argv[4]
    topic           = sys.argv[5] if len(sys.argv) > 5 else None

    evaluate(transcript_file, user_id, username, class_level, topic)
