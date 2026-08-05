const { Client } = require('ssh2');

console.log("Connecting via SSH to check pm2...");
const conn = new Client();
conn.on('ready', () => {
  const pass = 'wvpi2!ZnTcV];ncy';
  conn.exec(`echo '${pass}' | sudo -S pm2 ls && echo '${pass}' | sudo -S pm2 show backend`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    });
    stream.on('data', d => console.log(d.toString()));
    stream.stderr.on('data', d => console.error(d.toString()));
  });
});

conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
