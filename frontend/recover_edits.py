import json

transcript_path = '/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for tc in step['tool_calls']:
                    if tc['name'] == 'default_api:replace_file_content' or tc['name'] == 'default_api:multi_replace_file_content':
                        if 'Dashboard.jsx' in str(tc.get('args', {})):
                            print(json.dumps(tc['args'], indent=2))
        except:
            pass
