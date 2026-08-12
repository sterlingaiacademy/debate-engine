import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

const FONT = "'Inter', 'Google Sans', system-ui, sans-serif";

const SUBJECT_KEY = { English: 'english', Mathematics: 'mathematics', Science: 'science', 'Social Sciences': 'social_science', 'CT & AI': 'ct_ai' };
const GRADE_NUM = { 'Grade 5': 5, 'Grade 6': 6, 'Grade 7': 7, 'Grade 8': 8, 'Grade 9': 9, 'Grade 10': 10, 'Grade 11': 11, 'Grade 12': 12 };
const SUBJECT_COLORS = {
  English: { grad: 'linear-gradient(135deg,#ff6b6b,#ee0979)', light: '#ff6b6b', shadow: 'rgba(238,9,121,0.3)', bg: 'rgba(238,9,121,0.08)' },
  Mathematics: { grad: 'linear-gradient(135deg,#4facfe,#00f2fe)', light: '#4facfe', shadow: 'rgba(79,172,254,0.3)', bg: 'rgba(79,172,254,0.08)' },
  Science: { grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', light: '#43e97b', shadow: 'rgba(67,233,123,0.3)', bg: 'rgba(67,233,123,0.08)' },
  'Social Sciences': { grad: 'linear-gradient(135deg,#f7971e,#ffd200)', light: '#f7971e', shadow: 'rgba(247,151,30,0.3)', bg: 'rgba(247,151,30,0.08)' },
  'CT & AI': { grad: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', light: '#a18cd1', shadow: 'rgba(161,140,209,0.3)', bg: 'rgba(161,140,209,0.08)' },
};

export default function OlympiadEnglishQuiz({ user, subject = 'English', onClose }) {
  const [phase, setPhase] = useState('loading');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(true);

  const gradeNum = GRADE_NUM[user?.classLevel] || GRADE_NUM[user?.grade];
  const subjectKey = SUBJECT_KEY[subject] || 'english';
  const C = SUBJECT_COLORS[subject] || SUBJECT_COLORS.English;

  useEffect(() => {
    if (!gradeNum) { setError('Grade not set. Please update your profile.'); setPhase('blocked'); return; }
    fetch(`${API_BASE}/api/olympiad/quiz/status/${subjectKey}/${gradeNum}?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.attempted) { setResult(data.result); setPhase('result'); }
        else return fetch(`${API_BASE}/api/olympiad/quiz/${subjectKey}/${gradeNum}`).then(r => r.json()).then(q => { setQuiz(q); setPhase('quiz'); });
      })
      .catch(e => { setError(e.message); setPhase('blocked'); });
  }, [gradeNum, user.email, subjectKey]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setAnswers(prev => ({ ...prev, [current]: letter }));
    setRevealed(prev => ({ ...prev, [current]: true }));
  };

  const goNext = () => { setAnimate(false); setTimeout(() => { setCurrent(c => c + 1); setAnimate(true); }, 180); };
  const goPrev = () => { setAnimate(false); setTimeout(() => { setCurrent(c => c - 1); setAnimate(true); }, 180); };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((_, i) => answers[i] === undefined).length;
    if (unanswered > 0 && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/quiz/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, subject: subjectKey, grade: gradeNum, answers }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data); setPhase('result');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.92)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT, padding: '1rem' };

  // LOADING
  if (phase === 'loading') return (
    <div style={overlay}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid transparent`, borderTopColor: C.light, animation: 'qs 0.8s linear infinite', margin: '0 auto 1.25rem', background: C.bg }} />
        <style>{`@keyframes qs{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>Loading {subject} Quiz...</p>
      </div>
    </div>
  );

  // BLOCKED
  if (phase === 'blocked') return (
    <div style={overlay}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '3rem', textAlign: 'center', maxWidth: 420, width: '100%', backdropFilter: 'blur(20px)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 800, margin: '0 0 0.5rem' }}>Cannot Load Quiz</h2>
        <p style={{ color: '#64748b', margin: '0 0 2rem', lineHeight: 1.6 }}>{error}</p>
        <button onClick={onClose} style={{ padding: '0.8rem 2.5rem', background: C.grad, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: `0 8px 24px ${C.shadow}` }}>Close</button>
      </div>
    </div>
  );

  // RESULT
  if (phase === 'result') {
    const score = result?.score ?? result?.result?.score;
    const total = result?.total ?? result?.result?.total;
    const quizName = result?.quiz_name ?? result?.result?.quiz_name ?? `${subject} Practice`;
    const attemptedAt = result?.attempted_at ?? result?.result?.attempted_at;
    const pct = total ? parseFloat(((score / total) * 100).toFixed(1)) : 0;
    const pctColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    const breakdown = result?.breakdown || [];
    return (
      <div style={overlay}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '2rem', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', animation: 'fadeUp 0.3s ease', backdropFilter: 'blur(30px)' }}>
          {/* Top bar */}
          <div style={{ height: 3, background: C.grad, borderRadius: 99, marginBottom: '1.75rem' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: C.light, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Quiz Complete</div>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>{quizName}</h2>
              {attemptedAt && <div style={{ fontSize: '0.73rem', color: '#475569' }}>{new Date(attemptedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>}
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: 12, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; }}>
              ✕ Close
            </button>
          </div>

          {/* Score circle */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1.25rem' }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', border: `5px solid rgba(255,255,255,0.05)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, ${pctColor}10 0%, transparent 70%)`, boxShadow: `0 0 60px ${pctColor}30, inset 0 0 40px ${pctColor}08` }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `5px solid ${pctColor}`, clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)` }} />
                <div style={{ fontSize: '3rem', fontWeight: 900, color: pctColor, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>of {total}</div>
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: pctColor, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{pct}%</div>
            <div style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 600 }}>{pct >= 80 ? '🏆 Excellent Performance!' : pct >= 50 ? '👍 Good Effort!' : '📚 Keep Practicing!'}</div>
          </div>

          {breakdown.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Answer Review</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto', paddingRight: '0.25rem' }}>
                {breakdown.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.7rem 1rem', background: b.isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${b.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`, borderRadius: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: b.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 900, color: b.isCorrect ? '#10b981' : '#ef4444' }}>{b.isCorrect ? 'OK' : 'X'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>Q{i+1}: {b.question}</div>
                      {!b.isCorrect && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.15rem' }}>Your: <span style={{ color: '#f87171' }}>{b.selected || '—'}</span>  ·  Correct: <span style={{ color: '#34d399', fontWeight: 700 }}>{b.correct}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button onClick={onClose} style={{ padding: '0.9rem 3rem', background: C.grad, color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', boxShadow: `0 8px 32px ${C.shadow}`, transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ PHASE
  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const isRevealed = !!revealed[current];
  const selectedLetter = answers[current];
  const correctLetter = q.correct;
  const isCorrect = selectedLetter === correctLetter;

  const optStyle = (letter) => {
    if (!isRevealed) return {
      background: selectedLetter === letter ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)',
      border: `1.5px solid ${selectedLetter === letter ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
      color: '#e2e8f0',
    };
    if (letter === correctLetter) return { background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.4)', color: '#6ee7b7' };
    if (letter === selectedLetter) return { background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)', color: '#fca5a5' };
    return { background: 'rgba(255,255,255,0.015)', border: '1.5px solid rgba(255,255,255,0.03)', color: '#334155', opacity: 0.5 };
  };

  const badgeStyle = (letter) => {
    if (!isRevealed) return { background: selectedLetter === letter ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', color: selectedLetter === letter ? '#fff' : '#475569' };
    if (letter === correctLetter) return { background: '#10b981', color: '#fff' };
    if (letter === selectedLetter) return { background: '#ef4444', color: '#fff' };
    return { background: 'rgba(255,255,255,0.03)', color: '#334155' };
  };

  return (
    <div style={overlay}>
      <style>{`
        @keyframes qSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes qs{to{transform:rotate(360deg)}}
        @keyframes revealPop{0%{opacity:0;transform:scale(0.95) translateY(6px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        .qHover:hover{background:rgba(255,255,255,0.05)!important;border-color:rgba(255,255,255,0.12)!important;}
      `}</style>
      <div style={{ background: 'rgba(10,10,20,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: '0', width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 120px rgba(0,0,0,0.7)', backdropFilter: 'blur(30px)', position: 'relative', overflow: 'hidden' }}>
        {/* Color accent top bar */}
        <div style={{ height: 3, background: C.grad }} />

        <div style={{ padding: '1.75rem 2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.light, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>ThinkQuest Olympiad · {subject}</div>
              <h2 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{quiz.quiz_name}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.8rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.06)' }}>
                {answered}/{total} done
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', borderRadius: 10, padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                ✕
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: '0.7rem', color: C.light, fontWeight: 700 }}>{Math.round(((current+1)/total)*100)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((current+1)/total)*100}%`, background: C.grad, borderRadius: 99, transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>

          {/* Question number dots */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {quiz.questions.map((qItem, i) => {
              const isCur = i === current;
              const isAns = answers[i] !== undefined;
              const isOK = isAns && revealed[i] && answers[i] === quiz.questions[i].correct;
              const isBAD = isAns && revealed[i] && answers[i] !== quiz.questions[i].correct;
              return (
                <button key={i}
                  onClick={() => { setAnimate(false); setTimeout(() => { setCurrent(i); setAnimate(true); }, 150); }}
                  style={{ width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, fontFamily: FONT, transition: 'all 0.15s',
                    background: isCur ? C.light : isOK ? 'rgba(16,185,129,0.2)' : isBAD ? 'rgba(239,68,68,0.2)' : isAns ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    color: isCur ? '#fff' : isOK ? '#34d399' : isBAD ? '#f87171' : isAns ? '#94a3b8' : '#334155',
                    border: isCur ? `1.5px solid ${C.light}` : '1.5px solid transparent',
                    boxShadow: isCur ? `0 0 12px ${C.shadow}` : 'none',
                  }}
                >{i + 1}</button>
              );
            })}
          </div>

          {/* Question area */}
          <div style={{ animation: animate ? 'qSlide 0.2s ease' : 'none' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.25rem 1.5rem', marginBottom: '1.1rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: C.grad, borderRadius: '99px 0 0 99px' }} />
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: C.light, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Question {current + 1} of {total}</div>
              <p style={{ color: '#e2e8f0', fontSize: '0.97rem', fontWeight: 600, lineHeight: 1.7, margin: 0 }}>{q.question}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map(opt => {
                const os = optStyle(opt.letter);
                const bs = badgeStyle(opt.letter);
                const locked = isRevealed;
                return (
                  <button key={opt.letter}
                    className={!locked ? 'qHover' : ''}
                    onClick={() => handleSelect(opt.letter)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', borderRadius: 14, textAlign: 'left', width: '100%', cursor: locked ? 'default' : 'pointer', transition: 'all 0.2s', ...os, fontFamily: FONT }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.2s', ...bs }}>{opt.letter}</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: opt.letter === correctLetter && isRevealed ? 600 : 400, lineHeight: 1.55, flex: 1 }}>{opt.text}</span>
                    {isRevealed && opt.letter === correctLetter && <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', flexShrink: 0 }}>Correct</span>}
                    {isRevealed && opt.letter === selectedLetter && opt.letter !== correctLetter && <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', flexShrink: 0 }}>Wrong</span>}
                  </button>
                );
              })}
            </div>

            {/* Feedback banner */}
            {isRevealed && (
              <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', borderRadius: 16, background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, animation: 'revealPop 0.25s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  {isCorrect ? 'YES' : 'NO'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isCorrect ? '#34d399' : '#f87171', marginBottom: '0.1rem' }}>
                    {isCorrect ? 'Correct!' : 'Not quite!'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    {isCorrect ? 'Great job. Move to next question.' : `The correct answer is option ${correctLetter}.`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={goPrev} disabled={current === 0}
              style={{ padding: '0.7rem 1.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: current === 0 ? '#1e293b' : '#64748b', borderRadius: 14, cursor: current === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: FONT, transition: 'all 0.2s' }}
              onMouseEnter={e => { if (current !== 0) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = current === 0 ? '#1e293b' : '#64748b'; }}>
              ← Previous
            </button>

            <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>{current + 1} / {total}</div>

            {current < total - 1
              ? <button onClick={goNext}
                  style={{ padding: '0.7rem 1.75rem', background: isRevealed ? C.grad : 'rgba(255,255,255,0.05)', color: isRevealed ? '#fff' : '#334155', border: isRevealed ? 'none' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: FONT, boxShadow: isRevealed ? `0 6px 24px ${C.shadow}` : 'none', transition: 'all 0.25s' }}>
                  Next →
                </button>
              : <button onClick={handleSubmit} disabled={submitting}
                  style={{ padding: '0.7rem 1.75rem', background: C.grad, color: '#fff', border: 'none', borderRadius: 14, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.85rem', fontFamily: FONT, boxShadow: `0 6px 24px ${C.shadow}`, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
