const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_claude.js
require('dotenv').config({ path: '.env' });
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
async function testModel() {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log('SUCCESS');
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}
testModel();
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_claude.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log(d.toString())).on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
