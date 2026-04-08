global.navigator = { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [] }) } };
import { Conversation } from '@11labs/client';

console.log("Starting session...");
Conversation.startSession({
  agentId: 'agent_4501kngj040nfdna0c7yck5r5156',
  dynamicVariables: { topic: "Test Topic" },
  overrides: {
    agent: {
      firstMessage: `Welcome to the Model United Nations debate simulator. The agenda topic for this session is: "Test". Before we begin, which country would you like me to represent?`
    }
  },
  onConnect: () => { console.log("CONNECTED!"); process.exit(0); },
  onError: (err) => { console.error("CRASH ERROR:", err); process.exit(1); },
  onDisconnect: () => { console.log("DISCONNECTED!"); process.exit(0); }
}).then(() => console.log("Promise resolved")).catch(e => { console.error("Catch:", e); process.exit(1); });
