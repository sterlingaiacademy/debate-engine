const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    echo 'wvpi2!ZnTcV];ncy' | sudo -S sed -i '/server_name graceandforce.com www.graceandforce.com;/a \\
    client_max_body_size 100M;' /etc/nginx/sites-available/graceandforce
    echo 'wvpi2!ZnTcV];ncy' | sudo -S nginx -t && echo 'wvpi2!ZnTcV];ncy' | sudo -S systemctl reload nginx
  `;
  conn.exec(script, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
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
