with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()
start = content.find('      {/* ── Event Tiles ── */}')
end = content.find('      {/* ── Mode Cards ── */}')
if start != -1 and end != -1:
    print(content[start:end])
else:
    print("Not found")
