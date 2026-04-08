import React from 'react';
import { Link } from 'react-router-dom';

const ShinyButton = ({ text, to, href, icon: Icon, onClick }) => {
  const innerContent = (
    <>
      <style>{`
        .shiny-btn-container {
          position: relative;
          display: inline-block;
          padding: 2px;
          border-radius: 16px;
          background: radial-gradient(circle 80px at 80% -10%, #ffffff, #181b1b);
          cursor: pointer;
          border: none;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .shiny-btn-glow {
          position: absolute; top: 0; right: 0;
          width: 65%; height: 60%;
          border-radius: 120px;
          box-shadow: 0 0 20px rgba(255,255,255,0.22);
          transition: all 0.3s ease-out;
          z-index: 0;
        }
        .shiny-btn-container:hover .shiny-btn-glow {
          box-shadow: 0 0 40px rgba(255,255,255,0.38);
        }

        .shiny-btn-blob {
          position: absolute; bottom: 0; left: 0;
          width: 50px; height: 50%;
          border-radius: 17px;
          background: radial-gradient(circle 60px at 0% 100%, #F97316, rgba(232,57,42,0.31), transparent);
          box-shadow: -2px 9px 40px rgba(249,115,22,0.25);
          transition: all 0.3s ease-out;
          z-index: 0;
        }
        .shiny-btn-container:hover .shiny-btn-blob {
          width: 90px;
          box-shadow: -4px 1px 45px rgba(249,115,22,0.38);
        }

        .shiny-btn-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 14px;
          background: radial-gradient(circle 80px at 80% -50%, #444444, #0f1111);
          color: #ffffff;
          font-weight: bold;
          font-size: 1.1rem;
          transition: all 0.3s;
          z-index: 10;
        }
        .shiny-btn-container:hover .shiny-btn-inner {
          transform: scale(1.05);
        }

        .shiny-btn-inner-glow {
          position: absolute; inset: 0;
          border-radius: 14px;
          background: radial-gradient(circle 60px at 0% 100%, rgba(249,115,22,0.1), rgba(232,57,42,0.05), transparent);
          z-index: -1;
        }
      `}</style>
      
      <div className="shiny-btn-glow" />
      <div className="shiny-btn-blob" />
      <div className="shiny-btn-inner">
        {Icon && React.cloneElement(Icon, { size: 20 })}
        <span>{text}</span>
        <div className="shiny-btn-inner-glow" />
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="shiny-btn-container" onClick={onClick}>
        {innerContent}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="shiny-btn-container" onClick={onClick}>
        {innerContent}
      </a>
    );
  }

  return (
    <button className="shiny-btn-container" onClick={onClick} type="button">
      {innerContent}
    </button>
  );
};

export default ShinyButton;
