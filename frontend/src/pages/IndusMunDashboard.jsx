import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronLeft, Users, Flag, BookOpen, Award, Calendar, MapPin, Mic2, ExternalLink } from 'lucide-react';

const COMMITTEES = [
  { name: 'United Nations General Assembly', abbr: 'UNGA', topics: ['Global Climate Finance', 'Digital Sovereignty'], color: '#6366f1', icon: '🌍' },
  { name: 'Security Council', abbr: 'UNSC', topics: ['Regional Conflicts', 'Peacekeeping Reforms'], color: '#8b5cf6', icon: '🛡️' },
  { name: 'Human Rights Council', abbr: 'HRC', topics: ['Digital Rights', 'Refugee Policy'], color: '#a78bfa', icon: '⚖️' },
  { name: 'Economic & Social Council', abbr: 'ECOSOC', topics: ['Sustainable Development', 'Global Inequality'], color: '#818cf8', icon: '📊' },
];

const TIMELINE = [
  { date: 'Registration Open', status: 'active', desc: 'School & individual registrations open' },
  { date: 'Committee Allotment', status: 'upcoming', desc: 'Delegates assigned to committees' },
  { date: 'Research Phase', status: 'upcoming', desc: 'Position papers due' },
  { date: 'Conference Days', status: 'upcoming', desc: '3-day hybrid conference' },
  { date: 'Awards & Ceremony', status: 'upcoming', desc: 'Best delegate, verbal mentions' },
];

const RESOURCES = [
  { title: 'Delegate Handbook', desc: 'Rules of procedure, speech formats, resolution writing', icon: BookOpen },
  { title: 'Study Guides', desc: 'Committee-wise background guides & topic summaries', icon: Globe },
  { title: 'Past Resolutions', desc: 'Sample resolutions from previous Indus MUN editions', icon: Flag },
  { title: 'Awards Criteria', desc: 'How delegates are evaluated and scored', icon: Award },
];

export default function IndusMunDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const cardStyle = (color = '#6366f1') => ({
    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(10,10,50,0.8) 100%)',
    border: `1px solid ${color}33`,
    borderRadius: 16,
    padding: '1.25rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  });

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'committees', label: 'Committees' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(160deg, #050514 0%, #0d0d2e 40%, #111130 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif", color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,20,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        padding: '0.85rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '0.45rem 0.75rem', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s' }}>
          <ChevronLeft size={15} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
              <span style={{ color: '#818cf8' }}>Indus</span> MUN
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.05rem' }}>Model United Nations • Hybrid Conference</div>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Welcome, <span style={{ color: '#c7d2fe', fontWeight: 700 }}>{user?.name?.split(' ')[0] || 'Delegate'}</span>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(120deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 24, padding: '2rem 2.5rem', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#818cf8', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.85rem' }}>
              DELEGATE PORTAL • ACTIVE
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Indus MUN <span style={{ color: '#818cf8' }}>2025</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
              A premium hybrid Model United Nations experience for students from Grade 6–12 across India and beyond.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}><Calendar size={13} color="#818cf8" /> Hybrid Conference</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}><MapPin size={13} color="#818cf8" /> India-wide + Online</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}><Users size={13} color="#818cf8" /> Grades 6–12</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: '180px' }}>
            {[{ label: '4', sub: 'Committees' }, { label: '200+', sub: 'Delegates' }, { label: 'Free', sub: 'Registration' }].map(({ label, sub }) => (
              <div key={sub} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#818cf8' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '0.3rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer', background: activeTab === t.id ? 'rgba(99,102,241,0.25)' : 'transparent', color: activeTab === t.id ? '#c7d2fe' : '#64748b', fontWeight: activeTab === t.id ? 700 : 500, fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { icon: Globe, title: 'Global Issues', desc: 'Debate real-world problems on an international stage. Develop your diplomacy and negotiation skills.', color: '#6366f1' },
              { icon: Mic2, title: 'Public Speaking', desc: 'Deliver position speeches, participate in moderated caucuses, and craft compelling arguments.', color: '#8b5cf6' },
              { icon: Users, title: 'Team Building', desc: 'Network with delegates from across India, build alliances, and draft joint resolutions.', color: '#a78bfa' },
              { icon: Award, title: 'Recognition', desc: 'Win Best Delegate, Outstanding Delegate, or Verbal Mention awards. Get certificates for participation.', color: '#818cf8' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ ...cardStyle(color) }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${color}22`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem', color: '#fff' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'committees' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {COMMITTEES.map(c => (
              <div key={c.abbr} style={{ ...cardStyle(c.color), padding: '1.5rem' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${c.color}22`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>{c.icon}</div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>{c.abbr}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>{c.name}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Agenda Topics</div>
                {c.topics.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, marginTop: '0.4rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {TIMELINE.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: item.status === 'active' ? '#22c55e' : 'rgba(99,102,241,0.3)', border: item.status === 'active' ? '2px solid #86efac' : '2px solid rgba(99,102,241,0.4)', boxShadow: item.status === 'active' ? '0 0 12px rgba(34,197,94,0.5)' : 'none' }} />
                  {i < TIMELINE.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 40, background: 'rgba(99,102,241,0.2)', marginTop: '0.25rem' }} />}
                </div>
                <div style={{ paddingBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: item.status === 'active' ? '#86efac' : '#c7d2fe', marginBottom: '0.2rem' }}>{item.date}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {RESOURCES.map(({ title, desc, icon: Icon }) => (
              <div key={title} style={{ ...cardStyle(), cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.18)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{title} <ExternalLink size={11} color="#6366f1" /></div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ ...cardStyle('#22c55e'), gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#86efac', marginBottom: '0.3rem' }}>🎓 Need Help?</div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Contact your school coordinator or reach out to the Indus MUN Secretariat for guidance.</div>
              </div>
              <button style={{ padding: '0.7rem 1.5rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 10, color: '#86efac', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 }}>
                Contact Secretariat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
