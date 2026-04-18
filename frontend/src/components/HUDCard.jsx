/**
 * HUDCard — glowing stat card with top accent bar and radial glow.
 * Props:
 *   icon      — Lucide icon component
 *   label     — string label below value
 *   value     — string or number to display
 *   color     — hex color for accent + glow
 *   sub       — optional small caption below label
 *   onClick   — optional click handler
 */
export default function HUDCard({ icon: Icon, label, value, color = '#FF6B00', sub, onClick, style }) {
  const dim = `${color}20`;

  return (
    <div
      className="hud-card"
      onClick={onClick}
      style={{
        '--hud-accent': color,
        '--hud-glow': dim,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Icon + value row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div
          style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {Icon && <Icon size={22} color={color} strokeWidth={2} />}
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em',
        }}
      >
        {value ?? '—'}
      </div>

      {/* Label */}
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>

      {/* Optional sub caption */}
      {sub && (
        <div style={{ fontSize: '0.75rem', color: color, fontWeight: 600, marginTop: '0.35rem' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
