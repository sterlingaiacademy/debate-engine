const fs = require('fs');
fs.writeFileSync('frontend/src/test_aai.js', "import { RealtimeService } from 'assemblyai'; console.log(RealtimeService);");
