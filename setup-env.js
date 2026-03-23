const { execSync } = require('child_process');

function addEnv(key, val) {
  try {
    console.log(`Removing old ${key} if exists...`);
    execSync(`vercel env rm ${key} production -y`, { stdio: 'ignore' });
  } catch(e) {}
  
  try {
    console.log(`Adding ${key}...`);
    execSync(`vercel env add ${key} production`, { input: val, stdio: ['pipe', 'inherit', 'inherit'] });
  } catch(e) {
    console.error(`Failed to add ${key}`);
  }
}

addEnv('DATABASE_URL', 'postgresql://postgres:sterlingvoiceorders%40123@db.whfmuswqbsgbmaramuhi.supabase.co:5432/postgres');
addEnv('GEMINI_API_KEY', 'AIzaSyA55f--nL_MkcpAxifLgYCzFCKFhde6jSM');
addEnv('ELEVENLABS_API_KEY', 'fd5d955ff7f3cebe2a63a1f41d9f90c59f0ca6f7f00477634da583512ff48374');
