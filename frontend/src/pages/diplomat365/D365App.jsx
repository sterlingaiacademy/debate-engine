import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Lock, Crown, ChevronRight } from 'lucide-react';
import { API_BASE } from '../../api';
import D365Dashboard from './D365Dashboard';
import D365DailyLesson from './D365DailyLesson';
import D365KnowledgeMap from './D365KnowledgeMap';
import D365CohortHeatmap from './D365CohortHeatmap';
import D365Badges from './D365Badges';
import PremiumEnrollModal from '../../components/PremiumEnrollModal';

const getNormalizedLevel = (cls) => {
  if (!cls) return 'Level 1';
  if (cls.startsWith('Level ')) return cls;
  if (['KG','Class 1','Class 2','Class KG','KG-2','Grade 1','Grade 2'].includes(cls)) return 'Level 1';
  if (['Class 3','Class 4','Class 5','Grade 3','Grade 4','Grade 5'].includes(cls)) return 'Level 2';
  if (['Class 6','Class 7','Class 8','Grade 6','Grade 7','Grade 8'].includes(cls)) return 'Level 3';
  if (['Class 9','Class 10','Grade 9','Grade 10'].includes(cls)) return 'Level 4';
  if (['Class 11','Class 12','Grade 11','Grade 12'].includes(cls)) return 'Level 5';
  return 'Level 1';
};

export default function D365App({ user }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const normalizedLevel = getNormalizedLevel(user?.classLevel);
  const isEligibleLevel = ['Level 3','Level 4','Level 5'].includes(normalizedLevel);
  const isPaid = ['pro','max'].includes(user?.subscription_plan);

  useEffect(() => {
    if (!isPaid || !isEligibleLevel) return;
    const uid = user?.studentId || user?.username;
    if (!uid) return;
    fetch(`${API_BASE}/api/d365/progress/${uid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setProgress(data); })
      .catch(() => {});
  }, [user?.studentId, isPaid, isEligibleLevel]);

  // Not the right level — redirect silently
  if (!isEligibleLevel) {
    return <Navigate to="/dashboard" replace />;
  }

  // Demo user — full-screen lock card
  if (!isPaid) {
    return (
      <>
        {showUpgrade && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', overflowY: 'auto' }}>
            <PremiumEnrollModal user={user} mode="upgrade" onDismiss={() => setShowUpgrade(false)} />
          </div>
        )}
        <div style={{
          minHeight: '70vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center', gap: '1.5rem',
          animation: 'fadeIn 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Decorative ring */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)',
              animation: 'orbIdle 3s ease-in-out infinite',
            }} />
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212,160,23,0.12) 0%, rgba(255,107,0,0.08) 100%)',
              border: '1.5px solid rgba(212,160,23,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={48} color="#D4A017" strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
              NaNoSkool · G-Force AI Coach
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              <span className="gradient-text">Diplomat 365</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500, maxWidth: 380, margin: '0 auto', lineHeight: 1.65 }}>
              A 365-day daily rhythm curriculum — MUN mastery from beginner to gavel-worthy, built right into G-Force.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
            width: '100%', maxWidth: 420,
          }}>
            {[
              { label: '365 Days', sub: 'Daily lessons' },
              { label: '10 Levels', sub: 'Age 8 → 18' },
              { label: 'Vienna', sub: 'UN invitation' },
            ].map(({ label, sub }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212,160,23,0.2)',
                borderRadius: 14, padding: '0.85rem 0.5rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4A017' }}>{label}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(212,160,23,0.08)',
            border: '1px solid rgba(212,160,23,0.25)',
            borderRadius: 12, padding: '0.75rem 1.25rem',
            fontSize: '0.85rem', color: '#D4A017', fontWeight: 700,
          }}>
            🔒 Available exclusively on Pro and Max plans
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #FF6B00, #FF9500)',
              color: '#fff', border: 'none', borderRadius: 99,
              padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,107,0,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,0,0.35)'; }}
          >
            <Crown size={18} strokeWidth={2.5} />
            Upgrade to Pro / Max
            <ChevronRight size={16} strokeWidth={3} />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  // Paid user — full route tree
  return (
    <Routes>
      <Route index element={<D365Dashboard user={user} progress={progress} setProgress={setProgress} />} />
      <Route path="day/:dayNum" element={<D365DailyLesson user={user} progress={progress} setProgress={setProgress} />} />
      <Route path="map" element={<D365KnowledgeMap user={user} progress={progress} />} />
      <Route path="cohort" element={<D365CohortHeatmap user={user} />} />
      <Route path="badges" element={<D365Badges user={user} progress={progress} />} />
      <Route path="*" element={<Navigate to="/diplomat365" replace />} />
    </Routes>
  );
}
