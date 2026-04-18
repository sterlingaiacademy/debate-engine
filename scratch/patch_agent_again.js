const fs = require('fs');
const path = require('path');

// __dirname is '.../scratch', so we go up one level
const p = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'ConversationalAgent.jsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/const \[status, setStatus\] = useState\('idle'\);/, 
`const [status, setStatus] = useState('select_topic');
  const TOPICS = [
    { id: 1, title: 'Chit Chat', desc: 'Just have a casual talk with your AI tutor.', icon: '💬', color: '#10b981' },
    { id: 2, title: 'Doubt Clearing', desc: 'Ask questions and clear up any doubts.', icon: '🔍', color: '#f59e0b' },
    { id: 3, title: 'Quiz', desc: 'Test yourself with a quick quiz.', icon: '🎓', color: '#8b5cf6' }
  ];
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);`);

c = c.replace(/setStatus\('config'\); \/\/ Show Time Selection Modal/, '// stay on select_topic');

c = c.replace(/const startDebateSession = async \(\) => {/, 
`const handleTopicSelect = (topic) => { setSelectedTopic(topic); setStatus('config'); };

  const startDebateSession = async () => {`);

c = c.replace(/agentId,\r?\n\s*onConnect/, 
`agentId,
        dynamicVariables: { topic: selectedTopic?.title || 'General' },
        onConnect`);

c = c.replace(/\{\/\* Chat Window \*\/\}/, 
`{status === 'select_topic' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.5s' }}>
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
                  border: \`2px solid \${hoveredTopic === topic.id ? topic.color : 'var(--border)'}\`, 
                  borderRadius: '24px', 
                  padding: '2rem 1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease', 
                  transform: hoveredTopic === topic.id ? 'translateY(-6px)' : 'none', 
                  boxShadow: hoveredTopic === topic.id ? \`0 16px 32px \${topic.color}20\` : 'var(--shadow-md)'
                }}
              >
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: \`\${topic.color}15\`, color: topic.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
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
      {status !== 'select_topic' && (`);

c = c.replace(/<\/div>\r?\n\s*<\/div>\r?\n\s*<\/>\r?\n\s*\);\r?\n}\s*$/, 
`</div></div>)}</>);}
`);

fs.writeFileSync(p, c);
console.log('Patched');
