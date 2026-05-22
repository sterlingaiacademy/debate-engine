import { useState, useEffect } from 'react';
import { Globe, TrendingUp, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar } from 'recharts';
import { API_BASE } from '../../api';

export default function D365CohortHeatmap({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.studentId || user?.username;

  // Derive age band from classLevel
  const getAgeBand = (cls) => {
    if (!cls) return '14-15';
    if (['KG','Class 1','Class 2','Class KG','KG-2'].includes(cls)) return '8-9';
    if (['Class 3','Class 4','Class 5'].includes(cls)) return '9-10';
    if (['Class 6','Class 7','Class 8'].includes(cls)) return '12-13';
    if (['Class 9','Class 10'].includes(cls)) return '14-15';
    if (['Class 11','Class 12'].includes(cls)) return '16-17';
    if (cls === 'Level 3') return '12-13';
    if (cls === 'Level 4') return '14-15';
    if (cls === 'Level 5') return '16-17';
    return '14-15';
  };
  const ageBand = getAgeBand(user?.classLevel);

  useEffect(() => {
    fetch(`${API_BASE}/api/d365/cohort/${encodeURIComponent(ageBand)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ageBand]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#009edb', borderRadius: '50%' }} />
      </div>
    );
  }

  // Build survival curve data (mock if not enough real data yet)
  const survivalData = data?.survivalCurve || Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    remaining: Math.max(5, 100 - i * 7 - Math.random() * 5),
  }));

  const percentile = data?.yourPercentile ?? null;
  const totalInBand = data?.totalUsers ?? 0;
  const avgDay = data?.avgDay ?? 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
          Diplomat 365 · Anonymous
        </div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
          Cohort Pulse
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          Age band {ageBand} · Your scores appear anonymously · No names shown
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'In Your Band', value: totalInBand || '—', icon: Users, color: '#009edb' },
          { label: 'Avg Day Reached', value: avgDay ? `Day ${avgDay}` : '—', icon: TrendingUp, color: '#a855f7' },
          { label: 'Your Percentile', value: percentile !== null ? `Top ${Math.round(100 - percentile)}%` : '—', icon: Globe, color: '#D4A017' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <Icon size={20} color={color} style={{ margin: '0 auto 0.4rem', display: 'block' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Survival curve */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Cohort Retention</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem' }}>% Still Active by Month</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={survivalData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="cohortGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009edb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#009edb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 11 }} tickFormatter={v => `M${v}`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9' }}
              formatter={(v) => [`${Math.round(v)}%`, 'Active']}
              labelFormatter={l => `Month ${l}`}
            />
            <Area type="monotone" dataKey="remaining" stroke="#009edb" fill="url(#cohortGrad)" strokeWidth={2.5} dot={{ fill: '#009edb', r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Privacy note */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 12, padding: '0.75rem 1rem',
        fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500,
      }}>
        <Globe size={16} color="#a855f7" strokeWidth={2} style={{ flexShrink: 0 }} />
        Your data appears in this chart anonymously. No names, usernames, or identifiers are ever shared.
      </div>
    </div>
  );
}
