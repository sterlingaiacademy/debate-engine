const { execSync } = require('child_process');
const fs = require('fs');

// The CORRECT Supabase Transaction Pooler connection string
// Password @ is URL-encoded as %40, square brackets removed (they're just Supabase UI notation)
const dbUrl = 'postgresql://postgres.whfmuswqbsgbmaramuhi:sterlingvoiceorders%40123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const tmpFile = '_tmp_db.txt';
fs.writeFileSync(tmpFile, dbUrl);

try {
  execSync('vercel env rm DATABASE_URL production -y', { stdio: 'inherit' });
} catch(e) {}

execSync('vercel env add DATABASE_URL production --force', {
  input: fs.readFileSync(tmpFile, 'utf8'),
  stdio: ['pipe', 'inherit', 'inherit']
});

fs.unlinkSync(tmpFile);
console.log('\n✅ DATABASE_URL updated to Supabase Transaction Pooler!');
console.log('Host: aws-1-ap-northeast-1.pooler.supabase.com:6543');
