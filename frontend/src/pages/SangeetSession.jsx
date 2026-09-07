import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import PitchVisualizer from '../components/PitchVisualizer';
import { PROMPTS, STAGE_MAP } from '../data/sangeet_prompts';
import { API_BASE } from '../api';

const PASS_THRESHOLD = 60;

export default function SangeetSession({ user }) {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const grade = sp.get('grade') || 'G1';
  const stageInfo = STAGE_MAP[grade] || STAGE_MAP.G1;
  const prompts = PROMPTS[grade] || PROMPTS.G1;

  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentNote, setCurrentNote] = useState(null);
  const [score, setScore] = useState(null);

  const timerRef = useRef(null);
  const onsetTimesRef = useRef([]);
  const lastHzRef = useRef(null);
  const pitchReadingsRef = useRef([]);
  const pitchDevsRef = useRef([]);

  const prompt = prompts[promptIdx];
  const totalPrompts = prompts.length;
  const C = stageInfo.color;
  const gradeNum = parseInt(grade.replace('G', ''), 10);

  function resetRecordingData() {
    pitchDevsRef.current = [];
    pitchReadingsRef.current = [];
    onsetTimesRef.current = [];
    lastHzRef.current = null;
  }

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
      if (count <= 0) { clearInterval(timerRef.current); beginRecording(); }
    }, 1000);
  }

  function beginRecording() {
    const dur = prompt.duration || 10;
    setPhase('recording');
    setTimeLeft(dur);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setTimeout(finishRecording, 80); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const handlePitchDetected = useCallback((info) => {
    setCurrentNote(info);
    pitchReadingsRef.current.push({ hz: Math.round(info.hz), sargam: info.sargam, cents: info.cents });
    pitchDevsRef.current.push(Math.abs(info.cents));
    if (lastHzRef.current === null || Math.abs(info.hz - lastHzRef.current) > 20) {
      onsetTimesRef.current.push(Date.now());
      lastHzRef.current = info.hz;
    }
  }, []);

  async function finishRecording() {
    setPhase('processing');
    const pitchReadings = [...pitchReadingsRef.current];
    const onsetCount = onsetTimesRef.current.length;
    const [serverResult] = await Promise.all([
      submitScore(pitchReadings, onsetCount),
      new Promise(r => setTimeout(r, 2000)),
    ]);
    setScore(serverResult);
    setPhase('results');
  }

  async function submitScore(pitchReadings, onsetCount) {
    try {
      const studentId = user?.studentId || user?.id || 'anonymous';
      const resp = await fetch(`${API_BASE}/api/sangeet/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, grade, taskType: prompt.type, prompt: prompt.task, pitchReadings, onsetCount, raga: prompt.raga || null }),
      });
      if (!resp.ok) throw new Error('Server error');
      return await resp.json();
    } catch {
      return { pitchScore: 0, rhythmScore: 0, expressionScore: 0, overallScore: 0, feedback: 'Could not reach the scoring server. Please check your connection and try again.', passed: false, grade };
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

  const duration = prompt.duration || 10;
  const progress = phase === 'recording' ? timeLeft / duration : 1;
  const r = 52;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ minHeight: '100vh', background: '#04060d', fontFamily: "'Inter', sans-serif", color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Animated background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${C}18 0%, transparent 70%)`, top: '-15%', left: '-10%', animation: 'drift1 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C}10 0%, transparent 70%)`, bottom: '-10%', right: '-5%', animation: 'drift2 16s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(0px)', background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 60%)' }} />
      </div>

      {/* ── Top nav ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/sangeet')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontFamily: 'inherit', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
          <ChevronLeft size={15} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.3rem 0.8rem', borderRadius: 99, background: `${C}18`, border: `1px solid ${C}30`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: C, textTransform: 'uppercase' }}>
            Stage {stageInfo.stage} · {stageInfo.name}
          </div>
          <div style={{ padding: '0.3rem 0.65rem', borderRadius: 8, background: 'rgba(255,255,255,0.07)', fontSize: '0.75rem', fontWeight: 800, color: '#e2e8f0' }}>{grade}</div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {prompts.map((_, i) => (
            <div key={i} style={{ width: i === promptIdx ? 18 : 6, height: 6, borderRadius: 99, background: i === promptIdx ? C : i < promptIdx ? `${C}60` : 'rgba(255,255,255,0.12)', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }} />
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', gap: '1.5rem', maxWidth: 640, margin: '0 auto', width: '100%' }}>

        {/* Task card */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '1.75rem', boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.4)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.15em', color: C, textTransform: 'uppercase', background: `${C}15`, padding: '0.2rem 0.55rem', borderRadius: 99 }}>
              {prompt.type.replace(/_/g, ' ')}
            </span>
            {prompt.raga && (
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#64748b' }}>🎵 {prompt.raga}</span>
            )}
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.6rem', lineHeight: 1.3, letterSpacing: '-0.02em' }}>{prompt.task}</h2>
          <p style={{ fontSize: '0.83rem', color: '#64748b', margin: 0, lineHeight: 1.7 }}>{prompt.instruction}</p>
        </div>

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[['Pitch tolerance', `±${STAGE_MAP[grade]?.name === 'LISTEN' ? 50 : gradeNum <= 6 ? 35 : gradeNum <= 9 ? 25 : 15}¢`], ['Duration', `${prompt.duration}s`], ...(gradeNum >= 7 ? [['Expression', 'AI']] : [])].map(([label, value]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: label === 'Expression' ? C : '#94a3b8' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Big mic button with rings */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: `1px solid ${C}20`, animation: 'ring1 2.5s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', width: 105, height: 105, borderRadius: '50%', border: `1px solid ${C}30`, animation: 'ring2 2.5s ease-in-out infinite 0.4s' }} />
              <button onClick={startSession} style={{ position: 'relative', width: 82, height: 82, borderRadius: '50%', background: `linear-gradient(145deg, ${C}, ${C}bb)`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${C}50, 0 8px 32px rgba(0,0,0,0.4)`, transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 60px ${C}70, 0 12px 40px rgba(0,0,0,0.5)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 40px ${C}50, 0 8px 32px rgba(0,0,0,0.4)`; }}>
                <Mic size={30} color="#fff" strokeWidth={2} />
              </button>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#334155', letterSpacing: '0.05em' }}>Tap the mic to begin</div>
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {phase === 'counting' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', animation: 'fadeIn 0.3s ease both' }}>
            <div key={countdown} style={{ fontSize: '7rem', fontWeight: 900, color: C, lineHeight: 1, letterSpacing: '-0.05em', textShadow: `0 0 60px ${C}60`, animation: 'countPop 0.9s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              {countdown}
            </div>
            <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>Get ready to sing…</div>
          </div>
        )}

        {/* ── RECORDING ── */}
        {phase === 'recording' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', animation: 'fadeIn 0.4s ease both' }}>
            {/* Waveform card */}
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${C}25`, borderRadius: 16, padding: '1rem', boxShadow: `0 0 30px ${C}10` }}>
              <PitchVisualizer isRecording color={C} onPitchDetected={handlePitchDetected} />
            </div>

            {/* Current note — big display */}
            <div style={{ textAlign: 'center', minHeight: 52 }}>
              {currentNote ? (
                <div style={{ animation: 'noteIn 0.15s ease both' }} key={currentNote.sargam}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: C, lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 30px ${C}50` }}>{currentNote.sargam}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>
                    {currentNote.cents >= 0 ? '+' : ''}{currentNote.cents}¢ · {currentNote.hz.toFixed(0)} Hz
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>Listening…</div>
              )}
            </div>

            {/* Circular countdown */}
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width={110} height={110} viewBox="0 0 110 110" shapeRendering="geometricPrecision">
                {/* Track */}
                <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
                {/* Progress */}
                <circle cx={55} cy={55} r={r} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round"
                  strokeDasharray={`${circ * progress} ${circ}`}
                  transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dasharray 1s linear', filter: `drop-shadow(0 0 6px ${C})` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C, lineHeight: 1 }}>{timeLeft}</div>
                <div style={{ fontSize: '0.55rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>sec left</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C, boxShadow: `0 0 8px ${C}`, animation: 'blink 1.4s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C, letterSpacing: '0.06em' }}>RECORDING</span>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1rem 0', animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <svg width={80} height={80} viewBox="0 0 80 80" shapeRendering="geometricPrecision">
                <circle cx={40} cy={40} r={33} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                <circle cx={40} cy={40} r={33} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round"
                  strokeDasharray="60 148" style={{ animation: 'spin 1.1s linear infinite', transformOrigin: 'center', filter: `drop-shadow(0 0 6px ${C})` }} />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', textAlign: 'center', marginBottom: '0.3rem' }}>Analysing your performance</div>
              <div style={{ fontSize: '0.78rem', color: '#334155', textAlign: 'center' }}>
                {gradeNum >= 7 ? 'Claude is scoring pitch, rhythm & expression…' : 'Claude is evaluating your singing…'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C, opacity: 0.7, animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && score && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            {/* Big score */}
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${score.passed ? C + '35' : 'rgba(239,68,68,0.25)'}`, borderRadius: 20, padding: '2rem', textAlign: 'center', boxShadow: `0 0 60px ${score.passed ? C + '15' : 'rgba(239,68,68,0.08)'}` }}>
              <div style={{ fontSize: '0.6rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Overall Score</div>
              <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: score.passed ? C : '#ef4444', letterSpacing: '-0.04em', textShadow: `0 0 40px ${score.passed ? C + '50' : 'rgba(239,68,68,0.4)'}` }}>
                {score.overallScore}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#334155', marginBottom: '0.75rem' }}>out of 100</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', borderRadius: 99, background: score.passed ? `${C}18` : 'rgba(239,68,68,0.1)', border: `1px solid ${score.passed ? C + '35' : 'rgba(239,68,68,0.2)'}` }}>
                {score.passed
                  ? <><CheckCircle size={13} color={C} /><span style={{ color: C, fontSize: '0.78rem', fontWeight: 700 }}>Passed</span></>
                  : <><XCircle size={13} color="#ef4444" /><span style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>Keep Practising</span></>}
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: score.expressionScore !== null ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.65rem' }}>
              {[
                { label: 'Pitch', value: score.pitchScore, color: '#60a5fa' },
                { label: 'Rhythm', value: score.rhythmScore, color: '#fbbf24' },
                ...(score.expressionScore !== null ? [{ label: 'Expression', value: score.expressionScore, color: C }] : []),
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem 0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{label}</div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '0.6rem' }}>{value ?? '—'}</div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${value ?? 0}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1) 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: '0.58rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                {gradeNum >= 7 ? '🤖 Claude AI Feedback' : '🎵 AI Feedback'}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.75 }}>{score.feedback}</p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={retry} style={{ flex: 1, padding: '0.9rem', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.09)', color: '#64748b', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b'; }}>
                <RotateCcw size={14} /> Try Again
              </button>
              <button onClick={nextPrompt} style={{ flex: 2, padding: '0.9rem', borderRadius: 12, cursor: 'pointer', background: `linear-gradient(135deg, ${C}ee, ${C}aa)`, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: `0 4px 24px ${C}40`, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${C}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px ${C}40`; }}>
                Next Task <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.05)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.08)} }
        @keyframes ring1  { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.08);opacity:0.15} }
        @keyframes ring2  { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.06);opacity:0.1} }
        @keyframes countPop { from{transform:scale(1.6);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes noteIn  { from{transform:translateY(4px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dot     { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
      `}</style>
    </div>
  );
}
