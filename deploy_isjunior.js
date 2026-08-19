const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
const filesToDeploy = [
  'frontend/src/App.jsx',
  'frontend/src/components/Layout.jsx',
  'frontend/src/pages/Analytics.jsx',
  'frontend/src/pages/ArgumentBuilder.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/Leaderboard.jsx',
  'frontend/src/pages/PersonaDebate.jsx',
  'frontend/src/pages/VocabTrainer.jsx',
  'frontend/src/pages/WordScramble.jsx'
];

conn.on('ready', () => {
  let count = 0;
  
  const uploadNext = () => {
    if (count >= filesToDeploy.length) {
      console.log('Building on server...');
      conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo "Deploy completed successfully!"', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d.toString()))
              .on('close', () => conn.end());
      });
      return;
    }
    
    const file = filesToDeploy[count];
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const remotePath = `/home/graceandforce/debate-engine/${file}`;
      
      conn.exec(`cat << 'INNER_EOF' > ${remotePath}\n${content.replace(/\$/g, '\\$')}\nINNER_EOF`, (err) => {
        if (err) throw err;
        console.log(`Uploaded ${file}`);
        count++;
        uploadNext();
      });
    } else {
      console.log(`Skipped ${file} (not found)`);
      count++;
      uploadNext();
    }
  };
  
  uploadNext();
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
