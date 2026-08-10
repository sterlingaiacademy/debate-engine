const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`PGPASSWORD="Pck/aawJlsLFZxWu3CG7aw==" psql -U graceandforce_user -d graceandforce_db -h localhost -c "\\dt"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '82.112.239.5',
  port: 22,
  username: 'root',
  privateKey: require('fs').readFileSync('/Users/hananphashim/.ssh/id_rsa')
});
