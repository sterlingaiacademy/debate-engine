const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected, running build...');
  conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo "Build and copy complete!"', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()))
          .on('close', () => {
             console.log('Stream closed, ending connection');
             conn.end();
          });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
