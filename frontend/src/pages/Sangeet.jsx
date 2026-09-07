import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Ear, Mic, Radio, Sparkles, ChevronRight } from 'lucide-react';
import { PROMPTS } from '../data/sangeet_prompts';

const STAGES = [
  {
    num: 1, name: 'LISTEN', label: 'The Ear Awakens',
    desc: 'Pitch discrimination, timbre recognition, and body percussion. No instrument needed.',
    icon: Ear, color: '#10b981', grades: ['G1', 'G2', 'G3'],
    orb: 'rgba(16,185,129,0.18)',
  },
  {
    num: 2, name: 'SOUND', label: 'Voice & Pattern',
    desc: 'Sargam, alankars, interval training, and rhythmic tala cycles.',
    icon: Mic, color: '#3b82f6', grades: ['G4', 'G5', 'G6'],
    orb: 'rgba(59,130,246,0.18)',
  },
  {
    num: 3, name: 'SPEAK', label: 'Repertoire & Expression',
    desc: 'Raga phrases, bandish, and ornamentation — expression scored by Claude AI.',
    icon: Radio, color: '#a855f7', grades: ['G7', 'G8', 'G9'],
    orb: 'rgba(168,85,247,0.18)',
  },
  {
    num: 4, name: 'CREATE', label: 'The Composer Track',
    desc: 'Alap, composition, improvisation, and full expressive performance.',
    icon: Sparkles, color: '#f59e0b', grades: ['G10', 'G11', 'G12'],
    orb: 'rgba(245,158,11,0.18)',
  },
];

export default function Sangeet() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null); // 'G1' etc.

  return (
    <div style={{
      minHeight: '100vh',
      background: '#04060d',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Animated background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', top: '-20%', left: '-15%', animation: 'drift1 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)', bottom: '-10%', right: '-10%', animation: 'drift2 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', top: '40%', right: '20%', animation: 'drift3 22s ease-in-out infinite' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '2.75rem', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(145deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16,185,129,0.4), 0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <Music size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.18em', color: '#10b981', textTransform: 'uppercase', marginBottom: '0.1rem' }}>
                G-Force · Autonomous Curriculum
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
                Sangeet
              </h1>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: 480, lineHeight: 1.75, margin: 0 }}>
            AI-powered music training for all grades — pitch accuracy, rhythm precision,
            and expression scored in real time by Claude. No instrument required for G1–G3.
          </p>
        </div>

        {/* ── Stage grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {STAGES.map((stage, si) => {
            const Icon = stage.icon;
            const C = stage.color;
            return (
              <div
                key={stage.num}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '1.5rem',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                  animation: `fadeUp 0.5s ease ${si * 0.08}s both`,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${C}35`;
                  e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${C}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `${C}18`,
                      border: `1px solid ${C}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: `0 0 20px ${C}20`,
                    }}>
                      <Icon size={18} color={C} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.14em', color: C, textTransform: 'uppercase' }}>
                        Stage {stage.num}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {stage.name}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.6rem', fontWeight: 700, color: C,
                    background: `${C}12`, border: `1px solid ${C}25`,
                    borderRadius: 99, padding: '0.25rem 0.65rem',
                    whiteSpace: 'nowrap',
                  }}>
                    {stage.grades[0]}–{stage.grades[2]}
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1.25rem', lineHeight: 1.7 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{stage.label}</span> — {stage.desc}
                </p>

                {/* Grade buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {stage.grades.map((grade) => {
                    const taskCount = PROMPTS[grade]?.length ?? 0;
                    const isHov = hovered === grade;
                    return (
                      <button
                        key={grade}
                        onMouseEnter={() => setHovered(grade)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => navigate(`/sangeet/session?grade=${grade}`)}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0',
                          borderRadius: 12,
                          cursor: 'pointer',
                          background: isHov ? `linear-gradient(145deg, ${C}ee, ${C}aa)` : `${C}12`,
                          border: `1px solid ${isHov ? C : C + '30'}`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
                          transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                          transform: isHov ? 'translateY(-2px) scale(1.03)' : 'none',
                          boxShadow: isHov ? `0 8px 24px ${C}40` : 'none',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isHov ? '#fff' : C, transition: 'color 0.18s' }}>
                          {grade}
                        </span>
                        <span style={{ fontSize: '0.58rem', color: isHov ? 'rgba(255,255,255,0.65)' : '#334155', transition: 'color 0.18s' }}>
                          {taskCount} task{taskCount !== 1 ? 's' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Info footer ── */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '1.1rem 1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '1.75rem',
          animation: 'fadeUp 0.5s ease 0.35s both',
        }}>
          {[
            { label: 'Scoring', value: 'Claude Haiku 4.5 AI — all grades' },
            { label: 'Components', value: 'Pitch · Rhythm · Expression' },
            { label: 'Pass score', value: '60 / 100' },
            { label: 'Traditions', value: 'Indian Classical + Western' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.58rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>{label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,-40px) scale(1.06)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,50px) scale(1.08)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-30px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
