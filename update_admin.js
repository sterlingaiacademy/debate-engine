const fs = require('fs');
const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add tab
content = content.replace(
  "{ id: 'minimun', label: 'Mini MUN' },",
  "{ id: 'minimun', label: 'Mini MUN' },\n  { id: 'indusmun', label: 'Indus MUN' },"
);

// 2. Add IndusMunSection component (copied and adapted from MiniMunSection but simpler since it's just registrations without payment filtering, or maybe it has no payment since registration is free)
const indusMunSection = `
// SECTION: Indus MUN Registrations
// ══════════════════════════════════════════════════
function IndusMunSection({ adminToken, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(\`\${apiBase}/api/indusmun/registrations\`, {
        headers: { Authorization: \`Bearer \${adminToken}\` }
      });
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminToken, apiBase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const regs = data?.registrations || [];

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Indus MUN Registrations</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Total: {regs.length}</p>
        </div>
        <button onClick={fetchData} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>DATE</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>NAME</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>EMAIL</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>MOBILE</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>SCHOOL</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>GRADE</th>
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{r.student_name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>{r.email}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>{r.mobile}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>{r.school_name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>{r.grade}</td>
                </tr>
              ))}
              {regs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;

// Insert the component before "export default function AdminDashboard"
content = content.replace("export default function AdminDashboard", indusMunSection + "\nexport default function AdminDashboard");

// 3. Render the component in the main view
content = content.replace(
  "{activeSection === 'minimun' && <MiniMunSection adminToken={adminToken} apiBase={apiBase} />}",
  "{activeSection === 'minimun' && <MiniMunSection adminToken={adminToken} apiBase={apiBase} />}\n              {activeSection === 'indusmun' && <IndusMunSection adminToken={adminToken} apiBase={apiBase} />}"
);

fs.writeFileSync(file, content);
console.log('AdminDashboard updated');
