import React, { useState, useEffect } from 'react';
import juniorAvatar from '../assets/junior_avatar.png';

/**
 * AIAvatar — renders either:
 *   - Junior (Level 1/2): Talking Tom-style animated image (Leo/owl)
 *   - Senior (Level 3/4/5): Handled externally via GeminiWave (returns null here unless persona override)
 */
export default function AIAvatar({ isJunior, isSpeaking, size = 120, overrideImage, overrideName }) {
  // Senior users get the fluid wave (handled in parent). If no override, render nothing here.
  if (!isJunior && !overrideImage) {
    return null;
  }

  // Junior users (or persona override with a custom image) get the image avatar
  const src = overrideImage ? overrideImage : juniorAvatar;
  const displayName = overrideName ? overrideName : 'Leo';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      {/* Avatar wrapper with animated ring */}
      <div style={{ position: 'relative', width: size, height: size }}>

        {/* Pulsing glow ring when speaking */}
        {isSpeaking && (
          <div style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            border: `3px solid #a855f7`,
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            opacity: 0.5,
          }} />
        )}

        {/* Static soft ring */}
        <div style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          border: `3px solid rgba(168,85,247,0.3)`,
        }} />

        {/* Avatar image with talk/idle animation */}
        <img
          src={src}
          alt={displayName}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            animation: isSpeaking
              ? 'avatarTalk 0.4s ease-in-out infinite alternate'
              : 'avatarIdle 3s ease-in-out infinite',
            transformOrigin: 'center bottom',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
          }}
        />

        {/* Speaking indicator dot */}
        <div style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: isSpeaking ? '#10b981' : '#94a3b8',
          border: '2px solid white',
          transition: 'background 0.3s',
          boxShadow: isSpeaking ? '0 0 8px rgba(16,185,129,0.7)' : 'none',
        }} />
      </div>

      {/* Name label */}
      <div style={{
        fontSize: '0.8125rem',
        fontWeight: 700,
        color: '#7c3aed',
        background: 'rgba(168,85,247,0.08)',
        padding: '0.2rem 0.75rem',
        borderRadius: '99px',
        letterSpacing: '0.02em',
      }}>
        {isSpeaking ? `${displayName} is speaking...` : displayName}
      </div>

      {/* Inline keyframes injected via style tag */}
      <style>{`
        @keyframes avatarTalk {
          0%   { transform: scale(1) rotate(-2deg); }
          100% { transform: scale(1.08) rotate(2deg); }
        }
        @keyframes avatarIdle {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
}
