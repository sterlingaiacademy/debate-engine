const fs = require('fs');
const path = 'frontend/src/pages/OlympiadMockQuiz.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Rename Component
content = content.replace(/export default function OlympiadEnglishQuiz/g, 'export default function OlympiadMockQuiz');

// 2. Change API routes
content = content.replace(/\/api\/olympiad\/quiz\//g, '/api/olympiad/mock/');

// 3. Update timer default to 1200
content = content.replace(/const \[timeLeft, setTimeLeft\] = useState\(15\);/g, 'const [timeLeft, setTimeLeft] = useState(1200);');

// 4. Update timer logic to auto-submit when 0 and not pause on 'revealed'
const newTimerEffect = `
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (submitting) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [phase, timeLeft, submitting]);
`;
content = content.replace(/useEffect\(\(\) => \{\s+if \(phase !== 'quiz'\) return;\s+if \(revealed\[current\]\) return;[\s\S]*?return \(\) => clearInterval\(timerId\);\s+\}, \[phase, revealed, current, timeLeft\]\);/m, newTimerEffect);

// 5. Update handleSelect and handleNext (No 'revealed' state logic, just move next)
const newHandlers = `
  const handleSelect = (letter) => {
    setAnswers(prev => ({ ...prev, [current]: letter }));
  };

  const handleNext = () => {
    setAnimate(false);
    setTimeout(() => { setCurrent(c => c + 1); setAnimate(true); }, 180);
  };
  
  const handlePrev = () => {
    setAnimate(false);
    setTimeout(() => { setCurrent(c => c - 1); setAnimate(true); }, 180);
  };
`;
content = content.replace(/const handleSelect =[\s\S]*?\}\s*\};\s*const handleNext =[\s\S]*?\}\s*\};/m, newHandlers);

// 6. Update handleSubmit
const newSubmit = `
  const handleSubmit = async () => {
    if (answers[current] === undefined && timeLeft > 0) {
      if (!window.confirm("You have unanswered questions. Submit quiz anyway?")) return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(\`\${API_BASE}/api/olympiad/mock/submit\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_email: user.email, subject: subjectKey, grade: gradeNum, quiz_name: quiz?.quiz_name, score: calculateScore(), total: quiz?.total, answers, correctAnswers }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Build breakdown manually
      const breakdown = quiz.questions.map(q => {
        const isCorrect = answers[q.id] === q.correct;
        return {
          question: q.question,
          selected: answers[q.id],
          correct: q.correct,
          isCorrect
        };
      });
      
      setResult({ ...data, score: calculateScore(), total: quiz?.total, breakdown }); 
      setPhase('result');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };
  
  const calculateScore = () => {
    let s = 0;
    quiz?.questions?.forEach(q => {
      if (answers[q.id] === q.correct) s++;
    });
    return s;
  };
`;
content = content.replace(/const handleSubmit = async \(\) => \{[\s\S]*?finally \{ setSubmitting\(false\); \}\s*\};/m, newSubmit);

// 7. Inject passage display and fix next/prev buttons
content = content.replace(
  /<h3 className="text-xl md:text-2xl font-bold text-text-main dark:text-white leading-tight">/g, 
  `{quiz.questions[current].passage && (
     <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-text-main dark:text-gray-300 whitespace-pre-wrap text-sm md:text-base max-h-[250px] overflow-y-auto">
       {quiz.questions[current].passage}
     </div>
   )}
   <h3 className="text-xl md:text-2xl font-bold text-text-main dark:text-white leading-tight">`
);

// 8. Fix timer UI
content = content.replace(
  /<div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-neo-portal dark:shadow-neo-dark-portal" style=\{gradientStyle\}>\s*\{timeLeft\}\s*<\/div>/,
  `<div className="px-4 py-2 rounded-full flex items-center justify-center font-bold text-white shadow-neo-portal dark:shadow-neo-dark-portal" style={gradientStyle}>
     {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
   </div>`
);

// 9. Fix bottom buttons
content = content.replace(
  /<button\s+onClick=\{handleSubmit\}\s+disabled=\{submitting\}\s+className="flex-1 py-4.*?Submit Quiz<\/button>/,
  `<button onClick={handleSubmit} disabled={submitting} className="flex-1 py-4 rounded-2xl font-bold text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg" style={gradientStyle}>
     {submitting ? 'Submitting...' : 'Submit Exam'}
   </button>`
);

content = content.replace(
  /<button\s+onClick=\{handleNext\}\s+className="flex-1 py-4.*?<\/button>/,
  `<div className="flex w-full gap-3">
     {current > 0 && (
       <button onClick={handlePrev} className="flex-1 py-4 rounded-2xl font-bold text-text-main dark:text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg bg-bg-base dark:bg-dark-base">
         Previous
       </button>
     )}
     {current < quiz.questions.length - 1 ? (
       <button onClick={handleNext} className="flex-1 py-4 rounded-2xl font-bold text-text-main dark:text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg bg-bg-base dark:bg-dark-base">
         Next
       </button>
     ) : (
       <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-4 rounded-2xl font-bold text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg" style={gradientStyle}>
         {submitting ? 'Submitting...' : 'Submit Exam'}
       </button>
     )}
   </div>`
);

// Remove the old Check Answer button logic completely and replace the big button block at the bottom
const oldButtonsBlock = `
          {revealed[current] ? (
            current === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-4 rounded-2xl font-bold text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg"
                style={gradientStyle}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-4 rounded-2xl font-bold text-text-main dark:text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg bg-bg-base dark:bg-dark-base"
              >
                Next Question
              </button>
            )
          ) : (
            <button
              onClick={() => setRevealed(prev => ({ ...prev, [current]: true }))}
              disabled={answers[current] === undefined}
              className={\`flex-1 py-4 rounded-2xl font-bold text-lg transition-all \${
                answers[current] === undefined 
                  ? 'bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95'\
              }\`}
              style={answers[current] !== undefined ? gradientStyle : {}}
            >
              Check Answer
            </button>
          )}
`;

content = content.replace(oldButtonsBlock, `
          <div className="flex w-full gap-3">
             {current > 0 && (
               <button onClick={handlePrev} className="flex-1 py-4 rounded-2xl font-bold text-text-main dark:text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg bg-bg-base dark:bg-dark-base">
                 Previous
               </button>
             )}
             {current < quiz.questions.length - 1 ? (
               <button onClick={handleNext} className="flex-1 py-4 rounded-2xl font-bold text-text-main dark:text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg bg-bg-base dark:bg-dark-base">
                 Next
               </button>
             ) : (
               <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-4 rounded-2xl font-bold text-white shadow-neo-portal dark:shadow-neo-dark-portal hover:opacity-90 active:scale-95 transition-all text-lg" style={gradientStyle}>
                 {submitting ? 'Submitting...' : 'Submit Exam'}
               </button>
             )}
          </div>
`);

// 10. Fix Option rendering to not show correct/incorrect styles during test
content = content.replace(/const isSelected = answers\[current\] === opt.letter;/g, 'const isSelected = answers[current] === opt.letter;');
content = content.replace(/const isCorrectOpt = opt.letter === q.correct;/g, 'const isCorrectOpt = false;');
content = content.replace(/const showCorrect = revealed\[current\] && isCorrectOpt;/g, 'const showCorrect = false;');
content = content.replace(/const showWrong = revealed\[current\] && isSelected && !isCorrectOpt;/g, 'const showWrong = false;');
content = content.replace(/const showMissed = revealed\[current\] && !isSelected && isCorrectOpt;/g, 'const showMissed = false;');

fs.writeFileSync(path, content);
console.log('OlympiadMockQuiz rewritten successfully.');
