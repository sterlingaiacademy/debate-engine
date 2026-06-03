import { useState } from 'react';

export default function BootcampBanner({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes banner-glow {
          0%, 100% { box-shadow: 0 4px 24px rgba(239,68,68,0.25), 0 0 0 0 rgba(239,68,68,0.15); }
          50%       { box-shadow: 0 4px 32px rgba(239,68,68,0.45), 0 0 0 6px rgba(239,68,68,0); }
        }
        .bootcamp-banner-wrap:hover .bootcamp-cta-btn {
          background: linear-gradient(135deg, #FFa600, #FF6B00) !important;
          transform: scale(1.05);
        }
      `}</style>

      <div
        className="bootcamp-banner-wrap"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 16,
          background: hovered
            ? 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(255,107,0,0.15) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(255,107,0,0.10) 100%)',
          border: '1.5px solid rgba(239,68,68,0.4)',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.25s',
          animation: 'banner-glow 2.5s ease-in-out infinite',
          marginBottom: '0.25rem',
        }}
      >
        {/* Top bar: BREAKING NEWS ticker */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#ef4444', overflow: 'hidden' }}>
          {/* BREAKING badge */}
          <div style={{
            flexShrink: 0, background: '#b91c1c',
            padding: '0.3rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.68rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRight: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'live-pulse 1s ease-in-out infinite' }} />
            BREAKING
          </div>
          {/* Scrolling ticker */}
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{
              display: 'inline-block', whiteSpace: 'nowrap',
              animation: 'ticker-scroll 18s linear infinite',
              padding: '0.3rem 0',
              fontSize: '0.72rem', fontWeight: 700, color: '#fff', letterSpacing: '0.03em',
            }}>
              🎤 G-TALK SPEECH &amp; DEBATE PROGRAMME — COHORT 1 NOW OPEN! &nbsp;|&nbsp; 4 Weeks Online · 1 Hr Daily @ 7 PM IST · Certificate Included &nbsp;|&nbsp; Limited Seats — Register Now for ₹499 (Actual Fee ₹4,999) &nbsp;|&nbsp; Powered by G-Force AI × NanoSkool &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
        </div>

        {/* Main content row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.9rem 1.1rem', flexWrap: 'wrap',
        }}>
          {/* Icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #ef4444, #FF6B00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
          }}>
            🎤
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span style={{
                fontSize: '0.95rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em',
              }}>G-Talk Cohort 1 — Now Open!</span>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800, background: '#ef4444', color: '#fff',
                borderRadius: 99, padding: '0.15rem 0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>NEW</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600, lineHeight: 1.45 }}>
              Speech &amp; Debate Bootcamp · ₹499 only (worth ₹4,999) · 4 weeks · Cert included
            </div>
          </div>

          {/* CTA Button */}
          <div
            className="bootcamp-cta-btn"
            style={{
              flexShrink: 0, background: 'linear-gradient(135deg, #FF6B00, #FFa600)',
              color: '#fff', fontWeight: 800, fontSize: '0.82rem',
              padding: '0.55rem 1.1rem', borderRadius: 99,
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              boxShadow: '0 4px 14px rgba(255,107,0,0.35)',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            Register → ₹499
          </div>
        </div>
      </div>
    </>
  );
}
