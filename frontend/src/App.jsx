import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

const DebateArena = lazy(() => import('./pages/DebateArena'));
const Results = lazy(() => import('./pages/Results'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const PersonaPicker = lazy(() => import('./pages/PersonaPicker'));
const PersonaDebate = lazy(() => import('./pages/PersonaDebate'));
const MockUN = lazy(() => import('./pages/MockUN'));

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

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3'].includes(user?.classLevel);
  const themeClass = isJunior ? 'theme-junior' : 'theme-senior';

  useEffect(() => {
    document.body.className = themeClass;
  }, [themeClass]);

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
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/debate" element={user ? <DebateArena user={user} /> : <Navigate to="/login" />} />
              <Route path="/results/:sessionId" element={user ? <Results user={user} /> : <Navigate to="/login" />} />
              <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/login" />} />
              <Route path="/leaderboard" element={user ? <Leaderboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/persona" element={user ? <PersonaPicker user={user} /> : <Navigate to="/login" />} />
              <Route path="/persona-debate" element={user ? <PersonaDebate user={user} /> : <Navigate to="/login" />} />
              <Route path="/mock-un" element={user ? <MockUN user={user} /> : <Navigate to="/login" />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
