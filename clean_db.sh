#!/bin/bash
SERVER="graceandforce@65.20.85.75"
APP_DIR="/home/graceandforce/debate-engine"

ssh "$SERVER" bash << 'ENDSSH'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /home/graceandforce/debate-engine/backend
cat << 'EOF' > clean_script.js
const { query } = require('./database');
query('DELETE FROM student_speech_sessions WHERE is_league = true OR id IN (SELECT id FROM speech_analysis_sessions WHERE is_league = true)')
  .then(r => {
     console.log("Deleted " + (r.rowCount || 0));
     process.exit(0);
  })
  .catch(e => {
     console.error(e);
     process.exit(1);
  });
EOF
node clean_script.js
rm clean_script.js
ENDSSH
