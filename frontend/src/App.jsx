import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { API_BASE } from './api';

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
const VocabTrainer = lazy(() => import('./pages/VocabTrainer'));
const WordScramble = lazy(() => import('./pages/WordScramble'));
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'));

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
    localStorage.removeItem('token');
  };

  const handleSwitchProfile = async () => {
    alert('You are now using direct username authentication. To switch accounts, simply log out and log in with your other username.');
  };

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);
  const themeClass = isJunior ? 'theme-junior' : 'theme-senior';

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    document.body.className = themeClass;
  }, [themeClass]);

  useEffect(() => {
    // Standard Custom JWT LocalStorage check
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    } else if (window.location.pathname !== '/' && window.location.pathname !== '/login' && !window.location.pathname.includes('/register')) {
      // Clear invalid state
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsInitializing(false);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
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
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
              <Route path="/vocab-trainer" element={user ? <VocabTrainer user={user} /> : <Navigate to="/" />} />
              <Route path="/word-scramble" element={user ? <WordScramble user={user} /> : <Navigate to="/" />} />
              <Route path="/daily-challenge" element={user ? <DailyChallenge user={user} /> : <Navigate to="/" />} />
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
    </GoogleOAuthProvider>
  );
}

export default App;
