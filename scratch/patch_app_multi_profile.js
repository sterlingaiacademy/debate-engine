const fs = require('fs');

let file = "../frontend/src/App.jsx";
let content = fs.readFileSync(file, 'utf8');

const stateInjection = `
  const [isInitializing, setIsInitializing] = useState(true);
  const [profilesToSelect, setProfilesToSelect] = useState(null); // MULTI-PROFILE STATE
`;
content = content.replace(`const [isInitializing, setIsInitializing] = useState(true);`, stateInjection);

const hydrateInjection = `
      const hydrateUserFallback = async (session) => {
      const email = session?.user?.email;
      let legacyUsers = [];

      try {
        if (email) {
          const res = await fetch(\`/api/user-by-email/\${encodeURIComponent(email)}\`);
          if (res.ok) {
            const data = await res.json();
            legacyUsers = data.users || [];
          }
        }
      } catch (err) {
        console.error("Failed to fetch legacy profile", err);
      }

      if (legacyUsers.length === 0) {
          // If no legacy profile was ever fully created, bounce them to Complete Profile
          window.location.href = '/register?step=details';
          return;
      }

      // If MULTIPLE profiles exist, trigger the UI!
      if (legacyUsers.length > 1) {
          setProfilesToSelect(legacyUsers);
          return;
      }

      const legacyUser = legacyUsers[0];

      handleLogin({
`;

content = content.replace(/const hydrateUserFallback = async \(session\) => \{[\s\S]*?handleLogin\(\{/, hydrateInjection);

// Inject the ProfileSelector UI
const profileSelectorUI = `
  if (isInitializing) {
    return <PageLoader />;
  }

  // --- MULTI-PROFILE SELECTION UI ---
  if (profilesToSelect) {
    return (
      <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Google Sans', sans-serif" }}>
         <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, marginBottom: '3rem', letterSpacing: '-0.02em', textAlign: 'center' }}>Who's Learning?</h1>
         
         <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px' }}>
            {profilesToSelect.map(profile => (
               <div 
                  key={profile.studentId}
                  onClick={() => {
                     handleLogin({
                        name: profile.name,
                        username: profile.studentId,
                        classLevel: profile.classLevel, 
                        assignedAgentId: profile.assignedAgentId,
                        id: profile.id,
                        studentId: profile.studentId,
                        avatar: profile.avatar
                     });
                     setProfilesToSelect(null);
                     if (window.location.pathname === '/' || window.location.pathname === '/login') {
                         window.history.replaceState(null, '', '/dashboard');
                         window.dispatchEvent(new Event('popstate'));
                     }
                  }}
                  style={{ 
                     display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', 
                     cursor: 'pointer', transition: 'transform 0.2s', width: '140px' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
               >
                  <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: '#1e293b', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      {profile.avatar ? (
                         <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                         <span style={{ fontSize: '3rem', color: '#94a3b8', fontWeight: 800 }}>{profile.name.charAt(0).toUpperCase()}</span>
                      )}
                  </div>
                  <span style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' }}>{profile.name}</span>
               </div>
            ))}

            {/* ADD LEARNER BUTTON */}
            <div 
               onClick={() => { window.location.href = '/register?step=details'; }}
               style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', 
                  cursor: 'pointer', transition: 'transform 0.2s', width: '140px' 
               }}
               onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
               <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'transparent', border: '2px dashed rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1 }}>+</span>
               </div>
               <span style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' }}>Add Learner</span>
            </div>
         </div>
      </div>
    );
  }
`;

content = content.replace(
  `  if (isInitializing) {
    return <PageLoader />;
  }`,
  profileSelectorUI
);

// One last thing: inside hydrateUserFallback, if length===1, we need to handle the profile.avatar property too!
// I'll adjust handleLogin call inside hydrateUserFallback mapping
content = content.replace(
  `id: legacyUser.id || session.user.id,
          studentId: legacyUser.studentId
      });`,
  `id: legacyUser.id || session.user.id,
          studentId: legacyUser.studentId,
          avatar: legacyUser.avatar
      });`
);

fs.writeFileSync(file, content);
console.log('App.jsx Multi-Profile hooked up!');
