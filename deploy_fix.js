const { Client } = require('ssh2');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

conn.on('ready', () => {
  console.log('Client :: ready');
  
  const script = `
    cp -r /home/graceandforce/debate-engine/frontend/dist/* /var/www/grace-and-force/frontend/
  `;
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
