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
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1e293b', fontFamily: FONT, padding: '2rem' }}>
      
      {/* Playful Hero Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
        border: '4px solid #fff', 
        borderRadius: 32, 
        padding: '3rem', 
        marginBottom: '2rem', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(59,130,246,0.2)'
      }}>
        {/* Fun decorative elements */}
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.2 }}>
          <Star size={180} color="#fff" fill="#fff" />
        </div>
        <div style={{ position: 'absolute', bottom: -20, right: 100, opacity: 0.15 }}>
          <Sparkles size={120} color="#fff" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <Award size={32} color="#8b5cf6" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            ThinkQuest <span style={{ color: '#fde047' }}>Olympiad</span>
          </h1>
        </div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: '1.4rem', color: '#f1f5f9', marginBottom: '0.8rem', fontWeight: 800 }}>
            Hello, {user?.name?.split(' ')[0] || 'Champion'}! 👋
          </div>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: 99, backdropFilter: 'blur(10px)' }}>
               <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Status:</span> 
               <span style={{ color: '#fde047', fontWeight: 800 }}>Registered & Ready!</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: 99, backdropFilter: 'blur(10px)' }}>
               <span style={{ color: '#e2e8f0', fontWeight: 600 }}>School:</span> 
               <span style={{ color: '#fff', fontWeight: 800 }}>{user?.olympiad_school_name || 'Loading your school...'}</span>
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
            background: '#fff', border: '3px solid #e2e8f0', borderRadius: 28, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(59,130,246,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Rocket size={28} color="#3b82f6" fill="#bfdbfe" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', background: '#eff6ff', padding: '0.4rem 1rem', borderRadius: 99, border: '2px solid #bfdbfe' }}>
              LET'S GO!
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#1e293b' }}>Daily Practice</h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>Sharpen your brain! Answer fun daily questions tailored just for you.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#3b82f6', fontWeight: 800, fontSize: '1.1rem', gap: '0.5rem' }}>
            Start Playing <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Mock Exam Card */}
        <div 
          onClick={() => {}} // Placeholder for now
          style={{
            background: '#f8fafc', border: '3px solid #f1f5f9', borderRadius: 28, padding: '2rem',
            cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f1f5f9', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={28} color="#94a3b8" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: 99, border: '2px solid #e2e8f0' }}>
              LOCKED
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Mock Exam</h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>The big practice test! This will unlock shortly before the main event.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#94a3b8', fontWeight: 800, fontSize: '1.1rem', gap: '0.5rem' }}>
            <Clock size={20} strokeWidth={3} /> Opens Soon
          </div>
        </div>

        {/* Syllabus / Resources Card */}
        <div 
          style={{
            background: '#fff', border: '3px solid #e2e8f0', borderRadius: 28, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16,185,129,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfdf5', border: '2px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={28} color="#10b981" fill="#a7f3d0" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#1e293b' }}>Rules & Guide</h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>Read all the super important instructions and see what topics to study!</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: 800, fontSize: '1.1rem', gap: '0.5rem' }}>
            Read Guide <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>

      </div>
    </div>
  );
}
