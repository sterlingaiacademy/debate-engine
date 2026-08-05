const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("find / -type f -name '.env' -path '*/frontend/*' 2>/dev/null", (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('ENV FILES FOUND:');
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: 'graceandforce.com',
  port: 22,
  username: 'graceandforce',
  privateKey: require('fs').readFileSync('/Users/hananphashim/.ssh/id_rsa')
});
