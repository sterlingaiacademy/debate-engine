import re

# 1. Read recovered_changes.txt
with open('/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/scratch/recovered_changes.txt', 'r') as f:
    recovered = f.read()

# Extract newTiles string
match = re.search(r"const newTiles = `\n(.*?)\n`;", recovered, re.DOTALL)
if not match:
    print("Could not find newTiles in recovered_changes.txt")
    exit(1)

new_tiles_raw = match.group(1)
# Remove the line numbers from the start of each line
new_tiles_clean = '\n'.join([line.split(': ', 1)[1] if ': ' in line else line for line in new_tiles_raw.split('\n')])

# We know reorder-tiles.cjs reordered them to: MiniMun, Teachers, GTalk, Rest
# Let's see the order inside new_tiles_clean
# It currently has: GTalk, Teachers, MiniMun, Olympiad, Hybrid, Freedom

def extract_tile(html, start_comment):
    start = html.find(start_comment)
    if start == -1: return ""
    
    # We find the next `{/* ` to know where this tile ends, OR the end of the div
    next_comment = html.find('        {/* ', start + 10)
    if next_comment == -1:
        next_comment = len(html)
    return html[start:next_comment]

gtalk = extract_tile(new_tiles_clean, '        {/* G-Talk Cohort 2 */}')
teachers = extract_tile(new_tiles_clean, "        {/* Teachers' Challenge */}")
minimun = extract_tile(new_tiles_clean, '        {/* Mini MUN Module-4 */}')
rest = new_tiles_clean[new_tiles_clean.find('        {/* ThinkQuest Olympiad */}'):]

start_marker = "      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>\n"

# The user's exact requested layout:
final_tiles = start_marker + minimun + teachers + gtalk + rest

# 2. Read Dashboard.jsx
with open('frontend/src/pages/Dashboard.jsx', 'r') as f:
    dash = f.read()

# 3. Replace the Event Tiles block
start_idx = dash.find("      {/* ── Event Tiles ── */}")
end_idx = dash.find("      {/* ── Charts Row ── */}")

if start_idx == -1 or end_idx == -1:
    print("Could not find Event Tiles or Charts Row markers in Dashboard.jsx")
    exit(1)

# Construct final
new_dash = dash[:start_idx] + "      {/* ── Event Tiles ── */}\n" + final_tiles + "\n\n" + dash[end_idx:]

with open('frontend/src/pages/Dashboard.jsx', 'w') as f:
    f.write(new_dash)

print("Dashboard restored successfully!")
