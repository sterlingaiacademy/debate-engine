import { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import logoImg from '../assets/logo.png';

const FONT = "'Plus Jakarta Sans', 'Google Sans', system-ui, sans-serif";

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: '⊞' },
  { id: 'students', label: 'Students', icon: '◎' },
  { id: 'manage', label: 'Manage Students', icon: '⊕' },
  { id: 'scores', label: 'Scores', icon: '▤' },
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
function OverviewSection({ data, setScoreStudent }) {
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
            <TableHead cols={['Student', 'Class', 'Status', 'Practice', 'Score', 'Actions']} />
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
                  <TD>
                    <button
                      onClick={() => setScoreStudent(s)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 5, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.1)'}
                    >
                      📊 Scores
                    </button>
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
function StudentsSection({ students, fetchData, coordinatorId, setScoreStudent }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [removingId, setRemovingId] = useState(null);
  const [revealedId, setRevealedId] = useState(null);
  const [resettingId, setResettingId] = useState(null); // track which student is having password reset
  const [resetResults, setResetResults] = useState({}); // { studentId: newPassword }
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ newUsername: '', newPassword: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleResetPassword = async (s) => {
    setResettingId(s.id);
    try {
      const res = await fetch(`${API_BASE}/api/coordinator/update-student`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId, studentId: s.username, resetPassword: true }),
      });
      const data = await res.json();
      if (data.success && data.newPassword) {
        setResetResults(r => ({ ...r, [s.id]: data.newPassword }));
        fetchData();
      }
    } catch {}
    setResettingId(null);
  };

  const handleEdit = (s) => {
    setEditingStudent(s);
    setEditForm({ newUsername: s.username || '', newPassword: '' });
    setEditError(''); setEditSuccess('');
  };

  const handleEditSave = async () => {
    if (!editingStudent) return;
    setEditLoading(true); setEditError(''); setEditSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/coordinator/update-student`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId, studentId: editingStudent.username, newUsername: editForm.newUsername || undefined, newPassword: editForm.newPassword || undefined }),
      });
      const data = await res.json();
      if (data.success) { setEditSuccess('Credentials updated!'); fetchData(); setTimeout(() => setEditingStudent(null), 1200); }
      else setEditError(data.error || 'Failed to update.');
    } catch { setEditError('Network error.'); }
    setEditLoading(false);
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <SectionTitle sub={`${(students || []).length} total students registered under your school`}>All Students</SectionTitle>
        <button
          onClick={() => {
            const rows = (students || []).filter(s => s.username);
            if (!rows.length) return alert('No students with credentials to download.');
            const isHashed = p => p && (p.startsWith('$2a$') || p.startsWith('$2b$'));
            const csv = ['Name,Username,Password,Email,Class']
              .concat(rows.map(s => `${s.name},${s.username},${isHashed(s.password) ? 'Set by student' : (s.password || 'N/A')},${s.email || ''},${s.class || ''}`))
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'student_credentials.csv'; a.click();
            URL.revokeObjectURL(url);
          }}
          style={{ padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >⬇ Download Credentials CSV</button>
      </div>

      {/* Edit credentials modal */}
      {editingStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 420, fontFamily: FONT }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Edit Credentials</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1.5rem' }}>{editingStudent.name}</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Username</label>
              <input value={editForm.newUsername} onChange={e => setEditForm(f => ({ ...f, newUsername: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>New Password (leave blank to keep current)</label>
              <input type="password" value={editForm.newPassword} onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Enter new password"
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontFamily: FONT, fontSize: '0.875rem', outline: 'none' }} />
            </div>
            {editError && <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem' }}>⚠️ {editError}</div>}
            {editSuccess && <div style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '0.75rem' }}>✅ {editSuccess}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleEditSave} disabled={editLoading} style={{ flex: 1, padding: '0.65rem', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: FONT, fontSize: '0.875rem', fontWeight: 700, cursor: editLoading ? 'wait' : 'pointer' }}>
                {editLoading ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingStudent(null)} style={{ padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            <TableHead cols={['#', 'Student Name', 'Username', 'Class', 'Status', 'Actions']} />
            <tbody>
              {filtered.map((s, i) => (
                <TableRow key={i} idx={i}>
                  <TD mono muted>{i + 1}</TD>
                  <TD><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.name}</span></TD>
                  <TD mono>
                    {s.username ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ color: '#93c5fd', fontSize: '0.8rem' }}>{s.username}</span>
                          <button
                            onClick={() => setRevealedId(revealedId === s.id ? null : s.id)}
                            title={revealedId === s.id ? 'Hide password' : 'Show password'}
                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', color: revealedId === s.id ? '#10b981' : '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, cursor: 'pointer' }}
                          >{revealedId === s.id ? 'Hide' : 'Show'}</button>
                        </div>
                        {revealedId === s.id && (() => {
                            const isHashed = s.password && (s.password.startsWith('$2a$') || s.password.startsWith('$2b$'));
                            const justReset = resetResults[s.id];
                            return (
                              <div style={{ marginTop: '0.3rem', padding: '0.4rem 0.6rem', background: isHashed && !justReset ? 'rgba(100,116,139,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${isHashed && !justReset ? 'rgba(100,116,139,0.2)' : 'rgba(16,185,129,0.15)'}`, borderRadius: 7 }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Password</div>
                                {justReset ? (
                                  <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>{justReset}</span>
                                ) : isHashed ? (
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.35rem' }}>Password hidden</div>
                                    <button
                                      onClick={() => handleResetPassword(s)}
                                      disabled={resettingId === s.id}
                                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: resettingId === s.id ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', borderRadius: 7, cursor: resettingId === s.id ? 'wait' : 'pointer' }}
                                    >{resettingId === s.id ? 'Generating…' : 'Generate New Password'}</button>
                                  </div>
                                ) : (
                                  <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>{s.password || '—'}</span>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    ) : <span style={{ color: '#334155' }}>—</span>}
                  </TD>
                  <TD muted>{s.class}</TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {s.username && (
                        <button
                          onClick={() => handleEdit(s)}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(s.id, s.name)}
                        disabled={removingId === s.id}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, cursor: removingId === s.id ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      >
                        {removingId === s.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  </TD>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: '3rem', textAlign: 'center', color: '#334155' }}>
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

// ── Scores Section ──────────────────────────────────────────
function ScoresSection({ students }) {
  const [selectedGrade, setSelectedGrade] = useState('all');

  const scoreColor = pct => pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const scoreBg = pct => pct >= 80 ? 'rgba(16,185,129,0.1)' : pct >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  const SUBJECT_ICONS = { English: 'EN', Mathematics: 'MA', Math: 'MA', Science: 'SC', 'Social Science': 'SS', General: 'GN' };

  // Build grade -> subject -> rows
  const gradeMap = {};
  (students || []).forEach(student => {
    const grade = student.class || 'Unknown';
    if (!gradeMap[grade]) gradeMap[grade] = {};
    (student.quizResults || []).forEach(qr => {
      const subject = qr.subject || 'General';
      if (!gradeMap[grade][subject]) gradeMap[grade][subject] = [];
      gradeMap[grade][subject].push({ ...qr, studentName: student.name });
    });
  });

  const allGrades = Object.keys(gradeMap).sort((a, b) => {
    return (parseInt(a.replace(/\D/g, '')) || 0) - (parseInt(b.replace(/\D/g, '')) || 0);
  });

  const gradesToShow = selectedGrade === 'all' ? allGrades : [selectedGrade];

  // Merge subject rows for selected grades
  const subjectRows = {};
  gradesToShow.forEach(grade => {
    Object.entries(gradeMap[grade] || {}).forEach(([subject, rows]) => {
      if (!subjectRows[subject]) subjectRows[subject] = [];
      subjectRows[subject].push(...rows.map(r => ({ ...r, grade })));
    });
  });

  const subjects = Object.keys(subjectRows).sort();
  const hasData = allGrades.some(g => Object.keys(gradeMap[g] || {}).some(s => gradeMap[g][s].length > 0));

  if (!hasData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1rem', color: '#475569' }}>
        <div style={{ fontSize: '3rem' }}>📉</div>
        <h3 style={{ color: '#64748b', fontWeight: 700, margin: 0 }}>No Scores Yet</h3>
        <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: 360 }}>Once your students complete practice quizzes or olympiad sessions, their scores will appear here organized by grade and subject.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grade tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Select Grade</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', ...allGrades].map(grade => {
            const active = selectedGrade === grade;
            const label = grade === 'all' ? 'All Grades' : grade;
            const total = grade === 'all'
              ? allGrades.reduce((sum, g) => sum + Object.values(gradeMap[g] || {}).reduce((a, rows) => a + rows.length, 0), 0)
              : Object.values(gradeMap[grade] || {}).reduce((a, rows) => a + rows.length, 0);
            return (
              <button key={grade} onClick={() => setSelectedGrade(grade)}
                style={{
                  padding: '0.55rem 1.25rem', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: FONT,
                  background: active ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#fff' : '#64748b',
                  fontWeight: active ? 700 : 500, fontSize: '0.85rem',
                  boxShadow: active ? '0 4px 14px rgba(59,130,246,0.4)' : 'none',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#94a3b8'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; } }}
              >
                {label}
                {total > 0 && <span style={{ fontSize: '0.65rem', background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', borderRadius: 99, padding: '0.05rem 0.45rem', fontWeight: 700 }}>{total}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject cards */}
      {subjects.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#334155', marginTop: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No scores for this grade yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {subjects.map(subject => {
            const rows = subjectRows[subject] || [];
            // percentage may come as string "30.00%" or number 30 — normalise to number
            const pct = r => parseFloat(String(r.percentage).replace('%', '')) || 0;
            const avg = Math.round(rows.reduce((a, r) => a + pct(r), 0) / rows.length);
            const showGradeCol = selectedGrade === 'all';
            return (
              <Card key={subject}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.6rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', borderRadius: 10, color: '#60a5fa', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>{SUBJECT_ICONS[subject] || subject.slice(0,2).toUpperCase()}</span>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>{subject}</h3>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.1rem' }}>
                        {rows.length} attempt{rows.length !== 1 ? 's' : ''}
                        {showGradeCol && ` · ${[...new Set(rows.map(r => r.grade))].join(', ')}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.63rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Class Avg</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor(avg), lineHeight: 1 }}>{avg}%</div>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <TableHead cols={showGradeCol
                      ? ['Student', 'Grade', 'Quiz / Test', 'Score', 'Percentage', 'Date']
                      : ['Student', 'Quiz / Test', 'Score', 'Percentage', 'Date']}
                    />
                    <tbody>
                      {[...rows].sort((a, b) => pct(b) - pct(a)).map((row, idx) => (
                        <TableRow key={idx} idx={idx}>
                          <TD><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{row.studentName}</span></TD>
                          {showGradeCol && <TD muted>{row.grade}</TD>}
                          <TD muted>{row.quiz_name || '—'}</TD>
                          <TD><span style={{ fontWeight: 700, color: '#cbd5e1' }}>{row.score} / {row.total}</span></TD>
                          <TD>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', minWidth: 70 }}>
                                <div style={{ height: '100%', width: `${Math.min(pct(row), 100)}%`, background: scoreColor(pct(row)), borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: scoreColor(pct(row)), background: scoreBg(pct(row)), padding: '0.15rem 0.55rem', borderRadius: 6, whiteSpace: 'nowrap' }}>{pct(row).toFixed(1)}%</span>
                            </div>
                          </TD>
                          <TD muted>{new Date(row.attempted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TD>
                        </TableRow>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}




function ManageStudentsSection({ coordinatorId, fetchData }) {
  const [tab, setTab] = useState('csv'); // 'csv' | 'manual' | 'results'
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState([]);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Manual add state
  const [manualForm, setManualForm] = useState({ name: '', classLevel: '', password: '', email: '', phone: '', subjects: { social_science: false, science: false, ct_ai: false, maths: false, english: false } });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);
  const [manualError, setManualError] = useState('');


  const CLASS_OPTIONS = ['KG','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
  const SUBJECTS = ['Social Science', 'Science', 'CT&AI', 'Maths', 'English'];
  const SUBJECT_KEYS = ['social_science', 'science', 'ct_ai', 'maths', 'english'];

  const parseCSV = (text) => {
    setParseError('');
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) { setParseError('CSV must have a header row and at least one student row.'); return; }
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const nameIdx = header.findIndex(h => h === 'name' || h === 'student name' || h === 'student_name' || h === 'students name');
    const classIdx = header.findIndex(h => h === 'class' || h === 'classlevel' || h === 'grade' || h === 'class level' || h === 'grade(in number)');
    const passIdx = header.findIndex(h => h === 'password' || h === 'pass');
    const emailIdx = header.findIndex(h => h.startsWith('email') || h.startsWith('mail'));
    const phoneIdx = header.findIndex(h => h.startsWith('phone'));
    // Subject column indices
    const subjIdx = {
      social_science: header.findIndex(h => h.includes('social')),
      science: header.findIndex(h => h === 'science'),
      ct_ai: header.findIndex(h => h.includes('ct') || h.includes('ai')),
      maths: header.findIndex(h => h === 'maths' || h === 'math' || h === 'mathematics'),
      english: header.findIndex(h => h === 'english'),
    };
    if (nameIdx === -1) { setParseError('Could not find a "name" column. Please check your CSV headers.'); return; }
    if (classIdx === -1) { setParseError('Could not find a "class" or "grade" column. Please check your CSV headers.'); return; }
    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
      const rawClass = cols[classIdx] || '';
      // Accept plain numbers (8, 9, 12) or "Grade 8" style
      const normClass = rawClass.trim().toLowerCase() === 'kg' ? 'KG'
        : /^\d+$/.test(rawClass.trim()) ? `Grade ${rawClass.trim()}`
        : rawClass.replace(/^grade\s*/i, 'Grade ');
      const isY = v => v && v.trim().toLowerCase() === 'y';
      return {
        name: cols[nameIdx] || '',
        classLevel: normClass,
        password: passIdx !== -1 ? cols[passIdx] || '' : '',
        email: emailIdx !== -1 ? cols[emailIdx] || '' : '',
        phone: phoneIdx !== -1 ? cols[phoneIdx] || '' : '',
        subjects: {
          social_science: subjIdx.social_science !== -1 ? isY(cols[subjIdx.social_science]) : false,
          science: subjIdx.science !== -1 ? isY(cols[subjIdx.science]) : false,
          ct_ai: subjIdx.ct_ai !== -1 ? isY(cols[subjIdx.ct_ai]) : false,
          maths: subjIdx.maths !== -1 ? isY(cols[subjIdx.maths]) : false,
          english: subjIdx.english !== -1 ? isY(cols[subjIdx.english]) : false,
        },
      };
    }).filter(r => r.name);
    const valid = rows.filter(r => r.classLevel);
    const skipped = rows.length - valid.length;
    if (skipped > 0) setParseError(`${skipped} row(s) skipped — class/grade is required for every student.`);
    else setParseError('');
    setParsed(valid);
  };

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const txt = ev.target.result; setCsvText(txt); parseCSV(txt); };
    reader.readAsText(file);
  };

  const handleCSVText = (text) => { setCsvText(text); if (text.trim()) parseCSV(text); };

  const handleBulkCreate = async () => {
    if (!parsed.length) return;
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/coordinator/bulk-create-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId, students: parsed }),
      });
      const data = await res.json();
      if (data.success) { setResults(data.results); setTab('results'); fetchData(); }
      else alert(data.error || 'Failed to create students.');
    } catch { alert('Network error. Please try again.'); }
    setUploading(false);
  };

  const downloadCredentials = () => {
    if (!results) return;
    const created = results.filter(r => r.status === 'created');
    const csv = ['Name,Username,Password,Email', ...created.map(r => `"${r.name}","${r.username}","${r.password}","${r.email}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'student_credentials.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleManualAdd = async () => {
    if (!manualForm.name || !manualForm.classLevel) { setManualError('Name and class are required.'); return; }
    setManualLoading(true); setManualError(''); setManualResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/coordinator/add-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId, ...manualForm }),
      });
      const data = await res.json();
      if (data.success) { setManualResult(data.student); setManualForm({ name: '', classLevel: '', password: '', email: '', phone: '', subjects: { social_science: false, science: false, ct_ai: false, maths: false, english: false } }); fetchData(); }
      else setManualError(data.error || 'Failed to add student.');
    } catch { setManualError('Network error.'); }
    setManualLoading(false);
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontFamily: FONT, fontSize: '0.875rem', outline: 'none' };
  const labelStyle = { fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', display: 'block' };

  return (
    <div>
      <SectionTitle sub="Upload a CSV or add students manually. Auto-generated credentials can be printed and handed to students.">
        Manage &amp; Add Students
      </SectionTitle>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {[
          { id: 'csv', label: 'CSV Upload' },
          { id: 'manual', label: 'Add Manually' },
          ...(results ? [{ id: 'results', label: `Results (${results.length})` }] : []),
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.6rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: FONT, fontSize: '0.84rem', fontWeight: 700,
            color: tab === t.id ? '#60a5fa' : '#64748b',
            borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.15s', marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      {/* CSV UPLOAD TAB */}
      {tab === 'csv' && (
        <div>
          {/* Download Template */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.2rem' }}>Download CSV Template</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Fill in student names, grade (as a number), and mark Y/N for each subject. Email and phone are optional.</div>
            </div>
            <button
              onClick={() => {
                const header = 'Sl. No.,Students Name,Mail ID (optional),Phone Number (optional),Grade (in number),Social Science (Y/N),Science (Y/N),CT&AI (Y/N),Maths (Y/N),English (Y/N)';
                const rows = [
                  '1,Arjun Kumar,,, 8,Y,Y,N,Y,Y',
                  '2,Priya Sharma,,, 6,Y,N,Y,N,Y',
                  '3,Rohan Nair,,, 10,N,Y,N,Y,Y',
                ];
                const csv = [header, ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'student_upload_template.csv'; a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ⬇ Download Template
            </button>
          </div>

          {/* Drag & drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            style={{
              border: `2px dashed ${dragOver ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14, padding: '1.5rem', textAlign: 'center', marginBottom: '1.25rem',
              background: dragOver ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>📁</div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>Drop your CSV file here, or click to browse</div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.25rem' }}>Supports .csv files — or add rows manually below</div>
            <input id="csv-file-input" type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleFileDrop} />
          </div>

          {parseError && <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>⚠️ {parseError}</div>}

          {/* Editable student table */}
          <Card style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
                {parsed.length > 0 ? `Students — ${parsed.length} added` : 'No students yet'}
              </span>
              <button
                onClick={() => setParsed(p => [...p, { name: '', classLevel: '', email: '', phone: '', subjects: { social_science: false, science: false, ct_ai: false, maths: false, english: false } }])}
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, cursor: 'pointer' }}
              >+ Add Row</button>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['#', 'Name *', 'Grade *', 'Email', 'Phone', 'Soc.Sci', 'Science', 'CT&AI', 'Maths', 'English', ''].map((col, i) => (
                      <th key={i} style={{ padding: '0.6rem 0.6rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: '#334155', fontSize: '0.85rem' }}>Upload a CSV or click "+ Add Row" to add students manually</td></tr>
                  ) : parsed.map((s, i) => {
                    const cellInput = (field, placeholder, type = 'text', width = 120) => (
                      <input
                        value={s[field] || ''}
                        onChange={e => setParsed(p => p.map((r, ri) => ri === i ? { ...r, [field]: e.target.value } : r))}
                        placeholder={placeholder}
                        type={type}
                        style={{ width, padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#e2e8f0', fontFamily: FONT, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    );
                    const togBtn = (key, label) => {
                      const on = s.subjects?.[key];
                      return (
                        <button
                          onClick={() => setParsed(p => p.map((r, ri) => ri === i ? { ...r, subjects: { ...r.subjects, [key]: !on } } : r))}
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: 6, border: 'none', cursor: 'pointer',
                            background: on ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                            color: on ? '#10b981' : '#475569' }}
                        >{on ? 'Y' : 'N'}</button>
                      );
                    };
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '0.3rem 0.4rem' }}>{cellInput('name', 'Student name', 'text', 140)}</td>
                        <td style={{ padding: '0.3rem 0.4rem' }}>
                          <select
                            value={s.classLevel}
                            onChange={e => setParsed(p => p.map((r, ri) => ri === i ? { ...r, classLevel: e.target.value } : r))}
                            style={{ width: 100, padding: '0.35rem 0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: s.classLevel ? '#e2e8f0' : '#475569', fontFamily: FONT, fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                          >
                            <option value=''>Grade…</option>
                            {CLASS_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '0.3rem 0.4rem' }}>{cellInput('email', 'Optional', 'email', 140)}</td>
                        <td style={{ padding: '0.3rem 0.4rem' }}>{cellInput('phone', 'Optional', 'tel', 110)}</td>
                        <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center' }}>{togBtn('social_science', 'SS')}</td>
                        <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center' }}>{togBtn('science', 'Sci')}</td>
                        <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center' }}>{togBtn('ct_ai', 'CT')}</td>
                        <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center' }}>{togBtn('maths', 'Ma')}</td>
                        <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center' }}>{togBtn('english', 'En')}</td>
                        <td style={{ padding: '0.3rem 0.6rem' }}>
                          <button
                            onClick={() => setParsed(p => p.filter((_, ri) => ri !== i))}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, cursor: 'pointer' }}
                          >✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <button
            onClick={handleBulkCreate}
            disabled={uploading || parsed.filter(r => r.name && r.classLevel).length === 0}
            style={{ padding: '0.75rem 2rem', background: uploading || parsed.filter(r => r.name && r.classLevel).length === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #3b82f6)', color: parsed.filter(r => r.name && r.classLevel).length === 0 ? '#475569' : '#fff', border: 'none', borderRadius: 10, fontFamily: FONT, fontSize: '0.9rem', fontWeight: 700, cursor: uploading || parsed.filter(r => r.name && r.classLevel).length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            {uploading ? 'Creating accounts…' : `Create ${parsed.filter(r => r.name && r.classLevel).length} Student Accounts`}
          </button>
        </div>
      )}

      {/* MANUAL ADD TAB */}
      {tab === 'manual' && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Students Name *</label>
              <input value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Arjun Kumar" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mail ID (optional)</label>
              <input value={manualForm.email} onChange={e => setManualForm(f => ({ ...f, email: e.target.value }))} placeholder="student@school.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number (optional)</label>
              <input value={manualForm.phone} onChange={e => setManualForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" type="tel" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Grade *</label>
              <select value={manualForm.classLevel} onChange={e => setManualForm(f => ({ ...f, classLevel: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="" style={{ background: '#0f172a' }}>Select grade…</option>
                {CLASS_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
              </select>
            </div>
          </div>


          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Subjects Enrolled</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {SUBJECTS.map((subj, idx) => {
                const key = SUBJECT_KEYS[idx];
                const on = manualForm.subjects[key];
                return (
                  <button key={key}
                    onClick={() => setManualForm(f => ({ ...f, subjects: { ...f.subjects, [key]: !on } }))}
                    style={{ padding: '0.4rem 1rem', borderRadius: 8, border: `1px solid ${on ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700,
                      background: on ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                      color: on ? '#60a5fa' : '#475569', transition: 'all 0.15s' }}
                  >{subj}</button>
                );
              })}
            </div>
          </div>

          {manualError && <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>⚠️ {manualError}</div>}

          <button onClick={handleManualAdd} disabled={manualLoading} style={{ padding: '0.75rem 1.75rem', background: manualLoading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: FONT, fontSize: '0.9rem', fontWeight: 700, cursor: manualLoading ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
            {manualLoading ? 'Adding…' : '+ Add Student'}
          </button>

          {manualResult && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.75rem' }}>✅ Student account created!</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[['Name', manualResult.name], ['Username', manualResult.username], ['Password', manualResult.password], ['Email', manualResult.email]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontFamily: label === 'Username' || label === 'Password' ? 'monospace' : 'inherit', fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULTS TAB */}
      {tab === 'results' && results && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{results.filter(r => r.status === 'created').length} created</span>
              {results.filter(r => r.status === 'skipped').length > 0 && (
                <span style={{ color: '#f97316', fontWeight: 700 }}> · {results.filter(r => r.status === 'skipped').length} skipped</span>
              )}
            </div>
            <button onClick={downloadCredentials} style={{ padding: '0.5rem 1.25rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 9, fontFamily: FONT, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
            >
              ⬇ Download Credentials CSV
            </button>
          </div>
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <TableHead cols={['Name', 'Username', 'Password', 'Email', 'Status']} />
                <tbody>
                  {results.map((r, i) => (
                    <TableRow key={i} idx={i}>
                      <TD><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{r.name}</span></TD>
                      <TD mono>{r.username || '—'}</TD>
                      <TD mono>{r.password || '—'}</TD>
                      <TD muted>{r.email || '—'}</TD>
                      <TD>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                          background: r.status === 'created' ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)',
                          color: r.status === 'created' ? '#10b981' : '#f97316',
                          border: `1px solid ${r.status === 'created' ? 'rgba(16,185,129,0.25)' : 'rgba(249,115,22,0.25)'}` }}>
                          {r.status === 'created' ? '✓ Created' : '✗ Skipped'}
                        </span>
                      </TD>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
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
              {activeSection === 'manage' && <ManageStudentsSection coordinatorId={coordinatorId} fetchData={fetchData} />}
              {activeSection === 'scores' && <ScoresSection students={data.students} />}
            </>
          ) : null}
        </div>
      </main>

    </div>
  );
}
