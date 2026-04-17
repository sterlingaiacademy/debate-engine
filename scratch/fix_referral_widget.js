const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Find the referral widget block and replace it entirely using line-based approach
const lines = c.split('\n');
let startLine = -1, endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('REFERRAL SHARE') && startLine === -1) {
    // Go back to find the {!isJunior line before it
    startLine = i;
    for (let j = i; j < lines.length; j++) {
      // Find the closing )}  that ends this block
      if (lines[j].trim() === ')}' && j > startLine + 5) {
        endLine = j;
        break;
      }
    }
    break;
  }
}

console.log('Found at lines:', startLine+1, 'to', endLine+1);
console.log('Last line content:', JSON.stringify(lines[endLine]));

const refCode = "user?.studentId || user?.username || ''";
const newWidgetLines = [
  "      {/* REFERRAL SHARE & EARN WIDGET */}",
  "      {!isJunior && (() => {",
  "        const refCode = user?.studentId || user?.username || '';",
  "        const refUrl = `https://graceandforce.com/register?ref=${refCode}`;",
  "        const waMsg = encodeURIComponent(`Join me on G Force AI! Use my link to get +150 bonus tokens: ${refUrl}`);",
  "        return (",
  "          <div className=\"card\" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>",
  "             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>",
  "                <div>",
  "                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>🎁 Share & Earn Gforce Tokens</h3>",
  "                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Invite friends. They get <strong style={{color:'#a78bfa'}}>+150 Tokens</strong>, you get <strong style={{color:'#34d399'}}>+200 Tokens</strong>!</p>",
  "                </div>",
  "                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>",
  "                   <code style={{ background: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent)', border: '1px solid var(--border)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>",
  "                      {refUrl}",
  "                   </code>",
  "                   <button",
  "                      onClick={() => { navigator.clipboard.writeText(refUrl); }}",
  "                      className=\"btn btn-secondary btn-sm\"",
  "                      style={{ fontSize: '0.8rem', fontWeight: 700 }}",
  "                   >",
  "                      📋 Copy Link",
  "                   </button>",
  "                   <a",
  "                      href={`https://wa.me/?text=${waMsg}`}",
  "                      target=\"_blank\"",
  "                      rel=\"noopener noreferrer\"",
  "                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#25D366', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}",
  "                   >",
  "                      📲 WhatsApp",
  "                   </a>",
  "                </div>",
  "             </div>",
  "          </div>",
  "        );",
  "      })()}",
];

if (startLine >= 0 && endLine >= 0) {
  lines.splice(startLine, endLine - startLine + 1, ...newWidgetLines);
  fs.writeFileSync('frontend/src/pages/Dashboard.jsx', lines.join('\n'));
  console.log('SUCCESS: Referral widget upgraded');
  console.log('Has refUrl:', fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8').includes('graceandforce.com/register'));
} else {
  console.log('ERROR: Could not find widget block');
}
