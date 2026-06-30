import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

const FONT = "'Plus Jakarta Sans', 'Google Sans', system-ui, sans-serif";

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'debates', label: 'Debates' },
  { id: 'bootcamp', label: 'Bootcamp' },
  { id: 'coupons', label: 'School Coupons' },
  { id: 'quiz', label: 'UN Quiz' },
];

const PLAN_COLORS = { free: '#64748b', pro: '#3b82f6', max: '#f97316' };
const PLAN_BG = { free: 'rgba(100,116,139,0.12)', pro: 'rgba(59,130,246,0.12)', max: 'rgba(249,115,22,0.12)' };
const STATUS_COLORS = { active: '#10b981', inactive: '#64748b', halted: '#ef4444', cancelled: '#f59e0b' };

function PlanBadge({ plan }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: PLAN_BG[plan] || PLAN_BG.free, color: PLAN_COLORS[plan] || PLAN_COLORS.free,
      border: `1px solid ${(PLAN_COLORS[plan] || PLAN_COLORS.free)}30`,
    }}>
      {plan || 'free'}
    </span>
  );
}

function StatusDot({ status }) {
  const color = STATUS_COLORS[status] || '#64748b';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {status || 'inactive'}
    </span>
  );
}

function StatCard({ label, value, sub, color = '#F97316', trend }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '1.4rem 1.5rem', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      {/* glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top left, ${color}12 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', fontSize: '0.78rem', fontWeight: 700, color: trend >= 0 ? '#10b981' : '#ef4444' }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {children}
    </h2>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(c => (
          <th key={c} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableRow({ children, idx }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
    >
      {children}
    </tr>
  );
}

function TD({ children, mono }) {
  return (
    <td style={{ padding: '0.7rem 1rem', fontSize: '0.84rem', color: '#e2e8f0', fontFamily: mono ? 'monospace' : 'inherit', whiteSpace: 'nowrap' }}>
      {children}
    </td>
  );
}

function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} style={{ padding: '0.4rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontSize: '0.85rem' }}>←</button>
      <span style={{ color: '#94a3b8', fontSize: '0.85rem', minWidth: 100, textAlign: 'center' }}>Page {page} of {totalPages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} style={{ padding: '0.4rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, fontSize: '0.85rem' }}>→</button>
    </div>
  );
}

function fmt(n) {
  if (n === undefined || n === null) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

// ══════════════════════════════════════════════════
// SECTION: Overview
// ══════════════════════════════════════════════════
function OverviewSection({ stats }) {
  const u = stats.users;
  const s = stats.subscriptions;
  const d = stats.debates;
  const b = stats.bootcamp;

  return (
    <div>
      <SectionTitle>Platform Overview</SectionTitle>

      {/* Main KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Users" value={fmt(u.total)} sub={`+${u.newToday} today · +${u.newThisWeek} this week`} color="#3b82f6" />
        <StatCard label="Pro Subscribers" value={fmt(s.byPlan.pro)} sub="Active learners on Pro" color="#3b82f6" />
        <StatCard label="Max Subscribers" value={fmt(s.byPlan.max)} sub="Premium max plan" color="#F97316" />
        <StatCard label="Active Subscriptions" value={fmt(s.byStatus.active)} sub="Paying users right now" color="#10b981" />
        <StatCard label="Total Debates" value={fmt(d.total)} sub={`${d.today} today · ${d.thisWeek} this week`} color="#8b5cf6" />
        <StatCard label="Avg Debate Score" value={d.avgScore > 0 ? d.avgScore.toFixed(1) : '—'} sub="Out of 10 across all debates" color="#f59e0b" />
        <StatCard label="Bootcamp Registrations" value={fmt(b.paid)} sub={`${b.total} total · ₹${fmt(b.revenue)} revenue`} color="#ec4899" />
        <StatCard label="G-Force Tokens Issued" value={fmt(stats.gforceTokensIssued)} sub="Total across all users" color="#f59e0b" />
        {stats.quizRegistrations !== undefined && <StatCard label="UN Quiz Registrants" value={fmt(stats.quizRegistrations)} sub="Total contest registrations" color="#3b82f6" />}
      </div>

      {/* Two-column: Users by level + Subscription breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Users by Level */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Users by Level</h3>
          {u.byLevel.map(r => {
            const pct = u.total > 0 ? Math.round((r.count / u.total) * 100) : 0;
            return (
              <div key={r.classLevel} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>{r.classLevel || 'Unknown'}</span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.count} ({pct}%)</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #F97316, #FBBF24)', borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Subscription Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Free Users', val: s.byPlan.free, color: '#64748b' },
              { label: 'Pro Users', val: s.byPlan.pro, color: '#3b82f6' },
              { label: 'Max Users', val: s.byPlan.max, color: '#F97316' },
              { label: 'Active', val: s.byStatus.active, color: '#10b981' },
              { label: 'Halted', val: s.byStatus.halted, color: '#ef4444' },
              { label: 'Cancelled', val: s.byStatus.cancelled, color: '#f59e0b' },
              { label: 'Monthly', val: s.byPeriod.monthly, color: '#8b5cf6' },
              { label: 'Yearly', val: s.byPeriod.yearly, color: '#06b6d4' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${color}20` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', flex: 1 }}>{label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Recent Signups</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['Name', 'Username', 'Email', 'Level', 'Plan', 'Joined']} />
            <tbody>
              {stats.recentUsers.map((u, i) => (
                <TableRow key={u.studentId} idx={i}>
                  <TD>{u.name}</TD>
                  <TD mono>{u.studentId}</TD>
                  <TD>{u.email || '—'}</TD>
                  <TD>{u.classLevel}</TD>
                  <TD><PlanBadge plan={u.subscription_plan} /></TD>
                  <TD>{fmtDate(u.createdAt)}</TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION: Users (full paginated table)
// ══════════════════════════════════════════════════
function UsersSection({ adminToken, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (planFilter !== 'all') params.set('plan', planFilter);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      const res = await fetch(`${apiBase}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, planFilter, levelFilter, adminToken, apiBase]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div>
      <SectionTitle>All Users</SectionTitle>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search name, username, email…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
          style={{ padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: '0.875rem', outline: 'none', minWidth: 240, flex: 1 }}
        />
        <button onClick={() => { setSearch(searchInput); setPage(1); }}
          style={{ padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg,#E8392A,#F97316)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
          Search
        </button>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          style={{ padding: '0.55rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="max">Max</option>
        </select>
        <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1); }}
          style={{ padding: '0.55rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Levels</option>
          {['Level 1','Level 2','Level 3','Level 4','Level 5'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {data && <span style={{ color: '#64748b', fontSize: '0.82rem', marginLeft: 'auto' }}>{data.total} users</span>}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead cols={['Name', 'Username', 'Email', 'Phone', 'Level', 'Grade', 'Plan', 'Status', 'Period', 'Joined']} />
              <tbody>
                {data?.users?.map((u, i) => (
                  <TableRow key={u.studentId} idx={i}>
                    <TD>{u.name}</TD>
                    <TD mono>{u.studentId}</TD>
                    <TD>{u.email || '—'}</TD>
                    <TD mono>{u.phone || '—'}</TD>
                    <TD>{u.classLevel}</TD>
                    <TD>{u.grade || '—'}</TD>
                    <TD><PlanBadge plan={u.subscription_plan} /></TD>
                    <TD><StatusDot status={u.subscription_status} /></TD>
                    <TD>{u.subscription_period || '—'}</TD>
                    <TD>{fmtDate(u.createdAt)}</TD>
                  </TableRow>
                ))}
                {!data?.users?.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {data && <div style={{ padding: '0.75rem 1rem' }}><Pagination page={page} total={data.total} limit={20} onPage={setPage} /></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION: Subscriptions
// ══════════════════════════════════════════════════
function SubscriptionsSection({ stats }) {
  const s = stats.subscriptions;
  const paid = stats.recentSubscriptions;

  return (
    <div>
      <SectionTitle>Subscriptions</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Free Users" value={s.byPlan.free} color="#64748b" />
        <StatCard label="Pro Plan" value={s.byPlan.pro} color="#3b82f6" />
        <StatCard label="Max Plan" value={s.byPlan.max} color="#F97316" />
        <StatCard label="Active" value={s.byStatus.active} color="#10b981" />
        <StatCard label="Halted" value={s.byStatus.halted} color="#ef4444" />
        <StatCard label="Cancelled" value={s.byStatus.cancelled} color="#f59e0b" />
        <StatCard label="Monthly" value={s.byPeriod.monthly} color="#8b5cf6" />
        <StatCard label="Yearly" value={s.byPeriod.yearly} color="#06b6d4" />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Recent Paid Subscribers</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['Name', 'Username', 'Email', 'Plan', 'Period', 'Status', 'Joined']} />
            <tbody>
              {paid.map((u, i) => (
                <TableRow key={`${u.studentId}-${i}`} idx={i}>
                  <TD>{u.name}</TD>
                  <TD mono>{u.studentId}</TD>
                  <TD>{u.email || '—'}</TD>
                  <TD><PlanBadge plan={u.subscription_plan} /></TD>
                  <TD>{u.subscription_period || '—'}</TD>
                  <TD><StatusDot status={u.subscription_status} /></TD>
                  <TD>{fmtDate(u.createdAt)}</TD>
                </TableRow>
              ))}
              {!paid.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No paid subscribers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION: Debates
// ══════════════════════════════════════════════════
function DebatesSection({ stats }) {
  const d = stats.debates;
  return (
    <div>
      <SectionTitle>Debates</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Debates" value={fmt(d.total)} color="#8b5cf6" />
        <StatCard label="Avg Score" value={d.avgScore > 0 ? d.avgScore.toFixed(1) : '—'} sub="Out of 10" color="#f59e0b" />
        <StatCard label="Debates Today" value={d.today} color="#10b981" />
        <StatCard label="This Week" value={d.thisWeek} color="#3b82f6" />
        <StatCard label="Total Words Spoken" value={fmt(d.totalWords)} color="#ec4899" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* By Level */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Debates by Level</h3>
          {d.byLevel.map(r => (
            <div key={r.class} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{r.class || 'Unknown'}</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{r.total} debates</span>
                <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>avg {r.avg_score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent debates */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Recent Debates</h3>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 320 }}>
            {stats.recentDebates.map((d, i) => (
              <div key={i} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600, marginBottom: 2 }}>{d.name || d.user_id}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.motion || 'Unknown motion'}</div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>Score: {d.overall_score}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{fmtDate(d.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION: Bootcamp
// ══════════════════════════════════════════════════
function BootcampSection({ stats, adminToken, apiBase }) {
  const b = stats.bootcamp;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBootcamp = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${apiBase}/api/admin/bootcamp?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, statusFilter, adminToken, apiBase]);

  useEffect(() => { fetchBootcamp(); }, [fetchBootcamp]);

  return (
    <div>
      <SectionTitle>Bootcamp Registrations</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Registrations" value={b.total} color="#8b5cf6" />
        <StatCard label="Paid" value={b.paid} sub="Confirmed seats" color="#10b981" />
        <StatCard label="Pending" value={b.pending} color="#f59e0b" />
        <StatCard label="Revenue" value={`₹${fmt(b.revenue)}`} sub="From bootcamp registrations" color="#ec4899" />
      </div>

      {/* By Grade */}
      {b.byGrade.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>By Grade</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {b.byGrade.map(r => (
              <div key={r.grade} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Grade {r.grade || '?'}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{r.count} <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>({r.paid} paid)</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registrations table */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '0.5rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Registrations</option>
          <option value="paid">Paid Only</option>
          <option value="pending">Pending Only</option>
        </select>
        {data && <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{data.total} records</span>}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead cols={['Name', 'Email', 'Phone', 'School', 'Grade', 'City', 'Category', 'Status', 'Amount', 'Registered']} />
              <tbody>
                {data?.registrations?.map((r, i) => (
                  <TableRow key={r.id} idx={i}>
                    <TD>{r.name}</TD>
                    <TD>{r.email || '—'}</TD>
                    <TD mono>{r.phone}</TD>
                    <TD>{r.school || '—'}</TD>
                    <TD>{r.grade || '—'}</TD>
                    <TD>{r.city || '—'}</TD>
                    <TD>{r.category || '—'}</TD>
                    <TD>
                      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                        background: r.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: r.payment_status === 'paid' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${r.payment_status === 'paid' ? '#10b98130' : '#f59e0b30'}`,
                      }}>
                        {r.payment_status}
                      </span>
                    </TD>
                    <TD>₹{((r.amount || 0) / 100).toFixed(0)}</TD>
                    <TD>{fmtDate(r.registered_at)}</TD>
                  </TableRow>
                ))}
                {!data?.registrations?.length && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No registrations found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div style={{ padding: '0.75rem 1rem' }}><Pagination page={page} total={data.total} limit={20} onPage={setPage} /></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION: School Coupons
// ══════════════════════════════════════════════════
function CouponsSection({ stats }) {
  const sc = stats.schoolCoupons;
  return (
    <div>
      <SectionTitle>School Coupons</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Codes Generated" value={sc.total} color="#8b5cf6" />
        <StatCard label="Used" value={sc.used} sub="Activated by students" color="#10b981" />
        <StatCard label="Unused" value={sc.unused} sub="Still available" color="#f59e0b" />
      </div>

      {sc.batches.length > 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead cols={['School', 'Plan', 'Total Codes', 'Used', 'Unused', 'Usage %', 'Created']} />
              <tbody>
                {sc.batches.map((b, i) => {
                  const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
                  return (
                    <TableRow key={`${b.school}-${i}`} idx={i}>
                      <TD>{b.school}</TD>
                      <TD><PlanBadge plan={b.plan} /></TD>
                      <TD>{b.total}</TD>
                      <TD><span style={{ color: '#10b981', fontWeight: 700 }}>{b.used}</span></TD>
                      <TD><span style={{ color: '#f59e0b', fontWeight: 700 }}>{b.unused}</span></TD>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct > 75 ? '#10b981' : pct > 40 ? '#f59e0b' : '#3b82f6', borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', width: 32 }}>{pct}%</span>
                        </div>
                      </td>
                      <TD>{fmtDate(b.created_at)}</TD>
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          No school coupons generated yet
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// SECTION: UN Quiz Registrations
// ══════════════════════════════════════════════════
function QuizSection({ adminToken, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/api/quiz/registrations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [adminToken, apiBase]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>;
  if (!data) return null;

  const filtered = (data.registrations || []).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.school_name?.toLowerCase().includes(q) ||
      r.mobile?.includes(q) ||
      r.class_grade?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <SectionTitle>UN Quiz Contest Registrations</SectionTitle>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Registrations" value={data.total} color="#3b82f6" />
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, school, mobile..."
          style={{
            width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '0.65rem 1rem', color: '#e2e8f0', fontSize: '0.9rem',
            fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <TableHead cols={['#', 'Full Name', 'Email', 'Mobile', 'Class/Grade', 'School', 'City', 'Registered At']} />
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#475569' }}>
                    {search ? 'No results matching your search.' : 'No registrations yet.'}
                  </td>
                </tr>
              ) : filtered.map((r, i) => (
                <TableRow key={r.id} idx={i}>
                  <TD>{i + 1}</TD>
                  <TD>{r.full_name}</TD>
                  <TD>{r.email}</TD>
                  <TD mono>{r.mobile}</TD>
                  <TD>{r.class_grade}</TD>
                  <TD>{r.school_name}</TD>
                  <TD>{r.city || '—'}</TD>
                  <TD>{fmtDate(r.registered_at)}</TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// SECTION: MUN Mentor Master Class Registrations
// ══════════════════════════════════════════════════
function MunMentorSection({ adminToken, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/munmentor/registrations`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminToken, apiBase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const regs = data?.registrations || [];
  const filtered = statusFilter === 'all' ? regs : regs.filter(r => r.payment_status === statusFilter);

  return (
    <div>
      <SectionTitle>MUN Mentor Master Class</SectionTitle>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Registrations" value={regs.length} color="#FBBF24" />
        <StatCard label="Paid" value={regs.filter(r => r.payment_status === 'paid').length} color="#10b981" />
        <StatCard label="Revenue" value={`₹${regs.filter(r => r.payment_status === 'paid').reduce((a,b) => a + (b.amount/100), 0).toLocaleString()}`} color="#10b981" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Registrations</option>
          <option value="paid">Paid Only</option>
          <option value="pending">Pending Only</option>
        </select>
        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{filtered.length} records</span>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead cols={['Name', 'Email', 'Phone', 'Role', 'Experience', 'School/Inst.', 'City', 'Status', 'Registered']} />
              <tbody>
                {filtered.map((r, i) => (
                  <TableRow key={r.id} idx={i}>
                    <TD>{r.full_name}</TD>
                    <TD>{r.email || '—'}</TD>
                    <TD mono>{r.mobile}</TD>
                    <TD>{r.role || '—'}</TD>
                    <TD>{r.experience_years || '—'}</TD>
                    <TD>{r.school_name || '—'}</TD>
                    <TD>{r.city || '—'}</TD>
                    <TD>
                      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                        background: r.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: r.payment_status === 'paid' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${r.payment_status === 'paid' ? '#10b98130' : '#f59e0b30'}`,
                      }}>
                        {r.payment_status}
                      </span>
                    </TD>
                    <TD>{fmtDate(r.registered_at)}</TD>
                  </TableRow>
                ))}
                {!filtered.length && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No registrations found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminToken] = useState(() => localStorage.getItem('adminToken'));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const apiBase = API_BASE;

  const fetchStats = useCallback(async () => {
    if (!adminToken) { navigate('/login'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (e) {
      setError('Failed to fetch stats. Check your connection.');
    }
    setLoading(false);
  }, [adminToken, apiBase, navigate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  if (!adminToken) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT, background: '#06080F', color: '#f1f5f9' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 90, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 100,
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)', overflow: 'visible',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#E8392A,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem', fontWeight: 900, color: '#fff' }}>G</div>
          <div style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>G Force</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Panel</div>
          </div>
        </div>

        {/* Toggle (Moved to float on the border) */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position: 'absolute', top: '1.65rem', right: '-14px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '0.7rem', zIndex: 101, transition: 'transform 0.3s', transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          ◀
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: sidebarOpen ? '0.6rem 0.85rem' : '0.6rem',
                  borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                  color: active ? '#F97316' : '#94a3b8',
                  fontFamily: FONT, fontSize: '0.875rem', fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  boxShadow: active ? 'inset 2px 0 0 #F97316' : 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
              >
                {sidebarOpen ? (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{s.label}</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, width: 24, textAlign: 'center' }}>{s.label.substring(0,2).toUpperCase()}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            {sidebarOpen ? 'Logout' : <span style={{fontSize:'0.75rem', fontWeight:800}}>LO</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, marginLeft: sidebarOpen ? 240 : 90, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(6,8,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h1>
            {lastRefresh && <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.1rem' }}>
              Last refreshed at {lastRefresh.toLocaleTimeString('en-IN')}
            </div>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', padding: '0.3rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              Admin
            </div>
            <button onClick={fetchStats} disabled={loading}
              style={{ padding: '0.45rem 1rem', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, color: '#F97316', fontSize: '0.82rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: FONT }}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '1rem 1.25rem', borderRadius: 12, marginBottom: '1.5rem', fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          {loading && !stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1.5rem' }}>
              <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading platform stats…</div>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
          ) : stats ? (
            <>
              {activeSection === 'overview' && <OverviewSection stats={stats} />}
              {activeSection === 'users' && <UsersSection adminToken={adminToken} apiBase={apiBase} />}
              {activeSection === 'subscriptions' && <SubscriptionsSection stats={stats} />}
              {activeSection === 'debates' && <DebatesSection stats={stats} />}
              {activeSection === 'bootcamp' && <BootcampSection stats={stats} adminToken={adminToken} apiBase={apiBase} />}
              {activeSection === 'coupons' && <CouponsSection stats={stats} />}
              {activeSection === 'quiz' && <QuizSection adminToken={adminToken} apiBase={apiBase} />}
              {activeSection === 'munMentor' && <MunMentorSection adminToken={adminToken} apiBase={apiBase} />}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
