const { Client } = require('ssh2');

const script = `
const db = require('./database');
async function run() {
  try {
    const examRes = await db.query(
      "SELECT total_score as final_score, created_at FROM olympiad_exam_submissions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1",
      [123]
    );
    console.log("Success:", examRes.rows);
  } catch(e) {
    console.log("DB_ERROR_CAUGHT:", e.message);
  }
  process.exit(0);
}
run();
`;

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    sftp.fastPut(Buffer.from(script), '/home/graceandforce/debate-engine/backend/test_cast.js', (err) => {
      conn.exec("source ~/.nvm/nvm.sh && cd ~/debate-engine/backend && node test_cast.js", (err, stream) => {
        stream.on('close', () => conn.end())
              .on('data', d => console.log('STDOUT: ' + d))
              .stderr.on('data', d => console.log('STDERR: ' + d));
      });
    });
  });
});
conn.connect({
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy'
});
