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
    <div className="fixed inset-0 z-[100] bg-[#191b1f]/80 backdrop-blur-sm overflow-y-auto text-white">
      <div className="min-h-full flex flex-col justify-center p-4 sm:p-8 py-12">
        <div className="bg-[#292d32] mx-auto rounded-[28px] w-full max-w-[680px] relative overflow-hidden flex flex-col" style={{ boxShadow: '8px 8px 16px #191b1f, -8px -8px 16px #393f45' }}>
          {/* Top Color Bar */}
          <div className="h-[3px] w-full absolute top-0 left-0" style={gradientStyle}></div>
          
          {/* Header */}
          <div className="p-6 md:p-8 pb-0 pt-8 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-white/50 tracking-wider uppercase mb-1">ThinkQuest Olympiad · {subject}</div>
              <h1 className="text-2xl md:text-3xl font-extrabold" style={gradientTextStyle}>{quiz.quiz_name}</h1>
            </div>
            <div className="flex gap-4">
              <div className="bg-[#292d32] rounded-full px-4 py-1.5 flex items-center gap-1.5 hidden sm:flex" style={{ boxShadow: '4px 4px 8px #191b1f, -4px -4px 8px #393f45' }}>
                <span className="material-symbols-outlined text-[16px] text-white/70">format_list_numbered</span>
                <span className="text-sm text-white/90 font-bold">{answered}/{total}</span>
              </div>
              <div className={`bg-[#292d32] rounded-full px-4 py-1.5 flex items-center gap-1.5 ${timeLeft <= 5 && !isRevealed ? 'text-red-400 danger-pulse' : 'text-red-400'}`} style={{ boxShadow: '4px 4px 8px #191b1f, -4px -4px 8px #393f45' }}>
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span className="text-sm font-bold">{Math.floor(timeLeft/60).toString().padStart(2, '0')}:{(timeLeft%60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Navigator */}
          <div className="px-6 md:px-8 py-6 border-b border-white/[0.03]">
            <div className="h-[6px] bg-[#292d32] rounded-full w-full mb-8 overflow-hidden p-[1px]" style={{ boxShadow: 'inset 6px 6px 12px #191b1f, inset -6px -6px 12px #393f45' }}>
              <div className="h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(238,9,121,0.5)]" style={{ width: `${((current+1)/total)*100}%`, ...gradientStyle }}></div>
            </div>
            
            {/* Question Navigator */}
            <div className="flex justify-between items-center px-2 flex-wrap gap-2">
              {quiz.questions.map((_, i) => {
                const isCur = i === current;
                const isAns = answers[i] !== undefined;
                const isOK = isAns && revealed[i] && answers[i] === quiz.questions[i].correct;
                const isBAD = revealed[i] && answers[i] !== quiz.questions[i].correct;
                
                let elStyle = { boxShadow: '4px 4px 8px #191b1f, -4px -4px 8px #393f45' };
                let elClass = "w-[32px] h-[32px] rounded-full bg-[#292d32] flex items-center justify-center ";

                if (isCur) {
                  elStyle.boxShadow = 'inset 6px 6px 12px #191b1f, inset -6px -6px 12px #393f45';
                  elClass += "font-bold text-sm";
                  return (
                    <div key={i} className={elClass} style={elStyle}>
                      <span style={gradientTextStyle}>{i + 1}</span>
                    </div>
                  );
                }
                if (isOK) {
                  elClass += "text-green-400";
                  return (
                    <div key={i} className={elClass} style={elStyle}>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                  );
                }
                if (isBAD) {
                  elClass += "text-red-400";
                  return (
                    <div key={i} className={elClass} style={elStyle}>
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </div>
                  );
                }
                if (isAns) {
                   elClass += "text-white font-medium text-xs";
                   return (
                    <div key={i} className={elClass} style={elStyle}>
                      {i + 1}
                    </div>
                  );
                }
                
                elClass += `text-white/40 font-medium text-xs ${Math.abs(current - i) > 3 ? 'hidden sm:flex' : 'flex'}`;
                return (
                  <div key={i} className={elClass} style={elStyle}>
                    {i + 1}
                  </div>
                );
              })}
              {total > 8 && <div className="text-white/30 material-symbols-outlined text-[16px] w-[32px] h-[32px] flex items-center justify-center hidden sm:flex">more_horiz</div>}
            </div>
          </div>

          {/* Question Area */}
          <div className="p-6 md:p-8 flex-1 flex flex-col gap-8 transition-opacity duration-200" style={{ opacity: animate ? 1 : 0 }}>
            {/* Question Card */}
            <div className="bg-[#292d32] rounded-[20px] p-6 relative overflow-hidden" style={{ boxShadow: 'inset 6px 6px 12px #191b1f, inset -6px -6px 12px #393f45' }}>
              <div className="absolute left-0 top-0 bottom-0 w-[4px] opacity-80" style={gradientStyle}></div>
              <p className="text-lg text-white/90 leading-relaxed pl-3 font-medium whitespace-pre-wrap">
                {q.question}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-4">
              {q.options.map(opt => {
                const isSelected = selectedLetter === opt.letter;
                const isCorrectOpt = isRevealed && opt.letter === correctLetter;
                const isWrongOpt = isRevealed && isSelected && opt.letter !== correctLetter;
                
                let containerClass = "group relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 bg-[#292d32] ";
                let containerStyle = {};
                let letterClass = "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 transition-colors ";
                let letterStyle = {};
                let textClass = "text-base font-medium ";
                
                if (isCorrectOpt) {
                  containerStyle.boxShadow = 'inset 6px 6px 12px #191b1f, inset -6px -6px 12px #393f45';
                  containerClass += "border border-green-500/20";
                  letterStyle.boxShadow = 'inset 4px 4px 8px #191b1f, inset -4px -4px 8px #393f45';
                  letterClass += "bg-green-500/20 text-green-400";
                  textClass += "text-green-400 font-bold";
                } else if (isWrongOpt) {
                  containerStyle.boxShadow = 'inset 6px 6px 12px #191b1f, inset -6px -6px 12px #393f45';
                  containerClass += "border border-red-500/20";
                  letterStyle.boxShadow = 'inset 4px 4px 8px #191b1f, inset -4px -4px 8px #393f45';
                  letterClass += "bg-red-500/20 text-red-400";
                  textClass += "text-red-400 font-bold";
                } else if (isSelected) {
                  containerStyle.boxShadow = 'inset 6px 6px 12px #191b1f, inset -6px -6px 12px #393f45';
                  letterClass += "text-white shadow-[0_4px_12px_rgba(238,9,121,0.4)]"; 
                  textClass += "text-white font-bold";
                } else {
                  containerStyle.boxShadow = '8px 8px 16px #191b1f, -8px -8px 16px #393f45';
                  containerClass += "hover:shadow-[4px_4px_8px_#191b1f,-4px_-4px_8px_#393f45] " + (isRevealed ? "opacity-50 cursor-default" : "");
                  letterStyle.boxShadow = '4px 4px 8px #191b1f, -4px -4px 8px #393f45';
                  letterClass += "bg-[#292d32] text-white/60 group-hover:text-white/80";
                  textClass += "text-white/80";
                }

                return (
                  <label key={opt.letter} className={containerClass} style={containerStyle}>
                    <input type="radio" name={`q${current}`} className="hidden" checked={isSelected} onChange={() => handleSelect(opt.letter)} disabled={isRevealed} />
                    <div className={letterClass} style={isSelected && !isRevealed ? { ...gradientStyle, ...letterStyle } : letterStyle}>
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
          <div className="p-6 md:p-8 pt-4 pb-8 flex justify-between items-center z-10">
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors font-medium text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">close</span> Exit
            </button>
            
            {isLastQ ? (
              <button 
                onClick={handleSubmit} 
                disabled={submitting || !nextEnabled}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${nextEnabled && !submitting ? 'text-white hover:opacity-90 active:scale-[0.98]' : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-white/30 cursor-not-allowed'}`}
                style={nextEnabled && !submitting ? { ...gradientStyle, boxShadow: '8px 8px 16px #191b1f, -8px -8px 16px #393f45' } : {}}
              >
                {nextLabel()}
              </button>
            ) : (
              <button 
                onClick={handleNext} 
                disabled={!nextEnabled}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${nextEnabled ? 'text-white hover:opacity-90 active:scale-[0.98]' : 'bg-[#292d32] text-white/30 cursor-not-allowed border border-white/5'}`}
                style={nextEnabled ? { ...gradientStyle, boxShadow: '8px 8px 16px #191b1f, -8px -8px 16px #393f45' } : {}}
              >
                {nextLabel()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
