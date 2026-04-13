const supabaseUrl = 'https://whfmuswqbsgbmaramuhi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZm11c3dxYnNnYm1hcmFtdWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDgzNywiZXhwIjoyMDg4ODg2ODM3fQ.pua1mjLQhrJ_O4iWMtLHaXUrxVaMPDFd62MjntEZpJk';

async function clearTable(tableName, idColName) {
  console.log(`Fetching rows from ${tableName}...`);
  const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=${idColName}`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (!res.ok) {
     console.error(`Failed to fetch ${tableName}`, res.status, await res.text());
     return;
  }
  const rows = await res.json();
  console.log(`Found ${rows.length} rows in ${tableName}.`);
  
  for (const row of rows) {
    const id = row[idColName];
    if (id === undefined) continue;
    
    const encodedId = encodeURIComponent(id);
    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/${tableName}?${idColName}=eq.${encodedId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (!deleteRes.ok) {
        console.error(`Failed to delete ${id} from ${tableName}`, deleteRes.status, await deleteRes.text());
    } else {
        console.log(`Deleted ${id} from ${tableName}`);
    }
  }
}

async function main() {
    // Delete in this order to respect potential foreign keys
    await clearTable('debate_sessions', 'studentId');
    await clearTable('analytics', 'studentId');
    await clearTable('users', 'studentId');
    console.log("All requested tables cleared.");
}

main();
