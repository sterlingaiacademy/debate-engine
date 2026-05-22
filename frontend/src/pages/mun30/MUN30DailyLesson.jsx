import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Star, ChevronRight, Zap, BookOpen, Clock } from 'lucide-react';
import { API_BASE } from '../../api';

const PHASE_COLORS = { 1: '#009edb', 2: '#FF6B00', 3: '#a855f7', 4: '#ef4444' };

function StarRow({ count, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {Array.from({ length: total }).map((_, i) => (
        <Star key={i} size={20} fill={i < count ? '#f59e0b' : 'none'} color={i < count ? '#f59e0b' : '#334155'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

export default function MUN30DailyLesson({ user, progress, setProgress }) {
  const { dayNum } = useParams();
  const navigate   = useNavigate();
  const dayNumber  = parseInt(dayNum, 10);
  const uid        = user?.studentId || user?.username;

  const [dayData,    setDayData]    = useState(null);
  const [submission, setSubmission] = useState('');
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied,     setCopied]     = useState(false);

  const phase   = dayNumber <= 7 ? 1 : dayNumber <= 14 ? 2 : dayNumber <= 21 ? 3 : 4;
  const color   = PHASE_COLORS[phase];

  useEffect(() => {
    fetch(`${API_BASE}/api/mun30/day/${dayNumber}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDayData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dayNumber]);

  const handleCopy = () => {
    if (dayData?.aiPrompt) {
      navigator.clipboard.writeText(dayData.aiPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!submission.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/mun30/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, dayNumber, submission }),
      });
      const data = await res.json();
      setResult(data);
      if (data.unlocked && setProgress) {
        setProgress(p => ({ ...p, currentDay: Math.max((p?.currentDay || 1), dayNumber + 1) }));
      }
    } catch {
      setResult({ stars: 1, totalScore: 0, feedback: 'Could not connect. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Day {dayNumber}…</div>;
  if (!dayData) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Day not found.</div>;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Back */}
      <button onClick={() => navigate('/mun30')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, padding: 0, width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Day header */}
      <div style={{ background: `linear-gradient(135deg, rgba(${color === '#009edb' ? '0,158,219' : color === '#FF6B00' ? '255,107,0' : color === '#a855f7' ? '168,85,247' : '239,68,68'},0.1) 0%, rgba(255,255,255,0.02) 100%)`, border: `1px solid ${color}33`, borderRadius: 20, padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ background: color, color: '#fff', borderRadius: 8, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 800 }}>DAY {dayNumber}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Phase {phase} · {dayData.phaseLabel}</span>
        </div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.5rem', lineHeight: 1.3 }}>{dayData.title}</h1>
        <div style={{ fontSize: '0.78rem', color: color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Zap size={13} /> Engine: {dayData.engine}
        </div>
      </div>

      {/* AI Prompt — copyable */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📋 Today's AI Prompt</div>
          <button onClick={handleCopy} style={{
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8, padding: '0.3rem 0.65rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.72rem', fontWeight: 700, color: copied ? '#10b981' : '#94a3b8',
          }}>
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy prompt</>}
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#cbd5e1', margin: 0, fontStyle: 'italic' }}>
          "{dayData.aiPrompt}"
        </p>
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.08)', borderRadius: 10, fontSize: '0.75rem', color: '#818cf8' }}>
          💡 Copy this prompt → paste into G-Force Super Tutor or any AI engine → come back and write your reflection below.
        </div>
      </div>

      {/* Daily Ritual */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <Clock size={15} color="#FF6B00" />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Ritual · 15 Minutes</span>
        </div>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#94a3b8', margin: 0 }}>
          {dayData.dailyRitual}
        </p>
      </div>

      {/* Winning Edge */}
      <div style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 16, padding: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>⚡ Winning Edge</div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#e2e8f0', margin: 0, fontWeight: 600 }}>
          {dayData.winningEdge}
        </p>
      </div>

      {/* Submission area */}
      {!result && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            📝 Your Reflection / Practice Output
          </div>
          <textarea
            value={submission}
            onChange={e => setSubmission(e.target.value)}
            placeholder="Write your response to today's prompt, your practice speech, your notes from the ritual, or what you learned…"
            style={{
              width: '100%', minHeight: 140, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
              color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.7,
              padding: '0.85rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#475569' }}>{submission.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button
              onClick={handleSubmit}
              disabled={submitting || submission.trim().length < 10}
              style={{
                background: submitting || submission.trim().length < 10 ? '#1e293b' : color,
                color: submitting || submission.trim().length < 10 ? '#475569' : '#fff',
                border: 'none', borderRadius: 12, padding: '0.7rem 1.5rem',
                fontSize: '0.88rem', fontWeight: 800, cursor: submitting || submission.trim().length < 10 ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Grading…' : 'Submit & Get Score'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${result.stars >= 3 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Coach AI Result</div>
          <StarRow count={result.stars} />
          <div style={{ fontSize: '2rem', fontWeight: 900, color: result.stars >= 3 ? '#10b981' : '#f59e0b', margin: '0.5rem 0' }}>{result.totalScore}/25</div>
          {result.stars >= 3
            ? <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>✅ Unlocked tomorrow!</div>
            : <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>⚠ Try again or come back tomorrow</div>
          }
          <div style={{
            marginTop: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '0.85rem', textAlign: 'left',
            fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-line',
          }}>
            {result.feedback}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => { setResult(null); setSubmission(''); }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', cursor: 'pointer' }}>
              Try Again
            </button>
            {result.stars >= 3 && (
              <button onClick={() => navigate(`/mun30/day/${dayNumber + 1}`)} style={{ flex: 1, background: color, border: 'none', borderRadius: 12, padding: '0.7rem', fontSize: '0.85rem', fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                Day {dayNumber + 1} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
