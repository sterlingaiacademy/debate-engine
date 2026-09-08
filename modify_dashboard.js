const fs = require('fs');
const path = 'frontend/src/pages/OlympiadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import for OlympiadMockQuiz
if (!content.includes("import OlympiadMockQuiz")) {
  content = content.replace("import OlympiadEnglishQuiz from './OlympiadEnglishQuiz';", "import OlympiadEnglishQuiz from './OlympiadEnglishQuiz';\nimport OlympiadMockQuiz from './OlympiadMockQuiz';");
}

// 2. Add state
if (!content.includes("const [activeMockQuiz, setActiveMockQuiz] = useState(null);")) {
  content = content.replace("const [activeQuiz, setActiveQuiz] = useState(null);", "const [activeQuiz, setActiveQuiz] = useState(null);\n  const [activeMockQuiz, setActiveMockQuiz] = useState(null);");
}

// 3. Add Mock Tests section before Practice Quizzes
const mockTestsSection = `
        {/* Mock Tests */}
        <section className="mb-32">
          <h2 className="text-2xl font-bold mb-10 flex items-center gap-3 text-text-main dark:text-white transition-colors duration-300">
            <span className="material-symbols-outlined text-[#ffaa00] dark:text-[#ffaa00] bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal p-2 rounded-xl transition-all duration-300">verified</span>
            Mock Tests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {SUBJECTS.filter(s => s.key === 'English').map((s) => {
              const isSelected = userSubjectsArray.length === 0 || userSubjectsArray.includes(s.key);

              if (!isSelected) {
                return (
                  <div key={'mock-'+s.key} className="rounded-3xl p-8 bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal opacity-70 flex flex-col h-full transition-all duration-300 border-t border-white/50 dark:border-white/5">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal flex items-center justify-center transition-all duration-300">
                        <span className={\`material-symbols-outlined \${s.iconColorClass} text-2xl grayscale opacity-60\`}>{s.icon}</span>
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal text-[#8a94a6] dark:text-gray-400 text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300">
                        <span className="material-symbols-outlined text-[15px]">lock</span> LOCKED
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold mb-3 text-text-muted dark:text-gray-500 transition-colors duration-300">{s.label} Mock Test</h3>
                    <p className="text-text-muted dark:text-gray-500 text-sm mb-8 flex-grow transition-colors duration-300">Full 20-minute mock exam to evaluate your readiness.</p>
                    <button className="w-full py-3.5 rounded-xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal cursor-not-allowed font-semibold text-sm flex justify-center items-center gap-2 text-text-muted dark:text-gray-500 transition-all duration-300 border-none">
                      Requires Selection
                    </button>
                  </div>
                );
              }

              return (
                <div key={'mock-'+s.key} className="rounded-3xl p-8 bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal flex flex-col h-full border-t border-white/50 dark:border-white/5 transition-all duration-300">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal flex items-center justify-center transition-all duration-300">
                      <span className={\`material-symbols-outlined \${s.iconColorClass} text-2xl\`}>{s.icon}</span>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal text-[#00a572] dark:text-[#00d896] text-[13px] font-extrabold uppercase tracking-wider transition-all duration-300">READY</span>
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 text-text-main dark:text-white transition-colors duration-300">{s.label} Mock Test</h3>
                  <p className="text-text-muted dark:text-gray-400 text-sm mb-8 flex-grow transition-colors duration-300">Full 20-minute mock exam to evaluate your readiness.</p>
                  <button onClick={() => setActiveMockQuiz(s.key)} className="w-full py-3.5 rounded-xl bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal hover:shadow-neo-btn-inset-portal dark:hover:shadow-neo-btn-inset-dark-portal transition-all duration-300 font-bold text-sm flex justify-center items-center gap-2 text-text-main dark:text-gray-200 group cursor-pointer border-none">
                    Start Mock Test 
                  </button>
                </div>
              );
            })}
          </div>
        </section>

`;

if (!content.includes("Mock Tests")) {
  content = content.replace('{/* Practice Quizzes */}', mockTestsSection + '        {/* Practice Quizzes */}');
}

// 4. Add render for activeMockQuiz
if (!content.includes("activeMockQuiz && <OlympiadMockQuiz")) {
  content = content.replace(
    "{activeQuiz && <OlympiadEnglishQuiz user={user} subject={activeQuiz} onClose={() => setActiveQuiz(null)} />}",
    "{activeQuiz && <OlympiadEnglishQuiz user={user} subject={activeQuiz} onClose={() => setActiveQuiz(null)} />}\n      {activeMockQuiz && <OlympiadMockQuiz user={user} subject={activeMockQuiz} onClose={() => setActiveMockQuiz(null)} />}"
  );
}

fs.writeFileSync(path, content);
console.log('OlympiadDashboard updated successfully.');
