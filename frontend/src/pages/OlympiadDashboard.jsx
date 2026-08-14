import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OlympiadEnglishQuiz from './OlympiadEnglishQuiz';

const SUBJECTS = [
  { key: 'English', label: 'English', desc: 'Test your grammar, vocabulary, and reading comprehension.', icon: 'menu_book', iconColorClass: 'text-pink-500 dark:text-pink-400' },
  { key: 'Mathematics', label: 'Mathematics', desc: 'Logic, algebra, and advanced problem solving.', icon: 'calculate', iconColorClass: 'text-blue-500 dark:text-blue-400' },
  { key: 'Science', label: 'Science', desc: 'Physics, chemistry, biology, and scientific reasoning.', icon: 'science', iconColorClass: 'text-green-500 dark:text-green-400' },
  { key: 'Social Sciences', label: 'Social Sciences', desc: 'History, Geography & Global Citizenship MCQs.', icon: 'public', iconColorClass: 'text-yellow-500 dark:text-yellow-400' },
  { key: 'CT & AI', label: 'CT & AI', desc: 'Computational Thinking, Digital Citizenship & AI.', icon: 'smart_toy', iconColorClass: 'text-purple-500 dark:text-purple-400' },
];

export default function OlympiadDashboard({ user }) {
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const userSubjectsArray = user?.subjects ? user.subjects.split(',').map(s => s.trim()) : [];

  return (
    <div className={`font-body-md text-text-main dark:text-gray-100 bg-bg-base dark:bg-dark-base transition-colors duration-300 min-h-screen flex flex-col relative overflow-x-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Navigation Shell (TopAppBar) */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 bg-bg-base/80 dark:bg-dark-base/80 backdrop-blur-md hidden md:flex shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal transition-all duration-300">
        <div className="font-headline-md text-2xl font-bold text-text-main dark:text-white tracking-tight">ThinkQuest</div>
        <div className="flex gap-8">
          <a className="text-text-muted dark:text-gray-400 font-medium hover:text-primary dark:hover:text-primary transition-colors duration-300" href="#">Dashboard</a>
          <a className="text-primary font-bold relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-1 after:bg-primary after:rounded-full" href="#">Practice</a>
          <a className="text-text-muted dark:text-gray-400 font-medium hover:text-primary dark:hover:text-primary transition-colors duration-300" href="#">Rankings</a>
          <a className="text-text-muted dark:text-gray-400 font-medium hover:text-primary dark:hover:text-primary transition-colors duration-300" href="#">Profile</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal hover:shadow-neo-btn-inset-portal dark:hover:shadow-neo-btn-inset-dark-portal transition-all duration-300 flex items-center justify-center text-text-main dark:text-gray-200 cursor-pointer border-none">
            {isDarkMode ? (
              <span className="material-symbols-outlined text-[20px]">light_mode</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">dark_mode</span>
            )}
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal hover:shadow-neo-btn-inset-portal dark:hover:shadow-neo-btn-inset-dark-portal transition-shadow duration-300 text-sm font-semibold text-text-main dark:text-gray-200 cursor-pointer border-none">
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-[1100px] w-full mx-auto px-6 pb-24 relative z-10 flex-1" style={{ marginTop: '120px' }}>
        {/* Back Button Mobile */}
        <button onClick={() => navigate('/dashboard')} className="md:hidden inline-flex items-center gap-2 px-6 py-3 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal hover:shadow-neo-inset-portal dark:hover:shadow-neo-inset-dark-portal transition-shadow text-sm text-text-main dark:text-gray-200 font-semibold mb-8 group cursor-pointer border-none">
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Dashboard
        </button>

        {/* Hero Banner */}
        <section className="rounded-[32px] p-8 md:p-12 mb-16 flex flex-col md:flex-row items-start md:items-center gap-8 bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal transition-all duration-300">
          <div className="w-20 h-20 rounded-3xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal flex items-center justify-center shrink-0 transition-all duration-300">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          </div>
          <div className="flex-1">
            <div className="text-primary font-bold text-sm tracking-wider uppercase mb-2">PRACTICE PORTAL</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-text-main dark:text-white transition-colors duration-300">
              ThinkQuest <span className="text-tertiary dark:text-[#ffaa00]">Olympiad</span>
            </h1>
            <p className="text-text-muted dark:text-gray-400 text-lg mb-6 transition-colors duration-300">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</p>
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal text-secondary dark:text-[#00d896] text-sm font-semibold transition-all duration-300">
                <span className="w-2 h-2 rounded-full bg-secondary dark:bg-[#00d896] mr-2 animate-pulse"></span> Registered & Active
              </span>
              {user?.classLevel && (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal text-text-main dark:text-gray-200 text-sm font-semibold transition-all duration-300">
                  {user.classLevel}
                </span>
              )}
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal text-text-muted dark:text-gray-400 text-sm font-semibold transition-all duration-300">
                {userSubjectsArray.length > 0 ? `${userSubjectsArray.length} Subjects` : '5 Subjects'} · 1 Attempt Each
              </span>
            </div>
          </div>
        </section>

        {/* Practice Quizzes */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-10 flex items-center gap-3 text-text-main dark:text-white transition-colors duration-300">
            <span className="material-symbols-outlined text-primary bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal p-2 rounded-xl transition-all duration-300">school</span>
            Practice Quizzes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SUBJECTS.map((s) => {
              const isSelected = userSubjectsArray.length === 0 || userSubjectsArray.includes(s.key);

              if (!isSelected) {
                return (
                  <div key={s.key} className="rounded-3xl p-8 bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal opacity-70 flex flex-col h-full transition-all duration-300 border-t border-white/50 dark:border-white/5">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal flex items-center justify-center transition-all duration-300">
                        <span className={`material-symbols-outlined ${s.iconColorClass} text-2xl grayscale opacity-60`}>{s.icon}</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal text-text-muted dark:text-gray-500 text-xs font-bold uppercase tracking-wide flex items-center gap-1 transition-all duration-300">
                        <span className="material-symbols-outlined text-[14px]">lock</span> Locked
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold mb-3 text-text-muted dark:text-gray-500 transition-colors duration-300">{s.label}</h3>
                    <p className="text-text-muted dark:text-gray-500 text-sm mb-8 flex-grow transition-colors duration-300">{s.desc}</p>
                    <button className="w-full py-3.5 rounded-xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal cursor-not-allowed font-semibold text-sm flex justify-center items-center gap-2 text-text-muted dark:text-gray-500 transition-all duration-300 border-none">
                      Requires Selection
                    </button>
                  </div>
                );
              }

              return (
                <div key={s.key} className="rounded-3xl p-8 bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal flex flex-col h-full border-t border-white/50 dark:border-white/5 transition-all duration-300">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal flex items-center justify-center transition-all duration-300">
                      <span className={`material-symbols-outlined ${s.iconColorClass} text-2xl`}>{s.icon}</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal text-secondary dark:text-[#00d896] text-xs font-bold uppercase tracking-wide transition-all duration-300">Ready</span>
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 text-text-main dark:text-white transition-colors duration-300">{s.label}</h3>
                  <p className="text-text-muted dark:text-gray-400 text-sm mb-8 flex-grow transition-colors duration-300">{s.desc}</p>
                  <button onClick={() => setActiveQuiz(s.key)} className="w-full py-3.5 rounded-xl bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal hover:shadow-neo-btn-inset-portal dark:hover:shadow-neo-btn-inset-dark-portal transition-all duration-300 font-bold text-sm flex justify-center items-center gap-2 text-text-main dark:text-gray-200 group cursor-pointer border-none">
                    Start Practice Test 
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform text-primary dark:text-[#9e70ff]">arrow_forward</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section>
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-text-muted dark:text-gray-400 transition-colors duration-300">
            <span className="material-symbols-outlined text-tertiary dark:text-[#ffaa00] bg-bg-base dark:bg-dark-base shadow-neo-sm-portal dark:shadow-neo-sm-dark-portal p-1.5 rounded-lg transition-all duration-300">hourglass_empty</span>
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'event', label: 'Daily Practice' },
              { icon: 'description', label: 'Mock Exam' },
              { icon: 'gavel', label: 'Rules & Guide' }
            ].map(item => (
              <div key={item.label} className="rounded-2xl bg-bg-base dark:bg-dark-base shadow-neo-inset-portal dark:shadow-neo-inset-dark-portal p-5 flex items-center gap-5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-bg-base dark:bg-dark-base shadow-neo-portal dark:shadow-neo-dark-portal flex items-center justify-center shrink-0 transition-all duration-300">
                  <span className="material-symbols-outlined text-text-muted dark:text-gray-400 transition-colors duration-300">{item.icon}</span>
                </div>
                <div className="font-bold text-sm text-text-muted dark:text-gray-400 transition-colors duration-300">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6 bg-bg-base dark:bg-dark-base shadow-[0_-10px_20px_rgba(200,206,221,0.3)] dark:shadow-[0_-10px_20px_rgba(14,15,17,0.5)] transition-all duration-300 mt-auto z-10 relative">
        <div className="font-headline-md text-xl font-bold text-text-main dark:text-white transition-colors duration-300">ThinkQuest</div>
        <div className="text-text-muted dark:text-gray-400 font-body-md text-sm transition-colors duration-300 text-center">
          © 2024 ThinkQuest Olympiad. Powered by Cosmic Intelligence.
        </div>
        <div className="flex gap-6">
          <a className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-[#9e70ff] transition-colors font-medium text-sm" href="#">Support</a>
          <a className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-[#9e70ff] transition-colors font-medium text-sm" href="#">Privacy Policy</a>
          <a className="text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-[#9e70ff] transition-colors font-medium text-sm" href="#">Terms of Service</a>
        </div>
      </footer>

      {activeQuiz && <OlympiadEnglishQuiz user={user} subject={activeQuiz} onClose={() => setActiveQuiz(null)} />}
    </div>
  );
}
