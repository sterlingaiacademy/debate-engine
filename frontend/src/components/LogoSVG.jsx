// Inline SVG recreation of the G Force AI logo
// Red-to-orange gradient: #E8392A -> #F97316 -> #FBBF24

export default function LogoSVG({ size = 48, showText = false, className = '' }) {
  const id = `gf-grad-${size}`;
  return (
    <div className={`logo-svg-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? '0.6rem' : 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="G Force AI Logo"
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#E8392A" />
            <stop offset="50%"  stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Big "G" letter shape */}
        <path
          d="M 155 30
             A 90 90 0 1 0 155 170
             L 155 110
             L 105 110
             L 105 130
             L 135 130
             L 135 155
             A 65 65 0 1 1 135 45
             Z"
          fill={`url(#${id})`}
        />

        {/* Microphone body (capsule) */}
        <rect x="118" y="38" width="38" height="60" rx="19" fill={`url(#${id})`} />

        {/* Microphone grille dots */}
        {[0,1,2,3].map(row =>
          [0,1,2].map(col => (
            <circle
              key={`${row}-${col}`}
              cx={128 + col * 10}
              cy={48 + row * 10}
              r="2.5"
              fill="rgba(255,255,255,0.55)"
            />
          ))
        )}

        {/* Microphone stand — U-arch */}
        <path
          d="M 127 98 Q 127 125 137 125 Q 147 125 147 98"
          stroke={`url(#${id})`}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />

        {/* Microphone base */}
        <rect x="122" y="125" width="30" height="8" rx="4" fill={`url(#${id})`} />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.35,
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
          }}>
            G FORCE AI
          </span>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: size * 0.16,
            background: 'linear-gradient(135deg, #E8392A, #F97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Crafting Leaders
          </span>
        </div>
      )}
    </div>
  );
}
