import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Music } from 'lucide-react';
import PitchVisualizer from '../components/PitchVisualizer';
import { PROMPTS, TOLERANCE, GRADE_WEIGHTS, STAGE_MAP } from '../data/sangeet_prompts';
import { API_BASE } from '../api';

const PASS_THRESHOLD = 60;

// ── Scoring helpers ───────────────────────────────────────────────────────────
function scorePitchFromStats(stats, tolerance) {
  if (!stats || stats.notesSung === 0) return 15; // detected near-silence
  const { avgDeviation } = stats;
  const t = tolerance.pitchCents;
  if (avgDeviation <= t * 0.25) return 100;
  if (avgDeviation <= t * 0.50) return 90;
  if (avgDeviation <= t * 0.75) return 78;
  if (avgDeviation <= t)        return 65;
  if (avgDeviation <= t * 1.50) return 50;
  if (avgDeviation <= t * 2.00) return 35;
  return 20;
}

function scoreRhythm(notes, tolerance) {
  // Rhythm = steadiness of inter-onset intervals
  if (!notes || notes.length < 3) return 60; // not enough signal
  const gaps = [];
  for (let i = 1; i < notes.length; i++) gaps.push(notes[i] - notes[i - 1]);
  if (gaps.length < 2) return 60;
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const stddev = Math.sqrt(gaps.map(g => (g - mean) ** 2).reduce((a, b) => a + b, 0) / gaps.length);
  const t = tolerance.rhythmMs;
  if (stddev < t * 0.25) return 100;
  if (stddev < t * 0.50) return 88;
  if (stddev < t * 0.75) return 74;
  if (stddev < t)        return 60;
  if (stddev < t * 1.50) return 45;
  return 30;
}

// ── Phase label helper ────────────────────────────────────────────────────────
const PHASE_LABEL = { idle: 'Ready', counting: 'Get ready…', recording: 'Recording', processing: 'Scoring…', results: 'Results' };

export default function SangeetSession({ user }) {
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const grade            = searchParams.get('grade') || 'G1';
  const stageInfo        = STAGE_MAP[grade] || STAGE_MAP.G1;
  const tolerance        = TOLERANCE[grade]  || TOLERANCE.G1;
  const weights          = GRADE_WEIGHTS[grade] || GRADE_WEIGHTS.G1;
  const prompts          = PROMPTS[grade] || PROMPTS.G1;

  const [promptIdx,   setPromptIdx]   = useState(0);
  const [phase,       setPhase]       = useState('idle');      // idle | counting | recording | processing | results
  const [countdown,   setCountdown]   = useState(3);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [currentNote, setCurrentNote] = useState(null);
  const [score,       setScore]       = useState(null);
  const [error,       setError]       = useState('');

  const vizRef         = useRef(null);
  const onsetTimesRef  = useRef([]);   // timestamps of detected sound events (ms)
  const lastNoteHzRef  = useRef(null); // last detected Hz for onset tracking
  const timerRef       = useRef(null);

  const prompt = prompts[promptIdx];
  const totalPrompts = prompts.length;

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Countdown then record ─────────────────────────────────────────────────
  function startSession() {
    setPhase('counting');
    setCountdown(3);
    setCurrentNote(null);
    onsetTimesRef.current  = [];
    lastNoteHzRef.current  = null;

    let count = 3;
    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timerRef.current);
        beginRecording();
      }
    }, 1000);
  }

  function beginRecording() {
    const duration = prompt.duration || 10;
    setPhase('recording');
    setTimeLeft(duration);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ── Pitch events during recording ─────────────────────────────────────────
  const handlePitchDetected = useCallback((info) => {
    setCurrentNote(info);
    // Track onsets (note changes) for rhythm scoring
    if (lastNoteHzRef.current === null || Math.abs(info.hz - lastNoteHzRef.current) > 20) {
      onsetTimesRef.current.push(Date.now());
      lastNoteHzRef.current = info.hz;
    }
  }, []);

  // ── Stop recording and score ───────────────────────────────────────────────
  async function finishRecording() {
    setPhase('processing');
    setCurrentNote(null);

    // Give the visualizer 150ms to finish its last frame
    await new Promise(r => setTimeout(r, 150));

    const stats       = vizRef.current?.getStats?.() ?? null;
    const pitchScore  = scorePitchFromStats(stats, tolerance);
    const rhythmScore = scoreRhythm(onsetTimesRef.current, tolerance);

    try {
      const studentId = user?.studentId || user?.id || 'anonymous';
      const resp = await fetch(`${API_BASE}/api/sangeet/score`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          studentId,
          grade,
          taskType:    prompt.type,
          prompt:      prompt.task,
          pitchScore,
          rhythmScore,
          pitchData:   stats,
          raga:        prompt.raga || null,
        }),
      });

      if (!resp.ok) throw new Error('Server error');
      const data = await resp.json();
      setScore(data);
    } catch (err) {
      // Fallback: compute locally if backend is unreachable
      const needsExpr  = parseInt(grade.replace('G', ''), 10) >= 7;
      const exprScore  = needsExpr ? Math.round((pitchScore + rhythmScore) / 2) : null;
      let overall;
      if (needsExpr) {
        overall = Math.round(pitchScore * weights.pitch + rhythmScore * weights.rhythm + (exprScore ?? 0) * weights.expression);
      } else {
        overall = Math.round(pitchScore * weights.pitch + rhythmScore * weights.rhythm);
      }
      setScore({
        pitchScore, rhythmScore,
        expressionScore: exprScore,
        overallScore: Math.max(0, Math.min(100, overall)),
        feedback: 'Keep practicing — focus on matching the target note and staying steady.',
        passed: overall >= PASS_THRESHOLD,
        grade,
      });
    }
    setPhase('results');
  }

  function nextPrompt() {
    const next = (promptIdx + 1) % totalPrompts;
    setPromptIdx(next);
    setPhase('idle');
    setScore(null);
    setError('');
  }

  function retry() {
    setPhase('idle');
    setScore(null);
    setError('');
  }

  // ── Colour for this grade ─────────────────────────────────────────────────
  const C = stageInfo.color;

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      fontFamily: 'Inter, sans-serif', color: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={() => navigate('/sangeet')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontFamily: 'inherit' }}
        >
          <ChevronLeft size={16} /> Back to Sangeet
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
            color: C, background: `${C}18`, border: `1px solid ${C}30`,
            borderRadius: 99, padding: '0.25rem 0.7rem', textTransform: 'uppercase',
          }}>
            Stage {stageInfo.stage} · {stageInfo.name}
          </div>
          <div style={{
            fontSize: '0.75rem', fontWeight: 800, color: '#fff',
            background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.25rem 0.6rem',
          }}>
            {grade}
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#475569' }}>
          {promptIdx + 1} / {totalPrompts}
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2rem 1.5rem', maxWidth: 680, margin: '0 auto', width: '100%' }}>

        {/* ── Prompt card ── */}
        <div style={{
          width: '100%', background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${C}30`, borderRadius: 16,
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.6rem', color: C, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {prompt.type.replace(/_/g, ' ')}
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.75rem', lineHeight: 1.35 }}>
            {prompt.task}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.65 }}>
            {prompt.instruction}
          </p>
          {prompt.raga && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: C, fontWeight: 700 }}>
              🎵 Raga: {prompt.raga}
            </div>
          )}
        </div>

        {/* ── Pitch visualizer (always visible during recording) ── */}
        {(phase === 'recording') && (
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <PitchVisualizer
              ref={vizRef}
              isRecording={phase === 'recording'}
              onPitchDetected={handlePitchDetected}
              color={C}
            />
            {/* Live note display */}
            {currentNote && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: C }}>{currentNote.sargam}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.4rem' }}>
                  {currentNote.cents >= 0 ? '+' : ''}{currentNote.cents}¢ · {currentNote.hz.toFixed(0)} Hz
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Phase UI ── */}
        {phase === 'idle' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {/* Tolerance hint */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pitch tolerance</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>±{tolerance.pitchCents}¢</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Duration</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>{prompt.duration}s</div>
              </div>
              {parseInt(grade.replace('G','')) >= 7 && (
                <>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expression</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C }}>AI Scored</div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={startSession}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C}, ${C}cc)`,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 32px ${C}50`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
            >
              <Mic size={32} color="#fff" />
            </button>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Tap to begin</div>
          </div>
        )}

        {phase === 'counting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '5rem', fontWeight: 900, color: C,
              animation: 'pulse 1s cubic-bezier(0.4,0,0.6,1) infinite',
            }}>
              {countdown}
            </div>
            <div style={{ fontSize: '1rem', color: '#64748b' }}>Get ready…</div>
          </div>
        )}

        {phase === 'recording' && (
          <div style={{ textAlign: 'center' }}>
            {/* Timer ring */}
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 0.5rem' }}>
              <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }} shapeRendering="geometricPrecision">
                <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
                <circle cx={40} cy={40} r={34} fill="none"
                  stroke={C} strokeWidth={5} strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34 * (timeLeft / (prompt.duration || 10))} ${2 * Math.PI * 34}`}
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 900, color: C,
              }}>
                {timeLeft}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', color: C, fontSize: '0.85rem', fontWeight: 700 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C, animation: 'pulse 1.5s ease-in-out infinite' }} />
              Recording
            </div>
          </div>
        )}

        {phase === 'processing' && (
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
            <div style={{ fontSize: '0.85rem' }}>Analysing your performance…</div>
          </div>
        )}

        {/* ── Results ── */}
        {phase === 'results' && score && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Overall */}
            <div style={{
              background: score.passed
                ? `linear-gradient(135deg, ${C}15, ${C}08)`
                : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))',
              border: `1px solid ${score.passed ? C + '40' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 16, padding: '1.5rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: score.passed ? C : '#ef4444', lineHeight: 1 }}>
                {score.overallScore}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Overall Score</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                {score.passed
                  ? <><CheckCircle size={16} color={C} /><span style={{ color: C, fontSize: '0.85rem', fontWeight: 700 }}>Passed</span></>
                  : <><XCircle size={16} color="#ef4444" /><span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>Keep Practising</span></>
                }
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: score.expressionScore !== null ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Pitch', value: score.pitchScore, color: '#3b82f6', pct: `${Math.round(weights.pitch * 100)}%` },
                { label: 'Rhythm', value: score.rhythmScore, color: '#f59e0b', pct: `${Math.round(weights.rhythm * 100)}%` },
                ...(score.expressionScore !== null ? [{
                  label: 'Expression', value: score.expressionScore, color: C, pct: `${Math.round(weights.expression * 100)}%`,
                }] : []),
              ].map(({ label, value, color, pct }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '1rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color }}>{value ?? '—'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>{label}</div>
                  <div style={{ fontSize: '0.6rem', color: '#334155', marginTop: '0.15rem' }}>weight {pct}</div>
                  {/* Mini bar */}
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginTop: '0.6rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${value ?? 0}%`, background: color, borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '1rem 1.25rem',
            }}>
              <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                {parseInt(grade.replace('G','')) >= 7 ? '🤖 AI Feedback' : '📝 Feedback'}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.65 }}>
                {score.feedback}
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={retry}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                <RotateCcw size={15} /> Try Again
              </button>
              <button
                onClick={nextPrompt}
                style={{
                  flex: 2, padding: '0.8rem', borderRadius: 10, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${C}, ${C}cc)`,
                  border: 'none', color: '#fff',
                  fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  boxShadow: `0 4px 20px ${C}40`,
                }}
              >
                Next Task <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
