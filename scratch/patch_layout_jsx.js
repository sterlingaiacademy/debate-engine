const fs = require('fs');

let file = "../frontend/src/components/Layout.jsx";
let content = fs.readFileSync(file, 'utf8');

// Add avatar to the right side next to logout
const navEnd = `
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)' }}>
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
               )}
            </div>
            
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.375rem' }}
            >
              <LogOut size={16} />
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </nav>
`;

content = content.replace(
  `          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '0.75rem', gap: '0.375rem' }}
          >
            <LogOut size={16} />
            <span className="nav-label">Logout</span>
          </button>
        </nav>`,
  navEnd
);

fs.writeFileSync(file, content);
console.log('Layout.jsx patched!');
