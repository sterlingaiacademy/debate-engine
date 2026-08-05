with open('raw_tiles.txt', 'r') as f:
    new_tiles = f.read()

with open('frontend/src/pages/Dashboard.jsx', 'r') as f:
    dash = f.read()

# Replace from Event Tiles to the next section Mode Cards or Charts Row
start_idx = dash.find("      {/* ── Event Tiles ── */}")
end_idx = dash.find("      {/* ── Charts Row ── */}")

if start_idx == -1 or end_idx == -1:
    print("Failed to find boundaries")
    exit(1)

new_dash = dash[:start_idx] + "      {/* ── Event Tiles ── */}\n" + new_tiles + "\n\n" + dash[end_idx:]

with open('frontend/src/pages/Dashboard.jsx', 'w') as f:
    f.write(new_dash)

print("Dashboard restored successfully!")
