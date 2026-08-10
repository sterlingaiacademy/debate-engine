const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '/home/graceandforce/debate-engine/backend/.env' });

async function testModel(modelName) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [{ role: "user", content: "hi" }]
    });
    console.log(`Success with ${modelName}:`, message.content[0].text);
  } catch (e) {
    console.error(`Error with ${modelName}:`, e.message);
  }
}

async function run() {
  await testModel('claude-3-5-haiku-latest');
  await testModel('claude-3-5-haiku-20241022');
  await testModel('claude-haiku-4-5');
}
run();
