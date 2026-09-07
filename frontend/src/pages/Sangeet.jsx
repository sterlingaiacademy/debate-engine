import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ChevronRight, Mic, Ear, Radio, Sparkles } from 'lucide-react';
import { STAGE_MAP, PROMPTS } from '../data/sangeet_prompts';

const STAGES = [
  {
    num: 1, name: 'LISTEN', label: 'The Ear Awakens',
    desc: 'Pitch discrimination, timbre recognition, and body percussion. No instrument needed.',
    icon: Ear, color: '#10b981', grad: 'linear-gradient(135deg, #001a11 0%, #002d1c 100%)',
    border: 'rgba(16,185,129,0.25)', grades: ['G1', 'G2', 'G3'],
  },
  {
    num: 2, name: 'SOUND', label: 'Voice & Pattern',
    desc: 'Sargam, alankars, interval training, and rhythmic tala cycles.',
    icon: Mic, color: '#3b82f6', grad: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    border: 'rgba(59,130,246,0.25)', grades: ['G4', 'G5', 'G6'],
  },
  {
    num: 3, name: 'SPEAK', label: 'Repertoire & Expression',
    desc: 'Raga phrases, bandish, ornamentation — AI expression scoring via Claude.',
    icon: Radio, color: '#a855f7', grad: 'linear-gradient(135deg, #0d001a 0%, #1b0036 100%)',
    border: 'rgba(168,85,247,0.25)', grades: ['G7', 'G8', 'G9'],
  },
  {
    num: 4, name: 'CREATE', label: 'The Composer Track',
    desc: 'Alap, composition, improvisation, and full expressive performance.',
    icon: Sparkles, color: '#f59e0b', grad: 'linear-gradient(135deg, #1a0d00 0%, #2d1800 100%)',
    border: 'rgba(245,158,11,0.25)', grades: ['G10', 'G11', 'G12'],
  },
];

export default function Sangeet({ user }) {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState(null);
  const [hoveredGrade, setHoveredGrade] = useState(null);

  function handleGrade(grade) {
    navigate(`/sangeet/session?grade=${grade}`);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06080f',
      padding: '2rem 1.5rem 4rem',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
    }}>
      {/* ── Hero ── */}
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Music size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#10b981', textTransform: 'uppercase' }}>
              G-Force · Autonomous Curriculum
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
              Sangeet
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: 520, lineHeight: 1.65 }}>
          AI-powered music training for all grades — pitch accuracy, rhythm precision, and expression
          scored in real time. No instrument required for G1–G3.
        </p>

        {/* ── Stage Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1rem' }}>
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isHovered = hoveredStage === stage.num;
            return (
              <div
                key={stage.num}
                onMouseEnter={() => setHoveredStage(stage.num)}
                onMouseLeave={() => setHoveredStage(null)}
                style={{
                  background: stage.grad,
                  border: `1px solid ${isHovered ? stage.color + '55' : stage.border}`,
                  borderRadius: 16,
                  padding: '1.5rem',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isHovered ? `0 8px 32px ${stage.color}20` : 'none',
                }}
              >
                {/* Stage header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${stage.color}20`, border: `1px solid ${stage.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} color={stage.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', color: stage.color, textTransform: 'uppercase' }}>
                        Stage {stage.num}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                        {stage.name}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 700, color: stage.color,
                    background: `${stage.color}15`, border: `1px solid ${stage.color}30`,
                    borderRadius: 99, padding: '0.2rem 0.6rem',
                  }}>
                    {stage.grades[0]}–{stage.grades[2]}
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                  {stage.label} — {stage.desc}
                </p>

                {/* Grade buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {stage.grades.map((grade) => {
                    const taskCount = PROMPTS[grade]?.length ?? 0;
                    const isGHovered = hoveredGrade === grade;
                    return (
                      <button
                        key={grade}
                        onMouseEnter={() => setHoveredGrade(grade)}
                        onMouseLeave={() => setHoveredGrade(null)}
                        onClick={() => handleGrade(grade)}
                        style={{
                          flex: 1,
                          background: isGHovered ? stage.color : `${stage.color}15`,
                          border: `1px solid ${stage.color}${isGHovered ? 'ff' : '40'}`,
                          borderRadius: 10,
                          padding: '0.6rem 0',
                          cursor: 'pointer',
                          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem',
                        }}
                      >
                        <span style={{
                          fontSize: '0.9rem', fontWeight: 800, color: isGHovered ? '#fff' : stage.color,
                          transition: 'color 0.18s',
                        }}>
                          {grade}
                        </span>
                        <span style={{
                          fontSize: '0.6rem', color: isGHovered ? 'rgba(255,255,255,0.7)' : '#475569',
                          transition: 'color 0.18s',
                        }}>
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
          marginTop: '2rem', padding: '1rem 1.25rem',
          background: 'rgba(255,255,255,0.03)', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
        }}>
          {[
            { label: 'Scoring', value: 'Pitch + Rhythm + AI Expression' },
            { label: 'AI Model', value: 'Claude Haiku 4.5 (G7–G12)' },
            { label: 'Pass Score', value: '60 / 100' },
            { label: 'Traditions', value: 'Indian Classical + Western' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>{label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
