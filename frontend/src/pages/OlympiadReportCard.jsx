import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OlympiadReportCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000', color: 'white' }}>
        <p>No report found. Please complete the Grand Olympiad first.</p>
        <button onClick={() => navigate('/dashboard')} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', background: '#dc2626', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#111111', padding: '3rem', borderRadius: '1rem', borderTop: '4px solid #dc2626' }}>
        <h1 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '2.5rem' }}>AI Competency Report</h1>
        <p style={{ color: '#94A3B8', marginBottom: '3rem', fontSize: '1.2rem' }}>ThinkQuest Grand Olympiad</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #dc2626' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Cognitive Strengths</h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#CBD5E1' }}>
              {report.strengths?.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
            </ul>
          </div>
          <div style={{ background: '#000000', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #fca5a5' }}>
            <h3 style={{ color: '#fca5a5', marginBottom: '1rem' }}>Development Areas</h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#CBD5E1' }}>
              {report.areas_for_improvement?.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
            </ul>
          </div>
        </div>

        <div style={{ background: '#000000', padding: '2rem', borderRadius: '0.5rem', border: '1px solid #450a0a', marginBottom: '2rem' }}>
          <h3 style={{ color: '#fca5a5', marginBottom: '1rem' }}>Detailed AI Feedback</h3>
          <p style={{ color: '#E2E8F0', lineHeight: '1.6' }}>{report.overall_feedback}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #7f1d1d 0%, #000000 100%)', padding: '2rem', borderRadius: '0.5rem' }}>
          <div>
            <h3 style={{ color: '#FBCFE8', marginBottom: '0.5rem' }}>National Percentile</h3>
            <p style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>Based on peer comparison</p>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>
            {report.percentile}th
          </div>
        </div>
      </div>
    </div>
  );
}
