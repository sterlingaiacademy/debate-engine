const fs = require('fs');
const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add to SECTIONS array
if (!content.includes("{ id: 'english', label: 'English Session' }")) {
  content = content.replace(
    "{ id: 'indusmun', label: 'Indus MUN' },",
    "{ id: 'indusmun', label: 'Indus MUN' },\n  { id: 'english', label: 'English Session' },\n  { id: 'freedom', label: 'Freedom Quiz' },"
  );
}

// 2. Add the two new components right above export default function AdminDashboard
const newComponents = `
// SECTION: English Session Registrations
function EnglishSessionSection({ adminToken, apiBase }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIt = async () => {
      try {
        const res = await fetch(\`\${apiBase}/api/english-session/registrations\`, {
          headers: { 'Authorization': \`Bearer \${adminToken}\` }
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIt();
  }, [adminToken, apiBase]);

  const downloadCSV = () => {
    const headers = ['ID', 'User ID', 'Student Name', 'Parent Name', 'Email', 'Mobile', 'School Name', 'Grade', 'Created At'];
    const rows = data.map(r => [
      r.id, r.user_id, r.student_name, r.parent_name, r.email, r.mobile, r.school_name, r.grade, new Date(r.created_at).toLocaleString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'english_session_registrations.csv';
    link.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionTitle>English Session Registrations</SectionTitle>
        <button onClick={downloadCSV} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <TableRow isHeader>
                <TableHead>Student Name</TableHead>
                <TableHead>Parent Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <TableRow key={i}>
                  <TD>{r.student_name}</TD>
                  <TD>{r.parent_name}</TD>
                  <TD>{r.email}</TD>
                  <TD>{r.mobile}</TD>
                  <TD>{r.school_name}</TD>
                  <TD>{r.grade}</TD>
                  <TD>{new Date(r.created_at).toLocaleDateString()}</TD>
                </TableRow>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// SECTION: Freedom Quiz Registrations
function FreedomQuizSection({ adminToken, apiBase }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIt = async () => {
      try {
        const res = await fetch(\`\${apiBase}/api/freedom-quiz/registrations\`, {
          headers: { 'Authorization': \`Bearer \${adminToken}\` }
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIt();
  }, [adminToken, apiBase]);

  const downloadCSV = () => {
    const headers = ['ID', 'User ID', 'Full Name', 'Email', 'Mobile', 'City', 'Age', 'Created At'];
    const rows = data.map(r => [
      r.id, r.user_id, r.full_name, r.email, r.mobile, r.city, r.age, new Date(r.created_at).toLocaleString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'freedom_quiz_registrations.csv';
    link.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionTitle>Freedom Quiz Registrations</SectionTitle>
        <button onClick={downloadCSV} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <TableRow isHeader>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>City / State</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <TableRow key={i}>
                  <TD>{r.full_name}</TD>
                  <TD>{r.email}</TD>
                  <TD>{r.mobile}</TD>
                  <TD>{r.city}</TD>
                  <TD>{r.age}</TD>
                  <TD>{new Date(r.created_at).toLocaleDateString()}</TD>
                </TableRow>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard`;

if (!content.includes('function EnglishSessionSection')) {
  content = content.replace('export default function AdminDashboard', newComponents);
}

// 3. Add to render conditions
if (!content.includes("{activeSection === 'english'")) {
  content = content.replace(
    "{activeSection === 'indusmun' && <IndusMunSection adminToken={adminToken} apiBase={apiBase} />}",
    "{activeSection === 'indusmun' && <IndusMunSection adminToken={adminToken} apiBase={apiBase} />}\n              {activeSection === 'english' && <EnglishSessionSection adminToken={adminToken} apiBase={apiBase} />}\n              {activeSection === 'freedom' && <FreedomQuizSection adminToken={adminToken} apiBase={apiBase} />}"
  );
}

fs.writeFileSync(file, content);
