const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat << 'INNER_EOF' > /home/graceandforce/debate-engine/backend/fix_prep.sh
sed -i '233s/.*/    res.json(result);/' /home/graceandforce/debate-engine/backend/api/speech_coach.js
pm2 restart all
INNER_EOF
bash /home/graceandforce/debate-engine/backend/fix_prep.sh`, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => console.log(d.toString())).on('close', () => conn.end());
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
