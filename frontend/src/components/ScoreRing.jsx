import { useState, useEffect } from 'react';

function getScoreColor(score) {
  if (score >= 8.5) return '#10b981';
  if (score >= 7.0) return '#34d399';
  if (score >= 5.0) return '#facc15';
  if (score >= 3.0) return '#f97316';
  return '#ef4444';
}

/**
 * ScoreRing — animated SVG ring with count-up number.
 * Props:
 *   score    — number 0–10
 *   size     — px diameter (default 180)
 *   stroke   — stroke width (default 12)
 *   label    — optional label below number ("/ 10")
 *   color    — optional override color
 *   animate  — boolean, default true
 */
export default function ScoreRing({ score = 0, size = 180, stroke = 12, label = '/ 10', color, animate = true }) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [mounted, setMounted] = useState(false);

  const r = (size / 2) - stroke;
  const circ = 2 * Math.PI * r;
  const scoreColor = color || getScoreColor(score);
  const offset = mounted ? circ * (1 - score / 10) : circ;

  useEffect(() => {
    // Trigger ring animation
    const t = requestAnimationFrame(() => setMounted(true));

    // Count-up number animation
    if (!animate) { setDisplayScore(score); return; }
    let start = null;
    const duration = 1600;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplayScore(score * p);
      if (p < 1) requestAnimationFrame(step);
      else setDisplayScore(score);
    };
    const raf = requestAnimationFrame(step);

    return () => { cancelAnimationFrame(t); cancelAnimationFrame(raf); };
  }, [score, animate]);

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg
        className="score-ring-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={`${scoreColor}22`}
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={scoreColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>

      {/* Number overlay */}
      <div className="score-ring-overlay">
        <span style={{
          fontSize: size > 150 ? '2.8rem' : '1.8rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {displayScore.toFixed(1)}
        </span>
        {label && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
