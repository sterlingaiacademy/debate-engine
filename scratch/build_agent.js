const fs = require('fs');
const arenaCode = fs.readFileSync('../frontend/src/pages/DebateArena.jsx', 'utf8');

let agentCode = arenaCode;

// 1. Rename Component
agentCode = agentCode.replace('export default function DebateArena({ user }) {', 'export default function ConversationalAgent({ user }) {');

// 2. Remove TOPICS and topic state
agentCode = agentCode.replace(/const TOPICS = \[.*?\];/s, '');
agentCode = agentCode.replace('const [topic] = useState(() => TOPICS[Math.floor(Math.random() * TOPICS.length)]);', '');

// 3. Add getAgentId
const getAgentIdCode = `
  const getAgentId = () => {
    if (user?.classLevel === 'Level 3') return 'agent_3301knv3b67jejpsydj6bt2tf4fc';
    if (user?.classLevel === 'Level 4') return 'agent_7901knvcn8kkf709kzya6d9ky6yw';
    if (user?.classLevel === 'Level 5') return 'agent_3001knvea7y3fn3tdq0r0aczs2h4';
    return 'agent_3301knv3b67jejpsydj6bt2tf4fc';
  };
  const agentId = getAgentId();
`;
agentCode = agentCode.replace('export default function ConversationalAgent({ user }) {', 'export default function ConversationalAgent({ user }) {' + getAgentIdCode);

// 4. Time limits API to 'remainingPersona'
agentCode = agentCode.replace('const remain = data.remainingRanked;', 'const remain = data.remainingPersona;');

// 5. Replace `user.assignedAgentId` checks with `agentId`
agentCode = agentCode.replace(/user\?.assignedAgentId/g, 'agentId');
agentCode = agentCode.replace(/agentId: user\.assignedAgentId/g, 'agentId');

// 6. Time sync to use isPersona: true
agentCode = agentCode.replace(/isPersona: false/g, 'isPersona: true');

// 7. handleEndDebate -> simplify (no evaluate, just tracking session)
const endDebateReplacement = `
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
      fetch('/api/time-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.studentId, usedSeconds: unsavedSeconds, isPersona: true })
      }).catch(e => console.error('Final time sync failed', e));
    }

    const sessionData = {
      studentId: user.studentId,
      debateTopic: 'Conversational Agent Session',
      sessionDuration: initialTimerRef.current - currentTimerRef.current,
      argumentsCount: transcriptRef.current.filter(m => m.role === 'user').length,
      debateScore: 0,
      isPersona: true
    };

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
    } catch(e) {}

    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };
`;

agentCode = agentCode.replace(/const handleEndDebate = async \(\) => \{[\s\S]*?(?=const formatTime =)/, endDebateReplacement);

// 8. Fix UI states for "Analyzing Debate" -> "Session Ended"
agentCode = agentCode.replace('Analyzing Debate...', 'Session Ended');
agentCode = agentCode.replace('The AI is carefully reviewing your arguments!', 'Returning to dashboard...');
agentCode = agentCode.replace('Connecting to your debate buddy…', 'Connecting to your AI Tutor…');
agentCode = agentCode.replace('Choose Time Limit', 'Choose Practice Time Limit');

fs.writeFileSync('../frontend/src/pages/ConversationalAgent.jsx', agentCode);
console.log('Done!');
