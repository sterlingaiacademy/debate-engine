const fs = require('fs');

let file = "frontend/src/pages/Dashboard.jsx";
let content = fs.readFileSync(file, 'utf8');

const referralWidget = `
          {/* SECTION: Referral Gamification Widget */}
          <div className="card" style={{ 
            marginTop: '1rem', marginBottom: '1rem', padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(232,57,42,0.1) 100%)', 
            border: '1px solid rgba(249,115,22,0.3)', borderRadius: '16px',
            display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
                <Zap size={20} color="#f97316" /> Refer Friends to Earn Tokens
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '450px', lineHeight: 1.5 }}>
                Share your unique code with friends. When they sign up using your code, they get early access capital (+150 Tokens) and you instantly receive <strong style={{color:'#f97316'}}>+200 Gforce Tokens!</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Your Referral Code</span>
                <span style={{ fontSize: '1.15rem', color: '#f97316', fontWeight: 800, letterSpacing: '2px', userSelect: 'all' }}>
                  {user?.studentId || user?.username || 'GFORCE'}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  navigator.clipboard.writeText(user?.studentId || user?.username || '');
                  const originalText = e.currentTarget.innerText;
                  e.currentTarget.innerText = 'Copied!';
                  setTimeout(() => e.currentTarget.innerText = originalText, 2000);
                }} 
                style={{ 
                  marginLeft: '0.5rem', background: '#f97316', color: '#fff', border: 'none', 
                  borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, 
                  cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap'
                }}>
                Copy Link
              </button>
            </div>
          </div>
`;

// Insert the widget before the next grid layer
content = content.replace(
  `          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.5rem' }}>`,
  referralWidget + `          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.5rem' }}>`
);

fs.writeFileSync(file, content);
console.log('Dashboard.jsx referral widget injected!');
