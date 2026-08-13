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
  const [answers, setAnswers] = useState({});       // { qIndex: selectedLetter }
  const [correctAnswers, setCorrectAnswers] = useState({}); // { qIndex: correctLetter } from shuffled quiz
  const [revealed, setRevealed] = useState({});     // { qIndex: true } — set when Check Answer is clicked
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  const gradeNum = GRADE_NUM[user?.classLevel] || GRADE_NUM[user?.grade];
  const subjectKey = SUBJECT_KEY[subject] || 'english';
  const C = SUBJECT_COLORS[subject] || SUBJECT_COLORS.English;

  useEffect(() => {
    if (!gradeNum) { setError('Grade not set. Please update your profile.'); setPhase('blocked'); return; }
    fetch(`${API_BASE}/api/olympiad/quiz/status/${subjectKey}/${gradeNum}?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.attempted) { setResult(data.result); setPhase('result'); }
        else return fetch(`${API_BASE}/api/olympiad/quiz/${subjectKey}/${gradeNum}`).then(r => r.json()).then(q => {
          // Store the correct letter for each shuffled question
          const ca = {};
          q.questions.forEach((qu, i) => { ca[i] = qu.correct; });
          setCorrectAnswers(ca);
          setQuiz(q);
          setPhase('quiz');
        });
      })
      .catch(e => { setError(e.message); setPhase('blocked'); });
  }, [gradeNum, user.email, subjectKey]);

  useEffect(() => {
    if (phase !== 'quiz') return;
    if (revealed[current]) return; // pause timer if answer revealed

    if (timeLeft <= 0) {
      if (!revealed[current]) {
        setRevealed(prev => ({ ...prev, [current]: true }));
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [phase, revealed, current, timeLeft]);



  // User freely selects/changes answer — no locking yet
  const handleSelect = (letter) => {
    if (revealed[current]) return; // locked after reveal
    setAnswers(prev => ({ ...prev, [current]: letter }));
  };

  // Clicking Next: if not yet revealed → reveal answer first
  //                if already revealed → go to next question
  const handleNext = () => {
    if (!revealed[current]) {
      // Reveal answer for this question
      setRevealed(prev => ({ ...prev, [current]: true }));
    } else {
      // Move to next question
      setAnimate(false);
      setTimeout(() => { setTimeLeft(15); setCurrent(c => c + 1); setAnimate(true); }, 180);
    }
  };

  const handlePrev = () => {
    setAnimate(false);
    setTimeout(() => { setTimeLeft(15); setCurrent(c => c - 1); setAnimate(true); }, 180);
  };

  const handleSubmit = async () => {
    // If last question not yet revealed, reveal first
    if (!revealed[current] && answers[current] !== undefined) {
      setRevealed(prev => ({ ...prev, [current]: true }));
      return;
    }
    const unanswered = quiz.questions.filter((_, i) => answers[i] === undefined).length;
    if (unanswered > 0 && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/quiz/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, subject: subjectKey, grade: gradeNum, answers, correctAnswers }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data); setPhase('result');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.92)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT, padding: '1rem' };

  if (phase === 'loading') return (
    <div style={overlay}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${C.light}`, borderTopColor: 'transparent', animation: 'qs 0.8s linear infinite', margin: '0 auto 1.25rem' }} />
        <style>{`@keyframes qs{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading {subject} Quiz...</p>
      </div>
    </div>
  );

  if (phase === 'blocked') return (
    <div style={overlay}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '3rem', textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#f1f5f9', fontWeight: 800, margin: '0 0 0.5rem' }}>Cannot Load Quiz</h2>
        <p style={{ color: '#64748b', margin: '0 0 2rem', lineHeight: 1.6 }}>{error}</p>
        <button onClick={onClose} style={{ padding: '0.8rem 2.5rem', background: C.grad, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );

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
        <div style={{ background: 'rgba(10,10,20,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '0', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', animation: 'fadeUp 0.3s ease', backdropFilter: 'blur(30px)' }}>
          <div style={{ height: 3, background: C.grad, borderRadius: '28px 28px 0 0' }} />
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: C.light, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Quiz Complete</div>
                <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 0.2rem' }}>{quizName}</h2>
                {attemptedAt && <div style={{ fontSize: '0.73rem', color: '#475569' }}>{new Date(attemptedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>}
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: 12, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>✕ Close</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 130, height: 130, borderRadius: '50%', border: `4px solid ${pctColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', background: `${pctColor}10`, boxShadow: `0 0 60px ${pctColor}25` }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: pctColor, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>of {total}</div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: pctColor, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{pct}%</div>
              <div style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>{pct >= 80 ? '🏆 Excellent Performance!' : pct >= 50 ? '👍 Good Effort!' : '📚 Keep Practicing!'}</div>
            </div>
            {breakdown.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Answer Review</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
                  {breakdown.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: b.isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${b.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`, borderRadius: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: b.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 900, color: b.isCorrect ? '#10b981' : '#ef4444', marginTop: 2 }}>{b.isCorrect ? '✓' : '✗'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>Q{i+1}: {b.question}</div>
                        {!b.isCorrect && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.15rem' }}>Your answer: <span style={{ color: '#f87171' }}>{b.selected || '—'}</span>  ·  Correct: <span style={{ color: '#34d399', fontWeight: 700 }}>{b.correct}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <button onClick={onClose} style={{ padding: '0.9rem 3rem', background: C.grad, color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', boxShadow: `0 8px 32px ${C.shadow}` }}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ PHASE ──
  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const isLastQ = current === total - 1;
  const isRevealed = !!revealed[current];
  const selectedLetter = answers[current];
  const correctLetter = q.correct;
  const isCorrect = selectedLetter === correctLetter;

  // Option styling: before reveal — just highlight selected; after reveal — green/red
  const optStyle = (letter) => {
    if (!isRevealed) return {
      background: selectedLetter === letter ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.025)',
      border: `1.5px solid ${selectedLetter === letter ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'}`,
      color: '#e2e8f0',
      cursor: 'pointer',
      opacity: 1,
    };
    if (letter === correctLetter) return { background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.4)', color: '#6ee7b7', cursor: 'default', opacity: 1 };
    if (letter === selectedLetter) return { background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.35)', color: '#fca5a5', cursor: 'default', opacity: 1 };
    return { background: 'rgba(255,255,255,0.015)', border: '1.5px solid rgba(255,255,255,0.03)', color: '#2d3748', cursor: 'default', opacity: 0.45 };
  };

  const badgeStyle = (letter) => {
    if (!isRevealed) return { background: selectedLetter === letter ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)', color: selectedLetter === letter ? '#fff' : '#475569' };
    if (letter === correctLetter) return { background: '#10b981', color: '#fff' };
    if (letter === selectedLetter) return { background: '#ef4444', color: '#fff' };
    return { background: 'rgba(255,255,255,0.03)', color: '#2d3748' };
  };

  // Next button label and state
  const nextLabel = () => {
    if (isLastQ) {
      if (!isRevealed && selectedLetter) return 'Check Answer';
      return submitting ? 'Submitting...' : 'Submit Quiz';
    }
    if (!isRevealed) return 'Check Answer';
    return 'Next Question →';
  };

  const nextEnabled = !!selectedLetter || isRevealed; // must have selected something or time ran out
  const nextGlowing = isRevealed || (selectedLetter && !isRevealed); // glow when answer selected or revealed

  return (
    <div style={overlay}>
      <style>{`
        @keyframes qSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes qs{to{transform:rotate(360deg)}}
        @keyframes revealPop{0%{opacity:0;transform:scale(0.96) translateY(4px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        .qHover:hover{background:rgba(255,255,255,0.05)!important;border-color:rgba(255,255,255,0.14)!important;}
      `}</style>
      <div style={{ background: 'rgba(10,10,20,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 40px 120px rgba(0,0,0,0.7)', backdropFilter: 'blur(30px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 3, background: C.grad, flexShrink: 0 }} />

        <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.light, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>ThinkQuest Olympiad · {subject}</div>
              <h2 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{quiz.quiz_name}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ 
                fontSize: '1.05rem', 
                color: timeLeft <= 5 && !revealed[current] ? '#ef4444' : '#06b6d4', 
                fontWeight: 900, 
                background: timeLeft <= 5 && !revealed[current] ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)', 
                padding: '0.45rem 1rem', 
                borderRadius: 99, 
                border: `1.5px solid ${timeLeft <= 5 && !revealed[current] ? '#ef4444' : '#06b6d4'}`, 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center', 
                transition: 'all 0.3s',
                boxShadow: timeLeft <= 5 && !revealed[current] ? '0 0 12px rgba(239,68,68,0.4)' : '0 0 10px rgba(6,182,212,0.2)'
              }}>
                <span style={{ fontSize: '1.1rem' }}>⏳</span> {timeLeft}s
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.8rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.06)' }}>{answered}/{total} done</div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', borderRadius: 10, padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>✕</button>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: '0.7rem', color: C.light, fontWeight: 700 }}>{Math.round(((current+1)/total)*100)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((current+1)/total)*100}%`, background: C.grad, borderRadius: 99, transition: 'width 0.35s ease' }} />
            </div>
          </div>

          {/* Question number dots */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {quiz.questions.map((_, i) => {
              const isCur = i === current;
              const isAns = answers[i] !== undefined;
              const isOK = isAns && revealed[i] && answers[i] === quiz.questions[i].correct;
              const isBAD = isAns && revealed[i] && answers[i] !== quiz.questions[i].correct;
              return (
                <div key={i}
                  style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, fontFamily: FONT, transition: 'all 0.15s',
                    background: isCur ? C.light : isOK ? 'rgba(16,185,129,0.22)' : isBAD ? 'rgba(239,68,68,0.22)' : isAns ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    color: isCur ? '#fff' : isOK ? '#34d399' : isBAD ? '#f87171' : isAns ? '#94a3b8' : '#334155',
                    border: isCur ? `1.5px solid ${C.light}` : '1.5px solid transparent',
                    boxShadow: isCur ? `0 0 10px ${C.shadow}` : 'none',
                  }}>{i + 1}</div>
              );
            })}
          </div>

          {/* Question + Options */}
          <div style={{ animation: animate ? 'qSlide 0.2s ease' : 'none' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.25rem 1.5rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: C.grad }} />
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: C.light, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Question {current + 1} of {total}</div>
              <p style={{ color: '#e2e8f0', fontSize: '0.97rem', fontWeight: 600, lineHeight: 1.7, margin: 0 }}>{q.question}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map(opt => {
                const os = optStyle(opt.letter);
                const bs = badgeStyle(opt.letter);
                return (
                  <button key={opt.letter}
                    className={!isRevealed ? 'qHover' : ''}
                    onClick={() => handleSelect(opt.letter)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', borderRadius: 14, textAlign: 'left', width: '100%', transition: 'all 0.2s', fontFamily: FONT, ...os }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.2s', ...bs }}>{opt.letter}</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: isRevealed && opt.letter === correctLetter ? 600 : 400, lineHeight: 1.55, flex: 1 }}>{opt.text}</span>
                    {isRevealed && opt.letter === correctLetter && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', flexShrink: 0, background: 'rgba(16,185,129,0.12)', padding: '0.2rem 0.6rem', borderRadius: 99 }}>✓ Correct</span>}
                    {isRevealed && opt.letter === selectedLetter && opt.letter !== correctLetter && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', flexShrink: 0, background: 'rgba(239,68,68,0.12)', padding: '0.2rem 0.6rem', borderRadius: 99 }}>✗ Wrong</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed bottom navigation */}
        <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,20,0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ width: '100px' }} /> {/* Spacer to keep flex-between balanced */}

          <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>{current + 1} / {total}</span>

          {isLastQ
            ? <button onClick={handleSubmit} disabled={submitting || !nextEnabled}
                style={{ padding: '0.7rem 1.75rem', background: nextEnabled ? C.grad : 'rgba(255,255,255,0.04)', color: nextEnabled ? '#fff' : '#334155', border: 'none', borderRadius: 14, cursor: nextEnabled && !submitting ? 'pointer' : 'not-allowed', fontWeight: 800, fontSize: '0.85rem', fontFamily: FONT, boxShadow: nextEnabled ? `0 6px 24px ${C.shadow}` : 'none', transition: 'all 0.25s', opacity: submitting ? 0.7 : 1 }}>
                {nextLabel()}
              </button>
            : <button onClick={handleNext} disabled={!nextEnabled}
                style={{ padding: '0.7rem 1.75rem', background: nextEnabled ? C.grad : 'rgba(255,255,255,0.04)', color: nextEnabled ? '#fff' : '#334155', border: 'none', borderRadius: 14, cursor: nextEnabled ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.85rem', fontFamily: FONT, boxShadow: nextEnabled ? `0 6px 24px ${C.shadow}` : 'none', transition: 'all 0.25s' }}>
                {nextLabel()}
              </button>
          }
        </div>
      </div>
    </div>
  );
}
