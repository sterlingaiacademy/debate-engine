const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo 'wvpi2!ZnTcV];ncy' | sudo -S cp -r /home/graceandforce/debate-engine/frontend/dist/* /var/www/graceandforce.com/html/`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log('STDOUT:', d.toString()))
          .on('stderr', d => console.error('STDERR:', d.toString()))
          .on('close', () => {
             console.log('Done Copying.');
             conn.end();
          });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
