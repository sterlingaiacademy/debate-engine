with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# Add missing icons
content = content.replace("CheckCircle2\n} from 'lucide-react';", "CheckCircle2, Flag\n} from 'lucide-react';")
if "import { Download" not in content:
    content = content.replace("import logoImg from '../assets/logo.png';", "import logoImg from '../assets/logo.png';\nimport { Download } from 'lucide-react';")

# 1. We need to add the new events into the Event Tiles section.
# Event Tiles are in the Senior block.
# Let's find where Event Tiles section ends.
event_start = content.find('      {/* ── Event Tiles ── */}')
charts_start = content.find('      {/* ── Charts Row ── */}')
# Note: Since we swapped modes and events, Event Tiles is NOW RIGHT BEFORE Charts Row.
# Let's just append to the Event Tiles block before the end of the div.

# Find the closing div of the Event Tiles grid.
# Event tiles grid starts at: <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
# Let's replace the grid to make it min(100%, 280px) and remove intermediate grids.
content = content.replace(
    "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>",
    "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>"
)
content = content.replace(
    "        </div>\n        {/* Bottom Row */}\n        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>",
    "        \n        {/* Bottom Row */}"
)
content = content.replace(
    "        </div>\n        {/* Bottom Row */}\n        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>",
    "        \n        {/* Bottom Row */}"
)

# Now, where to inject the new tiles?
# Right before the Charts Row! Since we already swapped modes/events, the Event Tiles div is closed right before Charts Row.
new_events = """
        {/* Indus MUN Tile */}
        <div
          onClick={() => navigate('/indus-mun')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #422006 0%, #713f12 100%)',
            border: '1px solid rgba(234,179,8,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(234,179,8,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #eab308, #fef08a)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#eab308', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              HYBRID MUN
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#eab308" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Indus MUN <span style={{ color: '#eab308' }}>Hybrid</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Offline + Online MUN. August 14-16th, 2026. Very Limited Spots!
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#eab308' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>

        {/* English Session Tile */}
        <div
          onClick={() => navigate('/english-session')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #020617 0%, #1e3a8a 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #93c5fd)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              FREE SESSION
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={16} color="#60a5fa" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Speak English <span style={{ color: '#60a5fa' }}>Without Fear</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Parent-Child Confidence-Building Session (Grades 3-8). August 9th, 2026.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>

        {/* Freedom Quiz Tile */}
        <div
          onClick={() => navigate('/freedom-quiz')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #431407 0%, #1a0500 100%)',
            border: '1px solid rgba(249,115,22,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f97316, #fdba74)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              NEW CHALLENGE
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flag size={16} color="#f97316" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Great India <span style={{ color: '#f97316' }}>Freedom Challenge</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Freedom Quiz for All Indian Citizens on August 15th, 2026. Free Registration!
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#f97316' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>
"""

insert_pos = content.find('      </div>\n\n      {/* ── Charts Row ── */}')
if insert_pos != -1:
    content = content[:insert_pos] + new_events + content[insert_pos:]
    with open('src/pages/Dashboard.jsx', 'w') as f:
        f.write(content)
    print("Added events!")
else:
    print("Could not find insert position")
