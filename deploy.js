const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const sshPassword = 'wvpi2!ZnTcV];ncy';

const filesToUpload = [
  { local: 'backend/server.js', remote: '/home/graceandforce/debate-engine/backend/server.js' },
  { local: 'backend/api/speech_coach.js', remote: '/home/graceandforce/debate-engine/backend/api/speech_coach.js' },
  { local: 'backend/utils/email.js', remote: '/home/graceandforce/debate-engine/backend/utils/email.js' },
  { local: 'frontend/src/App.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/App.jsx' },
  { local: 'frontend/src/pages/Dashboard.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/Dashboard.jsx' },
  { local: 'frontend/src/pages/AdminDashboard.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/AdminDashboard.jsx' },
  { local: 'frontend/src/pages/LandingPage.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/LandingPage.jsx' },
  { local: 'frontend/src/pages/OlympiadArena.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadArena.jsx' },
  { local: 'frontend/src/pages/OlympiadDashboard.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadDashboard.jsx' },
  { local: 'frontend/src/pages/OlympiadIndividualRegister.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadIndividualRegister.jsx' },
  { local: 'frontend/src/pages/OlympiadPractice.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadPractice.jsx' },
  { local: 'frontend/src/pages/OlympiadReportCard.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadReportCard.jsx' },
  { local: 'frontend/src/pages/OlympiadSchoolRegister.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadSchoolRegister.jsx' },
  { local: 'frontend/src/pages/OlympiadStudentRegister.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/OlympiadStudentRegister.jsx' },
  { local: 'frontend/package.json', remote: '/home/graceandforce/debate-engine/frontend/package.json' },
  { local: 'frontend/package-lock.json', remote: '/home/graceandforce/debate-engine/frontend/package-lock.json' },
  { local: 'frontend/src/pages/EnglishSessionRegister.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/EnglishSessionRegister.jsx' },
  { local: 'frontend/src/pages/FreedomQuizRegister.jsx', remote: '/home/graceandforce/debate-engine/frontend/src/pages/FreedomQuizRegister.jsx' },
  { local: 'frontend/src/assets/Indra m nair.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/Indra m nair.png' },
  { local: 'frontend/src/assets/Ms Mallika Sen.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/Ms Mallika Sen.png' },
  { local: 'frontend/src/assets/KPS Maithraa.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/KPS Maithraa.png' },
  { local: 'frontend/src/assets/Christian Nwigwe.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/Christian Nwigwe.png' },
  { local: 'frontend/src/assets/Anusha Fulgaonkar.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/Anusha Fulgaonkar.png' },
  { local: 'frontend/src/assets/sruthy v raj.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/sruthy v raj.png' },
  { local: 'frontend/src/assets/miss himani bakshi.png', remote: '/home/graceandforce/debate-engine/frontend/src/assets/miss himani bakshi.png' }
];

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    let uploads = 0;
    filesToUpload.forEach(file => {
      sftp.fastPut(path.join(__dirname, file.local), file.remote, (err) => {
        if (err) throw err;
        console.log(`Uploaded ${file.local} to ${file.remote}`);
        uploads++;
        if (uploads === filesToUpload.length) {
          console.log('All files uploaded. Restarting and building...');
          
          const script = `
            source ~/.nvm/nvm.sh
            cd /home/graceandforce/debate-engine/backend
            pm2 restart grace-api
            cd /home/graceandforce/debate-engine/frontend
            npm install
            npm run build
            echo "wvpi2!ZnTcV];ncy" | sudo -S cp -r dist/* /var/www/grace-and-force/frontend/
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
        }
      });
    });
  });
}).connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: sshPassword
});
