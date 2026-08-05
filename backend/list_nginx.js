const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("ls /etc/nginx/sites-available/", (err, stream) => {
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
