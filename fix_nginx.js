const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
echo "wvpi2!ZnTcV];ncy" | sudo -S sed -i '/location \\/api/a \\    proxy_read_timeout 300s;\\n    proxy_connect_timeout 300s;\\n    proxy_send_timeout 300s;' /etc/nginx/sites-available/graceandforce
echo "wvpi2!ZnTcV];ncy" | sudo -S nginx -t && echo "wvpi2!ZnTcV];ncy" | sudo -S systemctl restart nginx
  `;
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('data', (data) => console.log(data.toString()))
          .stderr.on('data', (d) => console.error(d.toString()))
          .on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
