import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OlympiadEnglishQuiz from './OlympiadEnglishQuiz';

const FONT = "'Inter', 'Google Sans', system-ui, sans-serif";

const SUBJECTS = [
  { key: 'English', label: 'English', desc: 'Grammar, comprehension & vocabulary — grade-specific MCQs.', emoji: '📖', grad: 'linear-gradient(135deg,#ff6b6b,#ee0979)', shadow: 'rgba(238,9,121,0.28)', light: '#ff6b6b' },
  { key: 'Mathematics', label: 'Mathematics', desc: 'Problem-solving & key mathematical concepts for your grade.', emoji: '📐', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)', shadow: 'rgba(79,172,254,0.28)', light: '#4facfe' },
  { key: 'Science', label: 'Science', desc: 'Physics, Chemistry & Biology — tailored for your grade.', emoji: '⚗️', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', shadow: 'rgba(67,233,123,0.28)', light: '#43e97b' },
  { key: 'Social Sciences', label: 'Social Sciences', desc: 'History, Geography & Global Citizenship MCQs.', emoji: '🌍', grad: 'linear-gradient(135deg,#f7971e,#ffd200)', shadow: 'rgba(247,151,30,0.28)', light: '#f7971e' },
  { key: 'CT & AI', label: 'CT & AI', desc: 'Computational Thinking, Digital Citizenship & AI.', emoji: '🤖', grad: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', shadow: 'rgba(161,140,209,0.28)', light: '#a18cd1' },
];

export default function OlympiadDashboard({ user }) {
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #1a0a2e 0%, #0d0d1a 40%, #0a0a0f 100%)', color: '#f8fafc', fontFamily: FONT, position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,172,254,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderRadius: 99, cursor: 'pointer', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: '0.88rem', fontFamily: FONT, backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          ← Back to Dashboard
        </button>

        {/* Hero Banner */}
        <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 50%, rgba(16,185,129,0.08) 100%)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(20px)', padding: '2.5rem 3rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: -60, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, right: 40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,172,254,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}>🏆</div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Practice Portal</div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #fff 30%, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  ThinkQuest <span style={{ background: 'linear-gradient(135deg, #f59e0b, #fde047)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Olympiad</span>
                </h1>
                <div style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.3rem', fontWeight: 500 }}>Welcome back, {user?.name?.split(' ')[0] || 'Champion'} 👋</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 99, border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ color: '#6ee7b7' }}>Registered & Active</span>
              </div>
              {user?.classLevel && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', background: 'rgba(139,92,246,0.1)', borderRadius: 99, border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', fontWeight: 600, color: '#c4b5fd' }}>
                  🎓 {user.classLevel}
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 99, border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
                📝 5 Subjects · 1 Attempt Each
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>Practice Quizzes</h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>Select a subject to begin • One attempt per subject • Results visible to your coordinator</p>
        </div>

        {/* Subject Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {SUBJECTS.map((s, idx) => {
            const isHov = hoveredCard === s.key;
            return (
              <div
                key={s.key}
                onClick={() => setActiveQuiz(s.key)}
                onMouseEnter={() => setHoveredCard(s.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: isHov
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isHov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 24,
                  padding: '1.75rem',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: isHov ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHov ? `0 20px 60px ${s.shadow}, 0 0 0 1px rgba(255,255,255,0.08)` : '0 4px 24px rgba(0,0,0,0.2)',
                }}
              >
                {/* Top color bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.grad, opacity: isHov ? 1 : 0.5, transition: 'opacity 0.25s' }} />
                {/* Glow bg */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: s.grad, opacity: isHov ? 0.06 : 0.03, transition: 'opacity 0.25s', filter: 'blur(30px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: isHov ? s.grad : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'all 0.25s', boxShadow: isHov ? `0 8px 24px ${s.shadow}` : 'none' }}>
                      {s.emoji}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.28rem 0.75rem', background: 'rgba(16,185,129,0.12)', borderRadius: 99, border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Available</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>{s.label}</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: isHov ? s.light : '#64748b', transition: 'color 0.25s' }}>
                    Start Practice Test <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: isHov ? 'translateX(4px)' : '' }}>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#334155', letterSpacing: '-0.01em' }}>Coming Soon</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', opacity: 0.45 }}>
          {[
            { emoji: '🚀', label: 'Daily Practice', desc: 'Sharpen your brain with daily questions tailored for you.' },
            { emoji: '🎯', label: 'Mock Exam', desc: 'Full-length test — unlocks before the main Olympiad event.' },
            { emoji: '📚', label: 'Rules & Guide', desc: 'Topics, instructions, and everything you need to know.' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 20, padding: '1.5rem', cursor: 'not-allowed' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#475569' }}>{item.label}</h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>{item.desc}</p>
              <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>🔒 Locked</div>
            </div>
          ))}
        </div>
      </div>

      {activeQuiz && <OlympiadEnglishQuiz user={user} subject={activeQuiz} onClose={() => setActiveQuiz(null)} />}
    </div>
  );
}
