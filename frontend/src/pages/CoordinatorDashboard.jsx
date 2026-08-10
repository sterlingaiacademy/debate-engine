import { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import logoImg from '../assets/logo.png';

const FONT = "'Plus Jakarta Sans', 'Google Sans', system-ui, sans-serif";

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: '⊞' },
  { id: 'students', label: 'Students', icon: '◎' },
];

// ── Reusable primitives ──────────────────────────────────────
function StatCard({ label, value, sub, color = '#3b82f6', icon }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '1.4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${color}30`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top left, ${color}10 0%, transparent 65%)`, pointerEvents: 'none' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        {icon && <div style={{ fontSize: '1.1rem', opacity: 0.5 }}>{icon}</div>}
      </div>
      <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.4rem', lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>{children}</h2>
      {sub && <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0 0', fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return (
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{children}</h3>
    </div>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(c => (
          <th key={c} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableRow({ children, idx }) {
  return (
    <tr
      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)'}
    >
      {children}
    </tr>
  );
}

function TD({ children, mono, muted }) {
  return (
    <td style={{ padding: '0.7rem 1rem', fontSize: '0.84rem', color: muted ? '#64748b' : '#cbd5e1', fontFamily: mono ? 'monospace' : 'inherit', whiteSpace: 'nowrap' }}>
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const map = {
    'Completed':   { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    'In Progress': { bg: 'rgba(59,130,246,0.1)',   color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    'Pending':     { bg: 'rgba(100,116,139,0.1)',  color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
    'Registered':  { bg: 'rgba(139,92,246,0.1)',   color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  };
  const c = map[status] || map['Pending'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  );
}

function ProgressBar({ pct, color = '#3b82f6', height = 6 }) {
  return (
    <div style={{ height, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
    </div>
  );
}

// ── Overview Section ─────────────────────────────────────────
function OverviewSection({ data }) {
  const regPct = data.expectedRegistrations > 0 ? Math.round((data.totalRegistrations / data.expectedRegistrations) * 100) : 0;
  const completePct = data.totalRegistrations > 0 ? Math.round((data.olympiadCompleted / data.totalRegistrations) * 100) : 0;

  const byStatus = { Completed: 0, 'In Progress': 0, Pending: 0, Registered: 0 };
  (data.students || []).forEach(s => { if (byStatus[s.status] !== undefined) byStatus[s.status]++; else byStatus.Pending++; });

  return (
    <div>
      {/* School hero banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,8,15,0) 60%)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>School Olympiad Portal</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{data.school || 'Your School'}</h2>
          <p style={{ color: '#475569', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>Coordinator Dashboard · Academic Year 2025–26</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'Registration', value: `${regPct}%`, color: '#3b82f6' },
            { label: 'Completion', value: `${completePct}%`, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard label="Total Students" value={data.totalRegistrations} sub={`Out of ${data.expectedRegistrations} expected`} color="#3b82f6" />
        <StatCard label="Olympiad Done" value={data.olympiadCompleted} sub="Completed all rounds" color="#10b981" />
        <StatCard label="Daily Engagement" value={`${data.avgDailyEngagement}%`} sub="Avg practice activity" color="#8b5cf6" />
        <StatCard label="Students Enrolled" value={(data.students || []).length} sub="Under your school code" color="#06b6d4" />
      </div>

      {/* Two-col: Progress + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>

        {/* Progress bars */}
        <Card>
          <CardHeader>Registration & Completion</CardHeader>
          <div style={{ padding: '1.25rem' }}>
            {[
              { label: 'Registrations filled', pct: regPct, val: `${data.totalRegistrations} / ${data.expectedRegistrations}`, color: '#3b82f6' },
              { label: 'Olympiad completed', pct: completePct, val: `${data.olympiadCompleted} / ${data.totalRegistrations}`, color: '#10b981' },
              { label: 'Daily engagement', pct: data.avgDailyEngagement, val: `${data.avgDailyEngagement}%`, color: '#8b5cf6' },
            ].map(({ label, pct, val, color }) => (
              <div key={label} style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 700 }}>{val}</span>
                </div>
                <ProgressBar pct={pct} color={color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader>Student Status Breakdown</CardHeader>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Completed Olympiad', val: byStatus['Completed'], color: '#10b981', pct: (data.students || []).length > 0 ? Math.round((byStatus['Completed'] / (data.students || []).length) * 100) : 0 },
              { label: 'In Progress', val: byStatus['In Progress'], color: '#60a5fa', pct: (data.students || []).length > 0 ? Math.round((byStatus['In Progress'] / (data.students || []).length) * 100) : 0 },
              { label: 'Registered (Not Started)', val: byStatus['Registered'], color: '#a78bfa', pct: (data.students || []).length > 0 ? Math.round((byStatus['Registered'] / (data.students || []).length) * 100) : 0 },
              { label: 'Pending', val: byStatus['Pending'], color: '#64748b', pct: (data.students || []).length > 0 ? Math.round((byStatus['Pending'] / (data.students || []).length) * 100) : 0 },
            ].map(({ label, val, color, pct }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{val} <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>({pct}%)</span></span>
                </div>
                <ProgressBar pct={pct} color={color} height={4} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent students */}
      <Card>
        <CardHeader>Recent Students</CardHeader>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['Student', 'Class', 'Status', 'Practice', 'Score']} />
            <tbody>
              {(data.students || []).slice(0, 6).map((s, i) => (
                <TableRow key={i} idx={i}>
                  <TD><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.name}</span></TD>
                  <TD muted>{s.class}</TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD muted>{s.dailyPractice}</TD>
                  <TD>
                    <span style={{ fontWeight: 700, color: s.examScore !== 'N/A' ? '#10b981' : '#475569' }}>{s.examScore}</span>
                  </TD>
                </TableRow>
              ))}
              {(data.students || []).length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#334155' }}>
                  <div>No students registered yet. Share your school code with students.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {(data.students || []).length > 6 && (
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>View all {(data.students || []).length} students →</span>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Students Section ──────────────────────────────────────────
function StudentsSection({ students, fetchData, coordinatorId }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from your school?`)) return;
    setRemovingId(studentId);
    try {
      const res = await fetch(`${API_BASE}/api/coordinator/remove-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId, studentId })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to remove student');
      }
    } catch (err) {
      alert('Network error');
    }
    setRemovingId(null);
  };

  const filtered = (students || [])
    .filter(s => {
      const q = search.toLowerCase();
      return (s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q))
        && (filterStatus === 'all' || s.status === filterStatus);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return (b.avg_score || 0) - (a.avg_score || 0);
      if (sortBy === 'class') return a.class.localeCompare(b.class);
      return 0;
    });

  return (
    <div>
      <SectionTitle sub={`${(students || []).length} total students registered under your school`}>All Students</SectionTitle>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or class…"
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '0.9rem', paddingRight: '0.9rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#e2e8f0', fontFamily: FONT, fontSize: '0.85rem', outline: 'none' }}
          />
        </div>
        {[
          { label: 'Status', options: [['all','All Status'],['Completed','Completed'],['In Progress','In Progress'],['Registered','Registered'],['Pending','Pending']], val: filterStatus, set: setFilterStatus },
          { label: 'Sort by', options: [['name','Name'],['score','Avg Score'],['class','Class']], val: sortBy, set: setSortBy },
        ].map(({ label, options, val, set }) => (
          <select key={label} value={val} onChange={e => set(e.target.value)}
            style={{ padding: '0.55rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#e2e8f0', fontFamily: FONT, fontSize: '0.84rem', outline: 'none', cursor: 'pointer' }}
          >
            {options.map(([v, l]) => <option key={v} value={v} style={{ background: '#0f172a' }}>{l}</option>)}
          </select>
        ))}
        <div style={{ fontSize: '0.8rem', color: '#475569', padding: '0.55rem 0.9rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, whiteSpace: 'nowrap' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['#', 'Student Name', 'Class', 'Age', 'Parent Info', 'Status', 'Daily Practice', 'Avg Score', 'Exam Score', 'Actions']} />
            <tbody>
              {filtered.map((s, i) => (
                <TableRow key={i} idx={i}>
                  <TD mono muted>{i + 1}</TD>
                  <TD><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.name}</span></TD>
                  <TD muted>{s.class}</TD>
                  <TD muted>{s.age || '—'}</TD>
                  <TD muted>
                    <div style={{ fontSize: '0.75rem' }}>{s.parent_name || '—'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.parent_phone || '—'}</div>
                  </TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD muted>{s.dailyPractice}</TD>
                  <TD>
                    {s.avg_score > 0
                      ? <span style={{ fontWeight: 700, color: '#60a5fa' }}>{s.avg_score.toFixed(1)}</span>
                      : <span style={{ color: '#334155' }}>—</span>
                    }
                  </TD>
                  <TD>
                    <span style={{ fontWeight: 700, color: s.examScore !== 'N/A' ? '#10b981' : '#334155' }}>{s.examScore}</span>
                  </TD>
                  <TD>
                    <button 
                      onClick={() => handleRemove(s.id, s.name)}
                      disabled={removingId === s.id}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, cursor: removingId === s.id ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      {removingId === s.id ? '...' : 'Remove'}
                    </button>
                  </TD>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#334155' }}>
                    <div>No students match your filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function CoordinatorDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const coordinatorId = localStorage.getItem('coordinatorId');

  const fetchData = async () => {
    if (!coordinatorId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/coordinator/dashboard/${coordinatorId}`);
      if (res.status === 404) { setError('School not found. Please verify your coordinator ID.'); setLoading(false); return; }
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load data. Check your connection.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { localStorage.removeItem('coordinatorId'); window.location.href = '/login'; };

  if (!coordinatorId) { window.location.href = '/login'; return null; }

  const ACCENT = '#3b82f6';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT, background: '#06080F', color: '#f1f5f9' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.006) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.006) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 230 : 72, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'rgba(6,8,15,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.05)', zIndex: 100,
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)', overflow: 'visible',
      }}>
        {/* Branding */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <img src={logoImg} alt="G Force" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>School Portal</div>
            <div style={{ fontSize: '0.66rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Coordinator</div>
          </div>
        </div>

        {/* Toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position: 'absolute', top: '1.65rem', right: '-13px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.65rem', zIndex: 101, transition: 'transform 0.3s, color 0.2s', transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >◀</button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: sidebarOpen ? '0.65rem 0.9rem' : '0.65rem',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: active ? '#60a5fa' : '#64748b',
                  fontFamily: FONT, fontSize: '0.875rem', fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{s.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{s.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {sidebarOpen && data && (
            <div style={{ padding: '0.65rem 0.9rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed in as</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.school}</div>
            </div>
          )}
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.9rem', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.07)', color: '#f87171', cursor: 'pointer', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600, justifyContent: sidebarOpen ? 'flex-start' : 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
          >
            <span>⏻</span>
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, minWidth: 0, marginLeft: sidebarOpen ? 230 : 72, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 1 }}>
        {/* Sticky header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(6,8,15,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h1>
            {lastRefresh && <div style={{ fontSize: '0.7rem', color: '#334155', marginTop: '0.1rem' }}>Updated {lastRefresh.toLocaleTimeString('en-IN')}</div>}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button onClick={fetchData} disabled={loading}
              style={{ padding: '0.4rem 1rem', background: loading ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.1)', border: `1px solid ${loading ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.25)'}`, borderRadius: 9, color: loading ? '#475569' : '#60a5fa', fontSize: '0.8rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: FONT, transition: 'all 0.2s' }}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: '1.75rem 2rem', maxWidth: 1300, margin: '0 auto' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5', padding: '0.85rem 1.1rem', borderRadius: 12, marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          {loading && !data ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: '1.5rem' }}>
              <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ color: '#334155', fontSize: '0.9rem' }}>Loading school data…</div>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : data ? (
            <>
              {activeSection === 'overview' && <OverviewSection data={data} />}
              {activeSection === 'students' && <StudentsSection students={data.students} fetchData={fetchData} coordinatorId={coordinatorId} />}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
