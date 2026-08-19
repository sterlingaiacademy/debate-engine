const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    let uploaded = 0;
    const files = [
      'frontend/src/pages/OlympiadEnglishQuiz.jsx',
      'frontend/src/pages/AdminDashboard.jsx'
    ];
    
    const uploadNext = () => {
      if (uploaded >= files.length) {
        console.log('Building frontend and restarting backend...');
        conn.exec('cd /home/graceandforce/debate-engine/frontend && source ~/.nvm/nvm.sh && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo DEPLOY_COMPLETE', (err, stream) => {
          stream.on('data', d => console.log(d.toString())).on('close', () => conn.end());
        });
        return;
      }
      const file = files[uploaded];
      sftp.fastPut(file, '/home/graceandforce/debate-engine/' + file, (err) => {
        if (err) throw err;
        console.log('Uploaded ' + file);
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
