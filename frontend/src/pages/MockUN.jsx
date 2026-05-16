import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, PhoneOff, MessageSquare, Globe, ChevronRight, Mic, MicOff } from 'lucide-react';
import { Conversation } from '@11labs/client';
import GeminiWave from '../components/GeminiWave';
import TranscriptView from '../components/TranscriptView';
import PremiumEnrollModal from '../components/PremiumEnrollModal';
import { API_BASE } from '../api';

const MODEL_UN_AGENT_ID = 'agent_3001krh58bhcfp2r3p6nv4efm1je';

const UN_TOPICS = [
  { id: 1, topic: 'Russia–Ukraine War and the Future of European Security', emoji: '🇺🇦', tag: 'Geopolitics' },
  { id: 2, topic: 'Israel–Palestine Conflict and the Two-State Solution', emoji: '🕊️', tag: 'Peace & Security' },
  { id: 3, topic: 'Regulation of Artificial Intelligence in Warfare', emoji: '🤖', tag: 'Technology & Ethics' },
  { id: 4, topic: 'Climate Change as a Threat to Global Peace', emoji: '🌍', tag: 'Environment' },
  { id: 5, topic: 'Nuclear Proliferation and Disarmament', emoji: '☢️', tag: 'Arms Control' },
  { id: 6, topic: 'Global Refugee and Migration Crisis', emoji: '🚶', tag: 'Humanitarian' },
  { id: 7, topic: 'Global Pandemic Preparedness and Biosecurity', emoji: '🦠', tag: 'Health Security' },
  { id: 8, topic: 'Reform of the UN Security Council', emoji: '🏛️', tag: 'Governance' },
  { id: 9, topic: 'Regulation of Big Tech and Digital Sovereignty', emoji: '💻', tag: 'Digital Policy' },
  { id: 10, topic: 'Sustainable Development Goals (SDGs) and Global Inequality', emoji: '⚖️', tag: 'Development' },
  { id: 11, topic: 'Global Standards for Ethical Artificial Intelligence in Education', emoji: '🎓', tag: 'Future Governance' },
  { id: 12, topic: 'International Cooperation for Cybersecurity and Digital Safety', emoji: '🛡️', tag: 'Future Governance' },
  { id: 13, topic: 'Building Responsible Global Frameworks for Quantum Computing', emoji: '⚛️', tag: 'Future Governance' },
  { id: 14, topic: 'Strengthening International Disaster Response Systems', emoji: '🚨', tag: 'Future Governance' },
  { id: 15, topic: 'Future of Multilingualism and Indigenous Language Preservation', emoji: '🗣️', tag: 'Future Governance' },
  { id: 16, topic: 'Creating Global Guidelines for Deepfake and Synthetic Media Regulation', emoji: '🎭', tag: 'Future Governance' },
  { id: 17, topic: 'Global Governance of Autonomous Transportation Systems', emoji: '🚗', tag: 'Future Governance' },
  { id: 18, topic: 'Ethical Use of Facial Recognition and Biometric Technologies', emoji: '👁️', tag: 'Future Governance' },
  { id: 19, topic: 'Digital Identity Protection and Online Privacy Rights', emoji: '🔐', tag: 'Future Governance' },
  { id: 20, topic: 'Future of International Cooperation in Space Exploration', emoji: '🚀', tag: 'Future Governance' },
  { id: 21, topic: 'Ocean Plastic Pollution and Global Waste Management', emoji: '🌊', tag: 'Sustainability' },
  { id: 22, topic: 'Sustainable Smart Cities for the Next Generation', emoji: '🏙️', tag: 'Sustainability' },
  { id: 23, topic: 'Water Security and Groundwater Conservation', emoji: '💧', tag: 'Sustainability' },
  { id: 24, topic: 'Global Cooperation for Reforestation and Biodiversity Protection', emoji: '🌲', tag: 'Sustainability' },
  { id: 25, topic: 'Climate-Resilient Agriculture and Food Security', emoji: '🌾', tag: 'Sustainability' },
  { id: 26, topic: 'Renewable Energy Transition in Developing Nations', emoji: '☀️', tag: 'Sustainability' },
  { id: 27, topic: 'Sustainable Fashion and Reduction of Textile Waste', emoji: '👗', tag: 'Sustainability' },
  { id: 28, topic: 'Urban Heat Islands and Climate-Adaptive Infrastructure', emoji: '🌡️', tag: 'Sustainability' },
  { id: 29, topic: 'Future of Electric Mobility and Sustainable Transportation', emoji: '⚡', tag: 'Sustainability' },
  { id: 30, topic: 'Global Strategies for Clean Air and Pollution Reduction', emoji: '💨', tag: 'Sustainability' },
  { id: 31, topic: 'Mental Health Support Systems for Youth in the Digital Age', emoji: '🧠', tag: 'Health & Society' },
  { id: 32, topic: 'Combating Loneliness and Social Isolation Among Young People', emoji: '🤝', tag: 'Health & Society' },
  { id: 33, topic: 'Ethical Challenges of Human Genetic Engineering', emoji: '🧬', tag: 'Health & Society' },
  { id: 34, topic: 'Global Access to Affordable Healthcare Technologies', emoji: '🏥', tag: 'Health & Society' },
  { id: 35, topic: 'Future of Nutrition, Food Technology, and Public Health', emoji: '🥗', tag: 'Health & Society' },
  { id: 36, topic: 'Balancing Technology Use and Human Wellbeing in Schools', emoji: '📱', tag: 'Health & Society' },
  { id: 37, topic: 'International Collaboration Against Online Misinformation', emoji: '📰', tag: 'Health & Society' },
  { id: 38, topic: 'Protection of Children in the Era of AI and Social Media', emoji: '🛡️', tag: 'Health & Society' },
  { id: 39, topic: 'Promoting Inclusive Education for Neurodiverse Learners', emoji: '🧩', tag: 'Health & Society' },
  { id: 40, topic: 'Preparing Humanity for Future Pandemics Through Global Cooperation', emoji: '🩺', tag: 'Health & Society' },
  { id: 41, topic: 'Global Regulation of Autonomous AI Systems and Human Oversight', emoji: '⚖️', tag: 'AI Ethics' },
  { id: 42, topic: 'Ethical Boundaries of AI in Education, Surveillance, and Governance', emoji: '🏫', tag: 'AI Ethics' },
  { id: 43, topic: 'Preventing Bias, Manipulation, and Misinformation in Generative AI', emoji: '🕵️', tag: 'AI Ethics' },
  { id: 44, topic: 'Planetary Strategies for Climate Adaptation and Ecological Restoration', emoji: '🌱', tag: 'Future Earth' },
  { id: 45, topic: 'Global Water Security and Sustainable Resource Management', emoji: '🚰', tag: 'Future Earth' },
  { id: 46, topic: 'Balancing Economic Growth with Biodiversity Preservation', emoji: '🦋', tag: 'Future Earth' },
  { id: 47, topic: 'Role of Youth Leadership in Solving Global Challenges', emoji: '🌟', tag: 'Youth Diplomacy' },
  { id: 48, topic: 'Building Cross-Cultural Dialogue in the Age of Digital Polarization', emoji: '🌐', tag: 'Youth Diplomacy' },
  { id: 49, topic: 'Preparing Future Generations for Ethical Leadership and Global Citizenship', emoji: '🎓', tag: 'Youth Diplomacy' },
  { id: 50, topic: 'International Laws for Lunar Colonization and Space Resources', emoji: '🌕', tag: 'Space Governance' },
  { id: 51, topic: 'Preventing Militarization of Outer Space', emoji: '🛰️', tag: 'Space Governance' },
  { id: 52, topic: 'Global Cooperation for Interplanetary Exploration and Research', emoji: '🌌', tag: 'Space Governance' },
  { id: 53, topic: 'Ethical Regulation of Human Gene Editing and CRISPR Technologies', emoji: '🧬', tag: 'Bioethics' },
  { id: 54, topic: 'Bioethics of AI-Driven Healthcare and Predictive Diagnostics', emoji: '🩺', tag: 'Bioethics' },
  { id: 55, topic: 'Global Governance of Synthetic Biology and Human Enhancement', emoji: '🦾', tag: 'Bioethics' },
  { id: 56, topic: 'Protecting Human Identity and Privacy in the Digital Era', emoji: '🔒', tag: 'Digital Civilization' },
  { id: 57, topic: 'Governance of Virtual Societies, Metaverse Economies, and Digital Citizenship', emoji: '🕶️', tag: 'Digital Civilization' },
  { id: 58, topic: 'Combating Digital Addiction and Protecting Human Attention', emoji: '📵', tag: 'Digital Civilization' },
  { id: 59, topic: 'Designing Sustainable AI-Powered Smart Cities', emoji: '🌇', tag: 'Future Cities' },
  { id: 60, topic: 'Urban Planning for Climate Resilience and Public Wellbeing', emoji: '🏡', tag: 'Future Cities' },
  { id: 61, topic: 'Future Mobility Systems and Sustainable Transportation Infrastructure', emoji: '🚄', tag: 'Future Cities' },
  { id: 62, topic: 'Governance Frameworks for Artificial General Intelligence (AGI)', emoji: '🧠', tag: 'UN 2050' },
  { id: 63, topic: 'Preparing Humanity for Climate Migration and Population Shifts', emoji: '🚶', tag: 'UN 2050' },
  { id: 64, topic: 'The Future of Work, Universal Basic Income, and Human Purpose', emoji: '💼', tag: 'UN 2050' },
  { id: 65, topic: 'Global Preparedness Against Future Pandemics and Biosecurity Threats', emoji: '☣️', tag: 'Planetary Security' },
  { id: 66, topic: 'Protecting Critical Infrastructure from Cyber Warfare and AI Attacks', emoji: '💻', tag: 'Planetary Security' },
  { id: 67, topic: 'International Cooperation Against Asteroid and Space Threats', emoji: '☄️', tag: 'Planetary Security' },
  { id: 68, topic: 'Protecting Human Creativity in the Era of Generative AI', emoji: '🎨', tag: 'Creative Economy' },
  { id: 69, topic: 'Future of Creative Industries, Digital Ownership, and Intellectual Property', emoji: '©️', tag: 'Creative Economy' },
  { id: 70, topic: 'Building Creative Economies Through Arts, Media, Gaming, and Storytelling', emoji: '🎮', tag: 'Creative Economy' }
];

// step: 'time' | 'topics' | 'debating' | 'evaluating' | 'error' | 'out_of_time'
export default function MockUN({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('loading');
  const [maxMinutesAvailable, setMaxMinutesAvailable] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [customValue, setCustomValue] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [customTopicMode, setCustomTopicMode] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');

  // Debate state
  const [timer, setTimer] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcript, setTranscript] = useState([]);
  const transcriptRef = useRef([]);
  const conversationRef = useRef(null);
  const timerRef = useRef(null);
  const currentTimerRef = useRef(0);
  const initialTimerRef = useRef(300);
  const initialDailyRemainingRef = useRef(600);
  const conversationIdRef = useRef(null);
  const agentHasSpokenRef = useRef(false);

  const wakeLockRef = useRef(null);

  // Fetch daily remaining time
  useEffect(() => {
    let cancelled = false;
    const fetchLimits = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/time-limits/${user.studentId}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const remain = data.remainingRanked;
          if (remain <= 0) { setStep('out_of_time'); return; }
          initialDailyRemainingRef.current = remain;
          setMaxMinutesAvailable(Math.floor(remain / 60));
          setStep('time');
        } else {
          setStep('error');
        }
      } catch {
        if (!cancelled) setStep('error');
      }
    };
    fetchLimits();
    return () => { cancelled = true; };
  }, [user.studentId]);

  // Wake lock while debating
  useEffect(() => {
    let active = true;
    if (isActive) {
      (async () => {
        try {
          if ('wakeLock' in navigator && active) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch {}
      })();
    } else {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    }
    return () => {
      active = false;
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [isActive]);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;
    const startTime = Date.now();
    let lastSyncTime = startTime;
    const startVal = initialTimerRef.current;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTime = Math.max(0, startVal - elapsed);
      setTimer(newTime);
      currentTimerRef.current = newTime;
      const sinceLast = Math.floor((Date.now() - lastSyncTime) / 1000);
      if (sinceLast >= 15) {
        fetch(`${API_BASE}/api/time-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user.studentId, usedSeconds: sinceLast, isPersona: false }),
        }).catch(() => {});
        lastSyncTime = Date.now();
      }
      if (newTime <= 0) { clearInterval(timerRef.current); handleTimeUp(); }
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleContinueToTopics = () => {
    setStep('topics');
  };

  const handleTopicSelect = async (topicObj) => {
    setSelectedTopic(topicObj.topic);
    setStep('connecting');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const limitSeconds =
        selectedDuration === 'custom'
          ? parseInt(customValue, 10) * 60
          : selectedDuration * 60;
      const sessionMax = Math.min(limitSeconds, initialDailyRemainingRef.current);
      initialTimerRef.current = sessionMax;
      currentTimerRef.current = sessionMax;
      setTimer(sessionMax);

      window._activeElevenLabsSessions = [];

      Conversation.startSession({
        agentId: MODEL_UN_AGENT_ID,
        dynamicVariables: { topic: topicObj.topic },
        onConnect: () => {
          setStep('debating');
          setIsActive(true);
        },
        onDisconnect: () => {
          setIsActive(false);
          handleEndDebate();
        },
        onMessage: (msg) => {
          setTranscript(p => {
            const t = [...p, { role: msg.source, text: msg.message }];
            transcriptRef.current = t;
            return t;
          });
        },
        onError: (err) => {
          console.error("ElevenLabs Error:", err);
          setStep('error');
        },
        onModeChange: (m) => {
          setIsSpeaking(m.mode === 'speaking');
          if (m.mode === 'speaking') {
             agentHasSpokenRef.current = true;
          }
        },
      }).then(sessionInstance => {
        // Now the promise has resolved and we safely have the instance
        try {
          const id = sessionInstance?.getId?.() || sessionInstance?.id || null;
          if (id) conversationIdRef.current = id;
        } catch {}

        window._activeElevenLabsSessions.push(sessionInstance);
        conversationRef.current = sessionInstance;
      }).catch(() => {
        setStep('error');
      });
    } catch (err) {
      setStep('error');
    }
  };

  const handleTimeUp = async () => {
    clearInterval(timerRef.current);
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch {}
    }
    setIsActive(false);
    setStep('out_of_time');

    const elapsed = initialTimerRef.current - currentTimerRef.current;
    const alreadySynced = Math.floor(elapsed / 15) * 15;
    const unsaved = elapsed - alreadySynced;
    if (unsaved > 0) {
      fetch(`${API_BASE}/api/time-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.studentId, usedSeconds: unsaved, isPersona: false }),
      }).catch(() => {});
    }
  };

  const handleEndDebate = async () => {
    clearInterval(timerRef.current);
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch {}
    }
    setIsActive(false);

    // Sync remaining unsaved time
    const elapsed = initialTimerRef.current - currentTimerRef.current;
    const alreadySynced = Math.floor(elapsed / 15) * 15;
    const unsaved = elapsed - alreadySynced;
    if (unsaved > 0) {
      fetch(`${API_BASE}/api/time-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.studentId, usedSeconds: unsaved, isPersona: false }),
      }).catch(() => {});
    }

    // No analysis evaluation — go straight back to dashboard
    navigate('/dashboard');
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timerWarning = timer < 60;

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  // Loading
  if (step === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
      </div>
    );
  }

  // Out of time
  if (step === 'out_of_time') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', width: '100%', minHeight: '60vh' }}>
        <PremiumEnrollModal user={user} onDismiss={() => navigate('/dashboard')} />
      </div>
    );
  }

  // Error
  if (step === 'error') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
        <div className="alert alert-error" style={{ maxWidth: '400px' }}>
          <strong>Connection Failed:</strong> Could not connect to AI agent. Check microphone permissions and try again.
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
          <button onClick={() => setStep('time')} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  // Connecting
  if (step === 'connecting') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '2rem', textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: '5rem' }}>🌐</span>
          <div style={{
            position: 'absolute', top: -12, left: -12, right: -12, bottom: -12,
            border: '3px solid transparent', borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
        </div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connecting to Model UN…</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Topic: <strong>{selectedTopic}</strong></p>
        </div>
      </div>
    );
  }

  // Active Debate
  if (step === 'debating') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100vh', margin: 0, padding: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="animate-fade-in" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '2rem',
              position: 'relative', width: '100%', height: '100%',
            }}>
              {/* UN Banner at top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.9) 50%, rgba(15,23,42,0.9) 100%)',
                borderBottom: '1px solid rgba(251,191,36,0.2)',
                gap: '0.75rem',
                zIndex: 20,
              }}>
                <Globe size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Model UN &nbsp;•&nbsp;
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedTopic}
                </span>
              </div>

              <GeminiWave isSpeaking={isSpeaking} />

              <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: showTranscript ? '0' : '15vh' }}>
                {showTranscript && <TranscriptView transcript={transcript} agentName="UN Moderator" />}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                    {!agentHasSpokenRef.current ? 'Initializing Debate...' : isSpeaking ? 'UN Moderator is speaking...' : 'Listening carefully…'}
                  </h3>
                  {!agentHasSpokenRef.current ? (
                    <div style={{ margin: '0.65rem 0', display: 'flex', justifyContent: 'center' }}>
                      <div className="animate-spin" style={{ width: 24, height: 24, border: '3px solid rgba(251,191,36,0.2)', borderTopColor: '#fbbf24', borderRadius: '50%' }} />
                    </div>
                  ) : (
                    <div className="waveform" style={{ opacity: 1, margin: '0.5rem 0', height: '24px', gap: '4px' }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="waveform-bar" style={{ height: isSpeaking ? '24px' : '6px', background: '#fbbf24', minWidth: '6px' }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginTop: 'auto', marginBottom: '2rem', zIndex: 10,
                background: 'rgba(30,41,59,0.5)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                padding: '0.75rem', borderRadius: '40px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 1.25rem', height: '56px',
                  border: `2px solid ${timerWarning ? '#ef4444' : 'rgba(251,191,36,0.4)'}`,
                  background: timerWarning ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '99px',
                  color: timerWarning ? '#ef4444' : '#fff',
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }} className={timerWarning ? 'animate-pulse' : ''}>
                    {formatTime(timer)}
                  </span>
                </div>

                <button onClick={() => setShowTranscript(p => !p)} className="btn" style={{
                  background: showTranscript ? '#fbbf24' : 'var(--bg-secondary)',
                  color: showTranscript ? '#000' : 'var(--text-primary)', border: 'none',
                  borderRadius: '50%', width: '56px', height: '56px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }} title="Toggle Transcript">
                  <MessageSquare size={24} />
                </button>

                <button
                  onClick={async () => {
                    const nextMute = !isMuted;
                    setIsMuted(nextMute);
                    if (conversationRef.current) {
                      try { await conversationRef.current.setVolume({ volume: nextMute ? 0 : 1 }); } catch (e) { console.error('Mute error', e); }
                    }
                  }}
                  className="btn"
                  style={{
                    background: isMuted ? 'rgba(239,68,68,0.2)' : 'var(--bg-secondary)',
                    color: isMuted ? '#ef4444' : 'var(--text-primary)',
                    border: isMuted ? '1px solid rgba(239,68,68,0.3)' : 'none',
                    borderRadius: '50%', width: '56px', height: '56px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                  title={isMuted ? "Unmute Agent" : "Mute Agent"}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button onClick={handleEndDebate} className="btn" style={{
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '50%', width: '56px', height: '56px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }} title="End Session">
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── TIME LIMIT STEP ─────────────────────────────────────────────────────────
  if (step === 'time') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', margin: '0 auto', maxWidth: '900px', overflowY: 'auto', padding: '4rem 1.5rem' }}>
        <div style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(217,119,6,0.1) 100%)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '99px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>
              <Globe size={14} color="#fbbf24" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Model UN · {user?.grade ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade) : (user?.classLevel || 'Premium')}
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Choose Time Limit</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>How long do you want to debate today?</p>
          </div>

          {/* Time Limit Step */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem' }}>

            {/* Daily pool */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.08) 100%)',
              padding: '1.25rem 2.5rem', borderRadius: '16px',
              border: '1px solid rgba(251,191,36,0.2)',
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#d97706' }}>Daily Remaining Pool</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                {maxMinutesAvailable} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>mins</span>
              </span>
            </div>

            {/* Preset buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.75rem', width: '100%', maxWidth: '560px' }}>
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
                      background: isDisabled ? 'var(--bg-secondary)' : isSelected ? '#d97706' : 'transparent',
                      borderColor: isDisabled ? 'var(--border)' : isSelected ? '#d97706' : 'var(--border)',
                      color: isDisabled ? 'var(--text-muted)' : isSelected ? '#fff' : 'var(--text-primary)',
                      cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1,
                    }}
                  >{preset}m</button>
                );
              })}
              <button
                onClick={() => setSelectedDuration('custom')}
                style={{
                  padding: '1rem 0', borderRadius: '12px', fontWeight: 700, fontSize: '1.25rem',
                  transition: 'all 0.2s', border: '2px solid',
                  background: selectedDuration === 'custom' ? '#d97706' : 'transparent',
                  borderColor: selectedDuration === 'custom' ? '#d97706' : 'var(--border)',
                  color: selectedDuration === 'custom' ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >Custom</button>
            </div>

            {selectedDuration === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '300px', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>
                  {customValue || 1}<span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>m</span>
                </span>
                <input
                  type="range" min={1} max={maxMinutesAvailable}
                  value={customValue || 1}
                  onChange={e => { setCustomValue(parseInt(e.target.value, 10)); setSelectedDuration('custom'); }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#d97706', height: '8px', borderRadius: '4px' }}
                />
              </div>
            )}

            <button
              onClick={handleContinueToTopics}
              disabled={!selectedDuration || (selectedDuration === 'custom' && (!customValue || customValue < 1))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '1.1rem 3rem', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#fff', border: 'none', cursor: 'pointer', width: '100%', maxWidth: '300px',
                boxShadow: '0 8px 24px rgba(217,119,6,0.3)', transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(217,119,6,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(217,119,6,0.3)'; }}
            >
              Continue <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── TOPIC PICKER STEP ───────────────────────────────────────────────────────
  if (step === 'topics') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', margin: '0 auto', maxWidth: '900px', overflowY: 'auto', padding: '4rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(217,119,6,0.1) 100%)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '99px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>
            <Globe size={14} color="#fbbf24" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Model UN · {user?.grade ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade) : (user?.classLevel || 'Premium')}
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Choose Your Topic</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Select a global issue to debate. Your AI opponent will argue the opposing position.</p>
        </div>

        {/* Topic Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', width: '100%', maxWidth: '750px', margin: '0 auto', marginBottom: '2rem' }}>
          
          {/* Custom Topic Selection */}
          {!customTopicMode ? (
            <div 
              onClick={() => setCustomTopicMode(true)}
              onMouseEnter={() => setHoveredTopic('custom_btn')}
              onMouseLeave={() => setHoveredTopic(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.25rem 1.5rem', borderRadius: '16px', cursor: 'pointer',
                background: hoveredTopic === 'custom_btn'
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.05) 100%)'
                  : 'var(--bg-secondary)',
                border: hoveredTopic === 'custom_btn' ? '1px solid rgba(251,191,36,0.35)' : '1px solid var(--border)',
                transition: 'all 0.2s ease',
                transform: hoveredTopic === 'custom_btn' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredTopic === 'custom_btn' ? '0 8px 24px rgba(217,119,6,0.12)' : '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{
                width: 4, height: 48, borderRadius: '4px', flexShrink: 0,
                background: hoveredTopic === 'custom_btn' ? 'linear-gradient(180deg, #fbbf24, #d97706)' : 'var(--border)',
                transition: 'background 0.2s',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: hoveredTopic === 'custom_btn' ? '#d97706' : 'var(--text-muted)',
                  display: 'block', marginBottom: '0.25rem', transition: 'color 0.2s',
                }}>Create Your Own</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Custom Topic ✨</span>
              </div>
              <ChevronRight size={18} color={hoveredTopic === 'custom_btn' ? '#d97706' : 'var(--text-muted)'} style={{ transition: 'color 0.2s' }} />
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '1rem',
              padding: '1.5rem', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.05) 100%)',
              border: '1px solid rgba(251,191,36,0.35)',
              boxShadow: '0 8px 24px rgba(217,119,6,0.12)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enter Custom Topic</span>
                <button onClick={() => setCustomTopicMode(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
              </div>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g., The impact of microplastics on marine ecosystems..." 
                value={customTopicInput}
                onChange={e => setCustomTopicInput(e.target.value)}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '12px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button 
                disabled={!customTopicInput.trim()}
                onClick={() => {
                  handleTopicSelect({ id: 'custom', topic: customTopicInput.trim(), emoji: '✨', tag: 'Custom Topic' });
                }}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', opacity: !customTopicInput.trim() ? 0.5 : 1 }}
              >
                Debate This Topic
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR CHOOSE A PRESET</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {UN_TOPICS.map(t => (
            <div
              key={t.id}
              onClick={() => handleTopicSelect(t)}
              onMouseEnter={() => setHoveredTopic(t.id)}
              onMouseLeave={() => setHoveredTopic(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.25rem 1.5rem', borderRadius: '16px', cursor: 'pointer',
                background: hoveredTopic === t.id
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.05) 100%)'
                  : 'var(--bg-secondary)',
                border: hoveredTopic === t.id ? '1px solid rgba(251,191,36,0.35)' : '1px solid var(--border)',
                transition: 'all 0.2s ease',
                transform: hoveredTopic === t.id ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredTopic === t.id ? '0 8px 24px rgba(217,119,6,0.12)' : '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {/* Left accent bar */}
              <div style={{
                width: 4, height: 48, borderRadius: '4px', flexShrink: 0,
                background: hoveredTopic === t.id
                  ? 'linear-gradient(180deg, #fbbf24, #d97706)'
                  : 'var(--border)',
                transition: 'background 0.2s',
              }} />

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: hoveredTopic === t.id ? '#d97706' : 'var(--text-muted)',
                  display: 'block', marginBottom: '0.25rem', transition: 'color 0.2s',
                }}>{t.tag}</span>
                <span style={{
                  fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)',
                }}>{t.topic}</span>
              </div>

              {/* Arrow */}
              <ChevronRight size={18} color={hoveredTopic === t.id ? '#d97706' : 'var(--text-muted)'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
            </div>
          ))}
        </div>

        <button onClick={() => setStep('time')} className="btn btn-secondary" style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
          ← Change Time Limit
        </button>
      </div>
    );
  }

  return null;
}
