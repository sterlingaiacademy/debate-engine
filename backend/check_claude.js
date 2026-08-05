const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_models.js
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function testModel(modelName) {
  try {
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [{ role: "user", content: "Hi" }]
    });
    console.log("SUCCESS:", modelName);
  } catch(e) {
    console.log("FAILED:", modelName, e.message);
  }
}

async function run() {
  await testModel('claude-3-5-haiku-latest');
  await testModel('claude-3-5-sonnet-latest');
  await testModel('claude-3-7-sonnet-latest');
  await testModel('claude-3-haiku-20240307');
}
run();
INNER_EOF
node /home/graceandforce/debate-engine/backend/test_models.js`, (err, stream) => {
    stream.on('data', d => console.log(d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
