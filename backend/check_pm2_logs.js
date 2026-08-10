const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec("cat /home/graceandforce/.pm2/logs/grace-api-error.log | tail -n 50", (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      console.log(out);
      conn.end();
    }).on('data', (data) => {
      out += data;
    });
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
