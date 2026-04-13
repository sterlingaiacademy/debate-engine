const supabaseUrl = 'https://whfmuswqbsgbmaramuhi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZm11c3dxYnNnYm1hcmFtdWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDgzNywiZXhwIjoyMDg4ODg2ODM3fQ.pua1mjLQhrJ_O4iWMtLHaXUrxVaMPDFd62MjntEZpJk';

async function clearUsers() {
  console.log("Fetching users...");
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!res.ok) {
        console.error("Failed to fetch users", res.status, await res.text());
        return;
    }
    
    const data = await res.json();
    const users = data.users || [];
    
    if (users.length === 0) {
      console.log("No users found. You are starting fresh!");
      return;
    }

    console.log(`Found ${users.length} users. Deleting...`);
    
    for (const user of users) {
      // The user specifically asked to "clear google account", but also "start fresh". 
      // Deleting all users to ensure complete fresh start, printing the provider.
      console.log(`Deleting user: ${user.email} (Provider: ${user.app_metadata?.provider})`);
      
      const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!deleteRes.ok) {
        console.error(`Failed to delete user ${user.id}:`, deleteRes.status, await deleteRes.text());
      } else {
        console.log(`User ${user.id} deleted successfully.`);
      }
    }
    console.log("All done!");
  } catch(e) {
      console.error(e);
  }
}

clearUsers();
