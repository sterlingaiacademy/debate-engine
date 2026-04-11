import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';

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
const DebateInstructions = lazy(() => import('./pages/DebateInstructions'));

function App() {
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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel);
  const themeClass = isJunior ? 'theme-junior' : 'theme-senior';

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    document.body.className = themeClass;
  }, [themeClass]);

  useEffect(() => {
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
    <div style={{ display: 'flex', height: '50vh', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <Router>
      <div className={themeClass}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public landing page — root route */}
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
              <Route path="/debate" element={user ? <DebateArena user={user} /> : <Navigate to="/" />} />
              <Route path="/results/:sessionId" element={user ? <Results user={user} /> : <Navigate to="/" />} />
              <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/" />} />
              <Route path="/leaderboard" element={user ? <Leaderboard user={user} /> : <Navigate to="/" />} />
              <Route path="/persona" element={user ? <PersonaPicker user={user} /> : <Navigate to="/" />} />
              <Route path="/persona-debate" element={user ? <PersonaDebate user={user} /> : <Navigate to="/" />} />
              <Route path="/mock-un" element={user ? <MockUN user={user} /> : <Navigate to="/" />} />
              <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/" />} />
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
