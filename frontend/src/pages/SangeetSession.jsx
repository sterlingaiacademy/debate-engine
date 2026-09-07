import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import PitchVisualizer from '../components/PitchVisualizer';
import { PROMPTS, TOLERANCE, GRADE_WEIGHTS, STAGE_MAP } from '../data/sangeet_prompts';
import { API_BASE } from '../api';

const PASS_THRESHOLD = 60;

// ── Scoring helpers ───────────────────────────────────────────────────────────
function computePitchScore(deviations, tolerance) {
  if (!deviations || deviations.length === 0) return 20; // no voice detected
  const avg = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const t   = tolerance.pitchCents;
  if (avg <= t * 0.25) return 100;
  if (avg <= t * 0.50) return 90;
  if (avg <= t * 0.75) return 78;
  if (avg <= t)        return 65;
  if (avg <= t * 1.50) return 50;
  if (avg <= t * 2.00) return 35;
  return 22;
}

function computeRhythmScore(onsetTimes, tolerance) {
  if (!onsetTimes || onsetTimes.length < 3) return 62; // not enough claps to judge
  const gaps = [];
  for (let i = 1; i < onsetTimes.length; i++) gaps.push(onsetTimes[i] - onsetTimes[i - 1]);
  if (gaps.length < 2) return 62;
  const mean   = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const stddev = Math.sqrt(gaps.map(g => (g - mean) ** 2).reduce((a, b) => a + b, 0) / gaps.length);
  const t = tolerance.rhythmMs;
  if (stddev < t * 0.25) return 100;
  if (stddev < t * 0.50) return 88;
  if (stddev < t * 0.75) return 74;
  if (stddev < t)        return 60;
  if (stddev < t * 1.50) return 46;
  return 30;
}

function buildFeedback(pitchScore, rhythmScore) {
  const p =
    pitchScore >= 88 ? 'Excellent pitch accuracy — your ear is very precise!' :
    pitchScore >= 72 ? 'Good pitch! Keep focusing on centring your notes cleanly.' :
    pitchScore >= 55 ? 'Your pitch is developing. Try humming slowly against a drone.' :
    'Focus on matching the target note. Practice with a tanpura drone in the background.';
  const r =
    rhythmScore >= 88 ? 'Your timing is rock-steady — great rhythm sense!' :
    rhythmScore >= 72 ? 'Good rhythm. Try counting aloud while you sing or clap.' :
    rhythmScore >= 55 ? 'Timing is improving — practice with a metronome at a slow tempo.' :
    'Focus on keeping a steady beat. Clap to a metronome before singing.';
  return `${p} ${r}`;
}

export default function SangeetSession({ user }) {
  const navigate       = useNavigate();
  const [sp]           = useSearchParams();
  const grade          = sp.get('grade') || 'G1';
  const stageInfo      = STAGE_MAP[grade]     || STAGE_MAP.G1;
  const tolerance      = TOLERANCE[grade]     || TOLERANCE.G1;
  const weights        = GRADE_WEIGHTS[grade] || GRADE_WEIGHTS.G1;
  const prompts        = PROMPTS[grade]       || PROMPTS.G1;

  const [promptIdx,  setPromptIdx]  = useState(0);
  const [phase,      setPhase]      = useState('idle');
  const [countdown,  setCountdown]  = useState(3);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [currentNote,setCurrentNote]= useState(null);
  const [score,      setScore]      = useState(null);

  const timerRef      = useRef(null);
  const onsetTimesRef = useRef([]);
  const lastHzRef     = useRef(null);
  // Store pitch deviations directly in the parent — avoids cross-ref timing issues
  const pitchDevsRef  = useRef([]);

  const prompt      = prompts[promptIdx];
  const totalPrompts= prompts.length;
  const C           = stageInfo.color;
  const gradeNum    = parseInt(grade.replace('G', ''), 10);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Reset pitch data when a new session starts ─────────────────────────────
  function resetRecordingData() {
    pitchDevsRef.current  = [];
    onsetTimesRef.current = [];
    lastHzRef.current     = null;
  }

  // ── Countdown → record ─────────────────────────────────────────────────────
  function startSession() {
    resetRecordingData();
    setPhase('counting');
    setCountdown(3);
    setCurrentNote(null);
    setScore(null);

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
    const dur = prompt.duration || 10;
    setPhase('recording');
    setTimeLeft(dur);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Defer slightly so state flush completes before phase change
          setTimeout(finishRecording, 80);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ── Real-time pitch events (collected in parent ref) ───────────────────────
  const handlePitchDetected = useCallback((info) => {
    setCurrentNote(info);
    pitchDevsRef.current.push(Math.abs(info.cents));
    // Onset tracking — note changes > 20 Hz = new onset
    if (lastHzRef.current === null || Math.abs(info.hz - lastHzRef.current) > 20) {
      onsetTimesRef.current.push(Date.now());
      lastHzRef.current = info.hz;
    }
  }, []);

  // ── Score and submit ───────────────────────────────────────────────────────
  async function finishRecording() {
    setPhase('processing'); // show the processing screen immediately

    const deviations  = [...pitchDevsRef.current];
    const onsets      = [...onsetTimesRef.current];
    const pitchScore  = computePitchScore(deviations, tolerance);
    const rhythmScore = computeRhythmScore(onsets, tolerance);

    const pitchData = deviations.length > 0 ? {
      avgDeviation: deviations.reduce((a, b) => a + b, 0) / deviations.length,
      maxDeviation: Math.max(...deviations),
      smoothness:   Math.round((deviations.filter(d => d <= 25).length / deviations.length) * 100),
      notesSung:    deviations.length,
    } : null;

    // Guarantee at least 1.5 s of "processing" screen so user can see it
    const [serverResult] = await Promise.all([
      submitScore(pitchScore, rhythmScore, pitchData),
      new Promise(r => setTimeout(r, 1500)),
    ]);

    setScore(serverResult);
    setPhase('results');
  }

  async function submitScore(pitchScore, rhythmScore, pitchData) {
    try {
      const studentId = user?.studentId || user?.id || 'anonymous';
      const resp = await fetch(`${API_BASE}/api/sangeet/score`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          grade,
          taskType:   prompt.type,
          prompt:     prompt.task,
          pitchScore,
          rhythmScore,
          pitchData,
          raga:       prompt.raga || null,
        }),
      });
      if (!resp.ok) throw new Error('Server error');
      return await resp.json();
    } catch {
      // Graceful offline fallback
      const needsExpr = gradeNum >= 7 && weights.expression > 0;
      const exprScore = needsExpr ? Math.round((pitchScore + rhythmScore) / 2) : null;
      const overall   = needsExpr
        ? Math.round(pitchScore * weights.pitch + rhythmScore * weights.rhythm + (exprScore ?? 0) * weights.expression)
        : Math.round(pitchScore * weights.pitch + rhythmScore * weights.rhythm);
      return {
        pitchScore, rhythmScore,
        expressionScore: exprScore,
        overallScore: Math.max(0, Math.min(100, overall)),
        feedback: buildFeedback(pitchScore, rhythmScore),
        passed: overall >= PASS_THRESHOLD,
        grade,
      };
    }
  }

  function nextPrompt() {
    setPromptIdx(i => (i + 1) % totalPrompts);
    setPhase('idle');
    setScore(null);
    setCurrentNote(null);
  }

  function retry() {
    setPhase('idle');
    setScore(null);
    setCurrentNote(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'Inter, sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/sangeet')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontFamily: 'inherit' }}>
          <ChevronLeft size={16} /> Back to Sangeet
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', color: C, background: `${C}18`, border: `1px solid ${C}30`, borderRadius: 99, padding: '0.25rem 0.7rem', textTransform: 'uppercase' }}>
            Stage {stageInfo.stage} · {stageInfo.name}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.25rem 0.6rem' }}>{grade}</div>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#475569' }}>{promptIdx + 1} / {totalPrompts}</div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', maxWidth: 680, margin: '0 auto', width: '100%' }}>

        {/* Prompt card */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C}30`, borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.6rem', color: C, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {prompt.type.replace(/_/g, ' ')}
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.75rem', lineHeight: 1.35 }}>{prompt.task}</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.65 }}>{prompt.instruction}</p>
          {prompt.raga && <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: C, fontWeight: 700 }}>🎵 Raga: {prompt.raga}</div>}
        </div>

        {/* ── Idle ── */}
        {phase === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.25rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pitch tolerance</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1' }}>±{tolerance.pitchCents}¢</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Duration</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1' }}>{prompt.duration}s</div>
              </div>
              {gradeNum >= 7 && (
                <>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expression</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: C }}>AI Scored</div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={startSession}
              style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C}, ${C}cc)`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 32px ${C}50`, transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Mic size={32} color="#fff" />
            </button>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Tap to begin</div>
          </div>
        )}

        {/* ── Countdown ── */}
        {phase === 'counting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', fontWeight: 900, color: C, lineHeight: 1, animation: 'scalePop 0.3s ease' }}>{countdown}</div>
            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>Get ready…</div>
          </div>
        )}

        {/* ── Recording ── */}
        {phase === 'recording' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {/* Pitch visualizer */}
            <div style={{ width: '100%' }}>
              <PitchVisualizer isRecording color={C} onPitchDetected={handlePitchDetected} />
              {currentNote && (
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: C }}>{currentNote.sargam}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    {currentNote.cents >= 0 ? '+' : ''}{currentNote.cents}¢ · {currentNote.hz.toFixed(0)} Hz
                  </span>
                </div>
              )}
            </div>

            {/* Timer ring */}
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <svg width={72} height={72} viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }} shapeRendering="geometricPrecision">
                <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
                <circle cx={36} cy={36} r={30} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 30 * (timeLeft / (prompt.duration || 10))} ${2 * Math.PI * 30}`}
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, color: C }}>{timeLeft}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C, fontSize: '0.85rem', fontWeight: 700 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C, animation: 'blink 1.2s ease-in-out infinite' }} />
              Recording
            </div>
          </div>
        )}

        {/* ── Processing ── */}
        {phase === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 1rem' }}>
              <svg width={64} height={64} viewBox="0 0 64 64" style={{ animation: 'spin 1.2s linear infinite' }} shapeRendering="geometricPrecision">
                <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
                <circle cx={32} cy={32} r={26} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round"
                  strokeDasharray="55 109" />
              </svg>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>Analysing your performance…</div>
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              {gradeNum >= 7 ? 'Scoring pitch, rhythm & AI expression…' : 'Scoring pitch & rhythm…'}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {phase === 'results' && score && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
            {/* Overall */}
            <div style={{
              background: score.passed ? `linear-gradient(135deg, ${C}12, ${C}06)` : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))',
              border: `1px solid ${score.passed ? C + '40' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 16, padding: '1.75rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3.75rem', fontWeight: 900, color: score.passed ? C : '#ef4444', lineHeight: 1, marginBottom: '0.25rem' }}>
                {score.overallScore}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Overall Score</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                {score.passed
                  ? <><CheckCircle size={15} color={C} /><span style={{ color: C, fontSize: '0.85rem', fontWeight: 700 }}>Passed ✓</span></>
                  : <><XCircle size={15} color="#ef4444" /><span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>Keep Practising</span></>}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: score.expressionScore !== null ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Pitch',      value: score.pitchScore,      color: '#3b82f6', pct: `${Math.round(weights.pitch * 100)}%` },
                { label: 'Rhythm',     value: score.rhythmScore,     color: '#f59e0b', pct: `${Math.round(weights.rhythm * 100)}%` },
                ...(score.expressionScore !== null
                  ? [{ label: 'Expression', value: score.expressionScore, color: C, pct: `${Math.round(weights.expression * 100)}%` }]
                  : []),
              ].map(({ label, value, color, pct }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color }}>{value ?? '—'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>{label}</div>
                  <div style={{ fontSize: '0.6rem', color: '#334155', marginTop: '0.1rem' }}>weight {pct}</div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginTop: '0.65rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${value ?? 0}%`, background: color, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                {gradeNum >= 7 ? '🤖 AI Feedback' : '📝 Feedback'}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.65 }}>{score.feedback}</p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={retry} style={{ flex: 1, padding: '0.85rem', borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <RotateCcw size={14} /> Try Again
              </button>
              <button onClick={nextPrompt} style={{ flex: 2, padding: '0.85rem', borderRadius: 10, cursor: 'pointer', background: `linear-gradient(135deg, ${C}, ${C}cc)`, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: `0 4px 20px ${C}40` }}>
                Next Task <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scalePop { from{transform:scale(1.4);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
