import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader, CheckCircle, AlertTriangle, ArrowLeft, History, Play, Lightbulb, Clock, RotateCcw, Copy, Check, Activity } from 'lucide-react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Legend } from 'recharts';
import { API_BASE } from '../api';

// --- Sound Effects Generator ---
let uiAudioCtx;
export const playSound = (type) => {
  try {
    if (!uiAudioCtx) {
      uiAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (uiAudioCtx.state === 'suspended') {
      uiAudioCtx.resume();
    }

    const osc = uiAudioCtx.createOscillator();
    const gainNode = uiAudioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(uiAudioCtx.destination);

    const now = uiAudioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'go') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
// ------------------------------

export default function SpeechLeague({ user }) {
  const navigate = useNavigate();
  // UI States: 'intro', 'prep', 'countdown', 'recording', 'processing', 'result', 'history', 'already-completed'
  const [view, setView] = useState('intro');

  // Topic
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // Prep
  const [prepTime, setPrepTime] = useState(120); // 2 minutes
  const [prepHints, setPrepHints] = useState(null);
  const [hintsLoading, setHintsLoading] = useState(false);

  useEffect(() => {
    let topic = 'Are Schools Preparing Students for Real Life?'; // Default Cat III
    if (user?.classLevel || user?.grade) {
      const g = (user.classLevel || user.grade).toLowerCase();
      if (g.includes('5') || g.includes('6') || g.includes('7')) {
        topic = 'Kindness Is a Superpower';
      } else if (g.includes('8') || g.includes('9') || g.includes('10')) {
        topic = 'Marks Do Not Define Intelligence';
      }
    }
    setSelectedTopic(topic);
    
    // Automatically fetch hints
    setHintsLoading(true);
    fetch(`${API_BASE}/api/speech/prep-hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    })
    .then(res => res.json())
    .then(data => setPrepHints(data))
    .catch(e => console.error("Hints failed", e))
    .finally(() => setHintsLoading(false));
  }, [user]);
  
  // Countdown
  const [countdown, setCountdown] = useState(5);
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(180);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const transcriptContainerRef = useRef(null);
  
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const socketRef = useRef(null);
  const recordRTCRef = useRef(null);
  
  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch History
  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`${API_BASE}/api/speech/history/${user?.studentId || user?.username}`);
      const data = await res.json();
      setHistory(data || []);
      
      // If mounting and view is intro, check if they already have a league session
      if (view === 'intro' && data && data.some(s => s.is_league)) {
        setView('already-completed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    // Check history silently on mount to enforce one-time participation
    if (view === 'intro') {
      fetchHistory();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);



  // Prep Timer
  useEffect(() => {
    let interval;
    if (view === 'prep') {
      interval = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            startCountdown();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Countdown Timer
  useEffect(() => {
    let interval;
    if (view === 'countdown') {
      playSound('tick'); // initial tick
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            playSound('go');
            startRecording();
            return 0;
          }
          playSound('tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Recording Timer (Count down from 180s)
  useEffect(() => {
    let interval;
    if (view === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev <= 1) { // 3 mins max reached (counts down to 0)
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  const startCountdown = () => {
    setView('countdown');
    setCountdown(5);
  };

  const startRecording = async () => {
    try {
      setError('');
      setAnalysis(null);
      setLiveTranscript('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Also stop recognition
        if (recordRTCRef.current) {
          recordRTCRef.current.stopRecording();
        }

        await processAudio(audioBlob);
      };

      // Start Real-Time Transcription
      let useFallback = false;
      let sharedTranscriptText = '';
      const startWebSpeechAPI = () => {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
              setLiveTranscript((prev) => prev ? prev : 'Listening... Your speech will appear here in real-time.');
            };

            let fullFinalTranscript = sharedTranscriptText;

            recognition.onresult = (event) => {
              let interimTranscript = '';
              let newlyFinal = '';

              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  newlyFinal += event.results[i][0].transcript;
                } else {
                  interimTranscript += event.results[i][0].transcript;
                }
              }
              
              if (newlyFinal) {
                 fullFinalTranscript += newlyFinal;
              }
              
              sharedTranscriptText = fullFinalTranscript;
              setLiveTranscript(fullFinalTranscript + (interimTranscript ? ' ' + interimTranscript + ' [...]' : ''));
            };

            recognition.onerror = (event) => {
              console.error('Speech recognition error', event.error);
            };

            recognition.onend = () => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                try {
                  recognition.start();
                } catch (e) {}
              }
            };

            recognition.start();
            recordRTCRef.current = {
              stopRecording: () => recognition.stop()
            };
          } else {
             setLiveTranscript('Live transcript is not supported in this browser. However, your audio is being recorded for analysis.');
          }
        } catch (err) {
          console.error('Web Speech API Setup Failed:', err);
        }
      };

      const connectAssemblyAI = async () => {
        let assemblyAiReady = false;
        try {
          const tokenRes = await fetch(`${API_BASE}/api/speech/realtime-token`);
          if (!tokenRes.ok) throw new Error('Failed to get realtime token');
          const { token } = await tokenRes.json();

          const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
          socketRef.current = socket;

          socket.onmessage = (message) => {
            const res = JSON.parse(message.data);
            if (res.message_type === 'SessionBegins') {
              console.log('AssemblyAI v2 session began');
              assemblyAiReady = true;
            } else if (res.message_type === 'PartialTranscript') {
              setLiveTranscript(sharedTranscriptText + ' ' + res.text + ' [...]');
            } else if (res.message_type === 'FinalTranscript') {
              sharedTranscriptText += (sharedTranscriptText ? ' ' : '') + res.text;
              setLiveTranscript(sharedTranscriptText);
            } else if (res.message_type === 'Error') {
              console.error('AssemblyAI WebSocket returned error:', res.error);
              if (!useFallback && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                useFallback = true;
                console.log('Falling back to Web Speech API due to AssemblyAI error...');
                startWebSpeechAPI();
              }
            }
          };

          socket.onerror = (event) => {
            console.error('AssemblyAI WebSocket error:', event);
            if (!useFallback && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              useFallback = true;
              console.log('Falling back to Web Speech API...');
              startWebSpeechAPI();
            }
          };

          socket.onclose = (event) => {
            console.warn('AssemblyAI WebSocket closed', event.code, event.reason);
            if (!useFallback && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              useFallback = true;
              console.log('AssemblyAI disconnected. Falling back to Web Speech API to continue transcript...');
              startWebSpeechAPI();
            }
            if (recordRTCRef.current && !useFallback) {
              recordRTCRef.current.stopRecording();
            }
          };

          socket.onopen = () => {
            setLiveTranscript('Listening... Your speech will appear here in real-time.');
            try {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
              audioContext.resume();
              const source = audioContext.createMediaStreamSource(stream);
              const processor = audioContext.createScriptProcessor(4096, 1, 1);
              const destination = audioContext.createMediaStreamDestination();

              source.connect(processor);
              processor.connect(destination);

              // Prevent V8/Chrome Garbage Collection from destroying the nodes while recording
              window.__audioContext = audioContext;
              window.__audioProcessor = processor;
              window.__audioSource = source;
              window.__audioDestination = destination;

              processor.onaudioprocess = (e) => {
                if (socket.readyState === WebSocket.OPEN && assemblyAiReady) {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcm16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                  }
                  const buffer = new ArrayBuffer(pcm16.length * 2);
                  const view = new DataView(buffer);
                  for (let i = 0; i < pcm16.length; i++) {
                    view.setInt16(i * 2, pcm16[i], true);
                  }
                  socket.send(buffer);
                }
              };

              recordRTCRef.current = {
                stopRecording: () => {
                  try {
                    processor.disconnect();
                    source.disconnect();
                    audioContext.close();
                  } catch (e) {}
                }
              };
            } catch (err) {
              console.error('Microphone audio context error:', err);
            }
          };

        } catch (err) {
          console.error('AssemblyAI Token Error:', err);
          if (!useFallback) {
            useFallback = true;
            console.log('Falling back to Web Speech API...');
            startWebSpeechAPI();
          }
        }
      };

      // Attempt to connect to AssemblyAI first, fallback if it fails
      connectAssemblyAI();

      mediaRecorder.start(1000);
      setView('recording');
      setIsRecording(true);
      setRecordingTime(180);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access your microphone. Please ensure permissions are granted.');
      setView('selection');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordRTCRef.current) {
        recordRTCRef.current.stopRecording();
      }
    }
  };

  const processAudio = async (audioBlob) => {
    setView('processing');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('topic', selectedTopic);
      formData.append('studentId', user?.studentId || user?.username);
      formData.append('isLeague', 'true');

      const response = await fetch(`${API_BASE}/api/speech/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to process speech';
        try {
          const errorData = await response.clone().json();
          if (errorData.error) errorMsg = errorData.error;
        } catch(e) {
          errorMsg = `Server error (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      setAnalysis(data);
      setView('result');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
      setView('selection');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // RENDERS
  return (
    <div style={{ flex: 1, background: '#000000', color: '#fff', padding: '1rem', paddingBottom: '3rem', position: 'relative', overflowY: 'auto', overflowX: 'hidden' }}>
      
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(11,19,31,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(11,19,31,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 12, color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <AlertTriangle size={20} /> {error}
          </div>
        )}



        {/* VIEW: ALREADY COMPLETED */}
        {view === 'already-completed' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: '#0D0D0D', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>Competition Completed</h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                You have already submitted your speech for the Speech League. Check the Admin Dashboard for the results!
              </p>
            </div>
          </div>
        )}

        {/* VIEW: INTRO */}
        {view === 'intro' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: '#0D0D0D', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>Important Warning</h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                This is a <strong>one-time competition</strong> held on <strong>Sunday 30 Aug, 10 AM to 11 AM</strong>. 
                You can only attempt this once. If you close or refresh this tab before completing your speech, you will lose your progress and cannot start over.
              </p>
              <button
                onClick={() => { playSound('click'); setView('prep'); }}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: 99, fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                I Understand, Start Competition
              </button>
            </div>
          </div>
        )}

        {/* VIEW: PREP */}
        {view === 'prep' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Preparing to speak on</div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600 }}>{selectedTopic}</h2>
            </div>
            
            <div style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
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
            <div style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
              
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

            </div>
          </div>
        )}

        {/* VIEW: PROCESSING */}
        {view === 'processing' && (
          <div style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '6rem 2rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxWidth: 600, margin: '0 auto' }}>
            <Loader size={48} color="#38bdf8" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 2rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#e2e8f0', marginBottom: '0.75rem', fontWeight: 600 }}>Analyzing Performance...</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Evaluating pacing, clarity, and structural elements of your speech.</p>
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === 'result' && analysis && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.25rem' }}>Topic</div>
                <h2 style={{ fontSize: '1.4rem', color: '#e2e8f0', margin: 0, fontWeight: 600 }}>{selectedTopic}</h2>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              >
                <ArrowLeft size={18} /> Back to Dashboard
              </button>
            </div>

            {/* TOP METRICS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              
              {/* Overall Score */}
              <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
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
              <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Pacing (WPM)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1, marginTop: 'auto' }}>{analysis.metrics.wpm}</div>
                <div style={{ fontSize: '0.8rem', color: analysis.metrics.wpm >= 120 && analysis.metrics.wpm <= 160 ? '#10b981' : '#f59e0b', marginTop: '0.5rem' }}>
                  {analysis.metrics.wpm < 120 ? 'Too slow' : analysis.metrics.wpm > 160 ? 'Too fast' : 'Ideal speed'}
                </div>
              </div>

              {/* Filler Words */}
              <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Filler Words</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: analysis.metrics.fillerWordsCount > 5 ? '#ef4444' : '#10b981', lineHeight: 1, marginTop: 'auto' }}>{analysis.metrics.fillerWordsCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Detected um/uhs</div>
              </div>

              {/* Clarity */}
              {analysis.analysis.audioAnalytics && (
                <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
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
                <div style={{ background: '#0D0D0D', borderRadius: 20, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '1.5rem', fontWeight: 600 }}>Score Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: 280 }}>
                      <div style={{ width: '100%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Content', percentage: (analysis.analysis.scores.contentAndIdeas / 20) * 100, raw: analysis.analysis.scores.contentAndIdeas, max: 20 },
                            { name: 'Relevance', percentage: (analysis.analysis.scores.relevanceToTopic / 15) * 100, raw: analysis.analysis.scores.relevanceToTopic, max: 15 },
                            { name: 'Organization', percentage: (analysis.analysis.scores.organisationAndStructure / 15) * 100, raw: analysis.analysis.scores.organisationAndStructure, max: 15 },
                            { name: 'Fluency', percentage: (analysis.analysis.scores.fluency / 15) * 100, raw: analysis.analysis.scores.fluency, max: 15 },
                            { name: 'Voice', percentage: (analysis.analysis.scores.voiceModulationAndExpression / 10) * 100, raw: analysis.analysis.scores.voiceModulationAndExpression, max: 10 },
                            { name: 'Vocabulary', percentage: (analysis.analysis.scores.languageAndVocabulary / 10) * 100, raw: analysis.analysis.scores.languageAndVocabulary, max: 10 },
                            { name: 'Clarity', percentage: (analysis.analysis.scores.pronunciationAndClarity / 10) * 100, raw: analysis.analysis.scores.pronunciationAndClarity, max: 10 },
                            { name: 'Time', percentage: (analysis.analysis.scores.timeManagement / 5) * 100, raw: analysis.analysis.scores.timeManagement, max: 5 },
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
                            formatter={(value, name, props) => [`${props.payload.raw} / ${props.payload.max}`, 'Score']}
                          />
                          <Bar dataKey="percentage" radius={[4, 4, 4, 4]} fill="#10b981" animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Radar Chart */}
                  <div style={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                        { name: 'Content', val: (analysis.analysis.scores.contentAndIdeas / 20) * 100, raw: analysis.analysis.scores.contentAndIdeas, max: 20 },
                        { name: 'Organization', val: (analysis.analysis.scores.organisationAndStructure / 15) * 100, raw: analysis.analysis.scores.organisationAndStructure, max: 15 },
                        { name: 'Fluency', val: (analysis.analysis.scores.fluency / 15) * 100, raw: analysis.analysis.scores.fluency, max: 15 },
                        { name: 'Voice', val: (analysis.analysis.scores.voiceModulationAndExpression / 10) * 100, raw: analysis.analysis.scores.voiceModulationAndExpression, max: 10 },
                        { name: 'Vocabulary', val: (analysis.analysis.scores.languageAndVocabulary / 10) * 100, raw: analysis.analysis.scores.languageAndVocabulary, max: 10 },
                        { name: 'Clarity', val: (analysis.analysis.scores.pronunciationAndClarity / 10) * 100, raw: analysis.analysis.scores.pronunciationAndClarity, max: 10 }
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="val" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                        <Tooltip 
                          contentStyle={{ background: 'rgba(11, 19, 31, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                          itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
                          formatter={(value, name, props) => [`${props.payload.raw} / ${props.payload.max}`, 'Score']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* STRENGTHS AND OPPORTUNITIES - Custom Box matches Image 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1px', background: 'rgba(168, 85, 247, 0.3)', borderRadius: 16, border: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '2rem', background: 'linear-gradient(180deg, rgba(15, 15, 15, 0.8), rgba(15, 15, 15, 0.95))' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Activity size={18} color="#38bdf8" /> Strengths
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {analysis.analysis.strengths && analysis.analysis.strengths.length > 0 ? (
                    analysis.analysis.strengths.slice(0, 2).map((s, i) => (
                      <div key={i}>
                        <div style={{ color: '#d8b4fe', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.split(':')[0] || `Strength ${i+1}`}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.split(':').slice(1).join(':') || s}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No notable strengths identified. Keep practicing!</div>
                  )}
                </div>
              </div>
              <div style={{ padding: '2rem', background: 'linear-gradient(180deg, rgba(15, 15, 15, 0.8), rgba(15, 15, 15, 0.95))' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={18} color="#ef4444" /> Areas to Improve
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {analysis.analysis.areasForImprovement && analysis.analysis.areasForImprovement.length > 0 ? (
                    analysis.analysis.areasForImprovement.slice(0, 2).map((s, i) => (
                      <div key={i}>
                        <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.split(':')[0] || `Area ${i+1}`}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.split(':').slice(1).join(':') || s}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No critical areas to improve identified.</div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Feedback and Transcript */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#0D0D0D', borderRadius: 20, padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h3 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '1rem', fontWeight: 600 }}>Overall Feedback</h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap', margin: 0 }}>{analysis.analysis.overallFeedback}</p>
              </div>

              <div style={{ background: '#0D0D0D', borderRadius: 20, padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
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
              <div style={{ background: '#0D0D0D', border: '1px dashed rgba(255,255,255,0.1)', padding: '4rem 2rem', textAlign: 'center', borderRadius: 24, color: '#94a3b8' }}>
                You haven't recorded any speeches yet. Go back to the prep screen and hit "Start Now" to get started!
              </div>
            ) : (
              <div style={{ background: '#0D0D0D', borderRadius: 20, borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflowX: 'auto', overflowY: 'hidden' }}>
                <div style={{ minWidth: '600px' }}>
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
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
