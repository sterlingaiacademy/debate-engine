import React, { useState } from 'react';

export const GradientBars = () => {
  const numBars = 15;

  const calculateHeight = (index, total) => {
    const position = index / (total - 1);
    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2);
    return 30 + 70 * heightPercentage; // 30% min, 100% max
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes pulseBar {
          0%   { opacity: 0.4; transform: scaleY(0.85); }
          100% { opacity: 0.85; transform: scaleY(1); }
        }
      `}</style>
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'flex-end',
      }}>
        {Array.from({ length: numBars }).map((_, index) => {
          const height = calculateHeight(index, numBars);
          return (
            <div
              key={index}
              style={{
                flex: `1 0 calc(100% / ${numBars})`,
                maxWidth: `calc(100% / ${numBars})`,
                height: `${height}%`,
                background: 'linear-gradient(to top, rgb(220, 60, 20), transparent)',
                transformOrigin: 'bottom',
                animation: `pulseBar 2s ease-in-out ${index * 0.12}s infinite alternate`,
                boxSizing: 'border-box',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
