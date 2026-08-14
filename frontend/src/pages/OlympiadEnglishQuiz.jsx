import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

const SUBJECT_KEY = { English: 'english', Mathematics: 'mathematics', Science: 'science', 'Social Sciences': 'social_science', 'CT & AI': 'ct_ai' };
const GRADE_NUM = { 'Grade 5': 5, 'Grade 6': 6, 'Grade 7': 7, 'Grade 8': 8, 'Grade 9': 9, 'Grade 10': 10, 'Grade 11': 11, 'Grade 12': 12 };
const SUBJECT_COLORS = {
  English: { grad: 'linear-gradient(to right, #ff6b6b, #ee0979)', light: '#ff6b6b', shadow: 'rgba(238,9,121,0.3)', bg: 'rgba(238,9,121,0.08)' },
  Mathematics: { grad: 'linear-gradient(to right, #4facfe, #00f2fe)', light: '#4facfe', shadow: 'rgba(79,172,254,0.3)', bg: 'rgba(79,172,254,0.08)' },
  Science: { grad: 'linear-gradient(to right, #43e97b, #38f9d7)', light: '#43e97b', shadow: 'rgba(67,233,123,0.3)', bg: 'rgba(67,233,123,0.08)' },
  'Social Sciences': { grad: 'linear-gradient(to right, #f7971e, #ffd200)', light: '#f7971e', shadow: 'rgba(247,151,30,0.3)', bg: 'rgba(247,151,30,0.08)' },
  'CT & AI': { grad: 'linear-gradient(to right, #a18cd1, #fbc2eb)', light: '#a18cd1', shadow: 'rgba(161,140,209,0.3)', bg: 'rgba(161,140,209,0.08)' },
};

export default function OlympiadEnglishQuiz({ user, subject = 'English', onClose }) {
  const [phase, setPhase] = useState('loading');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  let gradeNum = GRADE_NUM[user?.classLevel] || GRADE_NUM[user?.grade];
  if (!gradeNum && (user?.classLevel === 'Professional' || user?.grade === 'Professional')) {
    gradeNum = 12;
  }
  const subjectKey = SUBJECT_KEY[subject] || 'english';
  const C = SUBJECT_COLORS[subject] || SUBJECT_COLORS.English;

  useEffect(() => {
    if (!gradeNum) { setError('Grade not set. Please update your profile.'); setPhase('blocked'); return; }
    fetch(`${API_BASE}/api/olympiad/quiz/status/${subjectKey}/${gradeNum}?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.attempted) { setResult(data.result); setPhase('result'); }
        else return fetch(`${API_BASE}/api/olympiad/quiz/${subjectKey}/${gradeNum}`).then(r => r.json()).then(q => {
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
    if (revealed[current]) return;

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

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setAnswers(prev => ({ ...prev, [current]: letter }));
  };

  const handleNext = () => {
    if (!revealed[current]) {
      setRevealed(prev => ({ ...prev, [current]: true }));
    } else {
      setAnimate(false);
      setTimeout(() => { setTimeLeft(15); setCurrent(c => c + 1); setAnimate(true); }, 180);
    }
  };

  const handleSubmit = async () => {
    if (!revealed[current] && answers[current] !== undefined) {
      setRevealed(prev => ({ ...prev, [current]: true }));
      return;
    }
    if (answers[current] === undefined && !revealed[current]) {
      if (!window.confirm("You haven't answered the current question. Submit quiz anyway?")) return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/quiz/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, subject: subjectKey, grade: gradeNum, answers, correctAnswers }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data); setPhase('result');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };

  // Helper styles for dynamic gradients
  const gradientStyle = { background: C.grad };
  const gradientTextStyle = { background: C.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  if (phase === 'loading') return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="text-center bg-bg-base dark:bg-dark-base p-8 rounded-3xl shadow-neo dark:shadow-neo-dark">
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${C.light}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.25rem' }} />
        <p className="text-text-main dark:text-gray-200 font-bold">Loading {subject} Quiz...</p>
      </div>
    </div>
  );

  if (phase === 'blocked') return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="bg-bg-base dark:bg-dark-base rounded-[28px] p-10 text-center max-w-[420px] w-full shadow-neo dark:shadow-neo-dark">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-text-main dark:text-white font-bold text-2xl mb-2">Cannot Load Quiz</h2>
        <p className="text-text-muted dark:text-gray-400 mb-8">{error}</p>
        <button onClick={onClose} style={gradientStyle} className="px-8 py-3 rounded-xl text-white font-bold shadow-neo dark:shadow-neo-dark hover:opacity-90 active:scale-95 transition-all">Close</button>
      </div>
    </div>
  );

  if (phase === 'result') {
    const score = result?.score ?? result?.result?.score;
    const total = result?.total ?? result?.result?.total;
    const pct = total ? parseFloat(((score / total) * 100).toFixed(1)) : 0;
    const isPassing = pct >= 50;
    const breakdown = result?.breakdown || [];

    return (
      <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center p-margin-mobile md:p-margin-desktop overflow-y-auto text-text-main dark:text-white">
        <div className="bg-bg-base dark:bg-dark-base rounded-[28px] w-full max-w-[900px] relative overflow-hidden flex flex-col my-auto shadow-neo dark:shadow-neo-dark">
          {/* Top Color Bar */}
          <div className="h-[3px] w-full absolute top-0 left-0" style={gradientStyle}></div>
          
          <div className="results-main-grid grid grid-cols-[1fr_380px] min-h-[500px]">
            {/* Left Col: Review (only if breakdown exists) */}
            <div className="p-gutter border-r border-gray-200 dark:border-white/5 flex flex-col h-full max-h-[70vh] md:max-h-[80vh] overflow-hidden">
              <div className="mb-6 flex-shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark text-text-muted dark:text-gray-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">manage_search</span>
                </div>
                <h2 className="font-headline-md text-xl font-bold">Answer Review</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                {breakdown.length === 0 ? (
                  <p className="text-text-muted dark:text-gray-500">No review data available.</p>
                ) : (
                  breakdown.map((b, i) => (
                    <div key={i} className={`p-5 rounded-2xl bg-bg-base dark:bg-dark-base ${b.isCorrect ? 'shadow-neo-inset dark:shadow-neo-inset-dark border border-green-500/20' : 'shadow-neo dark:shadow-neo-dark border border-red-500/20'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${b.isCorrect ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                          <span className="material-symbols-outlined text-[16px]">{b.isCorrect ? 'check' : 'close'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-body-sm text-text-main dark:text-white/90 mb-2 leading-relaxed">
                            <span className="text-text-muted dark:text-white/40 font-bold mr-2">Q{i+1}.</span> {b.question}
                          </p>
                          <div className="flex flex-col gap-1.5 mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-text-muted dark:text-white/40 text-xs uppercase tracking-wider w-16">Selected</span>
                              <span className={`text-sm font-medium ${b.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{b.selected || '—'}</span>
                            </div>
                            {!b.isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="text-text-muted dark:text-white/40 text-xs uppercase tracking-wider w-16">Correct</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">{b.correct}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Col: Summary */}
            <div className="p-gutter flex flex-col items-center justify-center bg-bg-base dark:bg-dark-base shadow-[inset_10px_0_20px_rgba(200,206,221,0.2)] dark:shadow-[inset_10px_0_20px_rgba(0,0,0,0.2)]">
              <div className="text-center mb-8">
                <div className="font-label-sm text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">ThinkQuest · {subject}</div>
                <h1 className="font-headline-md text-2xl font-bold mb-10" style={gradientTextStyle}>Quiz Completed</h1>
                
                <div className="relative w-[180px] h-[180px] mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" className="stroke-gray-200 dark:stroke-white/5" strokeWidth="6"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke={isPassing ? '#4ade80' : '#f87171'} strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * pct) / 100} className="transition-all duration-1000 ease-out"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-extrabold" style={{ color: isPassing ? '#4ade80' : '#f87171' }}>{pct}%</div>
                    <div className="text-text-muted dark:text-white/40 text-xs font-bold mt-1 uppercase tracking-wider">Score</div>
                  </div>
                </div>

                <div className="bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark rounded-2xl p-4 inline-flex gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-main dark:text-white">{score}</div>
                    <div className="text-text-muted dark:text-gray-400 text-xs">Correct</div>
                  </div>
                  <div className="w-[1px] bg-gray-200 dark:bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-main dark:text-white">{total - score}</div>
                    <div className="text-text-muted dark:text-gray-400 text-xs">Incorrect</div>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-full max-w-[280px] py-4 rounded-xl font-bold text-white shadow-neo dark:shadow-neo-dark hover:opacity-90 active:shadow-neo-btn-inset dark:active:shadow-neo-btn-inset-dark active:scale-[0.98] transition-all" style={gradientStyle}>
                Back to Dashboard
              </button>
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
  
  const nextLabel = () => {
    if (isLastQ) {
      if (!isRevealed && selectedLetter) return 'Check Answer';
      return submitting ? 'Submitting...' : 'Submit Quiz';
    }
    if (!isRevealed) return 'Check Answer';
    return 'Next Question →';
  };

  const nextEnabled = !!selectedLetter || isRevealed;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center p-margin-mobile md:p-margin-desktop overflow-y-auto text-text-main dark:text-white">
      <div className="bg-bg-base dark:bg-dark-base rounded-[28px] w-full max-w-[680px] relative overflow-hidden flex flex-col my-auto shadow-neo dark:shadow-neo-dark min-h-[500px]">
        {/* Top Color Bar */}
        <div className="h-[3px] w-full absolute top-0 left-0" style={gradientStyle}></div>
        
        {/* Header */}
        <div className="p-gutter pb-0 pt-8 flex justify-between items-start">
          <div>
            <div className="font-label-sm text-text-muted dark:text-white/50 tracking-wider uppercase mb-1">ThinkQuest Olympiad · {subject}</div>
            <h1 className="font-headline-md text-headline-md font-bold" style={gradientTextStyle}>{quiz.quiz_name}</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark rounded-full px-4 py-1.5 flex items-center gap-1.5 hidden sm:flex">
              <span className="material-symbols-outlined text-[16px] text-text-muted dark:text-white/70">format_list_numbered</span>
              <span className="font-label-sm text-text-main dark:text-white/90 font-bold">{answered}/{total}</span>
            </div>
            <div className={`bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark rounded-full px-4 py-1.5 flex items-center gap-1.5 ${timeLeft <= 5 && !isRevealed ? 'text-red-500 danger-pulse' : 'text-primary'}`}>
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span className="font-label-sm font-bold">00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Navigator */}
        <div className="px-gutter py-6 border-b border-gray-200 dark:border-white/[0.03]">
          <div className="h-[6px] bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark rounded-full w-full mb-8 overflow-hidden p-[1px]">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((current+1)/total)*100}%`, ...gradientStyle, boxShadow: `0 0 8px ${C.light}` }}></div>
          </div>
          
          {/* Question Navigator */}
          <div className="flex justify-between items-center px-2 flex-wrap gap-2">
            {quiz.questions.map((_, i) => {
              const isCur = i === current;
              const isAns = answers[i] !== undefined;
              const isOK = isAns && revealed[i] && answers[i] === quiz.questions[i].correct;
              const isBAD = revealed[i] && answers[i] !== quiz.questions[i].correct;
              
              if (isCur) {
                return (
                  <div key={i} className="w-[32px] h-[32px] rounded-full bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark flex items-center justify-center font-bold text-sm">
                    <span style={gradientTextStyle}>{i + 1}</span>
                  </div>
                );
              }
              if (isOK) {
                return (
                  <div key={i} className="w-[32px] h-[32px] rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark text-green-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                );
              }
              if (isBAD) {
                return (
                  <div key={i} className="w-[32px] h-[32px] rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </div>
                );
              }
              if (isAns) {
                 return (
                  <div key={i} className="w-[32px] h-[32px] rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark text-text-main dark:text-white flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </div>
                );
              }
              return (
                <div key={i} className={`w-[32px] h-[32px] rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark text-text-muted dark:text-white/40 items-center justify-center text-xs font-medium ${Math.abs(current - i) > 3 ? 'hidden sm:flex' : 'flex'}`}>
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Area */}
        <div className="p-gutter flex-1 flex flex-col gap-8 transition-opacity duration-200" style={{ opacity: animate ? 1 : 0 }}>
          {/* Question Card */}
          <div className="bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark rounded-[20px] p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] opacity-80" style={gradientStyle}></div>
            <p className="font-body-lg text-body-lg text-text-main dark:text-white/90 leading-relaxed pl-3 font-medium whitespace-pre-wrap">
              {q.question}
            </p>
          </div>

          {/* Multiple Choice Options */}
          <div className="flex flex-col gap-4 pb-4">
            {q.options.map(opt => {
              const isSelected = selectedLetter === opt.letter;
              const isCorrectOpt = isRevealed && opt.letter === correctLetter;
              const isWrongOpt = isRevealed && isSelected && opt.letter !== correctLetter;
              
              let containerClass = "group relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ";
              let letterClass = "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 transition-colors ";
              let textClass = "font-body-md font-medium ";
              
              if (isCorrectOpt) {
                containerClass += "bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark border border-green-500/20";
                letterClass += "bg-green-500/20 text-green-600 dark:text-green-400 shadow-neo-inset dark:shadow-neo-inset-dark";
                textClass += "text-green-600 dark:text-green-400 font-bold";
              } else if (isWrongOpt) {
                containerClass += "bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark border border-red-500/20";
                letterClass += "bg-red-500/20 text-red-600 dark:text-red-400 shadow-neo-inset dark:shadow-neo-inset-dark";
                textClass += "text-red-600 dark:text-red-400 font-bold";
              } else if (isSelected) {
                containerClass += "bg-bg-base dark:bg-dark-base shadow-neo-inset dark:shadow-neo-inset-dark";
                letterClass += "text-white shadow-[0_4px_12px_rgba(200,206,221,0.5)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)]"; // Custom style applied below
                textClass += "text-text-main dark:text-white font-bold";
              } else {
                containerClass += "bg-bg-base dark:bg-dark-base shadow-neo dark:shadow-neo-dark hover:shadow-neo-sm dark:hover:shadow-neo-sm-dark " + (isRevealed ? "opacity-50 cursor-default" : "");
                letterClass += "bg-bg-base dark:bg-dark-base shadow-neo-sm dark:shadow-neo-sm-dark text-text-muted dark:text-white/60 group-hover:text-text-main dark:group-hover:text-white/80";
                textClass += "text-text-muted dark:text-white/80";
              }

              return (
                <label key={opt.letter} className={containerClass}>
                  <input type="radio" name={`q${current}`} className="hidden" checked={isSelected} onChange={() => handleSelect(opt.letter)} disabled={isRevealed} />
                  <div className={letterClass} style={isSelected && !isRevealed ? gradientStyle : {}}>
                    {opt.letter}
                  </div>
                  <span className={textClass + " flex-1"}>{opt.text}</span>
                  {isCorrectOpt && <span className="material-symbols-outlined text-green-500 ml-2">check_circle</span>}
                  {isWrongOpt && <span className="material-symbols-outlined text-red-500 ml-2">cancel</span>}
                </label>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="p-gutter pt-4 pb-8 flex justify-between items-center bg-bg-base dark:bg-dark-base z-10 border-t border-gray-200 dark:border-white/5">
          <button onClick={onClose} className="text-text-muted dark:text-white/40 hover:text-text-main dark:hover:text-white/80 transition-colors font-medium text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">close</span> Exit
          </button>
          
          {isLastQ ? (
            <button 
              onClick={handleSubmit} 
              disabled={submitting || !nextEnabled}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${nextEnabled && !submitting ? 'text-white shadow-neo dark:shadow-neo-dark hover:opacity-90 active:shadow-neo-btn-inset dark:active:shadow-neo-btn-inset-dark active:scale-[0.98]' : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/30 cursor-not-allowed'}`}
              style={nextEnabled && !submitting ? gradientStyle : {}}
            >
              {nextLabel()}
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              disabled={!nextEnabled}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${nextEnabled ? 'text-white shadow-neo dark:shadow-neo-dark hover:opacity-90 active:shadow-neo-btn-inset dark:active:shadow-neo-btn-inset-dark active:scale-[0.98]' : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/30 cursor-not-allowed'}`}
              style={nextEnabled ? gradientStyle : {}}
            >
              {nextLabel()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
