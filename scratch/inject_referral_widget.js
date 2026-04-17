const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

const widget = [
  '',
  '      {/* REFERRAL SHARE & EARN WIDGET */}',
  '      {!isJunior && (',
  '        <div className="card" style={{ marginTop: \'1.5rem\', background: \'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)\', border: \'1px solid rgba(139,92,246,0.2)\' }}>',
  '           <div style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', flexWrap: \'wrap\', gap: \'1rem\' }}>',
  '              <div>',
  '                 <h3 style={{ fontSize: \'1.1rem\', fontWeight: 800, marginBottom: \'0.35rem\', display: \'flex\', alignItems: \'center\', gap: \'0.5rem\' }}>\u{1F381} Share & Earn Gforce Tokens</h3>',
  '                 <p style={{ color: \'var(--text-secondary)\', fontSize: \'0.85rem\', margin: 0 }}>Invite friends with your code. They get <strong>+150 Tokens</strong>, you get <strong>+200 Tokens</strong>!</p>',
  '              </div>',
  '              <div style={{ display: \'flex\', alignItems: \'center\', gap: \'0.5rem\' }}>',
  '                 <code style={{ background: \'var(--bg-tertiary)\', padding: \'0.5rem 1rem\', borderRadius: \'8px\', fontWeight: 800, fontSize: \'1rem\', color: \'var(--accent)\', letterSpacing: \'0.02em\', border: \'1px solid var(--border)\' }}>',
  '                    {user?.studentId || user?.username || \'N/A\'}',
  '                 </code>',
  '                 <button',
  '                    onClick={() => { navigator.clipboard.writeText(user?.studentId || user?.username || \'\'); }}',
  '                    className="btn btn-secondary btn-sm"',
  '                    style={{ fontSize: \'0.8rem\', fontWeight: 700 }}',
  '                 >',
  '                    Copy',
  '                 </button>',
  '              </div>',
  '           </div>',
  '        </div>',
  '      )}',
  '',
].join('\r\n');

// Insert right before the final closing </div>  );  }
c = c.replace(
  '      )}\r\n    </div>\r\n  );\r\n}\r\n',
  '      )}\r\n' + widget + '    </div>\r\n  );\r\n}\r\n'
);

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);
console.log('Referral widget injected:', c.includes('Share & Earn'));
