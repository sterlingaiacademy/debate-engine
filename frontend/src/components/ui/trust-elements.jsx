import React from 'react';

const Avatar = ({ imageSrc, delay }) => (
  <div style={{
    position: 'relative',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.15)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    flexShrink: 0,
    marginLeft: '-10px',
    animation: 'fadeIn 0.5s ease-out both',
    animationDelay: `${delay}ms`,
  }}>
    <img src={imageSrc} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

export const TrustElements = () => {
  const avatars = [
    "https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=80",
    "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=80",
    "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80",
    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80",
  ];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '999px',
      padding: '8px 16px 8px 18px',
    }}>
      {/* Avatar stack */}
      <div style={{ display: 'flex', paddingLeft: '10px' }}>
        {avatars.map((src, i) => (
          <Avatar key={i} imageSrc={src} delay={i * 150} />
        ))}
      </div>
      {/* Label */}
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'nowrap', fontWeight: 500 }}>
        Join <span style={{ color: '#fff', fontWeight: 700 }}>2,400+</span> students from KG to Class 12
      </p>
    </div>
  );
};
