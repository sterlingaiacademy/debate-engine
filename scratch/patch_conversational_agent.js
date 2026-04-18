const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'ConversationalAgent.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacement 1: Add topics and set status
const replacement1Target = `  const [status, setStatus] = useState('idle'); // idle | connecting | config | active | ended | error | out_of_time
  const [maxMinutesAvailable, setMaxMinutesAvailable] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [customValue, setCustomValue] = useState('');`;

const replacement1Text = `  const [status, setStatus] = useState('select_topic'); // select_topic | config | connecting | active | ended | error | out_of_time
  const [maxMinutesAvailable, setMaxMinutesAvailable] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [customValue, setCustomValue] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);

  const TOPICS = [
    { id: 1, title: 'Chit Chat', desc: 'Just have a casual talk with your AI tutor.', icon: '💬', color: '#10b981' },
    { id: 2, title: 'Doubt Clearing', desc: 'Ask questions and clear up any doubts.', icon: '🔍', color: '#f59e0b' },
    { id: 3, title: 'Quiz', desc: 'Test yourself with a quick quiz on any subject.', icon: '🎓', color: '#8b5cf6' }
  ];`;

// Replacement 2: Fetch limits modification
const replacement2Target = `  // Robust connection handling for React Strict Mode and fast navigation
  useEffect(() => {
    let isTerminated = false;

    const fetchLimits = async () => {
      setStatus('connecting');
      try {
        const res = await fetch(\`/api/time-limits/\${user.studentId}\`);
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
          setStatus('config'); // Show Time Selection Modal
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
  }, [agentId, user?.studentId]);`;

const replacement2Text = `  // Robust connection handling for React Strict Mode and fast navigation
  useEffect(() => {
    let isTerminated = false;

    const fetchLimits = async () => {
      try {
        const res = await fetch(\`/api/time-limits/\${user.studentId}\`);
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
          // Do not change status; remain in select_topic
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

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setStatus('config');
  };`;

// Replacement 3: Start debate variables
const replacement3Target = `      let localSession = await Conversation.startSession({
        agentId,
        onConnect: () => {`;
const replacement3Text = `      let localSession = await Conversation.startSession({
        agentId,
        dynamicVariables: { topic: selectedTopic?.title || 'Chit Chat' },
        onConnect: () => {`;

// Replacement 4: UI Topics Selection
const replacement4Target = `    <>
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
        <div style={{ flex: 1, overflowY: isActive ? 'hidden' : 'auto', padding: isActive ? 0 : '1.5rem', display: 'flex', flexDirection: 'column', gap: isActive ? 0 : '1rem' }}>`;

const replacement4Text = `    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 64px - 1.5rem)' }}>

      {/* Topics Selection Screen */}
      {status === 'select_topic' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>What do you feel like doing?</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px' }}>
            Whether you want to learn something new, clear up a doubt, or test yourself with a quiz — I've got you covered. Pick a mode below to start:
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
                  border: \`2px solid \${hoveredTopic === topic.id ? topic.color : 'var(--border)'}\`,
                  borderRadius: '24px', padding: '2rem 1.5rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  transform: hoveredTopic === topic.id ? 'translateY(-6px)' : 'none',
                  boxShadow: hoveredTopic === topic.id ? \`0 16px 32px \${topic.color}20\` : 'var(--shadow-md)'
                }}
              >
                <div style={{ 
                  width: '72px', height: '72px', borderRadius: '20px', 
                  background: \`\${topic.color}15\`, color: topic.color, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '2rem', marginBottom: '0.5rem' 
                }}>
                  {topic.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{topic.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{topic.desc}</p>
                <div style={{
                  marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  color: topic.color, fontWeight: 700, fontSize: '0.9rem',
                  opacity: hoveredTopic === topic.id ? 1 : 0.6,
                  transform: hoveredTopic === topic.id ? 'translateX(4px)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  Select Mode <Play size={16} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {status !== 'select_topic' && (
      <div className="card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        minHeight: 0,
        borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{ flex: 1, overflowY: isActive ? 'hidden' : 'auto', padding: isActive ? 0 : '1.5rem', display: 'flex', flexDirection: 'column', gap: isActive ? 0 : '1rem' }}>`;

// Replacement 5: Wrap end div
const replacement5Target = `          )}
        </div>
      </div>
    </div>
    </>`;
const replacement5Text = `          )}
        </div>
      </div>
      )}
    </div>
    </>`;

// Process
let newContent = content;

if (!newContent.includes(replacement1Target.split('\\n')[0].trim())) console.log("Failed 1");
else newContent = newContent.replace(replacement1Target, replacement1Text);

if (!newContent.includes(replacement2Target.split('\\n')[0].trim())) console.log("Failed 2");
else newContent = newContent.replace(replacement2Target, replacement2Text);

if (!newContent.includes(replacement3Target.split('\\n')[0].trim())) console.log("Failed 3");
else newContent = newContent.replace(replacement3Target, replacement3Text);

if (!newContent.includes(replacement4Target.split('\\n')[0].trim())) console.log("Failed 4");
else newContent = newContent.replace(replacement4Target, replacement4Text);

if (!newContent.includes("</div>\\n      </div>\\n    </div>\\n    </>")) console.log("Failed 5");
else newContent = newContent.replace(replacement5Target, replacement5Text);

fs.writeFileSync(filePath, newContent);
console.log("Successfully patched ConversationalAgent.jsx");
