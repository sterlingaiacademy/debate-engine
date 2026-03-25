import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, ArrowLeft, Play, Timer as TimerIcon } from 'lucide-react';
import { Conversation } from '@11labs/client';
import AIAvatar from '../components/AIAvatar';

export default function PersonaDebate({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const personaName = searchParams.get('name') || 'Historical Figure';
  const personaImage = searchParams.get('image') || '/gandhi_avatar_1773899586119.png';
  const agentId = searchParams.get('agentId');

  const [transcript, setTranscript] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | config | active | ended | error | out_of_time
  const [maxMinutesAvailable, setMaxMinutesAvailable] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [customValue, setCustomValue] = useState('');
  const conversationRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const currentTimerRef = useRef(0);

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3'].includes(user?.classLevel);
  const [timer, setTimer] = useState(1800);
  const initialTimerRef = useRef(1800);
  const initialDailyRemainingRef = useRef(1800);
  const timerRef = useRef(null);
  const isActive = status === 'active';

  // Timer effect with heartbeat logic
  useEffect(() => {
    if (!isActive || !agentId) return;

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
        fetch('/api/time-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user?.studentId, usedSeconds: timeSinceLastSync, isPersona: true })
        }).catch(e => console.error('Persona time sync failed', e));
        
        lastSyncTime = now;
      }

      if (newTime <= 0) {
        clearInterval(timerRef.current);
        handleEnd();
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerWarning = timer < 60;

  // scroll chat
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Screen Saver State
  const [isAwake, setIsAwake] = useState(true);
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    const handleActivity = () => {
      setIsAwake(true);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => setIsAwake(false), 10000); // 10 seconds to sleep
    };

    handleActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Robust connection handling for React Strict Mode and fast navigation
  useEffect(() => {
    let isTerminated = false;

    const fetchLimits = async () => {
      setStatus('connecting');
      try {
        const res = await fetch(`/api/time-limits/${user?.studentId}`);
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
          setStatus('config'); // Switch to Time Selection Modal Mode
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

  const startDebateSession = async () => {
    let localSession = null;
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

      localSession = await Conversation.startSession({
        agentId,
        onConnect: () => { setStatus('active'); },
        onDisconnect: () => { setStatus('ended'); },
        onMessage: (msg) => { setTranscript(p => [...p, { role: msg.source, text: msg.message }]); },
        onError: (err) => { setStatus('error'); },
        onModeChange: (m) => { setIsSpeaking(m.mode === 'speaking'); }
      });

      window._activeElevenLabsSessions.push(localSession);
      conversationRef.current = localSession;
    } catch (err) {
      setStatus('error');
    }
  };

  const handleEnd = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('evaluating');
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch { /* ignore */ }
    }

    // Sync any remaining unsaved seconds before ending
    const elapsedTotal = initialTimerRef.current - currentTimerRef.current;
    const alreadySynced = Math.floor(elapsedTotal / 15) * 15;
    const unsavedSeconds = Math.max(0, elapsedTotal - alreadySynced);
    if (unsavedSeconds > 0) {
      fetch('/api/time-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.studentId, usedSeconds: unsavedSeconds, isPersona: true })
      }).catch(e => console.error('Final persona time sync failed', e));
    }

    // Save persona session to update the daily time limit
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.studentId,
          debateTopic: `Persona: ${personaName}`,
          sessionDuration: initialTimerRef.current - timer,
          argumentsCount: transcript.filter(m => m.role === 'user').length,
          debateScore: 0, // Personas might not grant scores or it defaults inside
          isPersona: true
        }),
      });
    } catch (e) {
      console.error('Error saving persona session limit', e);
    }

    setTimeout(() => {
      navigate('/persona');
    }, 4500);
  };


  return (
    <>
      {/* Screen Saver Overlay */}
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#000',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', gap: '3rem',
          opacity: isAwake || !isActive ? 0 : 1,
          pointerEvents: isAwake || !isActive ? 'none' : 'auto',
          transition: 'opacity 1s ease-in-out'
        }}
      >
        {isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '10rem', fontWeight: 'bold', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', opacity: 0.8, lineHeight: 1 }}>
              {formatTime(timer)}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
              Daily Time Remaining: {formatTime(Math.max(0, initialDailyRemainingRef.current - (initialTimerRef.current - timer)))}
            </div>
          </div>
        )}
        <div style={{ fontSize: '1.5rem', color: '#6b7280', animation: 'pulse 3s infinite', marginTop: '2rem' }}>
          Move mouse to wake
        </div>
      </div>

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 64px - 1.5rem)' }}>

      {/* Persona Header Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, #fdf4ff 0%, #ede9fe 100%)',
        border: '2px solid rgba(139,92,246,0.2)',
        flexShrink: 0,
      }}>
        <button
          onClick={handleEnd}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem', flexShrink: 0 }}
        >
          <ArrowLeft size={16} /> Leave
        </button>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #8b5cf6', flexShrink: 0 }}>
          <img src={personaImage} alt={personaName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#4c1d95' }}>
            {personaName}
          </h2>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#7c3aed' }}>
            {isActive ? '● Live conversation' : status === 'connecting' ? 'Connecting…' : status === 'ended' ? 'Session ended' : status === 'error' ? 'Connection failed' : 'Initialising…'}
          </p>
        </div>
        {isActive && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: isSpeaking ? '#8b5cf6' : '#10b981',
              boxShadow: isSpeaking ? '0 0 10px #8b5cf6' : '0 0 6px #10b981',
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSpeaking ? '#7c3aed' : '#059669' }}>
              {isSpeaking ? `${personaName.split(' ')[0]} speaking` : 'Your turn'}
            </span>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="card" style={{
        flex: 1, padding: 0, overflow: 'hidden',
        minHeight: 0, borderRadius: 'var(--radius-xl)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Time Limit Setup UI */}
          {status === 'config' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.5s' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Choose Time Limit</h2>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
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

          {/* Connecting */}
          {transcript.length === 0 && (status === 'connecting' || status === 'idle') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', animation: 'fadeIn 0.5s' }}>
              <AIAvatar overrideImage={personaImage} overrideName={personaName} isJunior={false} isSpeaking={false} size={120} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: '#8b5cf6', borderRadius: '50%' }} />
                <p className="text-secondary font-semibold">Connecting to {personaName}…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.25rem', padding: '3rem 1.5rem' }}>
              <div className="alert alert-error" style={{ maxWidth: '400px' }}>
                <strong>Connection Failed:</strong> Could not connect to {personaName}. Please check your microphone permissions and try again.
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => navigate('/persona')} className="btn btn-secondary">Back to Personas</button>
              </div>
            </div>
          )}

          {/* Out of Time State */}
          {status === 'out_of_time' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1.5rem', gap: '1.25rem' }}>
              <AIAvatar overrideImage={personaImage} overrideName={personaName} isJunior={false} isSpeaking={false} size={120} />
              <div className="alert alert-warning" style={{ maxWidth: '400px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>
                <strong>Time's Up! ⏱️</strong><br/>
                You have reached your 30-minute daily debate limit for Persona Mode. Come back tomorrow!
              </div>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
            </div>
          )}

          {/* Evaluating State */}
          {status === 'evaluating' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', animation: 'fadeIn 0.5s' }}>
              <div style={{ position: 'relative' }}>
                <AIAvatar overrideImage={personaImage} overrideName={personaName} isJunior={false} isSpeaking={false} size={140} />
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
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Saving Conversation...</h3>
                <p className="text-secondary font-semibold" style={{ fontSize: '1.1rem' }}>Logging the interaction safely before concluding!</p>
              </div>
            </div>
          )}

          {/* Session ended */}
          {status === 'ended' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem', padding: '3rem 1.5rem' }}>
              <AIAvatar overrideImage={personaImage} overrideName={personaName} isJunior={false} isSpeaking={false} size={100} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem' }}>Conversation Ended</h3>
              <p className="text-secondary">You spoke with {personaName}. What an experience!</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => navigate('/persona')} className="btn btn-secondary">Choose Another Persona</button>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
              </div>
            </div>
          )}

          {/* Active Debate View - Centralized Call UI */}
          {isActive && (
            <div className="animate-fade-in" style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', gap: '2rem',
              background: 'radial-gradient(circle at center, rgba(139,92,246,0.05) 0%, transparent 60%)'
            }}>
              
              <div style={{ position: 'relative' }}>
                <AIAvatar overrideImage={personaImage} overrideName={personaName} isJunior={false} isSpeaking={isSpeaking} size={240} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isSpeaking ? `${personaName.split(' ')[0]} is speaking…` : 'Listening carefully…'}
                </h3>
                <div className="waveform" style={{ opacity: isActive ? 1 : 0.3, margin: '0.5rem 0', height: '24px', gap: '4px' }}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="waveform-bar" style={{ height: isSpeaking ? '24px' : '6px', background: '#8b5cf6', minWidth: '6px' }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1rem 2rem', border: `2px solid ${timerWarning ? 'var(--error)' : 'var(--border)'}`,
                    background: timerWarning ? '#fef2f2' : 'var(--bg-secondary)',
                    borderRadius: '99px', color: timerWarning ? 'var(--error)' : 'var(--text-primary)'
                  }}>
                    <TimerIcon size={24} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', minWidth: '60px', textAlign: 'center' }} className={timerWarning ? 'animate-pulse' : ''}>
                      {formatTime(timer)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Daily Left: {formatTime(Math.max(0, initialDailyRemainingRef.current - (initialTimerRef.current - timer)))}
                  </span>
                </div>

                <button onClick={handleEnd} className="btn btn-danger" style={{ 
                  borderRadius: '99px', padding: '1rem 2.5rem', fontSize: '1.25rem', gap: '0.75rem', fontWeight: 700, alignSelf: 'flex-start'
                }}>
                  <PhoneOff size={24} /> End Call
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
