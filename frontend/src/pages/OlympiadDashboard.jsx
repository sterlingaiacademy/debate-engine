import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, ChevronRight, BookOpen, Clock, Activity, Target, Award, Rocket, Sparkles } from 'lucide-react';

export default function OlympiadDashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const FONT = "'Google Sans', 'Inter', sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: '#110505', color: '#f8fafc', fontFamily: FONT, padding: '2rem' }}>
      
      {/* Playful Dark Red Hero Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', 
        border: '3px solid #ef4444', 
        borderRadius: 32, 
        padding: '3rem', 
        marginBottom: '2rem', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'
      }}>
        {/* Fun decorative elements */}
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.15 }}>
          <Star size={180} color="#fca5a5" fill="#fca5a5" />
        </div>
        <div style={{ position: 'absolute', bottom: -20, right: 100, opacity: 0.15 }}>
          <Sparkles size={120} color="#fef08a" />
        </div>
        <div style={{ position: 'absolute', top: 20, left: '50%', opacity: 0.1 }}>
          <Rocket size={100} color="#f87171" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)', border: '2px solid #fecaca' }}>
            <Award size={32} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            ThinkQuest <span style={{ color: '#fde047', textShadow: '0 0 15px rgba(253, 224, 71, 0.4)' }}>Olympiad</span>
          </h1>
        </div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: '1.4rem', color: '#fecaca', marginBottom: '0.8rem', fontWeight: 800 }}>
            Hello, {user?.name?.split(' ')[0] || 'Champion'}! 👋
          </div>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: 99, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <span style={{ color: '#fca5a5', fontWeight: 600 }}>Status:</span> 
               <span style={{ color: '#4ade80', fontWeight: 800, textShadow: '0 0 10px rgba(74, 222, 128, 0.3)' }}>Registered & Ready!</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: 99, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <span style={{ color: '#fca5a5', fontWeight: 600 }}>School:</span> 
               <span style={{ color: '#f8fafc', fontWeight: 800 }}>{user?.olympiad_school_name || 'Loading your school...'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '1rem 0' }}>
        
        {/* Daily Practice Card */}
        <div 
          onClick={() => navigate('/olympiad/practice')}
          style={{
            background: '#2a0a0a', border: '3px solid #450a0a', borderRadius: 28, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#450a0a'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#b91c1c', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(185, 28, 28, 0.4)' }}>
              <Rocket size={28} color="#fff" fill="#fecaca" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem 1rem', borderRadius: 99, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              LET'S GO!
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Daily Practice</h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#fca5a5', lineHeight: 1.6, fontWeight: 500 }}>Sharpen your brain! Answer fun daily questions tailored just for you.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#ef4444', fontWeight: 800, fontSize: '1.1rem', gap: '0.5rem' }}>
            Start Playing <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Mock Exam Card */}
        <div 
          onClick={() => {}} // Placeholder for now
          style={{
            background: '#1a0505', border: '3px solid #2a0a0a', borderRadius: 28, padding: '2rem',
            cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#450a0a', border: '2px solid #7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={28} color="#fca5a5" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '0.4rem 1rem', borderRadius: 99, border: '1px solid rgba(248, 113, 113, 0.3)' }}>
              LOCKED
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#f87171' }}>Mock Exam</h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#fca5a5', lineHeight: 1.6, fontWeight: 500 }}>The big practice test! This will unlock shortly before the main event.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#f87171', fontWeight: 800, fontSize: '1.1rem', gap: '0.5rem' }}>
            <Clock size={20} strokeWidth={3} /> Opens Soon
          </div>
        </div>

        {/* Syllabus / Resources Card */}
        <div 
          style={{
            background: '#2a0a0a', border: '3px solid #450a0a', borderRadius: 28, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(249, 115, 22, 0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#450a0a'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ea580c', border: '2px solid #fdba74', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(234, 88, 12, 0.4)' }}>
              <BookOpen size={28} color="#fff" fill="#fed7aa" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Rules & Guide</h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#fca5a5', lineHeight: 1.6, fontWeight: 500 }}>Read all the super important instructions and see what topics to study!</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#f97316', fontWeight: 800, fontSize: '1.1rem', gap: '0.5rem' }}>
            Read Guide <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

      </div>
    </div>
  );
}
