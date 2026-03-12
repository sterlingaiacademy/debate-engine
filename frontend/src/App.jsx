import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Placeholders for Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DebateArena from './pages/DebateArena';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
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

  const isJunior = user?.classLevel === 'Class 1-3';

  return (
    <Router>
      <div className={isJunior ? 'theme-junior' : 'theme-senior'}>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/debate" element={user ? <DebateArena user={user} /> : <Navigate to="/login" />} />
            <Route path="/results/:sessionId" element={user ? <Results user={user} /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/login" />} />
            <Route path="/leaderboard" element={user ? <Leaderboard user={user} /> : <Navigate to="/login" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
