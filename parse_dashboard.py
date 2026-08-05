import json

transcript = '/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/.system_generated/logs/transcript_full.jsonl'
versions = []

with open(transcript, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for tc in data['tool_calls']:
                    name = tc.get('name')
                    if name in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                        args = tc.get('args', {})
                        target = args.get('TargetFile', '')
                        if 'Dashboard.jsx' in target:
                            created_at = data.get('created_at', 'unknown')
                            step = data.get('step_index', 0)
                            content = args.get('CodeContent', '')
                            # for replace/multi_replace, it might not have CodeContent but ReplacementContent
                            size = len(content) if content else 0
                            if name != 'write_to_file':
                                size = -1 # indicates modification, not full write
                            versions.append((step, created_at, name, size))
        except Exception:
            pass

for v in versions[-20:]:
    print(v)
