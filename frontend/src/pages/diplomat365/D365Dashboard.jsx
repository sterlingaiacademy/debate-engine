import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Star, Trophy, Map, Users, ChevronRight,
  Scroll, Award, Target, BookOpen, Zap, Lock, Globe
} from 'lucide-react';
import { API_BASE } from '../../api';

const STREAK_COLOR = (streak, missed) => {
  if (missed >= 2) return '#ef4444';
  if (missed >= 1) return '#f97316';
  if (streak >= 30) return '#D4A017';
  if (streak >= 7)  return '#FF6B00';
  return '#fb923c';
};

const SLOT_ICONS = {
  'Concept Day':    BookOpen,
  'Drill Day':      Target,
  'Debate Day':     Zap,
  'Reflection Day': Scroll,
  'Assessment Day': Award,
};

const SLOT_COLORS = {
  'Concept Day':    '#009edb',
  'Drill Day':      '#FF6B00',
  'Debate Day':     '#a855f7',
  'Reflection Day': '#10b981',
  'Assessment Day': '#D4A017',
};

export default function D365Dashboard({ user, progress, setProgress }) {
  const navigate = useNavigate();
  const [todayDay, setTodayDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const uid = user?.studentId || user?.username;
  const currentDay = progress?.currentDay || 1;
  const streak = progress?.streak || 0;
  const missed = progress?.missedDaysInRow || 0;
  const tokens = progress?.tokens || 0;
  const badges = progress?.badges || [];
  const flameColor = STREAK_COLOR(streak, missed);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/d365/days/${currentDay}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/d365/attempts/${uid}?limit=5`).then(r => r.ok ? r.json() : { attempts: [] }),
    ]).then(([dayData, attData]) => {
      setTodayDay(dayData);
      setRecentAttempts(attData?.attempts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid, currentDay]);

  // Progress percentage (of 365)
  const progressPct = Math.round((Math.max(0, currentDay - 1) / 365) * 100);
  // Month (1-12) and fill within month
  const currentMonth = Math.ceil(currentDay / 30.42);
  const monthProgress = Math.round(((currentDay % 30) / 30) * 100);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#D4A017', borderRadius: '50%' }} />
        <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Loading your journey...</span>
      </div>
    );
  }

  const SlotIcon = todayDay ? (SLOT_ICONS[todayDay.slot] || BookOpen) : BookOpen;
  const slotColor = todayDay ? (SLOT_COLORS[todayDay.slot] || '#009edb') : '#009edb';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
            NaNoSkool · G-Force AI Coach
          </div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.65rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            <span className="gradient-text">Diplomat 365</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Streak pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: `${flameColor}15`, border: `1px solid ${flameColor}30`,
            borderRadius: 99, padding: '0.3rem 0.8rem',
            fontSize: '0.8rem', fontWeight: 800, color: flameColor,
          }}>
            <Flame size={14} strokeWidth={2.5} />
            {streak} day streak
            {missed > 0 && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>· {missed} missed</span>}
          </div>
          {/* Tokens pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.25)',
            borderRadius: 99, padding: '0.3rem 0.8rem',
            fontSize: '0.8rem', fontWeight: 800, color: '#D4A017',
          }}>
            <Trophy size={14} strokeWidth={2.5} />
            {tokens} tokens
          </div>
        </div>
      </div>

      {/* ── 365-day progress bar ── */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Journey Progress</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#D4A017' }}>
            Day {currentDay} <span style={{ color: '#334155', fontWeight: 600 }}>of 365</span>
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`, borderRadius: 99,
            background: 'linear-gradient(90deg, #009edb, #D4A017)',
            transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: '#334155', fontWeight: 600 }}>
          <span>L1 · Age 8+</span>
          <span>L5 · Day 130</span>
          <span>L10 · Vienna</span>
        </div>
      </div>

      {/* ── Today's Card ── */}
      {todayDay && (
        <div
          onClick={() => navigate(`/diplomat365/day/${currentDay}`)}
          style={{
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, rgba(0,158,219,0.08) 0%, rgba(212,160,23,0.06) 100%)`,
            border: `1px solid ${slotColor}30`,
            borderRadius: 24, padding: '1.75rem',
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,158,219,0.15)`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          {/* BG glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${slotColor}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: `${slotColor}18`, border: `1px solid ${slotColor}35`,
                  borderRadius: 99, padding: '0.2rem 0.7rem',
                  fontSize: '0.7rem', fontWeight: 800, color: slotColor, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  <SlotIcon size={12} strokeWidth={2.5} />
                  {todayDay.slot}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#334155' }}>
                  Day {currentDay} · Week {todayDay.week} · Level {todayDay.level}
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {todayDay.theme}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.25rem', lineHeight: 1.6 }}>
                {todayDay.slotDesc}
              </p>
              {todayDay.headline && (
                <p style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                  {todayDay.headline}
                </p>
              )}
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: `${slotColor}18`, border: `1px solid ${slotColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SlotIcon size={26} color={slotColor} strokeWidth={2} />
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem',
            fontSize: '0.875rem', fontWeight: 700, color: slotColor, position: 'relative', zIndex: 1,
          }}>
            <span>Start Today's Lesson</span>
            <ChevronRight size={16} strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* ── Quick Nav Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,180px),1fr))', gap: '0.85rem' }}>
        {[
          { label: 'Knowledge Map', sub: `Month ${currentMonth} of 12`, icon: Map, path: '/diplomat365/map', color: '#009edb' },
          { label: 'Cohort Pulse', sub: 'Anonymous ranking', icon: Globe, path: '/diplomat365/cohort', color: '#a855f7' },
          { label: 'Badges', sub: `${badges.length} earned`, icon: Award, path: '/diplomat365/badges', color: '#D4A017' },
        ].map(({ label, sub, icon: Icon, path, color }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="glass-card"
            style={{
              padding: '1.1rem', cursor: 'pointer',
              borderColor: `${color}20`,
              display: 'flex', alignItems: 'center', gap: '0.85rem',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: `${color}15`, border: `1px solid ${color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color={color} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{label}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, marginTop: '0.1rem' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Attempts ── */}
      {recentAttempts.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>Recent Submissions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentAttempts.map((a, i) => (
              <div key={i} className="glass-card" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Day {a.day_number}</span>
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, marginLeft: '0.5rem' }}>
                    {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} strokeWidth={0} fill={s <= a.stars ? '#D4A017' : 'rgba(255,255,255,0.1)'} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak warning */}
      {missed >= 1 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14, padding: '0.85rem 1.1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <Flame size={20} color="#ef4444" strokeWidth={2} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>Streak at risk!</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {3 - missed} more missed day{3 - missed !== 1 ? 's' : ''} and your streak resets to zero.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
