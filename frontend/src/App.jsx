import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { supabase } from './supabase';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';

const DebateArena = lazy(() => import('./pages/DebateArena'));
const Results = lazy(() => import('./pages/Results'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const PersonaPicker = lazy(() => import('./pages/PersonaPicker'));
const PersonaDebate = lazy(() => import('./pages/PersonaDebate'));
const MockUN = lazy(() => import('./pages/MockUN'));
const Settings = lazy(() => import('./pages/Settings'));
const ConversationalAgent = lazy(() => import('./pages/ConversationalAgent'));
const DebateInstructions = lazy(() => import('./pages/DebateInstructions'));

function App() {
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [profilesToSelect, setProfilesToSelect] = useState(null); // MULTI-PROFILE STATE

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    await supabase.auth.signOut();
  };

  const handleSwitchProfile = async () => {
    // Get email from OAuth session OR from stored user object (for credential login users)
    let email = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      email = session?.user?.email;
    } catch (e) {}
    // Fallback: use email stored in user object (credential login users)
    if (!email) {
      const storedUser = localStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      email = parsed?.email;
    }
    if (!email) {
      alert('Cannot switch profile: no email linked to this account.');
      return;
    }
    try {
      const res = await fetch(`/api/user-by-email/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUser(null);
          localStorage.removeItem('user');
          setProfilesToSelect(data.users);
        } else {
          alert('Only one profile found for this account.');
        }
      }
    } catch (e) { console.error(e); }
  };

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);
  const themeClass = isJunior ? 'theme-junior' : 'theme-senior';

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    document.body.className = themeClass;
  }, [themeClass]);

  useEffect(() => {
    
      const hydrateUserFallback = async (session) => {
      const email = session?.user?.email;
      let legacyUsers = [];

      try {
        if (email) {
          const res = await fetch(`/api/user-by-email/${encodeURIComponent(email)}`);
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
          setIsInitializing(false);
          return;
      }

      const legacyUser = legacyUsers[0];

      handleLogin({

          name: legacyUser.name,
          username: legacyUser.studentId,
          classLevel: legacyUser.classLevel, 
          assignedAgentId: legacyUser.assignedAgentId,
          id: legacyUser.id || session.user.id,
          studentId: legacyUser.studentId,
          avatar: legacyUser.avatar
      });

      // After successful OAuth login, naturally dump them into the dashboard if they are on root
      if (window.location.pathname === '/') {
         window.history.replaceState(null, '', '/dashboard');
         window.dispatchEvent(new Event('popstate'));
      }
    };

    // Ephemeral sessions: Clear cache synchronously before any React children mount if visiting root/login without an OAuth hash
    const isOAuthRedirect = window.location.hash.includes('access_token');
    if (!isOAuthRedirect && (window.location.pathname === '/' || window.location.pathname === '/login')) {
       localStorage.removeItem('user');
    }

    // Check initial native session from URL fragment before router executes
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let activeSession = session;

      if (!isOAuthRedirect && (window.location.pathname === '/' || window.location.pathname === '/login')) {
         await supabase.auth.signOut();
         activeSession = null;
      }

      const storedUser = localStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      
      if (activeSession && !parsed && !window.location.pathname.includes('/register')) {
         hydrateUserFallback(activeSession).finally(() => setIsInitializing(false));
      } else if (parsed) {
         handleLogin(parsed);
         setIsInitializing(false);
      } else {
         setIsInitializing(false);
      }
    });

    // Listen to Supabase native Auth changes (OAuth callbacks, OTP verify)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isOAuthRedirect = window.location.hash.includes('access_token');
      if (!isOAuthRedirect && (window.location.pathname === '/' || window.location.pathname === '/login')) {
        return; // Let the async getSession() block handle the graceful sign-out
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        // Sync local storage user state natively
        const storedUser = localStorage.getItem('user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        if (!parsed && !window.location.pathname.includes('/register')) {
            hydrateUserFallback(session);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Loading spinner for lazy-loaded pages
  const PageLoader = () => (
    <div style={{ display: 'flex', height: '100vh', width: '100%', justifyContent: 'center', alignItems: 'center', background: '#06080F' }}>
      <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#F97316', borderRadius: '50%' }} />
    </div>
  );


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
                     window.location.href = '/dashboard';
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


  return (
    <Router>
      <div className={themeClass}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public landing page — root route */}
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={
              user && !window.location.search.includes('step=details')
                ? <Navigate to="/dashboard" />
                : <Register onLogin={handleLogin} />
            } />
            
            <Route element={<Layout user={user} onLogout={handleLogout} onSwitchProfile={handleSwitchProfile} />}>
              <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" />} />
              <Route path="/debate" element={user ? <DebateArena user={user} /> : <Navigate to="/" />} />
              <Route path="/results/:sessionId" element={user ? <Results user={user} /> : <Navigate to="/" />} />
              <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/" />} />
              <Route path="/leaderboard" element={user ? <Leaderboard user={user} /> : <Navigate to="/" />} />
              <Route path="/persona" element={user ? <PersonaPicker user={user} /> : <Navigate to="/" />} />
              <Route path="/persona-debate" element={user ? <PersonaDebate user={user} /> : <Navigate to="/" />} />
              <Route path="/mock-un" element={user ? <MockUN user={user} /> : <Navigate to="/" />} />
              <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/" />} />
              <Route path="/conversational-agent" element={user ? <ConversationalAgent user={user} /> : <Navigate to="/" />} />
              <Route path="/debate-instructions" element={user ? <DebateInstructions user={user} /> : <Navigate to="/" />} />
            </Route>

            {/* Catch-all → landing page */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
      {isOffline && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ef4444', color: 'white', padding: '0.5rem', textAlign: 'center', zIndex: 9999, fontSize: '0.875rem', fontWeight: 600 }}>
          ⚠️ Poor internet connection. Please check your network.
        </div>
      )}
    </Router>
  );
}

export default App;
