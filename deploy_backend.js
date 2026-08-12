const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const textFiles = [
  ['backend/server_prod.js', '/home/graceandforce/debate-engine/backend/server_prod.js'],
  ['backend/utils/email.js', '/home/graceandforce/debate-engine/backend/utils/email.js'],
];

const dataFiles = [
  'backend/data/english_questions.json',
  'backend/data/mathematics_questions.json',
  'backend/data/science_questions.json',
  'backend/data/social_science_questions.json',
  'backend/data/ct_ai_questions.json',
];

conn.on('ready', () => {
  conn.exec('mkdir -p /home/graceandforce/debate-engine/backend/data /home/graceandforce/debate-engine/backend/utils', (err, s) => {
    if (err) throw err;
    s.on('close', () => {
      const allFiles = [
        ...textFiles.map(([l, r]) => ({ local: l, remote: r })),
        ...dataFiles.map(f => ({ local: f, remote: '/home/graceandforce/debate-engine/' + f })),
      ];
      let idx = 0;
      const uploadNext = () => {
        if (idx >= allFiles.length) {
          console.log('All files uploaded. Restarting server...');
          conn.exec('source ~/.nvm/nvm.sh && cd /home/graceandforce/debate-engine/backend && pm2 restart grace-api', (e2, s2) => {
            if (e2) throw e2;
            s2.on('data', d => process.stdout.write(d.toString())).on('close', () => conn.end());
          });
          return;
        }
        const { local, remote } = allFiles[idx];
        const content = fs.readFileSync(local, 'utf8');
        conn.sftp((err, sftp) => {
          if (err) throw err;
          const ws = sftp.createWriteStream(remote);
          ws.on('close', () => {
            console.log('Uploaded ' + local);
            idx++;
            sftp.end();
            uploadNext();
          });
          ws.write(content);
          ws.end();
        });
      };
      uploadNext();
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
