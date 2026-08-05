const fs = require('fs');
const file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const newTiles = `
        </div>
        {/* Third Row (New Events) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginTop: '1rem' }}>
          
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
`;

content = content.replace(
  '        </div>\n\n\n\n      {/* ── Charts Row ── */}', 
  newTiles + '\n        </div>\n\n\n\n      {/* ── Charts Row ── */}'
);

if (!content.includes('Mic')) {
  content = content.replace("import { Play, Activity, Shield, Trophy, FileText, Settings, Calendar, Menu, X, ArrowUpRight, TrendingUp, ChevronRight, CheckCircle2, ChevronDown, Lock, Star, Globe, Users, FileSignature, HelpCircle, LogOut } from 'lucide-react';", "import { Play, Activity, Shield, Trophy, FileText, Settings, Calendar, Menu, X, ArrowUpRight, TrendingUp, ChevronRight, CheckCircle2, ChevronDown, Lock, Star, Globe, Users, FileSignature, HelpCircle, LogOut, Mic, Flag } from 'lucide-react';");
}

fs.writeFileSync(file, content);
