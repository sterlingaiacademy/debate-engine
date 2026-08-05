const fs = require('fs');
const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = "function IndusMunSection({ adminToken, apiBase }) {";
const endStr = "// ══════════════════════════════════════════════════\n// MAIN ADMIN DASHBOARD";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newSection = `function IndusMunSection({ adminToken, apiBase }) {
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <SectionTitle>Indus MUN Registrations</SectionTitle>
        <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>{regs.length} TOTAL REGISTRATIONS</span>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <TableHead cols={['Name', 'Email', 'Mobile', 'School', 'Grade']} />
              <tbody>
                {regs.map((r, i) => (
                  <TableRow key={r.id} idx={i}>
                    <TD>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{r.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </TD>
                    <TD>{r.email || '—'}</TD>
                    <TD mono>{r.mobile}</TD>
                    <TD>{r.school_name || '—'}</TD>
                    <TD>{r.grade || '—'}</TD>
                  </TableRow>
                ))}
                {regs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No registrations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
`;
  content = content.substring(0, startIndex) + newSection + "\n" + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log('Fixed successfully');
} else {
  console.log('Could not find boundaries');
}
