import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, BookOpen, ChevronRight } from 'lucide-react';
import { API_BASE } from '../../api';

const MONTH_LABELS = [
  'World Citizenship', 'Nations & Neighbours', 'The United Nations',
  'Country Profiles', 'Strategic Writing', 'Alliance Building',
  'Advanced Negotiation', 'Crisis Committees', 'Advanced Diplomacy',
  'Vienna Bound I', 'Vienna Bound II', 'Vienna Finals',
];

const MONTH_COLORS = [
  '#009edb', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#D4A017',
];

export default function D365KnowledgeMap({ user, progress }) {
  const navigate = useNavigate();
  const currentDay = progress?.currentDay || 1;
  const currentMonth = Math.min(12, Math.ceil(currentDay / 30.42));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
          Diplomat 365
        </div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
          Knowledge Map
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          12 months · 52 weeks · 365 days of diplomatic mastery
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
        gap: '0.85rem',
      }}>
        {MONTH_LABELS.map((label, idx) => {
          const monthNum = idx + 1;
          const monthStart = Math.round((idx / 12) * 365) + 1;
          const monthEnd = Math.round(((idx + 1) / 12) * 365);
          const daysInMonth = monthEnd - monthStart + 1;

          const isUnlocked = currentDay >= monthStart;
          const isActive = currentDay >= monthStart && currentDay <= monthEnd;
          const isComplete = currentDay > monthEnd;

          const daysCompleted = isComplete
            ? daysInMonth
            : isUnlocked
              ? Math.max(0, currentDay - monthStart)
              : 0;
          const fillPct = Math.round((daysCompleted / daysInMonth) * 100);
          const color = MONTH_COLORS[idx];

          return (
            <div
              key={idx}
              onClick={() => isUnlocked && navigate('/diplomat365')}
              style={{
                background: isComplete
                  ? `linear-gradient(135deg, ${color}18, ${color}08)`
                  : isActive
                    ? `linear-gradient(135deg, ${color}12, rgba(0,0,0,0))`
                    : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? color + '40' : isComplete ? color + '25' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 18,
                padding: '1.15rem',
                cursor: isUnlocked ? 'pointer' : 'default',
                opacity: isUnlocked ? 1 : 0.45,
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (isUnlocked) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}20`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Glow blob */}
              {isActive && (
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 800, color: isUnlocked ? color : '#334155',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Month {monthNum}
                </div>
                {isComplete
                  ? <CheckCircle size={16} color={color} strokeWidth={2.5} />
                  : isActive
                    ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                    : <Lock size={14} color="#334155" strokeWidth={2} />
                }
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isUnlocked ? 'var(--text-primary)' : '#334155', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {label}
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '0.5rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${fillPct}%`,
                  background: color, borderRadius: 99,
                  transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>

              <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                {isComplete ? `✓ Complete` : isUnlocked ? `${daysCompleted}/${daysInMonth} days` : 'Locked'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
        {[
          { label: 'Complete', color: '#10b981', icon: '✓' },
          { label: 'In Progress', color: '#D4A017', icon: '●' },
          { label: 'Locked', color: '#334155', icon: '🔒' },
        ].map(({ label, color, icon }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>
    </div>
  );
}
