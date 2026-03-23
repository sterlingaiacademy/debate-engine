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
  const [status, setStatus] = useState('idle'); // idle | connecting | active | ended | error
  const conversationRef = useRef(null);
  const transcriptEndRef = useRef(null);

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3'].includes(user?.classLevel);
  const [timer, setTimer] = useState(1800);
  const initialTimerRef = useRef(1800);
  const timerRef = useRef(null);
  const isActive = status === 'active';

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
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
    let localSession = null;

    const init = async () => {
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
          initialTimerRef.current = remain;
          setTimer(remain);
        }
      } catch(err) {
        console.error('Failed to fetch time limits', err);
      }

      if (isTerminated) return;

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isTerminated) return;

        // Force-kill any lingering background SDK instances
        if (window._activeElevenLabsSessions) {
          window._activeElevenLabsSessions.forEach(s => { try { s.endSession(); } catch(e){} });
        }
        window._activeElevenLabsSessions = [];

        localSession = await Conversation.startSession({
          agentId,
          onConnect: () => { if (!isTerminated) setStatus('active'); },
          onDisconnect: () => { if (!isTerminated) setStatus('ended'); },
          onMessage: (msg) => { if (!isTerminated) setTranscript(p => [...p, { role: msg.source, text: msg.message }]); },
          onError: (err) => { if (!isTerminated) setStatus('error'); },
          onModeChange: (m) => { if (!isTerminated) setIsSpeaking(m.mode === 'speaking'); }
        });

        if (isTerminated) {
          localSession.endSession();
        } else {
          window._activeElevenLabsSessions.push(localSession);
          conversationRef.current = localSession;
        }
      } catch (err) {
        if (!isTerminated) setStatus('error');
      }
    };

    if (agentId) init();

    return () => {
      isTerminated = true;
      if (localSession) {
        try { localSession.endSession(); } catch(e){}
      }
    };
  }, [agentId, user?.studentId]);

  const handleEnd = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('evaluating');
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch { /* ignore */ }
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
          <div style={{ fontSize: '10rem', fontWeight: 'bold', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', opacity: 0.8 }}>
            {formatTime(timer)}
          </div>
        )}
        <div style={{ fontSize: '1.5rem', color: '#6b7280', animation: 'pulse 3s infinite' }}>
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

                <button onClick={handleEnd} className="btn btn-danger" style={{ 
                  borderRadius: '99px', padding: '1rem 2.5rem', fontSize: '1.25rem', gap: '0.75rem', fontWeight: 700
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
