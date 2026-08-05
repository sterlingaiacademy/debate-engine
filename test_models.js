const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_models.js
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/ANTHROPIC_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: apiKey });

async function testModel(modelName) {
  try {
    const msg = await anthropic.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log(modelName + ': SUCCESS');
  } catch (e) {
    // suppress 404
  }
}

async function run() {
  await testModel('claude-haiku-4.5');
  await testModel('claude-haiku-4-5');
  await testModel('haiku-4.5');
  await testModel('haiku-4-5');
  await testModel('claude-4.5-haiku');
  await testModel('claude-4-5-haiku');
  await testModel('fable-5');
  await testModel('claude-fable-5');
  await testModel('opus-5');
  await testModel('claude-opus-5');
}
run();
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_models.js`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (data) => console.log(data.toString()))
          .on('close', () => conn.end())
          .stderr.on('data', (data) => console.error(data.toString()));
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
