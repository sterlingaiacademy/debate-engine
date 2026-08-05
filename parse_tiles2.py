import sys
import re

with open('/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/scratch/recovered_changes.txt', 'r') as f:
    lines = f.readlines()

new_tiles_lines = []
in_new_tiles = False
for line in lines:
    # Safely remove prefix like "123: "
    line = re.sub(r'^[0-9]+: ', '', line)
    
    if "const newTiles = `" in line:
        in_new_tiles = True
        continue
    
    if in_new_tiles:
        if "`;" in line:
            in_new_tiles = False
            break
        new_tiles_lines.append(line)

raw_html = "".join(new_tiles_lines)
with open('raw_tiles2.txt', 'w') as f:
    f.write(raw_html)
