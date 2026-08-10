import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, ChevronRight, BookOpen, Clock, Activity, Target, Award, Rocket, Sparkles, Medal, ShieldCheck } from 'lucide-react';

export default function OlympiadDashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const FONT = "'Google Sans', 'Inter', sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: FONT, padding: '2rem' }}>
      
      {/* Playful & Clean Dark Hero Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)', 
        borderRadius: 24, 
        padding: '3rem', 
        marginBottom: '2rem', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid #ef4444',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)'
      }}>
        {/* Fun decorative elements */}
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.15 }}>
          <Star size={180} color="#fca5a5" fill="#fca5a5" />
        </div>
        <div style={{ position: 'absolute', bottom: -20, right: 100, opacity: 0.2 }}>
          <Sparkles size={120} color="#fde047" />
        </div>
        <div style={{ position: 'absolute', top: 30, left: '60%', opacity: 0.1 }}>
          <Rocket size={100} color="#f87171" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', border: '1px solid #ef4444' }}>
            <Award size={36} color="#ef4444" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
              ThinkQuest <span style={{ color: '#fde047', textShadow: '0 0 15px rgba(253,224,71,0.4)' }}>Olympiad</span>
            </h1>
            <div style={{ fontSize: '1.2rem', color: '#fecaca', fontWeight: 600, marginTop: '0.2rem' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Champion'}! 👋
            </div>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#09090b', padding: '0.6rem 1.2rem', borderRadius: 99, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '1px solid #27272a' }}>
               <ShieldCheck size={20} color="#34d399" strokeWidth={2.5} />
               <span style={{ color: '#a1a1aa', fontWeight: 700, fontSize: '0.95rem' }}>Status:</span> 
               <span style={{ color: '#34d399', fontWeight: 900, fontSize: '0.95rem', textShadow: '0 0 10px rgba(52,211,153,0.3)' }}>Registered</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#09090b', padding: '0.6rem 1.2rem', borderRadius: 99, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '1px solid #27272a' }}>
               <Award size={20} color="#fca5a5" strokeWidth={2.5} />
               <span style={{ color: '#a1a1aa', fontWeight: 700, fontSize: '0.95rem' }}>School:</span> 
               <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: '0.95rem' }}>{user?.olympiad_school_name || 'Loading...'}</span>
             </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', padding: '1rem 0' }}>
        
        {/* Daily Practice Card */}
        <div 
          onClick={() => navigate('/olympiad/practice')}
          style={{
            background: '#18181b', border: '2px solid #27272a', borderRadius: 24, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#450a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #7f1d1d' }}>
              <Rocket size={32} color="#fca5a5" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fca5a5', background: '#450a0a', padding: '0.5rem 1rem', borderRadius: 99, border: '1px solid #7f1d1d' }}>
              LET'S GO!
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Daily Practice</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#a1a1aa', lineHeight: 1.6, fontWeight: 500 }}>Sharpen your brain! Answer fun daily questions tailored just for you.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#ef4444', fontWeight: 800, fontSize: '1.15rem', gap: '0.5rem' }}>
            Start Playing <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Mock Exam Card */}
        <div 
          style={{
            background: '#09090b', border: '2px solid #18181b', borderRadius: 24, padding: '2rem',
            cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', opacity: 0.7
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #27272a' }}>
              <Target size={32} color="#52525b" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#71717a', background: '#18181b', padding: '0.5rem 1rem', borderRadius: 99, border: '1px solid #27272a' }}>
              LOCKED
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#71717a' }}>Mock Exam</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#52525b', lineHeight: 1.6, fontWeight: 500 }}>The big practice test! This will unlock shortly before the main event.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#71717a', fontWeight: 800, fontSize: '1.15rem', gap: '0.5rem' }}>
            <Clock size={20} strokeWidth={3} /> Opens Soon
          </div>
        </div>

        {/* Syllabus / Resources Card */}
        <div 
          style={{
            background: '#18181b', border: '2px solid #27272a', borderRadius: 24, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#451a03', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #78350f' }}>
              <BookOpen size={32} color="#fcd34d" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Rules & Guide</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#a1a1aa', lineHeight: 1.6, fontWeight: 500 }}>Read all the super important instructions and see what topics to study!</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#f59e0b', fontWeight: 800, fontSize: '1.15rem', gap: '0.5rem' }}>
            Read Guide <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

      </div>
    </div>
  );
}
