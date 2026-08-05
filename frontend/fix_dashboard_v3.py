with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# Swap Mode Cards and Event Tiles in the first block (presumably Senior)
event_start = content.find('      {/* ── Event Tiles ── */}')
mode_start = content.find('      {/* ── Mode Cards ── */}')
quick_stats_start = content.find('      {/* ── Quick Stats (Minimized) ── */}')
charts_start = content.find('      {/* ── Charts Row ── */}')

if event_start != -1 and mode_start != -1 and quick_stats_start != -1:
    event_block = content[event_start:mode_start].strip()
    mode_block = content[mode_start:quick_stats_start].strip()
    
    # We will also remove Quick Stats and Achievements. 
    # Where does the Achievements block end? Probably at Charts Row.
    # Actually, let's just remove everything from quick_stats_start up to charts_start
    
    before = content[:event_start]
    after = content[charts_start:]
    
    # modes first, then events
    new_content = before + '      ' + mode_block + '\n\n      ' + event_block + '\n\n      ' + after
    
    with open('src/pages/Dashboard.jsx', 'w') as f:
        f.write(new_content)
    print("Successfully swapped and removed senior stats/achievements")
else:
    print("Could not find senior blocks")

# Now do the same for junior if it exists
junior_mode_start = content.find('      {/* ── Mode Cards ── */}', mode_start + 1)
junior_quick_stats_start = content.find('      {/* ── Quick Stats (Minimized) ── */}', quick_stats_start + 1)
junior_end = content.find('    </div>\n  );\n}\n', junior_quick_stats_start)

if junior_mode_start != -1 and junior_quick_stats_start != -1:
    with open('src/pages/Dashboard.jsx', 'r') as f:
        content = f.read()
    junior_mode_start = content.find('      {/* ── Mode Cards ── */}', content.find('      {/* ── Charts Row ── */}'))
    junior_quick_stats_start = content.find('      {/* ── Quick Stats (Minimized) ── */}', junior_mode_start)
    junior_charts_start = content.find('      {/* ── Charts Row ── */}', junior_quick_stats_start)
    
    if junior_charts_start == -1:
        # If no charts row in junior, remove until end of div
        # Find the last closing div before the end of the file
        junior_end = content.rfind('    </div>\n  );')
        if junior_end != -1:
            before_junior_stats = content[:junior_quick_stats_start]
            after_junior = content[junior_end:]
            with open('src/pages/Dashboard.jsx', 'w') as f:
                f.write(before_junior_stats + after_junior)
            print("Removed junior stats")

