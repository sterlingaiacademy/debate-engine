import { Flame, Timer, Zap, Calendar, Lock, CheckCircle } from 'lucide-react';
import { getDailyMotion, getISTDateString, msUntilISTMidnight } from '../data/dailyMotions';

function Countdown({ ms }) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const pad = n => String(n).padStart(2, '0');
  return <span>{pad(h)}h {pad(m)}m {pad(s)}s</span>;
}

export default function DailyChallenge({ user }) {
  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);
  const accent = isJunior ? '#7c3aed' : '#FF6B00';
  const motion = getDailyMotion(isJunior);
  const today  = getISTDateString();
  const timerMinutes = isJunior ? 3 : 5;

  const UPCOMING = [
    { icon: Zap, label: '2× GForce Tokens', desc: 'Earn double tokens for completing the daily challenge' },
    { icon: Flame, label: 'Streak Badges', desc: 'Hat Trick, On Fire, Unstoppable — complete 3, 5, 10 days in a row' },
    { icon: Calendar, label: 'New Motion Daily', desc: 'A fresh debate topic every day at midnight IST' },
    { icon: Timer, label: 'Timed Format', desc: `${timerMinutes} minutes — one attempt per day, no re-tries` },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={24} color={accent} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Daily Challenge</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 99, padding: '0.2rem 0.65rem' }}>
              <Lock size={11} color="#fbbf24" />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coming Soon</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>One motion. One chance. Double the tokens.</p>
        </div>
      </div>

      {/* Preview card — blurred + locked */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        {/* Blur overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={24} color="rgba(255,255,255,0.7)" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Launching Soon</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>Daily challenges are being tested and will be live shortly.</div>
        </div>

        {/* Underneath: blurred preview of the real card */}
        <div className="glass-card" style={{ padding: '2rem', border: `1px solid ${accent}25`, background: `linear-gradient(135deg, ${accent}06, transparent)`, position: 'relative', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${accent}15`, filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: 99, padding: '0.3rem 0.75rem' }}>
              <Calendar size={12} color={accent} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accent, textTransform: 'uppercase' }}>{today}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 99, padding: '0.3rem 0.75rem' }}>
              <Zap size={12} color="#eab308" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#eab308' }}>2× TOKENS</span>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Today's Motion</div>
            <div style={{ fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)' }}>"{motion}"</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>TIME LIMIT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <Timer size={16} color={accent} />{timerMinutes} min
                </div>
              </div>
            </div>
            <div style={{ background: `${accent}20`, borderRadius: 14, padding: '0.875rem 1.75rem', color: accent, fontWeight: 800, fontSize: '1rem' }}>
              Accept Challenge
            </div>
          </div>
        </div>
      </div>

      {/* What's coming section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>What to expect</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,220px),1fr))', gap: '1rem' }}>
          {UPCOMING.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}10`, border: `1px solid ${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={accent} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* While you wait */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckCircle size={20} color="#6366f1" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>While you wait</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Use the Vocab Trainer and Argument Builder to sharpen your skills so you're ready when Daily Challenges go live.
          </div>
        </div>
      </div>

    </div>
  );
}
