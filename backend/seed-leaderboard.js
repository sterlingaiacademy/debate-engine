const db = require('better-sqlite3')('database.sqlite');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const dummyPassword = await bcrypt.hash('password123', 10);
  
  // Real-sounding AI generated data
  const realStudents = [
    { name: 'Aisha Sharma', classLevel: 'Level 4', avg: 96, debates: 42 },
    { name: 'Rohan Gupta', classLevel: 'Level 4', avg: 92, debates: 35 },
    { name: 'Priya Patel', classLevel: 'Class 10-12', avg: 89, debates: 28 },
    { name: 'Vikram Singh', classLevel: 'Level 5', avg: 94, debates: 31 },
    { name: 'Sophia Chen', classLevel: 'Level 4', avg: 88, debates: 19 },
    { name: 'Elijah Wood', classLevel: 'Level 2', avg: 91, debates: 25 },
    { name: 'Ananya Desai', classLevel: 'Level 1', avg: 85, debates: 14 },
    { name: 'Kabir Khan', classLevel: 'Class 1-3', avg: 87, debates: 22 },
    { name: 'Zoya Ahmed', classLevel: 'Level 5', avg: 95, debates: 38 },
    { name: 'Liam Smith', classLevel: 'Level 4', avg: 83, debates: 12 }
  ];

  console.log('Cleaning up garbage data...');
  // Delete users that are not Hanan and not the real students we're about to add
  db.prepare(`DELETE FROM analytics WHERE "studentId" IN (SELECT "studentId" FROM users WHERE name NOT LIKE '%HANAN%')`).run();
  db.prepare(`DELETE FROM users WHERE name NOT LIKE '%HANAN%'`).run();

  console.log('Inserting real data...');
  const insertUser = db.prepare(`INSERT INTO users (name, "studentId", password, "classLevel", "assignedAgentId") VALUES (?, ?, ?, ?, ?)`);
  const insertAnalytics = db.prepare(`INSERT INTO analytics ("studentId", "averageScore", "debatesCompleted", "speakingTime") VALUES (?, ?, ?, ?)`);

  const assignedAgentId = 'agent_1201kkdnn526eebs4fwb822fzgs3';

  db.transaction(() => {
    for (const s of realStudents) {
      const studentId = 'STU' + Math.floor(Math.random() * 10000);
      insertUser.run(s.name, studentId, dummyPassword, s.classLevel, assignedAgentId);
      insertAnalytics.run(studentId, s.avg, s.debates, s.debates * 150);
    }
  })();

  console.log('Done!');
}

seed().catch(console.error);
