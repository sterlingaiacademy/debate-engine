import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Play, Send, FileUp, Download, MessageSquare } from 'lucide-react';
import { Conversation } from '@11labs/client';

export default function ConversationalAgent({ user }) {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | active | ended | error
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const conversationRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Map Agent ID based on Level
  const getAgentId = () => {
    if (user?.classLevel === 'Level 3') return 'agent_3301knv3b67jejpsydj6bt2tf4fc';
    if (user?.classLevel === 'Level 4') return 'agent_7901knvcn8kkf709kzya6d9ky6yw';
    if (user?.classLevel === 'Level 5') return 'agent_3001knvea7y3fn3tdq0r0aczs2h4';
    return 'agent_3301knv3b67jejpsydj6bt2tf4fc'; // default fallback
  };

  const agentId = getAgentId();

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startSession = async () => {
    setStatus('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Force-kill any lingering background SDK instances
      if (window._activeElevenLabsSessions) {
        window._activeElevenLabsSessions.forEach(s => { try { s.endSession(); } catch(e){} });
      }
      window._activeElevenLabsSessions = [];

      const localSession = await Conversation.startSession({
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
      console.error(err);
      setStatus('error');
    }
  };

  const handleEnd = async () => {
    setStatus('ended');
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch { /* ignore */ }
    }
  };

  const toggleMute = async () => {
    try {
      if (conversationRef.current && typeof conversationRef.current.setMicMuted === 'function') {
        conversationRef.current.setMicMuted(!isMuted);
      }
      setIsMuted(p => !p);
    } catch(e) {
      setIsMuted(p => !p);
    }
  };

  const handleSendText = () => {
    if (!textInput.trim() || status !== 'active') return;
    
    // Optimistic UI update
    setTranscript(p => [...p, { role: 'user', text: textInput }]);
    
    // Some implementations of @11labs/client allow sending text directly if configured
    try {
      if (conversationRef.current && typeof conversationRef.current.sendMessage === 'function') {
        conversationRef.current.sendMessage({ text: textInput });
      }
    } catch(e) { console.error("Text sending not supported by this agent configuration"); }
    
    setTextInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file.name);
    // Notify UI that file was attached.
    // In a full implementation, you would pass this to your backend to parse and inject into the RAG context.
    setTranscript(p => [...p, { role: 'user', text: `[Uploaded File: ${file.name}]` }]);
    setTimeout(() => {
      setTranscript(p => [...p, { role: 'ai', text: `I have received ${file.name}. What questions do you have about it?` }]);
    }, 1500);
  };

  const downloadTranscriptPDF = () => {
    const content = transcript.map(t => `${t.role === 'user' ? 'You' : 'AI Helper'}: ${t.text}`).join('\n\n');
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Session_Transcript.txt`; // Simple fallback text export
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    
    // For pure PDF, we will mock invoking print dialogue targeting the transcript
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 64px - 1.5rem)', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
        borderRadius: '16px', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        flexShrink: 0, boxShadow: '0 4px 20px rgba(6,78,59,0.3)', color: '#fff'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Helper Bot (Level {user?.classLevel?.split(' ')[1] || '3'})</h2>
          <p style={{ margin: '0', fontSize: '0.85rem', opacity: 0.8 }}>
            {status === 'active' ? (isSpeaking ? '● AI is speaking' : '● Listening...') : 'Conversational Agent'}
          </p>
        </div>
        {status === 'ended' && transcript.length > 0 && (
          <button onClick={downloadTranscriptPDF} className="btn" style={{ marginLeft: 'auto', background: '#10b981', color: '#fff', border: 'none', gap: '0.5rem' }}>
            <Download size={16} /> Save Transcript
          </button>
        )}
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Intro state */}
        {(status === 'idle' || status === 'connecting') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
             <div style={{ background: 'rgba(16,185,129,0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
               <MessageSquare size={64} color="#10b981" />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your AI Tutor is Ready</h3>
             <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
               Ask doubts, practice quizzes, and casually talk. You can upload reference files and get instant spoken replies.
             </p>
             <button onClick={startSession} disabled={status === 'connecting'} className="btn btn-primary btn-lg" style={{ background: '#10b981', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', minWidth: '200px' }}>
               {status === 'connecting' ? 'Connecting...' : <><Play fill="#fff" size={20}/> Start Call</>}
             </button>
          </div>
        )}

        {/* Active Chat Transcript */}
        {(status === 'active' || status === 'ended') && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {transcript.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%', background: msg.role === 'user' ? '#10b981' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  padding: '1rem', borderRadius: '16px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role !== 'user' ? '4px' : '16px',
                  border: msg.role !== 'user' ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.text}</span>
                </div>
             ))}
             <div ref={transcriptEndRef} />
          </div>
        )}

        {/* Input Footer */}
        {status === 'active' && (
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Visual Wave */}
            {isSpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'ping 1s infinite' }} />
                AI is speaking...
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              
              <button onClick={toggleMute} className="btn" style={{ background: isMuted ? '#ef4444' : 'var(--bg-tertiary)', color: isMuted ? '#fff' : 'var(--text-primary)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }} title={isMuted ? "Unmute Mic" : "Mute Mic"}>
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <label className="btn" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', margin: 0 }} title="Upload File">
                <FileUp size={20} />
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>

              <input 
                type="text" 
                placeholder="Type your doubt here..." 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
              />

              <button onClick={handleSendText} className="btn" style={{ background: '#10b981', color: '#fff', padding: '0.75rem', borderRadius: '12px', border: 'none' }}>
                <Send size={20} />
              </button>

              <button onClick={handleEnd} className="btn" style={{ background: '#ef4444', color: '#fff', padding: '0.75rem', borderRadius: '12px', border: 'none' }} title="End Call">
                <PhoneOff size={20} />
              </button>
            </div>
            {uploadedFile && (
              <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileUp size={14} /> Attached: {uploadedFile}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
