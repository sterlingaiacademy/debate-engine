import sys

with open('/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/scratch/recovered_changes.txt', 'r') as f:
    lines = f.readlines()

new_tiles_lines = []
in_new_tiles = False
for line in lines:
    # Remove prefix like "123: "
    if ": " in line:
        content = line.split(": ", 1)[1]
    else:
        content = line
        
    if "const newTiles = `" in content:
        in_new_tiles = True
        continue
    
    if in_new_tiles:
        if "`;" in content:
            in_new_tiles = False
            break
        new_tiles_lines.append(content)

raw_html = "".join(new_tiles_lines)
with open('raw_tiles.txt', 'w') as f:
    f.write(raw_html)
print("Extracted tiles length:", len(raw_html))
