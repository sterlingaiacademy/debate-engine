import { useEffect, useState } from 'react';

/**
 * GeminiWave — Deep, fluid wave animation replicating the modern Gemini Live GUI.
 * Anchors to the bottom of the screen.
 */
export default function GeminiWave({ isSpeaking, isActive = true }) {
  // We use CSS layers that morph using transform and translate.
  // Speaking: Faster, larger amplitude, brighter.
  // Listening: Slower, gentle sway.
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
      opacity: isActive ? (isSpeaking ? 0.95 : 0.6) : 0.2,
      transition: 'opacity 0.6s ease-in-out',
    }}>
      <style>{`
        .g-orb {
          position: absolute;
          filter: blur(60px);
          border-radius: 50%;
          mix-blend-mode: screen;
          opacity: 0.85;
          transform-origin: center center;
          will-change: transform;
        }

        /* Floating when just active/listening */
        @keyframes orb-float-1 {
          0% { transform: translate(-10%, 30%) scale(1); }
          50% { transform: translate(15%, 5%) scale(1.15); }
          100% { transform: translate(-10%, 30%) scale(1); }
        }
        @keyframes orb-float-2 {
          0% { transform: translate(10%, 20%) scale(1.2); }
          50% { transform: translate(-15%, -5%) scale(0.9); }
          100% { transform: translate(10%, 20%) scale(1.2); }
        }
        @keyframes orb-float-3 {
          0% { transform: translate(-20%, 5%) scale(0.9); }
          50% { transform: translate(25%, 25%) scale(1.2); }
          100% { transform: translate(-20%, 5%) scale(0.9); }
        }

        /* Speaking animations (faster + pulse + wider movement) */
        @keyframes orb-speak-1 {
          0% { transform: translate(-5%, 25%) scale(1.1); }
          50% { transform: translate(20%, -10%) scale(1.4); }
          100% { transform: translate(-5%, 25%) scale(1.1); }
        }
        @keyframes orb-speak-2 {
           0% { transform: translate(15%, 15%) scale(1.4); }
          50% { transform: translate(-20%, -15%) scale(1.0); }
          100% { transform: translate(15%, 15%) scale(1.4); }
        }
        @keyframes orb-speak-3 {
          0% { transform: translate(-15%, -5%) scale(1.1); }
          50% { transform: translate(15%, 35%) scale(1.5); }
          100% { transform: translate(-15%, -5%) scale(1.1); }
        }
      `}</style>


      <div style={{ position: 'absolute', bottom: '-40%', left: '0', right: '0', height: '100%', display: 'flex', justifyContent: 'center', filter: 'saturate(1.2)' }}>
        
        {/* Soft Violet / Deep Blue Orb */}
        <div className="g-orb" style={{
          width: '70vw', height: '50vw', maxWidth: '900px', maxHeight: '700px',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0) 70%)',
          left: '0%',
          bottom: '-10%',
          animation: isSpeaking ? 'orb-speak-1 4s ease-in-out infinite' : 'orb-float-1 8s ease-in-out infinite'
        }} />
        
        {/* Vibrant Magenta / Cyan Orb */}
        <div className="g-orb" style={{
          width: '60vw', height: '45vw', maxWidth: '800px', maxHeight: '600px',
          background: 'radial-gradient(ellipse at center, rgba(236,72,153,0.85) 0%, rgba(217,70,239,0) 70%)',
          right: '5%',
          bottom: '-5%',
          animation: isSpeaking ? 'orb-speak-2 3.5s ease-in-out infinite' : 'orb-float-2 9s ease-in-out infinite'
        }} />

        {/* Bright Cyan Glow Orb */}
        <div className="g-orb" style={{
          width: '75vw', height: '40vw', maxWidth: '1000px', maxHeight: '500px',
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.85) 0%, rgba(14,165,233,0) 70%)',
          left: '15%',
          bottom: '-20%',
          animation: isSpeaking ? 'orb-speak-3 4.5s ease-in-out infinite' : 'orb-float-3 10s ease-in-out infinite'
        }} />

        {/* Core White/Cyan highlight while speaking */}
        <div className="g-orb" style={{
          width: '40vw', height: '20vw', maxWidth: '500px', maxHeight: '300px',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
          left: '30%',
          bottom: '-10%',
          opacity: isSpeaking ? 1 : 0,
          transition: 'opacity 0.4s ease',
          animation: 'orb-speak-1 2.5s ease-in-out infinite reverse',
          mixBlendMode: 'overlay'
        }} />
      </div>
      
      {/* Front layer to slightly darken the bottom edge */}
      <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px',
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
          zIndex: 1
      }} />
    </div>
  );
}
