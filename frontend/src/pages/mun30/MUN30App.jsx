import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Lock, Crown, ChevronRight, Zap } from 'lucide-react';
import { API_BASE } from '../../api';
import MUN30Dashboard from './MUN30Dashboard';
import MUN30DailyLesson from './MUN30DailyLesson';

export default function MUN30App({ user }) {
  const [progress, setProgress] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const plan = user?.subscription_plan;
  // Pro AND Max both get MUN30 (Max gets it as a bonus)
  const hasAccess = ['pro', 'max'].includes(plan);

  const uid = user?.studentId || user?.username;

  useEffect(() => {
    if (!hasAccess || !uid) return;
    fetch(`${API_BASE}/api/mun30/progress/${uid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setProgress(data); })
      .catch(() => {});
  }, [uid, hasAccess]);

  // Free user — lock screen
  if (!hasAccess) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center', gap: '1.5rem',
      }}>
        {/* Lock icon */}
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
            border: '1.5px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={44} color="#818cf8" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            NaNoSkool · G-Force AI Coach
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MUN 30-Day Mastery
            </span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: 380, margin: '0 auto', lineHeight: 1.65 }}>
            From Beginner to Gavel-Worthy in 30 Days. A daily 15-minute curriculum for Grades 7–12.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', width: '100%', maxWidth: 400 }}>
          {[
            { label: '30 Days', sub: '4 Phases' },
            { label: '15 Min/Day', sub: 'Fits any schedule' },
            { label: 'Gavel-Ready', sub: 'HMUN · WorldMUN' },
          ].map(({ label, sub }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 14, padding: '0.85rem 0.5rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#818cf8' }}>{label}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 12, padding: '0.75rem 1.25rem',
          fontSize: '0.85rem', color: '#818cf8', fontWeight: 700,
        }}>
          🔒 Available on Pro and Max plans
        </div>

        <button
          onClick={() => window.location.href = '/settings'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff', border: 'none', borderRadius: 99,
            padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}
        >
          <Crown size={18} strokeWidth={2.5} />
          Upgrade to Pro / Max
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route index element={<MUN30Dashboard user={user} progress={progress} setProgress={setProgress} />} />
      <Route path="day/:dayNum" element={<MUN30DailyLesson user={user} progress={progress} setProgress={setProgress} />} />
      <Route path="*" element={<Navigate to="/mun30" replace />} />
    </Routes>
  );
}
