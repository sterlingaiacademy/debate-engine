import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Send, CheckCircle, Lock,
  BookOpen, Target, Zap, Scroll, Award, Flame
} from 'lucide-react';
import { API_BASE } from '../../api';

const SLOT_ICONS = { 'Concept Day': BookOpen, 'Drill Day': Target, 'Debate Day': Zap, 'Reflection Day': Scroll, 'Assessment Day': Award };
const SLOT_COLORS = { 'Concept Day': '#009edb', 'Drill Day': '#FF6B00', 'Debate Day': '#a855f7', 'Reflection Day': '#10b981', 'Assessment Day': '#D4A017' };

function StarDisplay({ stars, animated }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      {[1,2,3,4,5].map(s => (
        <Star
          key={s}
          size={32}
          strokeWidth={0}
          fill={s <= stars ? '#D4A017' : 'rgba(255,255,255,0.08)'}
          style={{
            transition: `transform 0.4s cubic-bezier(0.16,1,0.3,1) ${(s-1)*80}ms, opacity 0.3s`,
            transform: animated && s <= stars ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

function DimRow({ label, lookFor, score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500, marginTop: '0.1rem' }}>{lookFor}</div>
      </div>
      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
        {[1,2,3,4,5].map(s => (
          <div key={s} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: s <= score ? '#D4A017' : 'rgba(255,255,255,0.1)',
            transition: `background 0.3s ease ${s * 60}ms`,
          }} />
        ))}
      </div>
      <div style={{ width: 24, textAlign: 'right', fontSize: '0.8rem', fontWeight: 800, color: score >= 3 ? '#D4A017' : '#475569' }}>
        {score}/5
      </div>
    </div>
  );
}

export default function D365DailyLesson({ user, progress, setProgress }) {
  const { dayNum } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [starAnim, setStarAnim] = useState(false);
  const [error, setError] = useState('');

  const uid = user?.studentId || user?.username;
  const currentDay = progress?.currentDay || 1;
  const dayNumber = parseInt(dayNum);
  const isLocked = dayNumber > currentDay;

  useEffect(() => {
    fetch(`${API_BASE}/api/d365/days/${dayNumber}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setDay(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dayNumber]);

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Please write at least a few sentences before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/d365/rubric/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, dayNumber, text }),
      });
      const data = await res.json();
      setResult(data);
      setStarAnim(true);
      setTimeout(() => setStarAnim(false), 2000);
      // Update progress if unlocked
      if (data.unlocked && setProgress) {
        setProgress(prev => ({
          ...prev,
          currentDay: Math.max(prev?.currentDay || 1, dayNumber + 1),
          streak: data.newStreak ?? prev?.streak,
          tokens: data.newTokens ?? prev?.tokens,
        }));
      }
    } catch (e) {
      setError('Submission failed. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#D4A017', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!day) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#475569' }}>Day not found.</p>
        <button onClick={() => navigate('/diplomat365')} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#FF6B00', cursor: 'pointer', fontWeight: 700 }}>← Back</button>
      </div>
    );
  }

  const SlotIcon = SLOT_ICONS[day.slot] || BookOpen;
  const slotColor = SLOT_COLORS[day.slot] || '#009edb';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem', maxWidth: 720, margin: '0 auto', width: '100%' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/diplomat365')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', alignSelf: 'flex-start', padding: 0 }}
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Dashboard
      </button>

      {/* Day header */}
      <div style={{
        background: `linear-gradient(135deg, ${slotColor}10, rgba(0,0,0,0))`,
        border: `1px solid ${slotColor}25`,
        borderRadius: 20, padding: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${slotColor}10 0%, transparent 70%)` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: `${slotColor}18`, border: `1px solid ${slotColor}30`,
            borderRadius: 99, padding: '0.2rem 0.7rem',
            fontSize: '0.68rem', fontWeight: 800, color: slotColor, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <SlotIcon size={11} strokeWidth={2.5} />
            {day.slot}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 600 }}>
            Day {day.dayNumber} · Week {day.week} · Level {day.level} · Age {day.ageBand}
          </span>
          {isLocked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239,68,68,0.1)', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 700, color: '#ef4444' }}>
              <Lock size={10} strokeWidth={2.5} /> Locked
            </div>
          )}
        </div>
        <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, margin: '0 0 0.4rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {day.theme}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{day.slotDesc}</p>
        {day.headline && (
          <p style={{ fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', marginTop: '0.6rem' }}>{day.headline}</p>
        )}
      </div>

      {/* Drill */}
      <div className="glass-card">
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Today's Drill (15–30 minutes)</div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{day.drill}</p>
      </div>

      {/* Vocab */}
      {day.vocab_word && (
        <div className="glass-card" style={{ borderColor: 'rgba(0,158,219,0.2)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#009edb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Vocabulary Builder</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Word: <span style={{ color: '#009edb' }}>{day.vocab_word}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{day.vocab_prompt}</p>
        </div>
      )}

      {/* Rubric table */}
      <div className="glass-card">
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>AI Rubric</div>
        <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '1rem' }}>Coach AI grades you out of 5 stars (25 points = 5 stars). You need ≥ 3 stars to unlock tomorrow.</div>
        {(day.rubric_dims || []).map((dim, i) => (
          <DimRow
            key={i}
            label={dim.label}
            lookFor={dim.lookFor}
            score={result ? (result.dims?.[Object.keys(result.dims)[i]] || 0) : 0}
          />
        ))}
      </div>

      {/* Submission area */}
      {!isLocked && !result && (
        <div className="glass-card">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Your Submission</div>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            placeholder="Write your response here. Aim for 150–300 words. Use diplomatic language, real evidence, and a clear argument..."
            style={{
              width: '100%', minHeight: 180,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '0.85rem 1rem',
              color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.65,
              resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#009edb'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600 }}>
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            {error && <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>{error}</span>}
            <button
              onClick={handleSubmit}
              disabled={submitting || text.trim().length < 20}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: submitting || text.trim().length < 20 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #009edb, #D4A017)',
                color: submitting || text.trim().length < 20 ? '#475569' : '#fff',
                border: 'none', borderRadius: 99, padding: '0.65rem 1.5rem',
                fontSize: '0.875rem', fontWeight: 800, cursor: submitting ? 'wait' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? (
                <><div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Grading...</>
              ) : (
                <><Send size={15} strokeWidth={2.5} /> Submit for AI Rubric</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Coach AI Result</div>
          <StarDisplay stars={result.stars} animated={starAnim} />
          <div style={{ fontSize: '2rem', fontWeight: 900, color: result.stars >= 3 ? '#D4A017' : '#ef4444', margin: '0.75rem 0 0.25rem' }}>
            {result.totalScore}/25
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: result.stars >= 3 ? '#10b981' : '#f97316', marginBottom: '1.25rem' }}>
            {result.stars >= 3 ? '✅ Day Unlocked!' : '⚠️ Try again tomorrow'}
          </div>

          {/* Dim breakdown */}
          <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            {(day.rubric_dims || []).map((dim, i) => {
              const dimKeys = ['persuasion', 'evidence', 'policyKnowledge', 'diplomaticRegister', 'voiceDelivery'];
              const score = result.dims?.[dimKeys[i]] || 0;
              return <DimRow key={i} label={dim.label} lookFor={dim.lookFor} score={score} />;
            })}
          </div>

          {/* Feedback */}
          <div style={{
            background: result.stars >= 3 ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)',
            border: `1px solid ${result.stars >= 3 ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)'}`,
            borderRadius: 12, padding: '0.85rem 1rem',
            fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.65, textAlign: 'left',
            whiteSpace: 'pre-line',
          }}>
            {result.feedback}
          </div>

          {result.stars >= 3 && (
            <button
              onClick={() => navigate('/diplomat365')}
              style={{
                marginTop: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem auto 0',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', borderRadius: 99,
                padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
              }}
            >
              <CheckCircle size={18} strokeWidth={2.5} /> Continue to Dashboard
            </button>
          )}
        </div>
      )}

      {/* Locked overlay message */}
      {isLocked && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 14, padding: '1rem 1.25rem', textAlign: 'center',
        }}>
          <Lock size={20} color="#ef4444" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>This day is locked</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Score ≥ 3 stars on Day {dayNumber - 1} to unlock this lesson.</div>
        </div>
      )}
    </div>
  );
}
