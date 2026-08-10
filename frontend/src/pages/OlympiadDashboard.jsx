import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, FileText, ChevronRight, BookOpen, Clock, Activity, Target } from 'lucide-react';

export default function OlympiadDashboard({ user }) {
  const navigate = useNavigate();

  // If not logged in or not registered, maybe redirect back
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const FONT = "'Google Sans', 'Inter', sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: '#06080F', color: '#fff', fontFamily: FONT, padding: '2rem' }}>
      
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1f0505 0%, #3d0a0a 100%)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: '3rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} color="#ef4444" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>ThinkQuest <span style={{ color: '#ef4444' }}>Olympiad</span></h1>
        </div>
        
        <div style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: 600 }}>
          Welcome, {user?.name || 'Student'}!
        </div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Status: <span style={{ color: '#ef4444', fontWeight: 700 }}>Registered</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Daily Practice Card */}
        <div 
          onClick={() => navigate('/olympiad/practice')}
          style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color="#ef4444" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.3rem 0.8rem', borderRadius: 99, border: '1px solid rgba(239,68,68,0.2)' }}>
              AVAILABLE
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Daily Practice</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Train your cognitive skills daily to prepare for the Grand Challenge. Questions are tailored to your grade.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', gap: '0.5rem' }}>
            Start Session <ChevronRight size={16} />
          </div>
        </div>

        {/* Mock Exam Card */}
        <div 
          onClick={() => {}} // Placeholder for now
          style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 20, padding: '2rem',
            cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color="#64748b" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)' }}>
              LOCKED
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#94a3b8' }}>Mock Exam</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>Experience the real test environment. Unlocks one week before the main event.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', color: '#475569', fontWeight: 700, fontSize: '0.9rem', gap: '0.5rem' }}>
            <Clock size={16} /> Opens Soon
          </div>
        </div>

        {/* Syllabus / Resources Card */}
        <div 
          style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2rem',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = ''; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} color="#3b82f6" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Syllabus & Rules</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Review the topics covered in the Olympiad and read the instructions for test day.</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', gap: '0.5rem' }}>
            View Resources <ChevronRight size={16} />
          </div>
        </div>

      </div>
    </div>
  );
}
