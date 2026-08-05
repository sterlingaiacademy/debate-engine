const fs = require('fs');
const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// There are two function IndusMunSection({ adminToken, apiBase }) ...
// Let's split by this string
const parts = content.split('function IndusMunSection({ adminToken, apiBase }) {');

if (parts.length === 3) {
  // parts[0] is everything before the first one.
  // parts[1] is the body of the first one (up to the next function declaration)
  // parts[2] is the body of the second one.
  
  // We want to keep parts[0], and the correct implementation, and then whatever comes after the second one.
  // Let's find the end of the second one.
  const endOfSecond = parts[2].indexOf('export default function AdminDashboard() {');
  
  if (endOfSecond !== -1) {
    const afterSecond = parts[2].substring(endOfSecond);
    const correctImplementation = `  const [data, setData] = useState(null);
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

// ══════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════
`;
    
    content = parts[0] + 'function IndusMunSection({ adminToken, apiBase }) {\n' + correctImplementation + '\n' + afterSecond;
    fs.writeFileSync(file, content);
    console.log('Fixed duplicate function');
  } else {
    console.log('Could not find AdminDashboard component');
  }
} else {
  console.log('Did not find exactly 2 occurrences, found: ' + parts.length);
}
