import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Play, RotateCcw, Target, Zap, MessageSquare, Mic, Lightbulb, BookOpen,
  HeartHandshake, ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Info, MicOff, Trophy, TrendingUp, ChevronRight
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing';

/* ─── Category config ─── */
const CATEGORY_META = {
  'Argument Quality':        { icon: Target,       color: '#FF6B00' },
  'Rebuttal & Engagement':   { icon: Zap,          color: '#ef4444' },
  'Clarity & Coherence':     { icon: MessageSquare,color: '#10b981' },
  'Speech Fluency':          { icon: Mic,          color: '#f59e0b' },
  'Persuasiveness':          { icon: Lightbulb,    color: '#8b5cf6' },
  'Knowledge & Evidence':    { icon: BookOpen,     color: '#0ea5e9' },
  'Respectfulness & Tone':   { icon: HeartHandshake,color: '#14b8a6' },
  'Consistency & Position':  { icon: ShieldCheck,  color: '#6366f1' },
};

function getScoreColor(s) {
  if (s >= 8.5) return '#10b981';
  if (s >= 7.0) return '#34d399';
  if (s >= 5.0) return '#facc15';
  if (s >= 3.0) return '#f97316';
  return '#ef4444';
}

/* ─── Animated horizontal skill bar ─── */
function SkillBar({ category, delay = 0 }) {
  const { icon: Icon, color } = CATEGORY_META[category.name] || { icon: Target, color: '#FF6B00' };
  const scoreColor = getScoreColor(category.score);
  const [expanded, setExpanded] = useState(false);
  const isCapped = category.details?.includes('Capped:');
  const detailsText = category.details?.split(' | ⚠ Capped:')[0] || '';

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.1rem 1.25rem',
        border: `1px solid ${scoreColor}22`,
        animation: `staggerIn 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} color={color} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{category.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Weight ×{category.weight.toFixed(1)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isCapped && <Info size={13} color="#f97316" title="Capped — insufficient participation" style={{ cursor: 'help' }} />}
          <span style={{ fontWeight: 800, fontSize: '1rem', color: scoreColor }}>{category.score.toFixed(1)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/10</span>
        </div>
      </div>

      {/* Animated bar */}
      <div className="skill-bar-track" style={{ marginBottom: expanded ? '0.75rem' : 0 }}>
        <div
          className="skill-bar-fill"
          style={{
            width: `${(category.score / 10) * 100}%`,
            background: `linear-gradient(90deg, ${scoreColor}cc, ${scoreColor})`,
            '--bar-delay': `${delay + 100}ms`,
          }}
        />
      </div>

      {/* Expand/collapse */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ background: 'transparent', border: 'none', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem', cursor: 'pointer', padding: 0 }}
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Less' : 'Details'}
      </button>

      {expanded && (
        <div style={{ marginTop: '0.75rem', animation: 'fadeIn 0.2s ease' }}>
          {detailsText && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{detailsText}</p>}
          {category.sub_scores && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {Object.entries(category.sub_scores).map(([k, v]) => {
                if (Array.isArray(v) || typeof v === 'object') return null;
                const label = k.replace(/_/g, ' ');
                return (
                  <span key={k} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.15rem 0.45rem', borderRadius: 4, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {label.charAt(0).toUpperCase() + label.slice(1)}: <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Particle burst animation ─── */
function ParticleBurst({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 8 });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {particles.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 8, height: 8, borderRadius: '50%',
          background: ['#FF6B00','#FFD700','#00d4ff','#a855f7','#10b981','#f43f5e','#fbbf24','#38bdf8'][i],
          animation: `particleRise 0.8s ease-out ${i * 0.08}s forwards`,
          transform: `rotate(${i * 45}deg) translateX(${30 + Math.random() * 20}px)`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Results({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setShowParticles(true), 800);
    return () => clearTimeout(t);
  }, []);

  const evaluation = state?.evaluation;

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user.classLevel);

  /* ── Junior / skip ── */
  if (isJunior || evaluation?.skipped) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', gap: '2rem' }}>
        {/* Celebration ring */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #e879f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(124,58,237,0.4)', animation: 'celebrateBounce 0.8s ease-out' }}>
            <Trophy size={64} color="#fff" strokeWidth={1.5} />
          </div>
          <ParticleBurst active={showParticles} />
        </div>

        <div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.03em', color: 'var(--j-text)' }}>
            Debate Complete!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
            Amazing work — keep going and you'll become a debate champion!
          </p>
        </div>

        {/* If junior with evaluation data, show simplified score */}
        {!isJunior || evaluation ? (
          evaluation?.overall_score && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <ScoreRing score={evaluation.overall_score} size={160} />
              {evaluation?.categories && evaluation.categories.length > 0 && (
                <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {evaluation.categories.map((c, i) => (
                    <SkillBar key={c.name} category={c} delay={i * 60} />
                  ))}
                </div>
              )}
            </div>
          )
        ) : null}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" style={{ borderRadius: 99 }} onClick={() => navigate('/debate')}>
            <Play size={18} fill="currentColor" /> Debate Again
          </button>
          <button className="btn btn-secondary btn-lg" style={{ borderRadius: 99 }} onClick={() => navigate('/dashboard')}>
            <RotateCcw size={18} /> Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (evaluation?.error) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem', gap: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={36} color="#ef4444" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--error)', margin: '0 0 0.5rem' }}>Evaluation Error</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: 0 }}>{evaluation.error}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/debate')}>Try Again</button>
        </div>
      </div>
    );
  }

  /* ── Insufficient data ── */
  if (evaluation?.insufficient_data) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 560, margin: '3rem auto', padding: '0 1rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', gap: '1.25rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MicOff size={36} color="var(--text-muted)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.75rem' }}>Not Enough Speech</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {evaluation.insufficient_data_reason ||
                `You spoke only ${evaluation?.stats?.total_words || 0} words. Aim for at least a few full arguments to get meaningful feedback.`}
            </p>
          </div>
          <button className="btn-game btn-game-primary" style={{ width: '100%', maxWidth: 300 }} onClick={() => navigate('/debate')}>
            <Play size={18} fill="#fff" /> Try Again
          </button>
          <div style={{ width: '100%', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '1.25rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fcd34d', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lightbulb size={15} /> Quick Tips
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#fef3c7', fontSize: '0.82rem' }}>
              <li>State your position clearly with at least one reason.</li>
              <li>Aim to speak at least 30 seconds per turn.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  /* ── FULL RESULTS ── */
  const score      = evaluation?.overall_score || 0;
  const grade      = evaluation?.grade || 'N/A';
  const categories = evaluation?.categories || [];
  const evStats    = evaluation?.stats || {};
  const wrongSide  = categories.find(c => c.name === 'Consistency & Position')?.sub_scores?.wrong_side;
  const sideColor  = evaluation?.debater?.side?.toUpperCase() === 'FOR' ? '#10b981' : '#ef4444';
  const scoreColor = getScoreColor(score);

  const leaderUpdate = evaluation?.leaderboard_update;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header Card ── */}
      <div className="glass-card" style={{ padding: '1.25rem 1.75rem', border: `1px solid ${scoreColor}20` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem' }}>
              {evaluation?.debater?.name || user.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {evaluation?.debater?.class || user.classLevel} · {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              "{evaluation?.motion || 'Unknown Motion'}"
            </span>
            <span style={{ background: `${sideColor}15`, color: sideColor, border: `1px solid ${sideColor}40`, padding: '0.2rem 0.65rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {evaluation?.debater?.side || '—'}
            </span>
            {wrongSide && <AlertTriangle size={16} color="#f97316" title="Side confusion detected" />}
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1fr) 2fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Score Ring */}
          <div className="glass-card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem',
            border: `1px solid ${scoreColor}25`,
            position: 'relative', overflow: 'visible',
          }}>
            <ParticleBurst active={showParticles} />

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
              Overall Score
            </div>

            <ScoreRing score={score} size={180} />

            <div style={{
              marginTop: '1.5rem',
              padding: '0.4rem 1.5rem',
              background: `${scoreColor}15`, color: scoreColor,
              border: `1px solid ${scoreColor}40`, borderRadius: 99,
              fontWeight: 800, fontSize: '1rem',
            }}>
              Grade: {grade}
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', width: '100%', marginTop: '1.5rem' }}>
              {[
                { label: 'Turns',      val: evStats.total_turns || 0 },
                { label: 'Words',      val: evStats.total_words || 0 },
                { label: 'Per Turn',   val: evStats.avg_words_per_turn || 0 },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.65rem 0.25rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Token / rank update */}
            {leaderUpdate && (
              <div style={{ width: '100%', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GForce Tokens</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {Math.round(leaderUpdate.new_tokens)}
                    <span style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: 700 }}>+{Math.round(leaderUpdate.tokens_earned)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Global Rank</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF6B00' }}>#{leaderUpdate.rank}</div>
                </div>
              </div>
            )}
          </div>

          {/* Strengths */}
          {evaluation?.strengths?.length > 0 && (
            <div className="glass-card" style={{ borderLeft: '3px solid #10b981', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: '#10b981', marginBottom: '0.875rem' }}>
                <CheckCircle2 size={16} /> Key Strengths
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {evaluation.strengths.map((s, i) => {
                  const m = s.match(/^\[(.*?)\]\s*(.*)$/);
                  return (
                    <li key={i} style={{ fontSize: '0.875rem', lineHeight: 1.5, display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#10b981', marginTop: '0.1rem', flexShrink: 0 }}>•</span>
                      {m
                        ? <span><strong style={{ color: 'var(--text-primary)' }}>[{m[1]}]</strong> {m[2]}</span>
                        : s
                      }
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Skill Breakdown */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.875rem', color: 'var(--text-primary)' }}>Skill Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px), 1fr))', gap: '0.75rem' }}>
              {categories.map((c, i) => <SkillBar key={c.name} category={c} delay={i * 60} />)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px), 1fr))', gap: '1.25rem' }}>

            {/* Key Moments */}
            <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Key Moments</h3>
              {evaluation?.key_moments?.length > 0 ? (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ position: 'absolute', top: 8, bottom: 8, left: 7, width: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                  {evaluation.key_moments.map((m, i) => {
                    const isPos = m.includes('✓');
                    const isNeg = m.includes('⚠') || m.includes('cost credibility');
                    const dot = isPos ? '#10b981' : isNeg ? '#f59e0b' : '#3b82f6';
                    return (
                      <div key={i} style={{ display: 'flex', gap: '0.875rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: dot, border: '3px solid #000', flexShrink: 0, marginTop: 3, boxShadow: `0 0 8px ${dot}60` }} />
                        <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '0.45rem 0.7rem', borderRadius: 8, flex: 1 }}>
                          {m.replace('✓','').replace('⚠','').trim()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No standout moments — develop your arguments more fully.</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Fallacies */}
              {evaluation?.fallacies_detected?.length > 0 && (
                <div className="glass-card" style={{ borderLeft: '3px solid #ef4444', background: 'rgba(239,68,68,0.04)', padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={15} /> Fallacies Detected
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {evaluation.fallacies_detected.map((f, i) => (
                      <div key={i}>
                        <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.82rem' }}>{f.type}</div>
                        <div style={{ fontSize: '0.78rem', color: '#fecaca', fontStyle: 'italic' }}>"{f.excerpt}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Persuasion Techniques */}
              <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>Persuasion Techniques</h3>
                {evaluation?.persuasion_techniques?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {evaluation.persuasion_techniques.map(t => (
                      <span key={t} style={{ background: 'rgba(168,85,247,0.1)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.25)', padding: '0.2rem 0.65rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                    No techniques detected. Try using analogies or rhetorical questions.
                  </p>
                )}
              </div>

              {/* Disfluency */}
              {evaluation?.disfluency_report && (
                <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>Speech Disfluency</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {[
                      { label: 'Stutters', val: evaluation.disfluency_report.stutters },
                      { label: 'Restarts', val: evaluation.disfluency_report.restarts },
                      { label: 'Repeats',  val: evaluation.disfluency_report.word_repetitions },
                      { label: 'Trail',    val: evaluation.disfluency_report.trailing_off },
                    ].map(d => (
                      <div key={d.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>{d.val}</div>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase' }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Total: {evaluation.disfluency_report.total} disfluencies
                    {evStats.total_words > 0 && ` (${((evaluation.disfluency_report.total / evStats.total_words) * 100).toFixed(1)} per 100 words)`}
                  </p>
                </div>
              )}

              {/* Opponent challenges */}
              {evaluation?.ai_challenges_summary?.length > 0 && (
                <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Review These Challenges</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Questions your opponent raised you should prepare for:</p>
                  <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                    {evaluation.ai_challenges_summary.map((q, i) => <li key={i}>{q}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: '1rem', maxWidth: 480, margin: '1.5rem auto 0', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-game btn-game-primary" style={{ flex: 1 }} onClick={() => navigate('/debate')}>
          <Play size={18} fill="#fff" /> New Debate
        </button>
        <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
          <RotateCcw size={18} /> Dashboard
        </button>
      </div>
    </div>
  );
}
