import React from 'react';
import { useNavigate } from 'react-router-dom';

const SpinnerButton = ({ text, href, to, icon: Icon, onClick, theme = 'slate' }) => {
  const navigate = useNavigate();

  const handleAction = (e) => {
    if (onClick) onClick(e);
    
    if (to) {
      e.preventDefault();
      navigate(to);
    } else if (href) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const isOrange = theme === 'orange';
  const innerBg = isOrange ? 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)' : '#0a0d14';
  const innerColor = isOrange ? '#ffffff' : '#e2e8f0';

  return (
    <button
      onClick={handleAction}
      style={{
        textDecoration: 'none',
        display: 'inline-block',
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer'
      }}
      className="hover:scale-105 active:scale-95 transition-all group"
      type="button"
    >
      <style>{`
        .spinner-bg {
          position: absolute;
          top: -100%; left: -100%;
          width: 300%; height: 300%;
          background: conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(255,255,255, 0.8) 90%, #ffffff 100%);
          animation: spin-gradient 3s linear infinite;
          z-index: 0;
        }
        @keyframes spin-gradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <span style={{
        position: 'relative',
        display: 'inline-flex',
        padding: '2px', // border width
        borderRadius: '12px', 
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.1)',
      }}>
        <span className="spinner-bg" />
        
        <span style={{
          position: 'relative',
          zIndex: 10,
          background: innerBg,
          color: innerColor,
          borderRadius: '10px', 
          padding: '0 32px',
          height: '52px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '1.05rem',
          fontWeight: 'bold',
        }} className={isOrange ? '' : 'group-hover:text-white transition-colors'}>
          {Icon}
          {text}
        </span>
      </span>
    </button>
  );
};

export default SpinnerButton;
