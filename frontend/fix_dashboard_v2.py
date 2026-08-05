import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# The vibrant events block
events_block = """      {/* ── Event Tiles ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 1rem', color: 'var(--text-primary)' }}>Upcoming Events & Challenges</h2>
        
        {/* Top Row: 3 Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          
          {/* Great India Freedom Challenge */}
          <div onClick={() => navigate('/freedom-quiz')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(16,185,129,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(16,185,129,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>CHALLENGE</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={16} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Great India Freedom Challenge</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Test your knowledge on India's struggle for independence.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Start Challenge <ChevronRight size={14} /></div>
          </div>

          {/* Mini MUN Module 4 */}
          <div onClick={() => navigate('/mini-mun')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(139,92,246,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(139,92,246,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>LIVE SESSION</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={16} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Mini MUN Module 4</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Master the art of writing an excellent position paper and stand out.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Register Now <ChevronRight size={14} /></div>
          </div>

          {/* Speak English Without Fear */}
          <div onClick={() => navigate('/english-session')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(245,158,11,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(245,158,11,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>WORKSHOP</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={16} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Speak English Without Fear</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Join our interactive session to build confidence in public speaking.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Join Workshop <ChevronRight size={14} /></div>
          </div>
          
        </div>

        {/* Bottom Row: 2 Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          
          {/* ThinkQuest Olympiad */}
          <div onClick={() => navigate('/olympiad/practice')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(244,63,94,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(244,63,94,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(244,63,94,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>COMPETITION</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={16} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>ThinkQuest Olympiad</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>Join the national level Olympiad and test your skills.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Participate Now <ChevronRight size={14} /></div>
          </div>

          {/* Indus MUN Hybrid */}
          <div onClick={() => navigate('/indus-mun')} style={{ borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: '0 6px 20px rgba(59,130,246,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(59,130,246,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)'; }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>NEW EVENT</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Indus MUN Hybrid</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>International Hybrid MUN for Grades 6 to 12. Registration is Free.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Register Now <ChevronRight size={14} /></div>
          </div>

        </div>
      </div>\n"""

# Remove existing event tiles blocks
# We'll use regex to match the Event Tiles block and remove it entirely.
# The Event Tiles block starts with `      {/* ── Event Tiles ── */}` and ends before `<div` or `{/* ── Mode Cards ── */}` or `{/* ── Quick Stats (Minimized) ── */}`
content = re.sub(r'      \{\/\* ── Event Tiles ── \*\/}.*?(?=      \{\/\* ──)', '', content, flags=re.DOTALL)

# Insert Event Tiles BEFORE Mode Cards
# Since Mode Cards appears twice (once in Senior, once in Junior), we can just replace both occurrences.
content = content.replace('      {/* ── Mode Cards ── */}', events_block + '\n      {/* ── Mode Cards ── */}')

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)

print("Dashboard.jsx updated successfully")
