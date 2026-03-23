require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper for IST Date (Resets at 12:00 AM IST)
function getISTDateString() {
  const now = new Date();
  // IST is UTC + 5 hours and 30 minutes
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  return istDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// Users
app.post('/api/register', async (req, res) => {
  const { name, studentId, password, classLevel } = req.body;
  if (!name || !studentId || !password || !classLevel) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Assign agent ID based on class
  let assignedAgentId = '';
  if (classLevel === 'Level 1' || classLevel === 'Class 1-3') {
    assignedAgentId = 'agent_3201kkb0dbh3fgravbhyjw4crve8';
  } else if (classLevel === 'Level 2') {
    assignedAgentId = 'agent_1201kkvd9ke5fd180zjz6ckrameq';
  } else if (classLevel === 'Level 4' || classLevel === 'Class 10-12') {
    // Level 4 uses senior debate agent for the standard debate tile
    assignedAgentId = 'agent_1201kkdnn526eebs4fwb822fzgs3';
  } else if (classLevel === 'Level 5') {
    assignedAgentId = 'agent_3801km7h68pbfn1t8m52ny028t6w';
  } else if (['Level 3'].includes(classLevel)) {
    assignedAgentId = 'agent_5601kkx9fa95e9eswcm93gdmp18h';
  } else {
    return res.status(400).json({ error: 'Invalid class level' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, "studentId", password, "classLevel", "assignedAgentId") VALUES ($1, $2, $3, $4, $5)`;
    
    try {
      await db.query(query, [name, studentId, hashedPassword, classLevel, assignedAgentId]);
    } catch (err) {
      if (err.code === '23505' || /UNIQUE constraint failed/i.test(err.message)) {
        return res.status(400).json({ error: 'Student ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    // Initialize analytics for new user
    await db.query(`INSERT INTO analytics ("studentId") VALUES ($1)`, [studentId]);
    
    res.status(201).json({ 
      message: 'Account created successfully', 
      user: { name, studentId, classLevel, assignedAgentId } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;
  
  try {
    const result = await db.query(`SELECT * FROM users WHERE "studentId" = $1`, [studentId]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    // Remove password from response
    delete user.password;
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Time Limits
app.get('/api/time-limits/:studentId', async (req, res) => {
  const studentId = req.params.studentId.replace(/"/g, '');
  try {
    const result = await db.query(`SELECT * FROM users WHERE "studentId" = $1`, [studentId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    
    let user = result.rows[0];
    const currentDateIST = getISTDateString();
    
    if (user.lastDebateDate !== currentDateIST) {
      // Reset times for the new day
      await db.query(`UPDATE users SET "lastDebateDate" = $1, "dailyRankedTime" = 0, "dailyPersonaTime" = 0 WHERE "studentId" = $2`, [currentDateIST, studentId]);
      user.lastDebateDate = currentDateIST;
      user.dailyRankedTime = 0;
      user.dailyPersonaTime = 0;
    }
    
    // Calculate remaining limits (1800 seconds = 30 minutes)
    const isJunior = ['Level 1', 'Level 2', 'Class 1-3'].includes(user.classLevel);
    const LIMIT = 1800;
    let remainingRanked = 0;
    let remainingPersona = 0;
    
    if (isJunior) {
      const used = (user.dailyRankedTime || 0) + (user.dailyPersonaTime || 0);
      remainingRanked = Math.max(0, LIMIT - used);
      remainingPersona = remainingRanked; // Shared pool
    } else {
      remainingRanked = Math.max(0, LIMIT - (user.dailyRankedTime || 0));
      remainingPersona = Math.max(0, LIMIT - (user.dailyPersonaTime || 0));
    }
    
    res.json({
      remainingRanked,
      remainingPersona,
      dailyRankedTime: user.dailyRankedTime || 0,
      dailyPersonaTime: user.dailyPersonaTime || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debate Sessions
app.post('/api/sessions', async (req, res) => {
  const { studentId, debateTopic, sessionDuration, argumentsCount, debateScore, isPersona } = req.body;
  
  const query = `INSERT INTO debate_sessions ("studentId", "debateTopic", "sessionDuration", "argumentsCount", "debateScore") VALUES ($1, $2, $3, $4, $5) RETURNING id`;
  
  try {
    const result = await db.query(query, [studentId, debateTopic, sessionDuration, argumentsCount, debateScore]);
    const newSessionId = result.rows[0].id;

    // Update analytics
    const analyticsResult = await db.query(`SELECT * FROM analytics WHERE "studentId" = $1`, [studentId]);
    if (analyticsResult.rows.length > 0) {
      const row = analyticsResult.rows[0];
      const newCompleted = row.debatesCompleted + 1;
      const newTotalScore = (row.averageScore * row.debatesCompleted) + debateScore;
      const newAverage = newTotalScore / newCompleted;
      const newSpeakingTime = row.speakingTime + sessionDuration;
      
      await db.query(`UPDATE analytics SET "averageScore" = $1, "debatesCompleted" = $2, "speakingTime" = $3 WHERE "studentId" = $4`,
        [newAverage, newCompleted, newSpeakingTime, studentId]
      );
    }
    
    // Update Daily Time Buckets
    const currentDateIST = getISTDateString();
    if (isPersona) {
      await db.query(`UPDATE users SET "lastDebateDate" = $1, "dailyPersonaTime" = coalesce("dailyPersonaTime", 0) + $2 WHERE "studentId" = $3`, [currentDateIST, Math.round(sessionDuration), studentId]);
    } else {
      await db.query(`UPDATE users SET "lastDebateDate" = $1, "dailyRankedTime" = coalesce("dailyRankedTime", 0) + $2 WHERE "studentId" = $3`, [currentDateIST, Math.round(sessionDuration), studentId]);
    }

    res.status(201).json({ message: 'Session saved', sessionId: newSessionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics (Routed via Python Profile script)
app.get('/api/analytics/:studentId', (req, res) => {
  const scriptPath = path.join(__dirname, 'api_profile.py');
  const studentId = req.params.studentId.replace(/"/g, '');
  
  exec(`py "${scriptPath}" "${studentId}"`, (error, stdout, stderr) => {
    try {
      const data = JSON.parse(stdout);
      if (data.error) {
        return res.json({ total_debates: 0, avg_score: 0, total_words_spoken: 0, elo_rating: 1000, badges: [], badge_details: [] });
      }
      res.json(data);
    } catch (e) {
      console.error('Python Analytics route parse error:', e);
      res.json({ total_debates: 0, avg_score: 0, total_words_spoken: 0, elo_rating: 1000, badges: [], badge_details: [] });
    }
  });
});

// Leaderboard (Routed via Python)
app.get('/api/leaderboard', (req, res) => {
  const level = req.query.level || 'undefined';
  const scriptPath = path.join(__dirname, 'api_leaderboard.py');
  
  exec(`py "${scriptPath}" "${level}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Python leaderboard error:', error);
      console.error('stderr:', stderr);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
    
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (parseError) {
      console.error('JSON parse error from python leaderboard:', parseError);
      console.error('Raw stdout:', stdout);
      res.status(500).json({ error: 'Invalid output from python leaderboard service' });
    }
  });
});


// Helper: Fetch ElevenLabs post-call conversation data
async function fetchElevenLabsConversationData(conversationId) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || !conversationId || apiKey === 'your_elevenlabs_api_key_here') {
    return null;
  }
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.warn('ElevenLabs API response:', response.status, await response.text());
      return null;
    }
    const data = await response.json();
    console.log('ElevenLabs conversation data:', JSON.stringify(data.analysis || data.metadata, null, 2));
    // Extract collected data variables from the analysis section
    const analysis = data.analysis || {};
    const dataVars = data.metadata?.data_collection_results || analysis.data_collection_results || {};
    return {
      conversationId,
      status: data.status,
      analysis,
      dataVars,
    };
  } catch (err) {
    console.error('Error fetching ElevenLabs conversation:', err.message);
    return null;
  }
}

// AI Judge Evaluation
app.post('/api/evaluate', async (req, res) => {
  const { transcript, topic, isJunior, conversationId, studentId, name, classLevel } = req.body;

  if (!transcript || !Array.isArray(transcript)) {
    return res.status(400).json({ error: 'transcript array is required' });
  }

  if (isJunior) {
    return res.json({
      skipped: true,
      overall_score: 10.0,
      grade: "N/A",
      strengths: ["Great effort!", "Keep practicing your speaking skills."],
      weaknesses: [],
      areas_to_improve: ["Speak a bit louder next time."],
      categories: [],
      fallacies_detected: [],
      persuasion_techniques: [],
      disfluency_report: { total: 0 },
      key_moments: [],
      ai_challenges_summary: [],
      stats: { total_turns: transcript.length, total_words: transcript.reduce((acc, m) => acc + m.text.split(' ').length, 0) }
    });
  }

  try {
    // Step 1: Convert transcript to ElevenLabs raw text format
    let rawText = '';
    for (const msg of transcript) {
      rawText += `\n${msg.text}\n`;
      rawText += msg.role === 'user' ? 'ASR\n' : 'LLM\n';
    }

    // Step 2: Write to tmp file
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const filename = path.join(tmpDir, `transcript_${Date.now()}.txt`);
    fs.writeFileSync(filename, rawText.trim());

    // Step 3: Call Python script
    const scriptPath = path.join(__dirname, 'api_evaluate.py');
    const sId = studentId ? String(studentId).replace(/"/g, '') : 'unknown';
    const sName = name ? String(name).replace(/"/g, '') : 'Anon';
    const sClass = classLevel ? String(classLevel).replace(/"/g, '') : 'unknown';
    const sTopic = topic ? String(topic).replace(/"/g, '') : 'Unknown Motion';
    
    // Pass args securely. Format: py script.py transcript.txt studentId name classLevel topic
    exec(`py "${scriptPath}" "${filename}" "${sId}" "${sName}" "${sClass}" "${sTopic}"`, (error, stdout, stderr) => {
      // Clean up file
      try { fs.unlinkSync(filename); } catch (e) {}

      if (error) {
        console.error('Python execute error:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ error: 'Failed to run debate judge' });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        console.error('JSON parse error from python output:', parseError);
        console.error('Raw stdout:', stdout);
        res.status(500).json({ error: 'Invalid output from judge' });
      }
    });
  } catch (err) {
    console.error('Judge mapping error:', err);
    res.status(500).json({ error: 'Server error during evaluation' });
  }
});

// Check if running locally vs Vercel Serverless
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
