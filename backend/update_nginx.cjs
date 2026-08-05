const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const pass = 'wvpi2!ZnTcV];ncy';
  const cmd = `
    echo '${pass}' | sudo -S sed -i 's/server_name graceandforce.com www.graceandforce.com 65.20.85.75;/server_name graceandforce.com www.graceandforce.com 65.20.85.75;\\n\\n    client_max_body_size 50M;/' /etc/nginx/sites-enabled/graceandforce
    echo '${pass}' | sudo -S systemctl restart nginx
  `;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('NGINX restarted.');
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
