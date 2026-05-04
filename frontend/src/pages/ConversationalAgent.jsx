import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Timer as TimerIcon, Play, MessageSquare } from 'lucide-react';
import { Conversation } from '@11labs/client';
import AIAvatar from '../components/AIAvatar';
import GeminiWave from '../components/GeminiWave';
import TranscriptView from '../components/TranscriptView';
import TypewriterText from '../components/TypewriterText';
import { API_BASE } from '../api';



export default function ConversationalAgent({ user }) {
  const getAgentId = () => {
    if (user?.classLevel === 'Level 3') return 'agent_3301knv3b67jejpsydj6bt2tf4fc';
    if (user?.classLevel === 'Level 4') return 'agent_7901knvcn8kkf709kzya6d9ky6yw';
    if (user?.classLevel === 'Level 5') return 'agent_3001knvea7y3fn3tdq0r0aczs2h4';
    return 'agent_3301knv3b67jejpsydj6bt2tf4fc';
  };
  const agentId = getAgentId();

  
  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user.classLevel);
  const [timer, setTimer] = useState(600);
  const [isActive, setIsActive] = useState(false);
  const [screenSleep, setScreenSleep] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const transcriptRef = useRef([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('select_topic');
  const TOPICS = [
    { id: 1, title: 'Chit Chat', desc: 'Just have a casual talk with your AI tutor.', icon: '💬', color: '#10b981' },
    { id: 2, title: 'Doubt Clearing', desc: 'Ask questions and clear up any doubts.', icon: '🔍', color: '#f59e0b' },
    { id: 3, title: 'Quiz', desc: 'Test yourself with a quick quiz.', icon: '🎓', color: '#8b5cf6' }
  ];
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null); // idle | connecting | config | active | ended | error | out_of_time
  const [maxMinutesAvailable, setMaxMinutesAvailable] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [customValue, setCustomValue] = useState('');
  const conversationRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const currentTimerRef = useRef(0);
  const hasStartedRef = useRef(false);
  const conversationIdRef = useRef(null);
  const initialTimerRef = useRef(600);
  const initialDailyRemainingRef = useRef(600);
  const navigate = useNavigate();

  const wakeLockRef = useRef(null);

  useEffect(() => {
    let active = true;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive && active) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('WakeLock Error:', err.message);
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }

    return () => {
      active = false;
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isActive]);

  // Activity monitor for Screen Sleep (Level 1 and 2 only)
  useEffect(() => {
    if (!isActive || !isJunior) {
      setScreenSleep(false);
      return;
    }

    let sleepTimer;
    const resetSleep = () => {
      setScreenSleep(false);
      clearTimeout(sleepTimer);
      sleepTimer = setTimeout(() => {
        setScreenSleep(true);
      }, 15000); // 15 seconds without moving the mouse
    };

    // Start initial timer
    resetSleep();

    // Listeners to wake up / stay awake
    window.addEventListener('mousemove', resetSleep);
    window.addEventListener('touchstart', resetSleep);
    window.addEventListener('keydown', resetSleep);

    return () => {
      clearTimeout(sleepTimer);
      window.removeEventListener('mousemove', resetSleep);
      window.removeEventListener('touchstart', resetSleep);
      window.removeEventListener('keydown', resetSleep);
    };
  }, [isActive, isJunior]);

  // auto-scroll placeholder for future logic if needed
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // countdown with heartbeat sync
  useEffect(() => {
    if (!isActive || !user?.studentId) return;

    const startTime = Date.now();
    let lastSyncTime = startTime;
    const startTimerValue = initialTimerRef.current;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const newTime = Math.max(0, startTimerValue - elapsedSeconds);
      
      setTimer(newTime);
      currentTimerRef.current = newTime;

      const timeSinceLastSync = Math.floor((now - lastSyncTime) / 1000);
      
      // Background sync every 15 real seconds
      if (timeSinceLastSync >= 15) {
        fetch(`${API_BASE}/api/time-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user.studentId, usedSeconds: timeSinceLastSync, isPersona: true })
        }).catch(e => console.error('Time sync failed', e));
        
        lastSyncTime = now;
      }

      if (newTime <= 0) {
        clearInterval(timerRef.current);
        handleEndDebate();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Robust connection handling for React Strict Mode and fast navigation
  useEffect(() => {
    let isTerminated = false;

    const fetchLimits = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/time-limits/${user.studentId}`);
        if (isTerminated) return;
        if (res.ok) {
          const data = await res.json();
          const remain = data.remainingPersona;
          if (remain <= 0) {
            setStatus('out_of_time');
            return;
          }
          initialDailyRemainingRef.current = remain;
          setMaxMinutesAvailable(Math.floor(remain / 60));
          setStatus('select_topic');
        }
      } catch(err) {
        console.error('Failed to fetch time limits', err);
        if (!isTerminated) setStatus('error');
      }
    };

    if (agentId) fetchLimits();

    return () => {
      isTerminated = true;
    };
  }, [agentId, user?.studentId]);

  const handleTopicSelect = (topic) => { setSelectedTopic(topic); setStatus('config'); };

  const startDebateSession = async () => {
    setStatus('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup chosen timer limit
      const limitSeconds = selectedDuration === 'custom' ? parseInt(customValue, 10) * 60 : selectedDuration * 60;
      const sessionMax = Math.min(limitSeconds, initialDailyRemainingRef.current);
      initialTimerRef.current = sessionMax;
      currentTimerRef.current = sessionMax;
      setTimer(sessionMax);

      // Force-kill any lingering background SDK instances
      if (window._activeElevenLabsSessions) {
        window._activeElevenLabsSessions.forEach(s => { try { s.endSession(); } catch(e){} });
      }
      window._activeElevenLabsSessions = [];

      let localSession = await Conversation.startSession({
        agentId,
        dynamicVariables: { topic: selectedTopic?.title || 'General' },
        onConnect: () => {
          setStatus('active');
          setIsActive(true);
          try {
            const convId = localSession?.getId?.() || localSession?.id || null;
            if (convId) conversationIdRef.current = convId;
          } catch (e) {}
        },
        onDisconnect: () => {
          setIsActive(false); 
          setStatus('ended');
          setTimeout(() => {
            handleEndDebate();
          }, 500);
        },
        onMessage: (msg) => { 
          setTranscript(p => {
            const newT = [...p, { role: msg.source, text: msg.message }];
            transcriptRef.current = newT;
            return newT;
          });
        },
        onError: (err) => { setStatus('error'); },
        onModeChange: (m) => { setIsSpeaking(m.mode === 'speaking'); }
      });

      window._activeElevenLabsSessions.push(localSession);
      conversationRef.current = localSession;
    } catch (err) {
      setStatus('error');
    }
  };

  const toggleMute = async () => {
    try {
      if (conversationRef.current) {
        if (typeof conversationRef.current.setMicMuted === 'function') {
          conversationRef.current.setMicMuted(!isMuted);
        }
      }
      setIsMuted(p => !p);
    } catch(e) {
      console.warn("Mute overlay toggle fell back to mock", e);
      setIsMuted(p => !p);
    }
  };

  
  const handleEndDebate = async () => {
    clearInterval(timerRef.current);
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch(e) {}
    }
    setIsActive(false);
    setStatus('ended');

    // Sync any remaining unsaved seconds before ending
    const elapsedTotal = initialTimerRef.current - currentTimerRef.current;
    const alreadySynced = Math.floor(elapsedTotal / 15) * 15;
    const unsavedSeconds = elapsedTotal - alreadySynced;
    if (unsavedSeconds > 0) {
      fetch(`${API_BASE}/api/time-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.studentId, usedSeconds: unsavedSeconds, isPersona: true })
      }).catch(e => console.error('Final time sync failed', e));
    }

    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };
const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerPct = (timer / initialTimerRef.current) * 100;
  const timerWarning = timer < 60;

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100vh', margin: 0, padding: 0, overflowY: 'auto' }}>
      {status === 'select_topic' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>What do you feel like doing?</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px' }}>
            Whether you want to learn something new, clear up a doubt, or test yourself with a quiz — I've got you.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '900px' }}>
            {TOPICS.map(topic => (
              <div 
                key={topic.id}
                onMouseEnter={() => setHoveredTopic(topic.id)}
                onMouseLeave={() => setHoveredTopic(null)}
                onClick={() => handleTopicSelect(topic)}
                style={{
                  background: 'var(--bg-primary)', 
                  border: `2px solid ${hoveredTopic === topic.id ? topic.color : 'var(--border)'}`, 
                  borderRadius: '24px', 
                  padding: '2rem 1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease', 
                  transform: hoveredTopic === topic.id ? 'translateY(-6px)' : 'none', 
                  boxShadow: hoveredTopic === topic.id ? `0 16px 32px ${topic.color}20` : 'var(--shadow-md)'
                }}
              >
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: `${topic.color}15`, color: topic.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  {topic.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{topic.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Chat Window */}
      {status !== 'select_topic' && (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div style={{ flex: 1, overflowY: isActive ? 'hidden' : 'auto', padding: isActive ? 0 : '1.5rem', display: 'flex', flexDirection: 'column', gap: isActive ? 0 : '1rem' }}>
          
          {/* Time Limit Setup UI */}
          {status === 'config' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.5s' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Choose Practice Time Limit</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px' }}>
                How long do you want to debate today?
              </p>
              
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)',
                padding: '1.25rem 2rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)',
                marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7c3aed' }}>Daily Remaining Pool</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{maxMinutesAvailable} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>mins</span></span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.75rem', width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
                {[5, 10, 15].map(preset => {
                  const isDisabled = preset > maxMinutesAvailable;
                  const isSelected = selectedDuration === preset && customValue === '';
                  return (
                    <button
                      key={preset}
                      onClick={() => { setSelectedDuration(preset); setCustomValue(''); }}
                      disabled={isDisabled}
                      style={{
                        padding: '1rem 0', borderRadius: '12px', fontWeight: 700, fontSize: '1.25rem',
                        transition: 'all 0.2s', border: '2px solid',
                        background: isDisabled ? 'var(--bg-secondary)' : isSelected ? 'var(--accent)' : 'transparent',
                        borderColor: isDisabled ? 'var(--border)' : isSelected ? 'var(--accent)' : 'var(--border)',
                        color: isDisabled ? 'var(--text-muted)' : isSelected ? '#fff' : 'var(--text-primary)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.5 : 1
                      }}
                    >
                      {preset}m
                    </button>
                  );
                })}
                <button
                  onClick={() => setSelectedDuration('custom')}
                  style={{
                        padding: '1rem 0', borderRadius: '12px', fontWeight: 700, fontSize: '1.25rem',
                        transition: 'all 0.2s', border: '2px solid',
                        background: selectedDuration === 'custom' ? 'var(--accent)' : 'transparent',
                        borderColor: selectedDuration === 'custom' ? 'var(--accent)' : 'var(--border)',
                        color: selectedDuration === 'custom' ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer'
                  }}
                >
                  Custom
                </button>
              </div>

              {selectedDuration === 'custom' && (
                <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '300px', animation: 'fadeIn 0.3s' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{customValue || 1}<span style={{fontSize: '1.25rem', color: 'var(--text-secondary)'}}>m</span></span>
                  <input 
                    type="range" min={1} max={maxMinutesAvailable} 
                    value={customValue || 1} onChange={(e) => {
                      let val = parseInt(e.target.value, 10);
                      setCustomValue(val);
                      setSelectedDuration('custom');
                    }}
                    style={{ 
                      width: '100%', cursor: 'pointer', accentColor: 'var(--accent)',
                      height: '8px', borderRadius: '4px', appearance: 'none', background: 'rgba(139, 92, 246, 0.2)'
                    }} 
                  />
                </div>
              )}

              <button 
                onClick={startDebateSession} 
                disabled={!selectedDuration || (selectedDuration === 'custom' && (!customValue || customValue < 1))}
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', maxWidth: '300px', padding: '1.25rem', fontSize: '1.25rem', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)' }}
              >
                <Play fill="#fff" size={24} /> Start Debate
              </button>
            </div>
          )}
          
          {/* Connecting State */}
          {transcript.length === 0 && (status === 'connecting' || status === 'idle') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', animation: 'fadeIn 0.5s' }}>
              <AIAvatar isJunior={isJunior} isSpeaking={false} size={120} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                <p className="text-secondary font-semibold">Connecting to your AI Tutor…</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1.5rem', gap: '1.25rem' }}>
              <div className="alert alert-error" style={{ maxWidth: '400px' }}>
                <strong>Connection Failed:</strong> Could not connect to AI agent. Please check your microphone permissions and try again.
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
              </div>
            </div>
          )}

          {/* Out of Time State */}
          {status === 'out_of_time' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1.5rem', gap: '1.25rem' }}>
              <AIAvatar isJunior={isJunior} isSpeaking={false} size={120} />
              <div className="alert alert-warning" style={{ maxWidth: '400px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>
                <strong>Time's Up! ⏱️</strong><br/>
                You have reached your 10-minute daily debate limit. Come back tomorrow to continue practicing!
              </div>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
            </div>
          )}

          {/* Evaluating State */}
          {status === 'ended' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', animation: 'fadeIn 0.5s' }}>
              <div style={{ position: 'relative' }}>
                <AIAvatar isJunior={isJunior} isSpeaking={false} size={140} />
                <div style={{
                  position: 'absolute', top: -15, left: -15, right: -15, bottom: -15,
                  border: '4px solid rgba(139,92,246,0.1)',
                  borderTopColor: 'var(--accent)',
                  borderRightColor: 'var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Session Ended</h3>
                <p className="text-secondary font-semibold" style={{ fontSize: '1.1rem' }}>Returning to dashboard...</p>
              </div>
            </div>
          )}

          {/* Active Debate View - Centralized Call UI */}
          {isActive && (
            <div className="animate-fade-in" style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', gap: '2rem',
              position: 'relative', width: '100%', height: '100%',
            }}>
              
              {/* Screen Sleep Overlay for Kids */}
              {isJunior && screenSleep && (
                <div className="animate-fade-in" style={{
                  position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'none' /* Hides mouse until they move it */
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem 4rem', height: '140px',
                    border: `3px solid ${timerWarning ? '#ef4444' : 'rgba(139,92,246,0.3)'}`,
                    background: timerWarning ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '40px',
                    color: timerWarning ? '#ef4444' : '#fff',
                    boxShadow: '0 0 40px rgba(139,92,246,0.15)'
                  }}>
                    <span style={{ fontSize: '5rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }} className={timerWarning ? 'animate-pulse' : ''}>
                      {formatTime(timer)}
                    </span>
                  </div>
                  <p className="animate-pulse" style={{ marginTop: '3rem', color: '#475569', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Move mouse to wake up
                  </p>
                </div>
              )}
              
              {!isJunior && <GeminiWave isSpeaking={isSpeaking} />}

              <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: (!isJunior && showTranscript) ? '0' : '15vh' }}>
                
                {/* Transcript View Overlay (Seniors) */}
                {!isJunior && showTranscript && (
                  <TranscriptView transcript={transcript} agentName="G FORCE" />
                )}

                {isJunior && (
                  <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <AIAvatar isJunior={isJunior} isSpeaking={isSpeaking} interactionCount={transcript.length} size={window.innerWidth < 640 ? 140 : 240} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {isSpeaking ? (isJunior ? 'AI is speaking…' : 'G FORCE is speaking...') : 'Listening carefully…'}
                  </h3>
                  <div className="waveform" style={{ opacity: isActive ? 1 : 0.3, margin: '0.5rem 0', height: '24px', gap: '4px' }}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="waveform-bar" style={{ height: isSpeaking ? '24px' : '6px', background: isJunior ? 'var(--accent)' : '#00d4ff', minWidth: '6px' }} />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', marginBottom: '2rem', zIndex: 10,
                background: isJunior ? 'rgba(255,255,255,0.5)' : 'rgba(30,41,59,0.5)', 
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                padding: '0.75rem', borderRadius: '40px', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: isJunior ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 1.25rem', height: '56px',
                  border: `2px solid ${timerWarning ? '#ef4444' : (isJunior ? 'rgba(139,92,246,0.4)' : 'rgba(0,212,255,0.3)')}`,
                  background: timerWarning ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '99px',
                  color: timerWarning ? '#ef4444' : (isJunior ? '#1e293b' : '#fff'),
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }} className={timerWarning ? 'animate-pulse' : ''}>
                    {formatTime(timer)}
                  </span>
                </div>

                {!isJunior && (
                  <button onClick={() => setShowTranscript(p => !p)} className="btn" style={{ 
                    background: showTranscript ? 'var(--accent)' : 'var(--bg-secondary)', 
                    color: showTranscript ? '#fff' : 'var(--text-primary)', border: 'none',
                    borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }} title="Toggle Transcript">
                    <MessageSquare size={24} />
                  </button>
                )}

                {!isJunior && (
                  <button onClick={toggleMute} className="btn" style={{ 
                    background: isMuted ? '#ef4444' : 'var(--bg-secondary)', 
                    color: isMuted ? '#fff' : 'var(--text-primary)', border: 'none',
                    borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }} title={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                )}

                <button onClick={handleEndDebate} className="btn" style={{ 
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }} title="End Call">
                  <PhoneOff size={24} />
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
      )}
    </div>
    </>
  );
}