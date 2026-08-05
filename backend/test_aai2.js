const { AssemblyAI } = require('assemblyai');
async function run() {
  try {
    const assemblyai = new AssemblyAI({ apiKey: 'f3dc6e80f8354e4998755cdb10b90445' });
    const token = await assemblyai.realtime.createTemporaryToken({ expires_in: 3600 });
    console.log("Token:", token);
  } catch(e) {
    console.error("AssemblyAI SDK error:", e.message);
  }
}
run();
