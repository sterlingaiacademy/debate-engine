import React, { useEffect, useRef } from 'react';

export default function TranscriptView({ transcript, agentName = 'AI', agentImage = null }) {
  const containerRef = useRef(null);

  // Auto-scroll to the bottom whenever transcript changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div 
      className="animate-fade-in"
      style={{
        width: '100%',
        maxWidth: '850px',
        height: '40vh',
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        zIndex: 25,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        scrollBehavior: 'smooth',
        margin: '0 auto 1.5rem auto'
      }} 
      ref={containerRef}
    >
      {transcript.length === 0 && (
        <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
          Conversation matching established...
        </div>
      )}

      {transcript.map((msg, idx) => {
        const isUser = msg.role === 'user';
        return (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            alignItems: 'flex-start',
            gap: '1rem',
            width: '100%',
          }}>
            {!isUser && (
              <div style={{ 
                width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', 
                overflow: 'hidden', border: '2px solid var(--accent)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
              }}>
                {agentImage ? (
                   <img src={agentImage} alt={agentName} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                   <div style={{width:'100%', height:'100%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:'0.9rem'}}>
                     {agentName[0] || 'A'}
                   </div>
                )}
              </div>
            )}
            
            <div style={{
              maxWidth: '85%',
              background: isUser ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
              padding: '0.75rem 1.25rem',
              borderRadius: '20px',
              borderBottomRightRadius: isUser ? '4px' : '20px',
              borderBottomLeftRadius: isUser ? '20px' : '4px',
              color: '#fff',
              fontSize: '1.05rem',
              lineHeight: 1.5,
              wordWrap: 'break-word',
              border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)'
            }}>
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
