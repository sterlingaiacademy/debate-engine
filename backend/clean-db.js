const db = require('better-sqlite3')('database.sqlite');

try {
  // Delete all analytics for users who don't have "HANAN" in their name
  const stmt1 = db.prepare(`DELETE FROM analytics WHERE "studentId" IN (SELECT "studentId" FROM users WHERE name NOT LIKE '%HANAN%')`);
  const info1 = stmt1.run();
  console.log(`Deleted ${info1.changes} rows from analytics.`);

  // Delete all users who don't have "HANAN" in their name
  const stmt2 = db.prepare(`DELETE FROM users WHERE name NOT LIKE '%HANAN%'`);
  const info2 = stmt2.run();
  console.log(`Deleted ${info2.changes} rows from users.`);
  
  console.log("Database cleaned. Only real user accounts remain.");
} catch (err) {
  console.error("Error cleaning database:", err);
}
