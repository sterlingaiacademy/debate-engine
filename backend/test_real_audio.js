const WebSocket = require('ws');
const fs = require('fs');
const token = 'f3dc6e80f8354e4998755cdb10b90445';

const ws = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?speech_model=universal-3-5-pro&sample_rate=16000&token=${token}`);
const fileData = fs.readFileSync('test_audio.raw');

ws.on('open', () => {
  let offset = 0;
  const sendChunk = () => {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (offset >= fileData.length) {
      ws.send(JSON.stringify({ type: "Terminate" }));
      return;
    }
    const chunk = fileData.slice(offset, offset + 4096);
    ws.send(chunk);
    offset += 4096;
    setTimeout(sendChunk, 128); // Send 256ms of audio every 128ms
  };
  sendChunk();
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'PartialTranscript' || msg.type === 'FinalTranscript') {
    console.log(msg.type, ':', msg.text);
  } else {
    console.log('Message:', msg.type);
  }
});
