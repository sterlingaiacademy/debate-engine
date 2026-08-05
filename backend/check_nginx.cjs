const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const pass = 'wvpi2!ZnTcV];ncy';
  const cmd = `
    echo '${pass}' | sudo -S cat /etc/nginx/sites-enabled/graceandforce
  `;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
