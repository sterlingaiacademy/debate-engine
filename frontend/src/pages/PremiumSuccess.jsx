import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, Sparkles, Home, Trophy, Mic } from 'lucide-react';

export default function PremiumSuccess({ plan }) {
  const location = useLocation();
  const statePlan = location.state?.plan || plan || 'pro';
  
  const isMax = statePlan === 'max';
  
  const theme = isMax 
    ? { 
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        shadow: '0 10px 40px rgba(16,185,129,0.3)',
        title: 'Welcome to Max!',
        desc: 'You now have 60 minutes of daily practice, School Leaderboards, and full Debate Arena access.',
        icon: <Sparkles size={64} color="#10b981" />
      }
    : {
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
        shadow: '0 10px 40px rgba(139,92,246,0.3)',
        title: 'Welcome to Pro!',
        desc: 'You now have 20 minutes of daily practice and unlimited priority AI coaching.',
        icon: <Crown size={64} color="#8b5cf6" />
      };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#06080F',
      padding: '2rem',
      fontFamily: "'Google Sans', sans-serif"
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: theme.shadow,
        animation: 'fadeIn 0.6s ease-out'
      }}>
        
        <div style={{ 
          width: '120px', height: '120px', margin: '0 auto 1.5rem', 
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          {theme.icon}
        </div>
        
        <h1 style={{ 
          fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem',
          background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          {theme.title}
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          {theme.desc} <br/><br/>
          Your daily time limit has been instantly upgraded. Let's get back to debating!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
          <Link to="/dashboard" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            background: theme.gradient, color: '#fff', textDecoration: 'none',
            padding: '1rem', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem',
            transition: 'transform 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
             onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <Home size={20} />
            Go to Dashboard
          </Link>
          
          <Link to="/debate" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none',
            padding: '1rem', borderRadius: '12px', fontWeight: 600, fontSize: '1rem',
            border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            <Mic size={20} />
            Start a Debate
          </Link>
        </div>
        
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
