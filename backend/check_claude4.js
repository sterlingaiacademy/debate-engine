const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/test_models2.js
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("NO API KEY");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

async function testModel(modelName) {
  try {
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [{ role: "user", content: "Hi" }]
    });
    console.log("SUCCESS:", modelName);
  } catch(e) {
    if (e.status === 404) {
       console.log("FAILED 404:", modelName);
    } else {
       console.log("FAILED:", modelName, e.message);
    }
  }
}

async function run() {
  await testModel('claude-3-7-sonnet-20250219');
  await testModel('claude-3-5-sonnet-20241022');
  await testModel('claude-3-5-haiku-20241022');
  await testModel('claude-3-5-haiku-latest');
  await testModel('claude-3-7-haiku-20250419'); // guessing a future model name if applicable
}
run();
INNER_EOF
source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && node test_models2.js`, (err, stream) => {
    stream.on('data', d => console.log('STDOUT:', d.toString()));
    stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
