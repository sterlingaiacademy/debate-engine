import sys

with open('frontend/src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

event_start = content.find('      {/* ── Event Tiles ── */}')
mode_start = content.find('      {/* ── Mode Cards ── */}')
quick_stats_start = content.find('      {/* ── Quick Stats (Minimized) ── */}')

if event_start != -1 and mode_start != -1 and quick_stats_start != -1:
    event_block = content[event_start:mode_start].strip()
    mode_block = content[mode_start:quick_stats_start].strip()
    
    # Reassemble
    before = content[:event_start]
    after = content[quick_stats_start:]
    
    new_content = before + '      ' + mode_block + '\n\n      ' + event_block + '\n\n' + after
    
    with open('frontend/src/pages/Dashboard.jsx', 'w') as f:
        f.write(new_content)
    print("Successfully swapped blocks")
else:
    print("Could not find blocks")
