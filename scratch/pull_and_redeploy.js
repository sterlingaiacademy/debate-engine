// pull_and_redeploy.js — uses ssh2 npm package to connect to Vultr and redeploy
// Run: node scratch/pull_and_redeploy.js

const { Client } = require('ssh2');
const path = require('path');

const HOST     = '65.20.85.75';
const PORT     = 22;
const USERNAME = 'graceandforce';
const PASSWORD = 'wvpi2!ZnTcV];ncy';
const APP_DIR  = '/home/graceandforce/debate-engine';

const NVM = 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"';

const COMMANDS = [
  { label: 'git pull', cmd: `cd ${APP_DIR} && git pull origin main` },
  { label: 'npm install (backend)', cmd: `${NVM}; cd ${APP_DIR}/backend && npm install --production 2>&1 | tail -5` },
  { label: 'pm2 restart', cmd: `${NVM}; pm2 restart grace-api` },
  { label: 'npm install (frontend)', cmd: `${NVM}; cd ${APP_DIR}/frontend && npm install 2>&1 | tail -5` },
  { label: 'build frontend', cmd: `${NVM}; cd ${APP_DIR}/frontend && npm run build 2>&1 | tail -10` },
  { label: 'deploy frontend', cmd: `echo 'wvpi2!ZnTcV];ncy' | sudo -S rsync -a --delete ${APP_DIR}/frontend/dist/ /var/www/grace-and-force/frontend/` },
  { label: 'pm2 status',  cmd: `${NVM}; pm2 list` },
  {
    label: 'smoke test /api/evaluate',
    cmd: `curl -s -X POST http://localhost:5000/api/evaluate \
-H "Content-Type: application/json" \
-d '{"transcript":[{"role":"agent","text":"Do you think AI is beneficial?"},{"role":"user","text":"Yes I strongly believe AI is beneficial because it helps people work faster and solve complex problems with data."}],"topic":"AI is beneficial","isJunior":false,"studentId":"test","name":"Test","classLevel":"Level 3"}' \
| python3 -c "import sys,json; r=json.load(sys.stdin); print('SCORE:', r.get('overall_score','ERR'), '| ERROR:', r.get('error','none'))"`,
  },
];

async function runCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => { out += d; });
      stream.stderr.on('data', d => { out += d; });
      stream.on('close', () => resolve(out.trim()));
    });
  });
}

async function deploy() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect({ host: HOST, port: PORT, username: USERNAME, password: PASSWORD, readyTimeout: 15000 });
  });

  console.log(`✅ Connected to ${HOST}\n`);

  for (const { label, cmd } of COMMANDS) {
    console.log(`\n>>> ${label}`);
    try {
      const output = await runCommand(conn, cmd);
      console.log(output || '(no output)');
    } catch (e) {
      console.log('ERROR:', e.message);
    }
  }

  conn.end();
  console.log('\n✅ Redeploy complete!');
}

deploy().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
