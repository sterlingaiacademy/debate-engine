import re
import sys

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Fix the \n that was accidentally injected
# In JavaScript/JSX, a literal '\n' inside text might be rendered if it was injected.
# We will just replace '      </div>\\n      </div>' with '      </div>\n      </div>'
content = content.replace('      </div>\\n      </div>', '      </div>\n      </div>')
content = content.replace('</div>\\n      </div>', '</div>\n      </div>')
content = content.replace('\\n', '') # Remove any remaining stray \n that might be rendered, but carefully. Wait, \n in strings is fine. 
# Actually, the user saw a literal \n.
# Let's just remove `\n` if it's inside the JSX but outside a string.
content = content.replace('{/* ── Charts Row ── */}', '{/* ── Charts Row ── */}')

# 2. Add Speech Analysis to SENIOR_MODES and JUNIOR_MODES
speech_analysis_mode = """  {
    id: 'speech-analysis',
    title: 'Speech Analysis',
    desc: 'Analyze your speech recordings and get detailed feedback on pacing and clarity.',
    tag: 'ANALYSIS',
    icon: Mic,
    color: '#f43f5e',
    grad: 'linear-gradient(135deg, #1f0510, #3e0a20)',
    glow: 'rgba(244,63,94,0.25)',
    path: () => '/speech-analysis',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
"""

if "'speech-analysis'" not in content:
    # Insert into SENIOR_MODES
    content = content.replace('];\n\nconst JUNIOR_MODES', speech_analysis_mode + '];\n\nconst JUNIOR_MODES')
    # Insert into JUNIOR_MODES
    content = content.replace('];\n\nconst ALL_BADGES', speech_analysis_mode.replace('levels: [', '// levels: [') + '];\n\nconst ALL_BADGES')

# 3. Swap Modes and Events
event_start = content.find('      {/* ── Event Tiles ── */}')
event_end = content.find('      {/* ── Mode Cards ── */}')
mode_end = content.find('      {/* ── Quick Stats (Minimized) ── */}')

if event_start != -1 and event_end != -1 and mode_end != -1:
    before = content[:event_start]
    events_block = content[event_start:event_end].strip()
    modes_block = content[event_end:mode_end].strip()
    after = content[mode_end:]
    
    # We will completely REPLACE the events block with a newly generated one containing ALL vibrant tiles
    
    new_events_block = """      {/* ── Event Tiles ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 1rem', color: 'var(--text-primary)' }}>Upcoming Events & Challenges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          
          {/* ThinkQuest Olympiad */}
          <div onClick={() => navigate('/olympiad/practice')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(225,29,72,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(225,29,72,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,29,72,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>COMPETITION</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>ThinkQuest Olympiad</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Join the national level Olympiad and test your skills.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Participate Now <ChevronRight size={14} /></div>
          </div>

          {/* Great India Freedom Challenge */}
          <div onClick={() => navigate('/freedom-quiz')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(5,150,105,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(5,150,105,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>CHALLENGE</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Great India Freedom Challenge</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Test your knowledge on India's struggle for independence.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Start Challenge <ChevronRight size={14} /></div>
          </div>

          {/* Speak English Without Fear */}
          <div onClick={() => navigate('/english-session')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #0f766e 0%, #042f2e 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(15,118,110,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(15,118,110,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,118,110,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#5eead4', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>WORKSHOP</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Speak English Without Fear</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', lineHeight: 1.5 }}>Overcome hesitation and speak fluently in any situation.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#5eead4' }}>Register <ChevronRight size={14} /></div>
          </div>

          {/* Indus MUN Hybrid */}
          <div onClick={() => navigate('/indus-mun')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(3,105,161,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(3,105,161,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(3,105,161,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>MUN</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Indus MUN Hybrid</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Join the prestigious Indus Model United Nations.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Explore <ChevronRight size={14} /></div>
          </div>

          {/* Mini MUN Module-4 */}
          <div onClick={() => navigate('/mini-mun')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(126,34,206,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(126,34,206,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(126,34,206,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>LIVE SESSION</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Mini MUN Module-4</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Learn resolution drafting and advanced negotiation.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Register Now <ChevronRight size={14} /></div>
          </div>
          
          {/* G-Talk Cohort */}
          <div onClick={() => navigate('/cohort')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(180,83,9,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(180,83,9,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(180,83,9,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>LIVE COHORT 2.0</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>G-Talk Cohort 2</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Master Public Speaking & Debating with live online sessions.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Learn More <ChevronRight size={14} /></div>
          </div>
          
          {/* Teachers Challenge 2026 */}
          <div onClick={() => navigate('/teachers-challenge')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(190,24,93,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(190,24,93,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(190,24,93,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>FOR TEACHERS</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Teachers' Challenge 2026</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>A special master class and challenge for all educators.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>View Details <ChevronRight size={14} /></div>
          </div>

        </div>
      </div>
"""

    content = before + '      ' + modes_block + '\n\n' + new_events_block + '\n\n' + after
    with open('src/pages/Dashboard.jsx', 'w') as f:
        f.write(content)
    print("Rewrote Dashboard layout successfully.")
else:
    print("Could not find layout blocks. Did not rewrite.")

