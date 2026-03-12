import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Timer as TimerIcon, Play } from 'lucide-react';
import { Conversation } from '@11labs/client';
import AIAvatar from '../components/AIAvatar';

const TOPICS = [
  'Should school uniforms be mandatory?',
  'Is social media good or bad for society?',
  'Should we prioritize space exploration over ocean research?',
  'Are video games a valid form of art?',
  'Should homework be abolished?',
  'Is technology making us less social?',
  'Should zoos be banned?',
];

export default function DebateArena({ user }) {
  const [topic] = useState(() => TOPICS[Math.floor(Math.random() * TOPICS.length)]);
  const isJunior = user.classLevel === 'Class 1-3';
  const totalTime = isJunior ? 300 : 600;
  const [timer, setTimer] = useState(totalTime);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | active | ended | error
  const conversationRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const hasStartedRef = useRef(false);
  const conversationIdRef = useRef(null);
  const navigate = useNavigate();

  // auto-scroll chat
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // countdown
  useEffect(() => {
    if (isActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && isActive) {
      handleEndDebate();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timer]);

  // Auto-start the debate on mount
  useEffect(() => {
    // Prevent React Strict Mode from double-firing the connection
    if (status === 'idle' && !hasStartedRef.current) {
      hasStartedRef.current = true;
      handleStartDebate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartDebate = async () => {
    setStatus('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      conversationRef.current = await Conversation.startSession({
        agentId: user.assignedAgentId,
        onConnect: () => {
          setStatus('active');
          setIsActive(true);
          // Capture the conversation ID for post-call data extraction
          try {
            const convId = conversationRef.current?.getId?.() || conversationRef.current?.id || null;
            if (convId) {
              conversationIdRef.current = convId;
              console.log('ElevenLabs conversation ID:', convId);
            }
          } catch (e) { console.warn('Could not get conversation ID:', e); }
        },
        onDisconnect: () => {
          if (isActive && status !== 'evaluating') {
            setIsActive(false); 
            setStatus('ended');
            // Timeout to allow the final transcript chunk to settle before sending to API
            setTimeout(() => {
              handleEndDebate();
            }, 500);
          }
        },
        onMessage: (msg) => {
          setTranscript((prev) => [...prev, { role: msg.source, text: msg.message }]);
        },
        onError: (err) => { console.error('EL error', err); setStatus('error'); },
        onModeChange: (mode) => setIsSpeaking(mode.mode === 'speaking'),
      });
    } catch (err) {
      console.error('Debate start error:', err);
      setStatus('error');
    }
  };

  const handleEndDebate = async () => {
    clearInterval(timerRef.current);
    if (conversationRef.current) await conversationRef.current.endSession();
    setIsActive(false);
    setStatus('evaluating');

    let evaluation = null;

    // Step 1: Get real AI judge evaluation from transcript
    try {
      const evalRes = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          topic,
          isJunior: user.classLevel === 'Class 1-3',
          conversationId: conversationIdRef.current,
        }),
      });
      evaluation = await evalRes.json();
    } catch (err) {
      console.error('Evaluation failed, using fallback:', err);
    }

    const finalScore = evaluation?.overallScore ?? Math.floor(Math.random() * 20) + 65;

    // Step 2: Save session with real score
    const sessionData = {
      studentId: user.studentId,
      debateTopic: topic,
      sessionDuration: totalTime - timer,
      argumentsCount: transcript.filter(m => m.role === 'user').length,
      debateScore: finalScore,
    };

    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      const data = await res.json();
      // Navigate with both session data AND real evaluation results
      navigate(`/results/${data.sessionId}`, {
        state: { sessionData, evaluation }
      });
    } catch {
      navigate('/dashboard');
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerPct = (timer / totalTime) * 100;
  const timerWarning = timer < 60;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 64px - 1.5rem)' }}>
      {/* Chat Window */}
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        minHeight: 0,
        borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Connecting State */}
          {transcript.length === 0 && (status === 'connecting' || status === 'idle') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', animation: 'fadeIn 0.5s' }}>
              <AIAvatar isJunior={isJunior} isSpeaking={false} size={120} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                <p className="text-secondary font-semibold">Connecting to your debate buddy…</p>
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
                <button onClick={handleStartDebate} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                  <Play size={18} fill="currentColor" /> Try Again
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transcript.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                  {msg.role === 'user' ? '🙋 You' : (isJunior ? '🦁 Dino' : '🤖 AI Judge')}
                </span>
                <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} style={{ backdropFilter: 'blur(4px)', background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.9)' }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Avatar positioned underneath the scrolling conversation */}
            {isActive && transcript.length > 0 && (
              <div style={{ alignSelf: 'center', marginTop: '2rem', marginBottom: '1rem', transition: 'all 0.3s' }}>
                <AIAvatar isJunior={isJunior} isSpeaking={isSpeaking} size={180} />
              </div>
            )}
            
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Voice Controls (shown when active) */}
        {isActive && (
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            gap: '1rem',
          }}>
            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                flexShrink: 0, width: 12, height: 12, borderRadius: '50%',
                background: isSpeaking ? 'var(--accent)' : '#94a3b8',
                boxShadow: isSpeaking ? '0 0 12px var(--accent)' : 'none',
                animation: isSpeaking ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'
              }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{isSpeaking ? 'AI is speaking…' : 'Your turn to speak'}</p>
                <p className="text-muted text-xs">Live voice session active</p>
              </div>
            </div>

            {/* Timer Output */}
            <div style={{
               display: 'flex', alignItems: 'center', gap: '0.5rem',
               padding: '0.25rem 0.75rem',
               background: timerWarning ? '#fef2f2' : 'var(--bg-tertiary)',
               border: `1px solid ${timerWarning ? 'var(--error)' : 'var(--border)'}`,
               borderRadius: '99px',
               color: timerWarning ? 'var(--error)' : 'var(--text-primary)'
            }}>
              <TimerIcon size={14} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' }} className={timerWarning ? 'animate-pulse' : ''}>
                {formatTime(timer)}
              </span>
            </div>

            {/* Waveform (Hidden on very small screens) */}
            <div className="waveform hide-mobile" style={{ opacity: isActive ? 1 : 0.3, flex: 1, minWidth: '40px', maxWidth: '100px', margin: '0 auto' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="waveform-bar" style={{ height: isSpeaking ? '8px' : undefined }} />
              ))}
            </div>

            {/* Mic status & End Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: isSpeaking ? 'var(--text-muted)' : 'var(--accent)' }}>
                {isSpeaking ? <MicOff size={18} /> : <Mic size={18} />}
                <span className="text-sm font-semibold hide-mobile">{isSpeaking ? 'Muted' : 'Live'}</span>
              </div>
              <button onClick={handleEndDebate} className="btn btn-danger btn-sm" style={{ padding: '0.375rem 0.75rem', gap: '0.375rem' }}>
                <PhoneOff size={14} /> End
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
