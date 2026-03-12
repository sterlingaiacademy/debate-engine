require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');
const { evaluateDebate } = require('./judge');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static React frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Users
app.post('/api/register', async (req, res) => {
  const { name, studentId, password, classLevel } = req.body;
  if (!name || !studentId || !password || !classLevel) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Assign agent ID based on class
  let assignedAgentId = '';
  if (classLevel === 'Class 1-3') {
    assignedAgentId = 'agent_3201kkb0dbh3fgravbhyjw4crve8';
  } else if (classLevel === 'Class 10-12') {
    assignedAgentId = 'agent_1201kkdnn526eebs4fwb822fzgs3';
  } else {
    return res.status(400).json({ error: 'Invalid class level' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, "studentId", password, "classLevel", "assignedAgentId") VALUES ($1, $2, $3, $4, $5)`;
    
    try {
      await db.query(query, [name, studentId, hashedPassword, classLevel, assignedAgentId]);
    } catch (err) {
      if (err.code === '23505') { // Postgres unique violation error code
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

// Debate Sessions
app.post('/api/sessions', async (req, res) => {
  const { studentId, debateTopic, sessionDuration, argumentsCount, debateScore } = req.body;
  
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
    
    res.status(201).json({ message: 'Session saved', sessionId: newSessionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics
app.get('/api/analytics/:studentId', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM analytics WHERE "studentId" = $1`, [req.params.studentId]);
    res.json(result.rows[0] || { averageScore: 0, debatesCompleted: 0, speakingTime: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const query = `
    SELECT u.name, u."classLevel", a."averageScore", a."debatesCompleted" 
    FROM analytics a
    JOIN users u ON a."studentId" = u."studentId"
    WHERE a."debatesCompleted" > 0
    ORDER BY a."averageScore" DESC, a."debatesCompleted" DESC
    LIMIT 10
  `;
  try {
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  const { transcript, topic, isJunior, conversationId } = req.body;

  if (!transcript || !Array.isArray(transcript)) {
    return res.status(400).json({ error: 'transcript array is required' });
  }

  try {
    // Step 1: Try to fetch ElevenLabs post-call data first
    let elevenLabsData = null;
    if (conversationId) {
      console.log('Fetching ElevenLabs data for conversation:', conversationId);
      // Wait a moment for ElevenLabs to finish processing the call
      await new Promise(resolve => setTimeout(resolve, 2000));
      elevenLabsData = await fetchElevenLabsConversationData(conversationId);
      if (elevenLabsData) {
        console.log('Successfully extracted ElevenLabs data:', elevenLabsData.dataVars);
      }
    }

    // Step 2: Pass transcript + ElevenLabs data to Gemini for scoring
    const result = await evaluateDebate(transcript, topic || '', isJunior || false, elevenLabsData);
    res.json(result);
  } catch (err) {
    console.error('Judge error:', err);
    const studentTurns = transcript.filter(m => m.role === 'user').length;
    const totalWords = transcript.reduce((acc, m) => acc + (m.role === 'user' ? m.text.split(' ').length : 0), 0);
    res.status(200).json({
      overallScore: 65,
      metrics: [
        { name: 'Argument Strength and Clarity', score: 60 },
        { name: 'Evidence and Logical Reasoning Usage', score: 55 },
        { name: 'Rebuttal Effectiveness', score: 65 },
        { name: 'Debate Technique Adherence', score: 58 },
        { name: 'Overall Performance/Improvement', score: 63 },
      ],
      feedback: "The debate was too short or an error occurred. Try speaking more next time!",
      elevenLabsData: null,
      analysisDetails: { totalWords, studentTurns, avgWordsPerTurn: studentTurns ? Math.round(totalWords / studentTurns) : 0 }
    });
  }
});

// Catch-all route to serve React app for non-API routes (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
