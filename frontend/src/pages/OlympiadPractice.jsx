import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

export default function OlympiadPractice({ user }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/olympiad/daily-challenge`)
      .then(res => res.json())
      .then(data => {
        setChallenge(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/olympiad/practice/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, challenge_id: challenge.id, score: 10, time_spent: 300 })
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading Daily Challenge...</div>;
  if (!challenge) return <div style={{ color: 'white', padding: '2rem' }}>Failed to load challenge.</div>;

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#111111', padding: '2rem', borderRadius: '1rem' }}>
        <h1 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '2rem' }}>Daily Olympiad Practice</h1>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Topic: {challenge.topic} | Difficulty: {challenge.difficulty_level}</p>

        {submitted ? (
          <div style={{ background: 'rgba(220,38,38,0.1)', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid #dc2626' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Practice Completed!</h2>
            <p>Great job! Keep practicing every day to prepare for the Grand Arena.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {challenge.questions.map((q, idx) => (
              <div key={idx} style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #450a0a' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}><strong>Q{idx + 1}:</strong> {q.q}</p>
                {q.type === 'mcq' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options.map((opt, oIdx) => (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name={`q_${idx}`} onChange={() => setAnswers({...answers, [idx]: opt})} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    rows="4" 
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: '#111111', color: 'white', border: '1px solid #450a0a' }}
                    placeholder="Type your answer here..."
                    onChange={(e) => setAnswers({...answers, [idx]: e.target.value})}
                  />
                )}
              </div>
            ))}
            
            <button 
              onClick={handleSubmit}
              style={{ padding: '1rem 2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Submit Practice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
