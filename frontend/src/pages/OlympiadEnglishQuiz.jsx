import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

const FONT = "'Plus Jakarta Sans', 'Google Sans', system-ui, sans-serif";

const GRADE_NUM = {
  'Grade 5': 5, 'Grade 6': 6, 'Grade 7': 7, 'Grade 8': 8,
  'Grade 9': 9, 'Grade 10': 10, 'Grade 11': 11, 'Grade 12': 12,
};

export default function OlympiadEnglishQuiz({ user, onClose }) {
  const [phase, setPhase] = useState('loading');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(true);

  const gradeNum = GRADE_NUM[user?.classLevel] || GRADE_NUM[user?.grade];

  useEffect(() => {
    if (!gradeNum) {
      setError('Your grade is not set. Please complete your profile first.');
      setPhase('blocked');
      return;
    }
    fetch(`${API_BASE}/api/olympiad/quiz/status/english/${gradeNum}?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.attempted) {
          setResult(data.result);
          setPhase('result');
        } else {
          return fetch(`${API_BASE}/api/olympiad/quiz/english/${gradeNum}`)
            .then(r => r.json())
            .then(q => { setQuiz(q); setPhase('quiz'); });
        }
      })
      .catch(e => { setError(e.message); setPhase('blocked'); });
  }, [gradeNum, user.email]);

  const handleSelect = (letter) => setAnswers(prev => ({ ...prev, [current]: letter }));

  const goNext = () => { setAnimate(false); setTimeout(() => { setCurrent(c => c + 1); setAnimate(true); }, 200); };
  const goPrev = () => { setAnimate(false); setTimeout(() => { setCurrent(c => c - 1); setAnimate(true); }, 200); };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((_, i) => answers[i] === undefined).length;
    if (unanswered > 0 && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, subject: 'English', grade: gradeNum, answers }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setPhase('result');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT };
  const card = { background: 'linear-gradient(145deg, #0d0d1f 0%, #1a0808 100%)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.08)', position: 'relative' };

  if (phase === 'loading') return (
    <div style={overlay}>
      <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #ef4444', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontFamily: FONT }}>Loading quiz...</p>
      </div>
    </div>
  );

  if (phase === 'blocked') return (
    <div style={overlay}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontFamily: FONT }}>Cannot Load Quiz</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontFamily: FONT }}>{error}</p>
        <button onClick={onClose} style={{ padding: '0.75rem 2rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontFamily: FONT }}>Close</button>
      </div>
    </div>
  );

  if (phase === 'result') {
    const score = result?.score ?? result?.result?.score;
    const total = result?.total ?? result?.result?.total;
    const quizName = result?.quiz_name ?? result?.result?.quiz_name ?? `English Practice – Grade ${gradeNum}`;
    const attemptedAt = result?.attempted_at ?? result?.result?.attempted_at;
    const finalPct = total ? parseFloat(((score / total) * 100).toFixed(1)) : 0;
    const finalColor = finalPct >= 80 ? '#10b981' : finalPct >= 50 ? '#f59e0b' : '#ef4444';
    const breakdown = result?.breakdown || [];
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem', fontFamily: FONT }}>Quiz Complete</div>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: FONT }}>{quizName}</h2>
              {attemptedAt && <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.2rem', fontFamily: FONT }}>{new Date(attemptedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>}
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: FONT }}>✕ Close</button>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', border: `6px solid ${finalColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', background: `${finalColor}12`, boxShadow: `0 0 50px ${finalColor}30` }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: finalColor, lineHeight: 1, fontFamily: FONT }}>{score}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: FONT }}>out of {total}</div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: finalColor, fontFamily: FONT }}>{finalPct}%</div>
            <div style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: '0.3rem', fontFamily: FONT }}>{finalPct >= 80 ? '🏆 Excellent!' : finalPct >= 50 ? '👍 Good effort!' : '📚 Keep practicing!'}</div>
          </div>
          {breakdown.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem', fontFamily: FONT }}>Answer Review</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: 260, overflowY: 'auto' }}>
                {breakdown.map((b, i) => (
                  <div key={i} style={{ background: b.isCorrect ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${b.isCorrect ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}`, borderRadius: 10, padding: '0.6rem 0.9rem', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ color: b.isCorrect ? '#10b981' : '#ef4444', fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>{b.isCorrect ? '✓' : '✗'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45, fontFamily: FONT }}>Q{i + 1}: {b.question}</div>
                      {!b.isCorrect && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', fontFamily: FONT }}>Your: <span style={{ color: '#ef4444' }}>{b.selected || '—'}</span> · Correct: <span style={{ color: '#10b981' }}>{b.correct}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button onClick={onClose} style={{ padding: '0.85rem 2.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', fontFamily: FONT }}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ phase
  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const progress = (current / total) * 100;
  const answered = Object.keys(answers).length;

  return (
    <div style={overlay}>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } } .qopt:hover { border-color: rgba(239,68,68,0.45) !important; background: rgba(239,68,68,0.07) !important; }`}</style>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: FONT }}>ThinkQuest Olympiad · English</div>
            <h2 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: '0.1rem 0 0', fontFamily: FONT }}>{quiz.quiz_name}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: FONT }}>{answered}/{total} answered</div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '0.38rem 0.7rem', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT }}>✕</button>
          </div>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '1.25rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#ef4444,#f87171)', borderRadius: 99, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {quiz.questions.map((_, i) => (
            <button key={i} onClick={() => { setAnimate(false); setTimeout(() => { setCurrent(i); setAnimate(true); }, 150); }}
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.15s', fontFamily: FONT,
                background: i === current ? '#ef4444' : answers[i] ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.05)',
                color: i === current ? '#fff' : answers[i] ? '#10b981' : '#64748b',
              }}
            >{i + 1}</button>
          ))}
        </div>
        <div style={{ animation: animate ? 'slideIn 0.22s ease' : 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.2rem 1.4rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem', fontFamily: FONT }}>Question {current + 1} of {total}</div>
            <p style={{ color: '#f1f5f9', fontSize: '0.98rem', fontWeight: 600, lineHeight: 1.65, margin: 0, fontFamily: FONT }}>{q.question}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {q.options.map(opt => {
              const sel = answers[current] === opt.letter;
              return (
                <button key={opt.letter} className="qopt" onClick={() => handleSelect(opt.letter)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.85rem 1.05rem', background: sel ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${sel ? '#ef4444' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? '#ef4444' : 'rgba(255,255,255,0.05)', color: sel ? '#fff' : '#64748b', fontWeight: 800, fontSize: '0.82rem', transition: 'all 0.15s', fontFamily: FONT }}>{opt.letter}</div>
                  <span style={{ color: sel ? '#fff' : '#cbd5e1', fontSize: '0.9rem', fontWeight: sel ? 600 : 400, lineHeight: 1.5, fontFamily: FONT }}>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.4rem' }}>
          <button onClick={goPrev} disabled={current === 0} style={{ padding: '0.65rem 1.3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: current === 0 ? '#334155' : '#94a3b8', borderRadius: 12, cursor: current === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.86rem', fontFamily: FONT }}>← Prev</button>
          {current < total - 1
            ? <button onClick={goNext} style={{ padding: '0.65rem 1.5rem', background: answers[current] ? '#ef4444' : 'rgba(239,68,68,0.25)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem', fontFamily: FONT }}>Next →</button>
            : <button onClick={handleSubmit} disabled={submitting} style={{ padding: '0.65rem 1.75rem', background: submitting ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', borderRadius: 12, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 4px 18px rgba(239,68,68,0.3)', fontFamily: FONT }}>{submitting ? 'Submitting...' : '🏁 Submit Quiz'}</button>
          }
        </div>
      </div>
    </div>
  );
}
