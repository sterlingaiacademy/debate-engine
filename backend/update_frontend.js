const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
const keyPath = process.env.HOME + '/.ssh/id_ed25519';
conn.on('ready', () => {
  console.log("Connected to SSH. Updating frontend...");
  // First upload the new file
  const localFile = '/Users/hananphashim/.gemini/antigravity/worktrees/debate-engine/analyze-entire-project-scope/frontend/src/pages/SpeechAnalysis.jsx';
  const remoteFile = '/home/graceandforce/debate-engine/frontend/src/pages/SpeechAnalysis.jsx';
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('File uploaded. Building...');
      conn.exec("source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && pm2 restart all", (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Build process closed with code ' + code);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          process.stderr.write('STDERR: ' + data);
        });
      });
    });
  });
});
conn.connect({
  host: '20.62.247.240',
  port: 22,
  username: 'graceandforce',
  privateKey: fs.readFileSync(keyPath)
});
