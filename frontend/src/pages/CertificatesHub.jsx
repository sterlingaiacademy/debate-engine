import React from 'react';
import { Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CertificatesHub() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Certificates Hub</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
            Download and view your achievements and contest certificates.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Tile 1: Model UN Quiz */}
          <div 
            onClick={() => navigate('/certificates/model-un-quiz')}
            style={{
              background: '#1e293b', 
              borderRadius: 20, 
              padding: '2rem', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              cursor: 'pointer',
              transition: 'transform 0.2s, borderColor 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
          >
            <div style={{ width: 60, height: 60, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Award size={30} color="#3b82f6" />
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>Model UN Quiz Certificate</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Download your certificate of appreciation or participation for the recent Model UN Quiz Contest.
              </p>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: 600 }}>Download Now</span>
              <ChevronRight size={18} color="#3b82f6" />
            </div>
          </div>
          
          {/* Tile 2: Mini MUN Module 1 */}
          <div 
            onClick={() => navigate('/minimun-mod1-certificate')}
            style={{ 
              background: '#1e293b', 
              borderRadius: 20, 
              padding: '2rem', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              cursor: 'pointer',
              transition: 'transform 0.2s, borderColor 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
          >
            <div style={{ width: 60, height: 60, background: 'rgba(249,115,22,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(249,115,22,0.2)' }}>
              <Award size={30} color="#f97316" />
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>Mini MUN Master Class - Module 1</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                The World of Diplomacy (05.07.2026). Download your certificate of participation.
              </p>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#f97316', fontSize: '0.9rem', fontWeight: 600 }}>Download Now</span>
              <ChevronRight size={18} color="#f97316" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
