const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function test() {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "Hi" }]
    });
    console.log("Success with claude-3-5-haiku-20241022");
  } catch(e) {
    console.error("Error with claude-3-5-haiku-20241022:", e.message);
  }
}
test();
