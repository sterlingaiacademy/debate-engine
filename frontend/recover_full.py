import json
import re

transcript_path = '/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/.system_generated/logs/transcript_full.jsonl'

latest_content = None

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            step = json.loads(line)
            
            # Check tool calls that write to Dashboard.jsx
            if 'tool_calls' in step:
                for tc in step['tool_calls']:
                    if tc['name'] == 'default_api:write_to_file' and 'Dashboard.jsx' in tc.get('args', {}).get('TargetFile', ''):
                        latest_content = tc['args']['CodeContent']
                        
            # Check tool responses from view_file or cat
            if 'tool_responses' in step:
                for tr in step['tool_responses']:
                    output = tr.get('output', '')
                    if 'File Path:' in output and 'Dashboard.jsx' in output and 'The above content shows the entire, complete file contents' in output:
                        # Extract content from view_file
                        lines = output.split('\n')
                        content_lines = []
                        for l in lines:
                            if re.match(r'^[0-9]+: ', l):
                                content_lines.append(l.split(': ', 1)[1])
                        if content_lines:
                            latest_content = '\n'.join(content_lines)
                            
        except Exception as e:
            pass

if latest_content:
    with open('recovered_dashboard_full.jsx', 'w') as out:
        out.write(latest_content)
    print(f'Recovered file with {len(latest_content)} characters.')
else:
    print('Could not find full Dashboard.jsx in transcript.')
