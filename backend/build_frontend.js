const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log("Connected to SSH. Building frontend...");
  conn.exec("source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build", (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Build process closed with code ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
});
conn.connect({
  host: '20.62.247.240',
  port: 22,
  username: 'graceandforce',
  privateKey: require('fs').readFileSync('/Users/hananphashim/.ssh/id_rsa')
});
