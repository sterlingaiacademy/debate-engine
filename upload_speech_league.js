const { Client } = require('ssh2');

const files = [
  'frontend/src/pages/SpeechLeagueRegister.jsx'
];

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    let uploaded = 0;
    
    const uploadNext = () => {
      if (uploaded >= files.length) {
        console.log('Building frontend...');
        conn.exec('cd /home/graceandforce/debate-engine/frontend && source ~/.nvm/nvm.sh && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo FRONTEND_DEPLOYED', (err, stream) => {
          if (err) throw err;
          stream.on('data', d => process.stdout.write(d.toString()))
                .stderr.on('data', d => process.stderr.write(d.toString()))
                .on('close', () => {
                  conn.end();
                });
        });
        return;
      }
      
      const localFile = files[uploaded];
      const remoteFile = '/home/graceandforce/debate-engine/' + localFile;
      
      sftp.fastPut(localFile, remoteFile, (err) => {
        if (err) throw err;
        console.log(`Uploaded ${localFile}`);
        uploaded++;
        uploadNext();
      });
    };
    
    uploadNext();
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
