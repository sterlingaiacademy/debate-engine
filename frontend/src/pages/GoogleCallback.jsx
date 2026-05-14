import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { API_BASE } from '../api';

const GOOGLE_SANS = "'Google Sans', 'Plus Jakarta Sans', 'Product Sans', system-ui, sans-serif";

export default function GoogleCallback({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const hash = window.location.hash;
      if (!hash) {
        setError('No authentication token found.');
        return;
      }
      
      // Parse the hash parameters (remove the # first)
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (!accessToken) {
        // Sometimes Google returns an error in the hash
        const errorParams = params.get('error');
        if (errorParams) {
           setError(`Authentication failed: ${errorParams}`);
        } else {
           setError('Authentication failed. Please try again.');
        }
        return;
      }
      
      try {
        const profileResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!profileResp.ok) throw new Error('Failed to fetch Google profile');
        const profile = await profileResp.json();

        const res = await fetch(`${API_BASE}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            onLogin(data.user);
            navigate('/');
        } else {
            localStorage.setItem('pendingGoogleProfile', JSON.stringify({
                email: profile.email,
                avatar: profile.picture,
                name: profile.name,
                access_token: accessToken
            }));
            navigate('/register?from=google-callback');
        }
      } catch (err) {
        setError('Network error during Google login.');
      }
    };

    handleGoogleCallback();
  }, [navigate, onLogin]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: '#fff', backgroundColor: '#06080F', fontFamily: GOOGLE_SANS }}>
      {error ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
           <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Login Error</h2>
           <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{error}</p>
           <button onClick={() => navigate('/login')} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', backgroundColor: '#334155', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Return to Login</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={40} color="#FF6B00" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 style={{ color: '#f8fafc', margin: 0 }}>Authenticating...</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>Securing your session</p>
        </div>
      )}
    </div>
  );
}
