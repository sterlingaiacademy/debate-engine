import re

with open('src/pages/SpeechAnalysis.jsx', 'r') as f:
    content = f.read()

renders_idx = content.find('  // RENDERS')
if renders_idx == -1:
    print("Could not find // RENDERS")
    exit(1)

head = content[:renders_idx]

tail = """  // RENDERS
  return (
    <div style={{ minHeight: '100vh', background: '#0B131F', color: '#fff', padding: '1rem', paddingBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(11,19,31,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(11,19,31,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        
        {/* Top Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {view !== 'selection' && (
              <button 
                onClick={() => { playSound('click'); setView('selection'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
              >
                <ArrowLeft size={20} /> Speech Analysis
              </button>
            )}
            {view === 'selection' && (
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0' }}>Speech Analysis</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {view === 'selection' && (
              <button 
                onClick={() => { playSound('click'); setView('history'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <History size={16} /> My History
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#111C2A', padding: '0.5rem 1rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>{user?.name || user?.username || 'Student'}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{user?.studentId || 'Speaker'}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 12, color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {/* VIEW: SELECTION */}
        {view === 'selection' && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                Select a Topic
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                Choose from below or type your own. You'll get 2 minutes to prep.
              </p>
            </div>

            <div style={{ background: '#111C2A', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <input 
                  type="text" 
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="Type your own custom topic..."
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.2), inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                />
                <button 
                  onClick={() => { playSound('click'); handleTopicSelect(); }}
                  disabled={!customTopic.trim()}
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #38bdf8)', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: customTopic.trim() ? 'pointer' : 'not-allowed', opacity: customTopic.trim() ? 1 : 0.5, transition: 'all 0.2s', boxShadow: customTopic.trim() ? '0 8px 16px rgba(79, 70, 229, 0.3)' : 'none' }}
                  onMouseEnter={e => { if(customTopic.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={e => { if(customTopic.trim()) { e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  Start
                </button>
              </div>

              <h3 style={{ marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                Or choose a predefined topic
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {DEFAULT_TOPICS.map((t, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { playSound('click'); handleTopicSelect(t); }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: 12, cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}
                    onMouseEnter={e => { 
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; 
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => { 
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; 
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PREP */}
        {view === 'prep' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Preparing to speak on</div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600 }}>{selectedTopic}</h2>
            </div>
            
            <div style={{ background: '#111C2A', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
              <div style={{ margin: '0 auto 2rem', width: 'fit-content', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 2rem', borderRadius: 99, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                <Clock size={24} /> {formatTime(prepTime)}
              </div>

              {hintsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
                  <Loader size={32} color="#38bdf8" style={{ animation: 'spin 2s linear infinite' }} />
                  <p style={{ color: '#94a3b8' }}>Generating AI hints to help you prepare...</p>
                </div>
              ) : prepHints && (
                <div style={{ textAlign: 'left', margin: '2rem auto 0' }}>
                  <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <Lightbulb size={18} color="#38bdf8" /> Key Points to Hit
                  </h3>
                  <ul style={{ color: '#cbd5e1', lineHeight: 1.6, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                    {prepHints.points?.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>

                  <div style={{ background: 'linear-gradient(145deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.02))', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.25rem', borderRadius: 12, color: '#e0f2fe', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, marginTop: 2, color: '#38bdf8' }}><AlertTriangle size={20} /></div>
                    <div style={{ lineHeight: 1.5 }}><strong style={{ color: '#38bdf8' }}>Speaking Tip:</strong> {prepHints.tip}</div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => { playSound('click'); startCountdown(); }}
                style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '0.85rem 2.5rem', borderRadius: 99, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Skip Prep & Start Now
              </button>
            </div>
          </div>
        )}

        {/* VIEW: COUNTDOWN */}
        {view === 'countdown' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', animation: 'zoomIn 0.5s ease-out' }}>
            <div style={{ fontSize: '12rem', fontWeight: 900, color: '#38bdf8', textShadow: '0 0 60px rgba(56,189,248,0.5)', lineHeight: 1 }}>
              {countdown}
            </div>
            <h2 style={{ color: '#94a3b8', fontSize: '1.5rem', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: 2 }}>Get Ready</h2>
          </div>
        )}

        {/* VIEW: RECORDING */}
        {view === 'recording' && (
          <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background: '#111C2A', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', borderRadius: 99, color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                <span style={{ display: 'block', width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                Recording Live
              </div>

              <div style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem' }}>
                Topic: <span style={{ color: '#fff', fontWeight: 600 }}>{selectedTopic}</span>
              </div>

              <div style={{ fontSize: '5rem', fontWeight: 300, fontFamily: 'monospace', color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.2)', marginBottom: '3rem', lineHeight: 1 }}>
                {formatTime(recordingTime)}
              </div>
              
              <button 
                onClick={() => { playSound('click'); stopRecording(); }}
                style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', border: 'none', color: '#fff', width: 80, height: 80, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Square size={32} fill="currentColor" />
              </button>
              
              <div ref={transcriptContainerRef} style={{ marginTop: '4rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', minHeight: 120, maxHeight: '30vh', overflowY: 'auto', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>
                  Live Transcript
                </h4>
                <p style={{ color: liveTranscript ? '#cbd5e1' : '#475569', lineHeight: 1.6, fontSize: '1.05rem', fontStyle: liveTranscript ? 'normal' : 'italic', wordBreak: 'break-word', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {liveTranscript || "Listening... Your speech will appear here in real-time."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROCESSING */}
        {view === 'processing' && (
          <div style={{ background: '#111C2A', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '6rem 2rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxWidth: 600, margin: '0 auto' }}>
            <Loader size={48} color="#38bdf8" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 2rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#e2e8f0', marginBottom: '0.75rem', fontWeight: 600 }}>Analyzing Performance...</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Evaluating pacing, clarity, and structural elements of your speech.</p>
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === 'result' && analysis && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.25rem' }}>Topic</div>
              <h2 style={{ fontSize: '1.4rem', color: '#e2e8f0', margin: 0, fontWeight: 600 }}>{selectedTopic}</h2>
            </div>

            {/* TOP METRICS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              
              {/* Overall Score */}
              <div style={{ background: '#111C2A', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(10px)' }}></div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Overall Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{analysis.analysis.score}</div>
                  <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>/ 100</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <Activity size={14} /> Analysis Complete
                </div>
              </div>

              {/* Pacing */}
              <div style={{ background: '#111C2A', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Pacing (WPM)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1, marginTop: 'auto' }}>{analysis.metrics.wpm}</div>
                <div style={{ fontSize: '0.8rem', color: analysis.metrics.wpm >= 120 && analysis.metrics.wpm <= 160 ? '#10b981' : '#f59e0b', marginTop: '0.5rem' }}>
                  {analysis.metrics.wpm < 120 ? 'Too slow' : analysis.metrics.wpm > 160 ? 'Too fast' : 'Ideal speed'}
                </div>
              </div>

              {/* Filler Words */}
              <div style={{ background: '#111C2A', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Filler Words</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: analysis.metrics.fillerWordsCount > 5 ? '#ef4444' : '#10b981', lineHeight: 1, marginTop: 'auto' }}>{analysis.metrics.fillerWordsCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Detected um/uhs</div>
              </div>

              {/* Clarity */}
              {analysis.analysis.audioAnalytics && (
                <div style={{ background: '#111C2A', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Clarity Level</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: analysis.analysis.audioAnalytics.clarityLevel === 'Clear' ? '#10b981' : (analysis.analysis.audioAnalytics.clarityLevel === 'Unintelligible' || analysis.analysis.audioAnalytics.clarityLevel === 'Incomprehensible') ? '#ef4444' : '#f59e0b', lineHeight: 1.2, marginTop: 'auto' }}>
                    {analysis.analysis.audioAnalytics.clarityLevel}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Articulation</div>
                </div>
              )}
            </div>

            {/* MID ROW: Bar Chart & Strengths Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              
              {/* Detailed Breakdown Chart */}
              {analysis.analysis.scores && (
                <div style={{ background: '#111C2A', borderRadius: 20, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '1.5rem', fontWeight: 600 }}>Score Breakdown</h3>
                  <div className="custom-scrollbar" style={{ width: '100%', height: 280, overflowX: 'auto' }}>
                    <div style={{ minWidth: 600, height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Content', percentage: (analysis.analysis.scores.contentAndIdeas / 20) * 100 },
                            { name: 'Relevance', percentage: (analysis.analysis.scores.relevanceToTopic / 15) * 100 },
                            { name: 'Organization', percentage: (analysis.analysis.scores.organisationAndStructure / 15) * 100 },
                            { name: 'Fluency', percentage: (analysis.analysis.scores.fluency / 15) * 100 },
                            { name: 'Voice', percentage: (analysis.analysis.scores.voiceModulationAndExpression / 10) * 100 },
                            { name: 'Vocabulary', percentage: (analysis.analysis.scores.languageAndVocabulary / 10) * 100 },
                            { name: 'Clarity', percentage: (analysis.analysis.scores.pronunciationAndClarity / 10) * 100 },
                            { name: 'Time', percentage: (analysis.analysis.scores.timeManagement / 5) * 100 },
                          ]}
                          layout="vertical"
                          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                          barSize={8}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={90} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ background: 'rgba(11, 19, 31, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
                            formatter={(val) => [`${Math.round(val)}%`, 'Score']}
                          />
                          <Bar dataKey="percentage" radius={[4, 4, 4, 4]} fill="#10b981" animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STRENGTHS AND OPPORTUNITIES - Custom Box matches Image 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', background: 'transparent', borderRadius: 16, border: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '2rem', borderRight: '1px solid rgba(168, 85, 247, 0.3)', background: 'linear-gradient(180deg, rgba(17, 28, 42, 0.8), rgba(17, 28, 42, 0.95))' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Activity size={18} color="#38bdf8" /> Strengths
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {analysis.analysis.strengths.slice(0, 2).map((s, i) => (
                    <div key={i}>
                      <div style={{ color: '#d8b4fe', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.split(':')[0] || `Strength ${i+1}`}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.split(':').slice(1).join(':') || s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '2rem', background: 'linear-gradient(180deg, rgba(17, 28, 42, 0.8), rgba(17, 28, 42, 0.95))' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Lightbulb size={18} color="#94a3b8" /> Opportunities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {analysis.analysis.areasForImprovement.slice(0, 2).map((s, i) => (
                    <div key={i}>
                      <div style={{ color: '#d8b4fe', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.split(':')[0] || `Area ${i+1}`}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.split(':').slice(1).join(':') || s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Feedback and Transcript */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#111C2A', borderRadius: 20, padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h3 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '1rem', fontWeight: 600 }}>Overall Feedback</h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap', margin: 0 }}>{analysis.analysis.overallFeedback}</p>
              </div>

              <div style={{ background: '#111C2A', borderRadius: 20, padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h3 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '1rem', fontWeight: 600 }}>Speech Transcript</h3>
                <div style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }} className="custom-scrollbar">
                  {analysis.transcription || analysis.analysis.transcript || analysis.transcript || "No transcript available."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: HISTORY */}
        {view === 'history' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Past Assessments</h1>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Review your previous speech analytics</div>
            </div>
            
            {historyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <Loader size={32} color="#38bdf8" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ background: '#111C2A', border: '1px dashed rgba(255,255,255,0.1)', padding: '4rem 2rem', textAlign: 'center', borderRadius: 24, color: '#94a3b8' }}>
                You haven't recorded any speeches yet. Go back and select a topic to get started!
              </div>
            ) : (
              <div style={{ background: '#111C2A', borderRadius: 20, borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                
                {/* Table Header style */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  <div>Topic</div>
                  <div>Date</div>
                  <div>Pacing</div>
                  <div style={{ textAlign: 'right' }}>Score</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {history.map((h, i) => (
                    <div key={i} 
                         onClick={() => {
                            let parsedScores = h.detailed_scores;
                            if (typeof parsedScores === 'string') {
                              try { parsedScores = JSON.parse(parsedScores); } catch(e){}
                            }
                            let parsedStrengths = h.strengths;
                            if (typeof parsedStrengths === 'string') {
                              try { parsedStrengths = JSON.parse(parsedStrengths); } catch(e){}
                            }
                            let parsedAreas = h.areas_for_improvement;
                            if (typeof parsedAreas === 'string') {
                              try { parsedAreas = JSON.parse(parsedAreas); } catch(e){}
                            }
  
                            setAnalysis({
                              transcription: h.transcript,
                              metrics: {
                                wpm: h.wpm,
                                fillerWordsCount: h.filler_words || 0,
                                durationSeconds: 0
                              },
                              analysis: {
                                score: h.score,
                                scores: parsedScores || {},
                                strengths: parsedStrengths || [],
                                areasForImprovement: parsedAreas || [],
                                overallFeedback: h.overall_feedback,
                                audioAnalytics: {
                                  longPauses: 0,
                                  clarityLevel: 'N/A',
                                  voiceVariation: 'N/A'
                                }
                              }
                            });
                            setSelectedTopic(h.topic);
                            setView('result');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                         }}
                         style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', alignItems: 'center' }}
                         onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                         onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', paddingRight: '1rem' }}>{h.topic}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{new Date(h.created_at).toLocaleDateString()}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{h.wpm} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>WPM</span></div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: 99, fontWeight: 700, fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          {h.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open('src/pages/SpeechAnalysis.jsx', 'w') as f:
    f.write(head + tail)

print("Replaced successfully")
