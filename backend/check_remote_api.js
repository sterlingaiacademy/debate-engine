const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat /var/www/html/assets/*.js | grep -o -E '"https?://[^"]+"'`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log(out.split('\n').slice(0, 10).join('\n'));
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
