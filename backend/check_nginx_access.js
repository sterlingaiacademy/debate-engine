const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`grep "prep-hints" /var/log/nginx/access.log | tail -n 20`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
