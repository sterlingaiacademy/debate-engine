import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, Trophy, ChevronRight, BookOpen, PenTool, Users, Zap, Award } from 'lucide-react';
import { API_BASE } from '../../api';

const PHASE_CONFIG = [
  { phase: 1, label: 'Foundations & Architecture', days: '1–7',  color: '#009edb', icon: BookOpen,  bg: 'rgba(0,158,219,0.1)' },
  { phase: 2, label: 'Strategic Writing & Research', days: '8–14', color: '#FF6B00', icon: PenTool,  bg: 'rgba(255,107,0,0.1)' },
  { phase: 3, label: 'Alliance Building & Resolutions', days: '15–21', color: '#a855f7', icon: Users, bg: 'rgba(168,85,247,0.1)' },
  { phase: 4, label: 'Battle Readiness & Crisis', days: '22–30', color: '#ef4444', icon: Zap,      bg: 'rgba(239,68,68,0.1)' },
];

const MUN_CONFERENCES = [
  { name: 'IIMUN Chapters', date: 'Rolling 2025–26', location: '108+ Indian cities' },
  { name: 'Delhi MUN', date: 'Aug 8–9, 2026', location: 'New Delhi' },
  { name: 'ILMUNC India', date: 'Jul 31–Aug 2, 2026', location: 'Amity Univ, Noida' },
  { name: 'HMUN', date: 'Jan 29–Feb 1, 2026', location: 'Boston, USA' },
  { name: 'WorldMUN', date: 'Mar 15–19, 2026', location: 'Lima, Peru' },
];

export default function MUN30Dashboard({ user, progress, setProgress }) {
  const navigate = useNavigate();
  const [todayDay, setTodayDay] = useState(null);
  const [loading, setLoading]   = useState(true);

  const uid        = user?.studentId || user?.username;
  const currentDay = progress?.currentDay || 1;
  const streak     = progress?.streak || 0;
  const phase      = currentDay <= 7 ? 1 : currentDay <= 14 ? 2 : currentDay <= 21 ? 3 : 4;
  const phaseCfg   = PHASE_CONFIG[phase - 1];
  const PhaseIcon  = phaseCfg.icon;
  const pctDone    = Math.round(((currentDay - 1) / 30) * 100);

  useEffect(() => {
    fetch(`${API_BASE}/api/mun30/day/${currentDay}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setTodayDay(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentDay]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '1.5rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
          MUN 30-Day Mastery · G-Force AI
        </div>
        <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 900, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          From Beginner to <span style={{ background: 'linear-gradient(135deg,#818cf8,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gavel-Worthy</span>
        </h1>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { icon: '📅', val: `Day ${currentDay}/30`, sub: 'Current day' },
            { icon: '🔥', val: `${streak} day${streak !== 1 ? 's' : ''}`, sub: 'Streak' },
            { icon: '⚡', val: `Phase ${phase}`, sub: phaseCfg.label.split('&')[0].trim() },
          ].map(({ icon, val, sub }) => (
            <div key={sub} style={{
              flex: '1 1 120px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '0.85rem',
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{val}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>
            <span>Overall Progress</span>
            <span>{pctDone}% complete</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${pctDone}%`,
              background: `linear-gradient(90deg, ${phaseCfg.color}, #a855f7)`,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Today's Day Card */}
      {!loading && todayDay && (
        <div style={{
          background: `linear-gradient(135deg, ${phaseCfg.bg} 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid ${phaseCfg.color}33`, borderRadius: 20, padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ background: phaseCfg.color, borderRadius: 8, padding: '0.3rem 0.7rem', fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
              DAY {currentDay}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Phase {phase} · {phaseCfg.label}</div>
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.3 }}>{todayDay.title}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engine:</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: phaseCfg.color }}>{todayDay.engine}</span>
          </div>

          {/* Winning Edge teaser */}
          <div style={{
            background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.2)',
            borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>⚡ Winning Edge</div>
            <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{todayDay.winningEdge}"
            </div>
          </div>

          <button
            onClick={() => navigate(`/mun30/day/${currentDay}`)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: phaseCfg.color, color: '#fff', border: 'none', borderRadius: 14,
              padding: '0.9rem', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 8px 24px ${phaseCfg.color}44`,
            }}
          >
            Start Today's Session <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Phase Map */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Programme Map</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {PHASE_CONFIG.map(p => {
            const Icon = p.icon;
            const isActive = p.phase === phase;
            const isDone   = p.phase < phase;
            return (
              <div key={p.phase} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: 14,
                background: isActive ? p.bg : isDone ? 'rgba(255,255,255,0.02)' : 'transparent',
                border: `1px solid ${isActive ? p.color + '44' : 'rgba(255,255,255,0.05)'}`,
                opacity: p.phase > phase ? 0.5 : 1,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isDone ? 'rgba(16,185,129,0.15)' : isActive ? p.bg : 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {isDone ? <span style={{ fontSize: '1rem' }}>✅</span> : <Icon size={18} color={isActive ? p.color : '#475569'} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isActive ? '#e2e8f0' : '#64748b' }}>Phase {p.phase} · {p.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.1rem' }}>Days {p.days}</div>
                </div>
                {isActive && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: p.color, background: p.bg, padding: '0.2rem 0.5rem', borderRadius: 99 }}>ACTIVE</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* MUN Calendar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>🌐 Next Conferences</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {MUN_CONFERENCES.map(c => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>{c.location}</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 700, textAlign: 'right' }}>{c.date}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
