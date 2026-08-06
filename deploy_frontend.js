const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
const filesToDeploy = [
  'frontend/src/App.jsx',
  'frontend/src/components/ScrollToTop.jsx',
  'frontend/src/components/Layout.jsx',
  'frontend/src/pages/CoordinatorDashboard.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/OlympiadPractice.jsx',
  'frontend/src/pages/OlympiadSchoolRegister.jsx',
  'frontend/src/pages/OlympiadStudentRegister.jsx',
  'frontend/src/pages/OlympiadReportCard.jsx',
  'frontend/src/pages/OlympiadArena.jsx',
  'frontend/src/pages/AdminDashboard.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/Register.jsx',
  'frontend/src/pages/EnglishSessionRegister.jsx',
  'frontend/src/components/ui/animated-testimonials.jsx'
];

conn.on('ready', () => {
  let count = 0;
  
  const uploadNext = () => {
    if (count >= filesToDeploy.length) {
      console.log('Building on server...');
      conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/frontend && npm run build && cp -r dist/* /var/www/grace-and-force/frontend/ && echo "Deploy completed successfully!"', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()))
              .on('close', () => conn.end());
      });
      return;
    }
    
    const file = filesToDeploy[count];
    const content = fs.readFileSync(file, 'utf8');
    const remotePath = `/home/graceandforce/debate-engine/${file}`;
    
    conn.exec(`cat << 'INNER_EOF' > ${remotePath}\n${content}\nINNER_EOF`, (err) => {
      if (err) throw err;
      console.log(`Uploaded ${file}`);
      count++;
      uploadNext();
    });
  };
  
  uploadNext();
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
