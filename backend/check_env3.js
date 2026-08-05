const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat /home/graceandforce/debate-engine/backend/.env`, (err, stream) => {
    stream.on('data', d => {
      const output = d.toString();
      const anth = output.split('\n').find(l => l.startsWith('ANTHROPIC_API_KEY'));
      console.log('ANTHROPIC_API_KEY starts with:', anth ? anth.substring(0, 30) : 'not found');
    });
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
