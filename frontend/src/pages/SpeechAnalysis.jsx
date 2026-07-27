import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader, CheckCircle, AlertTriangle, ArrowLeft, History, Play, Lightbulb, Clock, RotateCcw, Copy, Check, Activity } from 'lucide-react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

const DEFAULT_TOPICS = [
  "The impact of artificial intelligence on education",
  "Should homework be banned in schools?",
  "The importance of space exploration",
  "Is social media doing more harm than good?",
  "The future of renewable energy",
  "Why failure is the greatest teacher",
  "The pros and cons of universal basic income",
  "How social media affects mental health",
  "The ethics of genetic engineering",
  "Should voting be made mandatory?",
  "The role of sports in character building",
  "Is a college degree still worth the cost?"
];

export default function SpeechAnalysis({ user }) {
  const navigate = useNavigate();
  
  // UI States: 'selection', 'prep', 'countdown', 'recording', 'processing', 'result', 'history'
  const [view, setView] = useState('selection');
  
  // Topic
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  
  // Prep
  const [prepTime, setPrepTime] = useState(120); // 2 minutes
  const [prepHints, setPrepHints] = useState(null);
  const [hintsLoading, setHintsLoading] = useState(false);
  
  // Countdown
  const [countdown, setCountdown] = useState(5);
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
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
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleTopicSelect = async (topic) => {
    const finalTopic = topic || customTopic;
    if (!finalTopic.trim()) return;
    
    setSelectedTopic(finalTopic);
    setView('prep');
    setPrepTime(120);
    setPrepHints(null);
    setHintsLoading(true);
    setError('');
    
    // Fetch hints
    try {
      const res = await fetch(`${API_BASE}/api/speech/prep-hints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: finalTopic })
      });
      const data = await res.json();
      setPrepHints(data);
    } catch (e) {
      console.error("Hints failed", e);
    } finally {
      setHintsLoading(false);
    }
  };

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
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Recording Timer
  useEffect(() => {
    let interval;
    if (view === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 1200) { // 20 mins max
            stopRecording();
            return prev;
          }
          return prev + 1;
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

            let fullFinalTranscript = '';

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
        try {
          const tokenRes = await fetch(`${API_BASE}/api/speech/realtime-token`);
          if (!tokenRes.ok) throw new Error('Failed to get realtime token');
          const { token } = await tokenRes.json();

          const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
          socketRef.current = socket;

          socket.onmessage = (message) => {
            const res = JSON.parse(message.data);
            if (res.message_type === 'PartialTranscript') {
              setLiveTranscript((prev) => (prev ? prev.split(' [...]')[0] : '') + ' ' + res.text + ' [...]');
            } else if (res.message_type === 'FinalTranscript') {
              setLiveTranscript((prev) => (prev ? prev.split(' [...]')[0] : '') + ' ' + res.text);
            }
          };

          socket.onerror = (event) => {
            console.error('AssemblyAI WebSocket error:', event);
            if (!useFallback) {
              useFallback = true;
              console.log('Falling back to Web Speech API...');
              startWebSpeechAPI();
            }
          };

          socket.onclose = (event) => {
            console.warn('AssemblyAI WebSocket closed', event.code, event.reason);
            if (!useFallback && (event.code === 1006 || event.code >= 4000)) {
              useFallback = true;
              startWebSpeechAPI();
            }
            if (recordRTCRef.current && !useFallback) {
              recordRTCRef.current.stopRecording();
            }
          };

          socket.onopen = () => {
            setLiveTranscript('Listening... Your speech will appear here in real-time.');
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
              const recordRTC = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm;codecs=pcm',
                recorderType: StereoAudioRecorder,
                timeSlice: 250,
                desiredSampRate: 16000,
                numberOfAudioChannels: 1,
                bufferSize: 4096,
                audioBitsPerSecond: 128000,
                ondataavailable: (blob) => {
                  if (socket.readyState === WebSocket.OPEN) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const base64data = reader.result.split(',')[1];
                      socket.send(JSON.stringify({ audio_data: base64data }));
                    };
                    reader.readAsDataURL(blob);
                  }
                },
              });
              recordRTC.startRecording();
              recordRTCRef.current = recordRTC;
            }).catch(err => {
              console.error('Microphone error for RecordRTC:', err);
            });
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
      setRecordingTime(0);
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

      const response = await fetch(`${API_BASE}/api/speech/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process speech');
      }

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
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#fff', padding: '1rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '3rem' }}>
          {/* Back button removed as requested */}
          
          {view === 'selection' && (
            <button 
              onClick={() => setView('history')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' }}
            >
              <History size={16} /> My History
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 12, color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {/* VIEW: SELECTION */}
        {view === 'selection' && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
                AI Speech Analysis
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                Select a topic below or type your own. You will have 2 minutes to prepare before the recording begins.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="Type your own custom topic..."
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: 8, color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
                <button 
                  onClick={() => handleTopicSelect()}
                  disabled={!customTopic.trim()}
                  style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: 8, fontWeight: 700, cursor: customTopic.trim() ? 'pointer' : 'not-allowed', opacity: customTopic.trim() ? 1 : 0.5 }}
                >
                  Start
                </button>
              </div>

              <h3 style={{ marginBottom: '1.5rem', color: '#e2e8f0', fontSize: '1.1rem' }}>Or choose a predefined topic:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {DEFAULT_TOPICS.map((t, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleTopicSelect(t)}
                    style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', padding: '1.2rem', borderRadius: 12, cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
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
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>Topic: <span style={{ color: '#818cf8' }}>{selectedTopic}</span></h2>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '3rem 2rem' }}>
              <div style={{ margin: '0 auto 2rem', width: 'fit-content', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1.5rem', borderRadius: 99, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '1.2rem' }}>
                <Clock size={20} /> {formatTime(prepTime)}
              </div>

              {hintsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                  <Loader size={32} color="#6366f1" style={{ animation: 'spin 2s linear infinite' }} />
                  <p style={{ color: '#94a3b8' }}>Generating AI hints to help you prepare...</p>
                </div>
              ) : prepHints && (
                <div style={{ textAlign: 'left', maxWidth: 600, margin: '2rem auto 0' }}>
                  <h3 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Lightbulb size={20} /> Key Points to Hit
                  </h3>
                  <ul style={{ color: '#cbd5e1', lineHeight: 1.6, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                    {prepHints.points?.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>

                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: 12, color: '#fbbf24', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flexShrink: 0 }}><AlertTriangle size={20} /></div>
                    <div><strong>Speaking Tip:</strong> {prepHints.tip}</div>
                  </div>
                </div>
              )}

              <button 
                onClick={startCountdown}
                style={{ marginTop: '3rem', background: 'transparent', border: '1px solid #6366f1', color: '#818cf8', padding: '0.75rem 2rem', borderRadius: 99, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Skip Prep & Start Now
              </button>
            </div>
          </div>
        )}

        {/* VIEW: COUNTDOWN */}
        {view === 'countdown' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', animation: 'zoomIn 0.5s ease-out' }}>
            <div style={{ fontSize: '10rem', fontWeight: 900, color: '#6366f1', textShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
              {countdown}
            </div>
            <h2 style={{ color: '#94a3b8', fontSize: '1.5rem', marginTop: '1rem' }}>Get Ready...</h2>
          </div>
        )}

        {/* VIEW: RECORDING */}
        {view === 'recording' && (
          <div className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>
              Speaking on: <strong style={{ color: '#fff' }}>{selectedTopic}</strong>
            </div>

            <div style={{ fontSize: '4rem', fontWeight: 200, fontFamily: 'monospace', color: '#ef4444', marginBottom: '2rem' }}>
              {formatTime(recordingTime)}
            </div>
            
            <button 
              onClick={stopRecording}
              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444', color: '#ef4444', width: 80, height: 80, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', animation: 'pulse 2s infinite' }}
            >
              <Square size={32} fill="currentColor" />
            </button>
            
            <p style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
              Recording in progress... Click stop when finished. Max 20 minutes.
            </p>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', minHeight: 100, maxHeight: '35vh', overflowY: 'auto' }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                Live Transcript
              </h4>
              <p style={{ color: liveTranscript ? '#e2e8f0' : '#475569', lineHeight: 1.6, fontSize: '1rem', fontStyle: liveTranscript ? 'normal' : 'italic', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {liveTranscript || "Listening... Your speech will appear here in real-time."}
              </p>
            </div>
          </div>
        )}

        {/* VIEW: PROCESSING */}
        {view === 'processing' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '6rem 2rem', textAlign: 'center' }}>
            <Loader size={48} color="#6366f1" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>Analyzing your speech...</h3>
            <p style={{ color: '#94a3b8' }}>Our AI is evaluating your pacing, vocabulary, and persuasiveness.</p>
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === 'result' && analysis && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: '#fff', textAlign: 'center' }}>Topic: <span style={{ color: '#818cf8' }}>{selectedTopic}</span></h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Overall Score</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6366f1' }}>{analysis.analysis.score}<span style={{ fontSize: '1.2rem', color: '#64748b' }}>/100</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pacing (WPM)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{analysis.metrics.wpm}</div>
                <div style={{ fontSize: '0.8rem', color: analysis.metrics.wpm >= 120 && analysis.metrics.wpm <= 160 ? '#10b981' : '#f59e0b' }}>
                  {analysis.metrics.wpm < 120 ? 'Too slow' : analysis.metrics.wpm > 160 ? 'Too fast' : 'Ideal speed'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Filler Words</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: analysis.metrics.fillerWordsCount > 5 ? '#ef4444' : '#10b981' }}>{analysis.metrics.fillerWordsCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>"um", "uh", "like"</div>
              </div>
            </div>

            {analysis.analysis.scores && (
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="#6366f1" /> Detailed Score Breakdown
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {[
                    { label: 'Content and Ideas', key: 'contentAndIdeas', max: 20 },
                    { label: 'Relevance to Topic', key: 'relevanceToTopic', max: 15 },
                    { label: 'Organisation and Structure', key: 'organisationAndStructure', max: 15 },
                    { label: 'Fluency', key: 'fluency', max: 15 },
                    { label: 'Voice Modulation', key: 'voiceModulationAndExpression', max: 10 },
                    { label: 'Language and Vocabulary', key: 'languageAndVocabulary', max: 10 },
                    { label: 'Pronunciation and Clarity', key: 'pronunciationAndClarity', max: 10 },
                    { label: 'Time Management', key: 'timeManagement', max: 5 },
                  ].map(metric => (
                    <div key={metric.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{metric.label}</span>
                        <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>{analysis.analysis.scores[metric.key]} / {metric.max}</span>
                      </div>
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #4f46e5, #818cf8)', 
                          width: `${(analysis.analysis.scores[metric.key] / metric.max) * 100}%`,
                          borderRadius: 99,
                          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Overall Feedback</h3>
              <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{analysis.analysis.overallFeedback}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} /> Strengths
                </h3>
                <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analysis.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#f59e0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} /> Areas for Improvement
                </h3>
                <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analysis.analysis.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Speech Transcript</h3>
              <div style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                {analysis.transcription || analysis.analysis.transcript || analysis.transcript || "No transcript available."}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: HISTORY */}
        {view === 'history' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>My Speech History</h1>
            
            {historyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <Loader size={40} color="#6366f1" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', padding: '4rem 2rem', textAlign: 'center', borderRadius: 24, color: '#94a3b8' }}>
                You haven't recorded any speeches yet. Go back and select a topic to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((h, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>{h.topic}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>WPM</div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{h.wpm}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{h.score}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
