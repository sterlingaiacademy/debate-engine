import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Timer, Zap, Trophy, ChevronRight, CheckCircle, Lock, Calendar } from 'lucide-react';
import { getDailyMotion, getISTDateString, msUntilISTMidnight } from '../data/dailyMotions';

function Countdown({ ms }) {
  const [remaining, setRemaining] = useState(ms);
  useEffect(() => {
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  const pad = n => String(n).padStart(2, '0');
  return <span>{pad(h)} : {pad(m)} : {pad(s)}</span>;
}

export default function DailyChallenge({ user }) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(null); // null=loading, true/false
  const [launching, setLaunching] = useState(false);
  const [msLeft, setMsLeft] = useState(msUntilISTMidnight());

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);
  const accent = isJunior ? '#7c3aed' : '#FF6B00';
  const motion = getDailyMotion(isJunior);
  const today  = getISTDateString();

  // Junior settings
  const timerMinutes = isJunior ? 3 : 5;
  const timerSeconds = timerMinutes * 60;

  useEffect(() => {
    fetch(`/api/daily-challenge/${user.studentId}`)
      .then(r => r.json())
      .then(d => setCompleted(d.completed))
      .catch(() => setCompleted(false));
  }, [user.studentId]);

  const handleStart = async () => {
    setLaunching(true);
    // Navigate to debate with daily-challenge state
    navigate('/debate', {
      state: {
        dailyChallenge: true,
        motion,
        timerOverride: timerSeconds,
        isJunior,
      },
    });
  };

  // Past challenge cards display (last 5 days — static labels)
  const pastDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    ist.setDate(ist.getDate() - (i + 1));
    const label = ist.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    const start = new Date(ist.getFullYear(), 0, 0);
    const dayNum = Math.floor((ist - start) / (1000 * 60 * 60 * 24));
    return { label, dayNum };
  });


  if (completed === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: accent, borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={24} color={accent} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 900, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>Daily Challenge</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>One motion. One chance. Double the tokens.</p>
        </div>
      </div>

      {/* Main challenge card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.25rem', border: completed ? '1px solid rgba(16,185,129,0.2)' : `1px solid ${accent}25`, background: completed ? 'rgba(16,185,129,0.04)' : `linear-gradient(135deg, ${accent}06, transparent)`, position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        {!completed && <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${accent}15`, filter: 'blur(60px)', pointerEvents: 'none' }} />}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: 99, padding: '0.3rem 0.75rem' }}>
              <Calendar size={12} color={accent} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{today}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 99, padding: '0.3rem 0.75rem' }}>
              <Zap size={12} color="#eab308" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#eab308' }}>2× TOKENS</span>
            </div>
          </div>
          {/* Countdown */}
          {!completed && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.15rem' }}>RESETS IN</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                <Countdown ms={msLeft} />
              </div>
            </div>
          )}
        </div>

        {/* Motion */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Today's Motion</div>
          <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            "{motion}"
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>TIME LIMIT</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                <Timer size={16} color={accent} />{timerMinutes} min
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>FORMAT</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{isJunior ? 'Guided' : 'Open Debate'}</div>
            </div>
          </div>

          {completed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '0.75rem 1.25rem' }}>
              <CheckCircle size={18} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>Completed Today</span>
            </div>
          ) : (
            <button onClick={handleStart} disabled={launching}
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none', borderRadius: 14, padding: '0.875rem 1.75rem', cursor: 'pointer', color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: `0 0 30px ${accent}40`, transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 0 40px ${accent}60`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 30px ${accent}40`; }}>
              {launching ? 'Starting...' : 'Accept Challenge'}
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.875rem', color: 'var(--text-primary)' }}>Challenge Rules</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            `One attempt per day — challenge resets at midnight IST`,
            `You earn 2× GForce Tokens compared to a regular debate`,
            `Side is assigned randomly — argue for or against`,
            `Motion is the same for all ${isJunior ? 'junior' : 'senior'} students today`,
            isJunior ? '3-minute guided debate with extra hints' : '5-minute full-format debate — no hints',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <div style={{ width: 18, height: 18, borderRadius: 6, background: `${accent}15`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: accent, flexShrink: 0, marginTop: '0.1rem' }}>{i + 1}</div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak encouragement */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={20} color="#ef4444" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>Build Your Streak</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Complete the daily challenge 3 days in a row to earn the Hat Trick badge.</div>
        </div>
      </div>
    </div>
  );
}
