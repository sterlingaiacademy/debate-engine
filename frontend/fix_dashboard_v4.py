import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Swap Modes and Events for Senior
event_start = content.find('      {/* ── Event Tiles ── */}')
mode_start = content.find('      {/* ── Mode Cards ── */}')
quick_stats_start = content.find('      {/* ── Quick Stats (Minimized) ── */}')
charts_start = content.find('      {/* ── Charts Row ── */}')
achievements_end = content.find('    </div>\n    </>\n  );')

# In base file: Event Tiles -> Mode Cards -> Quick Stats -> Charts Row -> Achievements
if event_start != -1 and mode_start != -1 and quick_stats_start != -1 and charts_start != -1:
    before = content[:event_start]
    events = content[event_start:mode_start]
    modes = content[mode_start:quick_stats_start]
    
    # We want to remove quick_stats up to charts_start. 
    # Also we want to remove the Achievements block which comes after charts.
    
    # Actually, the user's screenshot had: Speech Coach (mode), then Quick Stats, then Achievements!
    # Wait, the user said "how did this thing came? its removed right?" pointing to Quick Stats and Achievements.
    # So yes, remove them.
    
    # We want: before + modes + events + charts_start to end of charts, BUT skip achievements?
    # No, wait, they said "how did this thing came". They didn't mention Charts Row. Let's keep Charts Row, remove Achievements.
    achievements_start = content.find('      {displayBadges.length > 0 && (')
    achievements_end = content.find('      )}', achievements_start) + 9 # include "      )}\n"
    
    if achievements_start != -1:
        after_charts = content[charts_start:achievements_start] + content[achievements_end:]
    else:
        after_charts = content[charts_start:]
    
    new_senior = before + modes + events + after_charts
    content = new_senior
    print("Swapped modes/events and removed quick stats/achievements for Senior.")

# 2. Swap Modes and Events for Junior? 
# Wait, junior DOES NOT HAVE EVENT TILES. Junior only has Mode Cards.
# The user's complaint was probably just about Senior, since Senior is the one that had both.

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)
