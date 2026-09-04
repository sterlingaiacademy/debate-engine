import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api';

const FONT = "'Plus Jakarta Sans', 'Google Sans', system-ui, sans-serif";

const CLASS_OPTIONS = ['KG','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];

// ── Utility ──────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  const map = {
    submitted:  { bg: 'rgba(234,179,8,0.15)',  color: '#eab308', label: 'Pending Review' },
    verified:   { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Verified ✓' },
    returned:   { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: 'Returned ✗' },
  };
  const s = map[status] || map.submitted;
  return (
    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ── Reusable components ──────────────────────────────────────────
function StatCard({ icon, label, value, color = '#3b82f6', sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden', flex: 1, minWidth: 160 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top left, ${color}10 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.3rem' }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, onClick, color = '#3b82f6', disabled, small, outline }) {
  const bg = outline ? 'transparent' : (disabled ? 'rgba(255,255,255,0.05)' : color);
  const border = outline ? `1px solid ${color}` : 'none';
  const textColor = disabled ? '#475569' : (outline ? color : '#fff');
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ padding: small ? '0.45rem 1rem' : '0.7rem 1.5rem', background: bg, border, borderRadius: 10, fontFamily: FONT, fontSize: small ? '0.82rem' : '0.9rem', fontWeight: 700, color: textColor, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled && !outline) e.currentTarget.style.filter = 'brightness(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
    >
      {children}
    </button>
  );
}

const inputStyle = { width: '100%', padding: '0.6rem 0.85rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontFamily: FONT, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' };

// ══════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════════════════════════
function OverviewTab({ stats, teacher }) {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Welcome back, {teacher?.name?.split(' ')[0] || 'Teacher'} 👋
        </h2>
        <p style={{ color: '#64748b', marginTop: '0.3rem', fontSize: '0.9rem' }}>Here's what's happening in your classroom today.</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard icon="👨‍🎓" label="My Students" value={stats?.totalStudents || 0} color="#3b82f6" />
        <StatCard icon="📋" label="Assignments" value={stats?.totalAssignments || 0} color="#8b5cf6" />
        <StatCard icon="⏳" label="Pending Reviews" value={stats?.pendingReviews || 0} color="#f59e0b" sub="Need your attention" />
      </div>
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.5rem' }}>🚀 Quick Tips</div>
        <ul style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.9, margin: 0, paddingLeft: '1.2rem' }}>
          <li>Go to <strong style={{ color: '#e2e8f0' }}>My Classes</strong> to add students by section (e.g. Grade 7A, Grade 8B)</li>
          <li>Go to <strong style={{ color: '#e2e8f0' }}>Assignments</strong> to create and send tasks to your whole class at once</li>
          <li>Go to <strong style={{ color: '#e2e8f0' }}>Review</strong> to verify or return student submissions</li>
        </ul>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB: MY CLASSES
// ══════════════════════════════════════════════════════════════════
function ClassesTab({ teacher }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', classLevel: '', class_section: '', password: '', email: '' });
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [addError, setAddError] = useState('');
  const [copied, setCopied] = useState(null);

  const teacherId = teacher?.studentId;

  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/students/${teacherId}`)
      .then(r => r.json())
      .then(d => { setStudents(d.students || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [teacherId]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleAdd = async () => {
    if (!form.name || !form.classLevel) { setAddError('Name and grade are required.'); return; }
    setAdding(true); setAddError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/students/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddResult(data.student);
      setStudents(s => [...s, { ...data.student, class_level: form.classLevel, class_section: form.class_section }]);
      setForm({ name: '', classLevel: '', class_section: '', password: '', email: '' });
    } catch (e) { setAddError(e.message); }
    finally { setAdding(false); }
  };

  // Group by section
  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.username?.toLowerCase().includes(search.toLowerCase()));
  const sections = [...new Set(filtered.map(s => s.class_section || 'Unassigned'))].sort();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>My Classes</h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>{students.length} students enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" style={{ ...inputStyle, width: 200, padding: '0.5rem 0.85rem' }} />
          <Btn onClick={() => { setShowAdd(v => !v); setAddResult(null); setAddError(''); }}>
            {showAdd ? '✕ Close' : '+ Add Student'}
          </Btn>
        </div>
      </div>

      {/* Add Student Form */}
      {showAdd && (
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', fontSize: '0.95rem' }}>➕ Add New Student</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Arjun Kumar" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Grade *</label>
              <select value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select grade…</option>
                {CLASS_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Section</label>
              <input value={form.class_section} onChange={e => setForm(f => ({ ...f, class_section: e.target.value }))} placeholder="e.g. A, B, 7A" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password (optional)</label>
              <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Auto-generated if blank" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email (optional)</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="student@school.com" style={inputStyle} />
            </div>
          </div>
          {addError && <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.75rem' }}>⚠️ {addError}</div>}
          <Btn onClick={handleAdd} disabled={adding}>{adding ? 'Adding…' : '+ Create Student Account'}</Btn>

          {addResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>✅ Account created!</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[['Username', addResult.username], ['Password', addResult.password]].map(([label, val]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.5rem 0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{label}:</span>
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 700 }}>{val}</span>
                    <button onClick={() => copy(val, label)} style={{ background: 'none', border: 'none', color: copied === label ? '#10b981' : '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                      {copied === label ? '✓' : '⎘'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students by section */}
      {loading ? (
        <div style={{ color: '#475569', textAlign: 'center', padding: '3rem' }}>Loading students…</div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👨‍🏫</div>
          <div style={{ fontWeight: 700, color: '#64748b' }}>No students yet</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Click "+ Add Student" to add your first student</div>
        </div>
      ) : (
        sections.map(section => {
          const sectionStudents = filtered.filter(s => (s.class_section || 'Unassigned') === section);
          return (
            <div key={section} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Section {section}</div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>{sectionStudents.length} students</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {sectionStudents.map(student => (
                  <div key={student.username} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                      {student.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>{student.class_level}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '0.2rem 0.5rem' }}>{student.username}</div>
                      {student.password && (
                        <button onClick={() => copy(student.password, `pwd-${student.username}`)} style={{ fontSize: '0.68rem', color: copied === `pwd-${student.username}` ? '#10b981' : '#475569', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {copied === `pwd-${student.username}` ? '✓ Copied' : '⎘ Copy password'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB: ASSIGNMENTS
// ══════════════════════════════════════════════════════════════════
function AssignmentsTab({ teacher }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', task_type: 'text', class_section: '', due_date: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const teacherId = teacher?.studentId;

  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/assignments/${teacherId}`)
      .then(r => r.json())
      .then(d => { setAssignments(d.assignments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [teacherId]);

  const handleCreate = async () => {
    if (!form.title) { setCreateError('Title is required.'); return; }
    setCreating(true); setCreateError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/assignments/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssignments(a => [data.assignment, ...a]);
      setForm({ title: '', description: '', task_type: 'text', class_section: '', due_date: '' });
      setShowCreate(false);
    } catch (e) { setCreateError(e.message); }
    finally { setCreating(false); }
  };

  const taskTypeColor = { text: '#3b82f6', audio: '#8b5cf6', quiz: '#f59e0b' };
  const taskTypeIcon  = { text: '📝', audio: '🎙️', quiz: '📊' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>Assignments</h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>{assignments.length} total</p>
        </div>
        <Btn onClick={() => { setShowCreate(v => !v); setCreateError(''); }}>
          {showCreate ? '✕ Close' : '+ Create Assignment'}
        </Btn>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>📋 New Assignment</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Write your opening speech" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Instructions for students…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Task Type</label>
              <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="text" style={{ background: '#0f172a' }}>📝 Text / Written</option>
                <option value="audio" style={{ background: '#0f172a' }}>🎙️ Audio / Speech</option>
                <option value="quiz" style={{ background: '#0f172a' }}>📊 Quiz</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assign to Section</label>
              <input value={form.class_section} onChange={e => setForm(f => ({ ...f, class_section: e.target.value }))} placeholder="e.g. 7A, 8B (or leave blank for all)" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          {createError && <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.75rem' }}>⚠️ {createError}</div>}
          <Btn onClick={handleCreate} disabled={creating}>{creating ? 'Creating…' : '✓ Create & Assign'}</Btn>
        </div>
      )}

      {/* Assignment list */}
      {loading ? (
        <div style={{ color: '#475569', textAlign: 'center', padding: '3rem' }}>Loading…</div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <div style={{ fontWeight: 700, color: '#64748b' }}>No assignments yet</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Create your first assignment above</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assignments.map(a => (
            <div key={a.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${taskTypeColor[a.task_type]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {taskTypeIcon[a.task_type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>{a.title}</div>
                {a.description && <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.5 }}>{a.description}</div>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {a.class_section && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📌 Section {a.class_section}</span>}
                  {a.due_date && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 Due {formatDate(a.due_date)}</span>}
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>Created {timeAgo(a.created_at)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0' }}>{a.total_submissions || 0}</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>Total</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#eab308' }}>{a.pending_count || 0}</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>Pending</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{a.verified_count || 0}</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>Verified</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB: REVIEW SUBMISSIONS
// ══════════════════════════════════════════════════════════════════
function ReviewTab({ teacher }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('submitted');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [actioning, setActioning] = useState(false);
  const teacherId = teacher?.studentId;

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/teacher/submissions/${teacherId}${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`)
      .then(r => r.json())
      .then(d => { setSubmissions(d.submissions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [teacherId, filterStatus]);

  const doAction = async (action) => {
    if (action === 'return' && !note.trim()) { alert('Please add a note when returning.'); return; }
    setActioning(true);
    await fetch(`${API_BASE}/api/teacher/submissions/${selected.id}/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_note: note })
    });
    setActioning(false);
    setSelected(null);
    setNote('');
    load();
  };

  const statusFilters = [
    { key: 'submitted', label: '⏳ Pending' },
    { key: 'verified',  label: '✅ Verified' },
    { key: 'returned',  label: '↩️ Returned' },
    { key: 'all',       label: '📋 All' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1.25rem', height: '100%' }}>
      {/* List pane */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>Review Submissions</h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {statusFilters.map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{ padding: '0.35rem 0.85rem', borderRadius: 8, border: '1px solid', borderColor: filterStatus === f.key ? 'transparent' : 'rgba(255,255,255,0.1)', background: filterStatus === f.key ? '#3b82f6' : 'rgba(255,255,255,0.03)', color: filterStatus === f.key ? '#fff' : '#64748b', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: '3rem' }}>Loading…</div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <div style={{ fontWeight: 700, color: '#64748b' }}>No submissions here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {submissions.map(s => (
              <div key={s.id}
                onClick={() => { setSelected(s); setNote(''); }}
                style={{ background: selected?.id === s.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.025)', border: `1px solid ${selected?.id === s.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '0.9rem 1rem', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{s.student_name || s.student_id}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>{s.assignment_title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.15rem' }}>{timeAgo(s.submitted_at)}{s.class_section ? ` · Section ${s.class_section}` : ''}</div>
                  </div>
                  {statusBadge(s.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail pane */}
      <div style={{ width: 340, flexShrink: 0, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!selected ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👈</div>
            <div style={{ fontSize: '0.85rem' }}>Select a submission to review</div>
          </div>
        ) : (
          <>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{selected.student_name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>{selected.assignment_title}</div>
              <div style={{ marginTop: '0.5rem' }}>{statusBadge(selected.status)}</div>
            </div>
            {selected.content && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Submission</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '0.75rem', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto' }}>{selected.content}</div>
              </div>
            )}
            {selected.ai_feedback && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>🤖 AI Feedback</div>
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10, padding: '0.75rem', fontSize: '0.82rem', color: '#c4b5fd', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto' }}>{selected.ai_feedback}</div>
              </div>
            )}
            {selected.teacher_note && selected.status !== 'submitted' && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Your Previous Note</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>{selected.teacher_note}</div>
              </div>
            )}
            {selected.status === 'submitted' && (
              <div>
                <label style={labelStyle}>Note for Student</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (required when returning)…" rows={3} style={{ ...inputStyle, resize: 'none' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <Btn onClick={() => doAction('verify')} disabled={actioning} color="#10b981">{actioning ? '…' : '✓ Verify'}</Btn>
                  <Btn onClick={() => doAction('return')} disabled={actioning} color="#ef4444" outline>{actioning ? '…' : '↩ Return'}</Btn>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN TEACHER DASHBOARD
// ══════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'overview',     icon: '⊞', label: 'Overview' },
  { id: 'classes',      icon: '👥', label: 'My Classes' },
  { id: 'assignments',  icon: '📋', label: 'Assignments' },
  { id: 'review',       icon: '✅', label: 'Review' },
];

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('teacherUser');
    if (!stored) { window.location.href = '/login'; return; }
    const t = JSON.parse(stored);
    setTeacher(t);
    fetch(`${API_BASE}/api/teacher/dashboard/${t.studentId}`)
      .then(r => r.json())
      .then(d => { setStats(d.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacherUser');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!teacher && loading) {
    return <div style={{ minHeight: '100vh', background: '#06080F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontFamily: FONT }}>Loading…</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#06080F', fontFamily: FONT, color: '#fff' }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, background: 'rgba(10,10,10,0.98)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100dvh' }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontWeight: 900, fontSize: '1.25rem', background: 'linear-gradient(135deg,#FF6B5A,#FF6B00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.15rem' }}>G FORCE</div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teacher Portal</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: active ? 'rgba(59,130,246,0.12)' : 'transparent', borderLeft: `3px solid ${active ? '#3b82f6' : 'transparent'}`, border: 'none', color: active ? '#60a5fa' : '#64748b', fontFamily: FONT, fontSize: '0.9rem', fontWeight: active ? 800 : 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Teacher info + logout */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {teacher?.name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacher?.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#475569' }}>Teacher</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
              {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Teacher Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {stats?.pendingReviews > 0 && (
              <div style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10, padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#eab308', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#eab308' }}>{stats.pendingReviews} pending review{stats.pendingReviews !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'overview'    && <OverviewTab stats={stats} teacher={teacher} />}
        {tab === 'classes'     && <ClassesTab teacher={teacher} />}
        {tab === 'assignments' && <AssignmentsTab teacher={teacher} />}
        {tab === 'review'      && <ReviewTab teacher={teacher} />}
      </main>
    </div>
  );
}
