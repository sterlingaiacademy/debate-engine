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
    <div style={{ minHeight: '100vh', background: '#F4F7F9', color: '#1e293b', fontFamily: FONT, padding: '2rem' }}>
      
      {/* Playful & Clean Hero Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #FF4B4B 0%, #D31027 100%)', 
        borderRadius: 24, 
        padding: '3rem', 
        marginBottom: '2rem', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(211, 16, 39, 0.2)'
      }}>
        {/* Fun decorative elements */}
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.15 }}>
          <Star size={180} color="#fff" fill="#fff" />
        </div>
        <div style={{ position: 'absolute', bottom: -20, right: 100, opacity: 0.2 }}>
          <Sparkles size={120} color="#fde047" />
        </div>
        <div style={{ position: 'absolute', top: 30, left: '60%', opacity: 0.1 }}>
          <Rocket size={100} color="#fff" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <Award size={36} color="#D31027" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              ThinkQuest <span style={{ color: '#fde047' }}>Olympiad</span>
            </h1>
            <div style={{ fontSize: '1.2rem', color: '#fecaca', fontWeight: 600, marginTop: '0.2rem' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Champion'}! 👋
            </div>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.6rem 1.2rem', borderRadius: 99, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
               <ShieldCheck size={20} color="#10b981" strokeWidth={2.5} />
               <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.95rem' }}>Status:</span> 
               <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.95rem' }}>Registered</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.6rem 1.2rem', borderRadius: 99, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
               <Award size={20} color="#D31027" strokeWidth={2.5} />
               <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.95rem' }}>School:</span> 
               <span style={{ color: '#D31027', fontWeight: 900, fontSize: '0.95rem' }}>{user?.olympiad_school_name || 'Loading...'}</span>
             </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', padding: '1rem 0' }}>
        
        {/* Daily Practice Card */}
        <div 
          onClick={() => navigate('/olympiad/practice')}
          style={{
            background: '#fff', border: '2px solid #f1f5f9', borderRadius: 24, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#FF4B4B'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 75, 75, 0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.04)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Rocket size={32} color="#FF4B4B" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF4B4B', background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: 99 }}>
              LET'S GO!
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#1e293b' }}>Daily Practice</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>Sharpen your brain! Answer fun daily questions tailored just for you.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#FF4B4B', fontWeight: 800, fontSize: '1.15rem', gap: '0.5rem' }}>
            Start Playing <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Mock Exam Card */}
        <div 
          style={{
            background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: 24, padding: '2rem',
            cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={32} color="#94a3b8" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: 99 }}>
              LOCKED
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Mock Exam</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>The big practice test! This will unlock shortly before the main event.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#94a3b8', fontWeight: 800, fontSize: '1.15rem', gap: '0.5rem' }}>
            <Clock size={20} strokeWidth={3} /> Opens Soon
          </div>
        </div>

        {/* Syllabus / Resources Card */}
        <div 
          style={{
            background: '#fff', border: '2px solid #f1f5f9', borderRadius: 24, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.04)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={32} color="#f59e0b" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#1e293b' }}>Rules & Guide</h3>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>Read all the super important instructions and see what topics to study!</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#f59e0b', fontWeight: 800, fontSize: '1.15rem', gap: '0.5rem' }}>
            Read Guide <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

      </div>
    </div>
  );
}
