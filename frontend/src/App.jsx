import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DebateArena from './pages/DebateArena';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import PersonaPicker from './pages/PersonaPicker';
import PersonaDebate from './pages/PersonaDebate';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  return (
    <Router>
      <div className={themeClass}>
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
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
