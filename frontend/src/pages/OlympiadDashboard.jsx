import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, BookOpen, Clock, Target, Award, Rocket, Sparkles, Medal, ShieldCheck, BookMarked, Atom, Globe, Cpu, Calculator } from 'lucide-react';
import OlympiadEnglishQuiz from './OlympiadEnglishQuiz';

const FONT = "'Google Sans', 'Inter', sans-serif";

const SUBJECTS = [
  {
    key: 'English',
    label: 'English',
    desc: '10 competency-based MCQs on grammar, comprehension & vocabulary for your grade.',
    icon: BookMarked,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    glow: 'rgba(239,68,68,0.2)',
  },
  {
    key: 'Mathematics',
    label: 'Mathematics',
    desc: '10 MCQs covering key mathematical concepts and problem-solving for your grade.',
    icon: Calculator,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    key: 'Science',
    label: 'Science',
    desc: '10 MCQs on Physics, Chemistry & Biology concepts tailored for your grade.',
    icon: Atom,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    key: 'Social Sciences',
    label: 'Social Sciences',
    desc: '10 MCQs on History, Geography & Global Citizenship for your grade.',
    icon: Globe,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    glow: 'rgba(245,158,11,0.2)',
  },
  {
    key: 'CT & AI',
    label: 'CT & AI',
    desc: '10 MCQs on Computational Thinking, Digital Citizenship & AI for your grade.',
    icon: Cpu,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.3)',
    glow: 'rgba(168,85,247,0.2)',
  },
];

export default function OlympiadDashboard({ user }) {
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState(null); // subject key string

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: FONT, padding: '2rem' }}>

      {/* Back */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#18181b', color: '#a1a1aa', borderRadius: 99, cursor: 'pointer', marginBottom: '1rem', border: '1px solid #27272a', fontWeight: 600, fontSize: '0.95rem' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#52525b'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = '#27272a'; }}
      >
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)', borderRadius: 24, padding: '2.5rem 3rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid #ef4444', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.15 }}><Star size={180} color="#fca5a5" fill="#fca5a5" /></div>
        <div style={{ position: 'absolute', bottom: -20, right: 100, opacity: 0.18 }}><Sparkles size={120} color="#fde047" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ef4444' }}>
            <Award size={32} color="#ef4444" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              ThinkQuest <span style={{ color: '#fde047' }}>Olympiad</span>
            </h1>
            <div style={{ fontSize: '1.1rem', color: '#fecaca', fontWeight: 600, marginTop: '0.15rem' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Champion'}! 👋
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#09090b', padding: '0.5rem 1.1rem', borderRadius: 99, border: '1px solid #27272a' }}>
            <ShieldCheck size={18} color="#34d399" strokeWidth={2.5} />
            <span style={{ color: '#a1a1aa', fontWeight: 700, fontSize: '0.9rem' }}>Status:</span>
            <span style={{ color: '#34d399', fontWeight: 900, fontSize: '0.9rem' }}>Registered</span>
          </div>
          {user?.classLevel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#09090b', padding: '0.5rem 1.1rem', borderRadius: 99, border: '1px solid #27272a' }}>
              <Medal size={18} color="#fca5a5" strokeWidth={2.5} />
              <span style={{ color: '#a1a1aa', fontWeight: 700, fontSize: '0.9rem' }}>Grade:</span>
              <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: '0.9rem' }}>{user.classLevel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Practice Quizzes heading */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Practice Quizzes</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>One attempt per subject • Results tracked on your coordinator's dashboard</p>
      </div>

      {/* Subject Quiz Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {SUBJECTS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.key}
              onClick={() => setActiveQuiz(s.key)}
              style={{ background: 'linear-gradient(145deg, #0d1117 0%, #111 100%)', border: `1.5px solid ${s.border}`, borderRadius: 20, padding: '1.6rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: `0 8px 32px ${s.glow}`, transition: 'all 0.22s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 16px 48px ${s.glow}`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = s.border; e.currentTarget.style.boxShadow = `0 8px 32px ${s.glow}`; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.border}` }}>
                  <Icon size={26} color={s.color} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff', background: s.color, padding: '0.3rem 0.8rem', borderRadius: 99, letterSpacing: '0.04em' }}>AVAILABLE ✓</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.3rem', color: '#fff', fontFamily: FONT }}>{s.label}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55, fontFamily: FONT }}>{s.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: s.color, fontWeight: 800, fontSize: '0.9rem', fontFamily: FONT }}>
                <span>Start Quiz</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked Cards section */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Coming Soon</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Daily Practice', icon: Rocket, desc: 'Sharpen your brain with daily questions tailored just for you.', color: '#fca5a5' },
          { label: 'Mock Exam', icon: Target, desc: 'Full-length practice test — unlocks before the main event.', color: '#93c5fd' },
          { label: 'Rules & Guide', icon: BookOpen, desc: 'Instructions, topics, and everything you need to know.', color: '#fcd34d' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{ background: '#09090b', border: '1.5px solid #18181b', borderRadius: 20, padding: '1.6rem', cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #2a2a2a' }}>
                  <Icon size={26} color={item.color} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', background: '#1a1a1a', padding: '0.3rem 0.8rem', borderRadius: 99, border: '1px solid #2a2a2a', letterSpacing: '0.04em' }}>LOCKED</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.3rem', color: '#f8fafc', fontFamily: FONT }}>{item.label}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, fontFamily: FONT }}>{item.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontWeight: 800, fontSize: '0.9rem', fontFamily: FONT }}>
                <Clock size={15} /> Opens Soon
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Modal */}
      {activeQuiz && (
        <OlympiadEnglishQuiz
          user={user}
          subject={activeQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
