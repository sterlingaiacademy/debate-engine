import json

transcript = '/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/.system_generated/logs/transcript_full.jsonl'
found_content = ""

# I will find the first read_file or view_file response that contains "ThinkQuest" or "Speech Analysis"
with open(transcript, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'TOOL_RESPONSE':
            output = data.get('content', '')
            if 'ThinkQuest' in output and 'Event Tiles' in output:
                found_content = output
                break

if found_content:
    with open('found_dashboard.txt', 'w') as out:
        out.write(found_content)
    print("Found it!")
else:
    print("Not found")
