import React, { useState } from 'react';
import { API_BASE } from '../api';
import { useNavigate } from 'react-router-dom';

export default function OlympiadArena({ user }) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => setStarted(true);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/exam/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, answers: {}, time_taken: 3000 })
      });
      const data = await res.json();
      setReport(data.report);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted && report) {
    return (
      <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#111111', padding: '3rem', borderRadius: '1rem', textAlign: 'center', borderTop: '4px solid #dc2626' }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '2.5rem' }}>Exam Completed!</h1>
          <p style={{ color: '#94A3B8', marginBottom: '2rem', fontSize: '1.2rem' }}>Here is your initial AI Competency Snapshot</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #dc2626' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Key Strengths</h3>
              <ul style={{ paddingLeft: '1.5rem', color: '#CBD5E1' }}>
                {report.strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
              </ul>
            </div>
            <div style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #fca5a5' }}>
              <h3 style={{ color: '#fca5a5', marginBottom: '1rem' }}>Areas to Improve</h3>
              <ul style={{ paddingLeft: '1.5rem', color: '#CBD5E1' }}>
                {report.areas_for_improvement.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
              </ul>
            </div>
          </div>
          
          <div style={{ background: 'rgba(220,38,38,0.1)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <p style={{ fontStyle: 'italic', color: '#E2E8F0' }}>"{report.overall_feedback}"</p>
          </div>
          
          <button onClick={() => navigate('/dashboard')} style={{ padding: '1rem 2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', cursor: 'pointer' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #000000 100%)', padding: '4rem 2rem', borderRadius: '1rem', border: '1px solid #450a0a' }}>
          <h1 style={{ color: '#fca5a5', fontSize: '3rem', marginBottom: '1rem', textShadow: '0 2px 10px rgba(220,38,38,0.3)' }}>Grand Olympiad Arena</h1>
          <p style={{ color: '#F3E8FF', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Welcome to the final challenge! You will have 60 minutes to complete 5 sections testing cognitive flexibility, analytical reasoning, and creative problem-solving.
          </p>
          
          <button onClick={handleStart} style={{ padding: '1.5rem 4rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '3rem', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px rgba(220,38,38,0.5)', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            Enter Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#111111', padding: '2rem', borderRadius: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #450a0a', paddingBottom: '1rem' }}>
          <h2 style={{ color: '#dc2626' }}>Grand Olympiad Exam</h2>
          <div style={{ background: '#000000', padding: '0.5rem 1rem', borderRadius: '2rem', color: '#fca5a5', fontFamily: 'monospace', fontSize: '1.2rem' }}>
            TIME REMAINING: 59:59
          </div>
        </div>
        
        {/* Mock Exam Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #450a0a' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Part A: Logical Reasoning</span>
            <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: '1rem' }}>If all blips are blops, and some blops are bloops, which of the following MUST be true?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['All blips are bloops', 'Some blips are bloops', 'Some bloops are blops', 'None of the above'].map((opt, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name="q1" /> {opt}</label>
              ))}
            </div>
          </div>
          
          <div style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #450a0a' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Part E: Critical Expression</span>
            <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Argue for or against the use of AI in creative writing. (Max 200 words)</p>
            <textarea rows="6" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: '#000000', color: 'white', border: '1px solid #450a0a' }} placeholder="Type your response here..." />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{ padding: '1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
          {loading ? 'Submitting Exam...' : 'Submit Grand Olympiad Exam'}
        </button>
      </div>
    </div>
  );
}
