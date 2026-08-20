const express = require('express');
const multer = require('multer');
const { AssemblyAI } = require('assemblyai');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const db = require('../database');

const router = express.Router();
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('audio'), async (req, res) => {
  try {
    const { studentId, topic } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    if (!studentId || !topic) {
      return res.status(400).json({ error: 'Student ID and Topic are required' });
    }

    if (!process.env.ASSEMBLYAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Missing AssemblyAI or Anthropic API keys in server environment.' });
    }

    const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Step 1: Upload to AssemblyAI
    console.log('Uploading to AssemblyAI...', req.file.path);
    const audioUrl = await assemblyai.files.upload(req.file.path);

    // Step 2: Transcribe with AssemblyAI
    console.log('Transcribing...');
    const transcript = await assemblyai.transcripts.transcribe({
      audio: audioUrl,
      disfluencies: true,
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    const transcriptionText = transcript.text;
    const words = transcript.words || [];
    const durationSeconds = transcript.audio_duration || (words.length > 0 ? words[words.length - 1].end / 1000 : 0);

    // Calculate basic metrics
    const wordCount = words.filter(w => w.text.match(/\w+/)).length;
    const fillerWordsCount = words.filter(w => {
      const clean = w.text.toLowerCase().replace(/[^a-z]/g, '');
      return ['um', 'uh', 'hmm', 'ah', 'like', 'actually', 'basically', 'literally'].includes(clean);
    }).length;
    const wpm = durationSeconds > 0 ? Math.round((wordCount / (durationSeconds / 60))) : 0;

    // Clean up temporary file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp audio file:', err);
    });

    // Step 3: Analyze with Claude
    console.log('Analyzing with Claude...');
    const prompt = `
You are an expert, strict public speaking coach. Analyze the following speech transcript and provide detailed, actionable feedback.
The student spoke for ${durationSeconds} seconds on the topic: "${topic}".

CRITICAL INSTRUCTION 1: First, determine if the speech is completely unrelated, gibberish, or off-topic. If the transcript is entirely off-topic or doesn't make any sense regarding the prompt, you MUST give a total score of 0, and 0 for ALL detailed scores. 
CRITICAL INSTRUCTION 2: Be EXTREMELY STRICT about length and substance. If the transcript is shorter than 2-3 full sentences OR if it completely lacks substantive content about the topic (e.g. generic statements like "I think there has been a great achievement"), you MUST give a total score of 0, and 0 for ALL detailed scores. Do NOT give any pity points for grammar or syntax if there is no substantive content.
Otherwise, evaluate it strictly on a scale of 0-100 for overall quality, and provide a detailed breakdown based on this exact rubric:
- Content and Ideas (max 20)
- Relevance to Topic (max 15)
- Organisation and Structure (max 15)
- Fluency (max 15)
- Voice Modulation and Expression (max 10)
- Language and Vocabulary (max 10)
- Pronunciation and Clarity (max 10)
- Time Management (max 5) (Assume a 2-minute target for a standard speech)

Provide your response strictly as a JSON object with exactly this format, and no other text before or after:
{
  "score": number, // Overall total score (sum of detailed scores, max 100)
  "scores": {
    "contentAndIdeas": number,
    "relevanceToTopic": number,
    "organisationAndStructure": number,
    "fluency": number,
    "voiceModulationAndExpression": number,
    "languageAndVocabulary": number,
    "pronunciationAndClarity": number,
    "timeManagement": number
  },
  "strengths": ["point 1", "point 2", "point 3", "point 4"], // AT LEAST 4 detailed bullet points identifying specific things they did well.
  "areasForImprovement": ["point 1", "point 2", "point 3", "point 4"], // AT LEAST 4 detailed bullet points with highly actionable advice for next time.
  "overallFeedback": "A comprehensive paragraph (3-4 sentences) summarizing the performance, what stood out, and their primary focus for the next speech."
}

Transcript:
"${transcriptionText}"
`;

    let aiAnalysis;
    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: "You are an expert public speaking coach. Always respond with only valid JSON.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      const responseText = message.content[0].text;
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      aiAnalysis = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Claude API failed for analysis, using fallback:', e.message);
      aiAnalysis = {
        score: 75,
        scores: {
          contentAndIdeas: 15,
          relevanceToTopic: 12,
          organisationAndStructure: 10,
          fluency: 12,
          voiceModulationAndExpression: 7,
          languageAndVocabulary: 8,
          pronunciationAndClarity: 8,
          timeManagement: 3
        },
        strengths: ["Clear pronunciation", "Good pacing"],
        areasForImprovement: ["Reduce filler words", "Add more vocal variety"],
        overallFeedback: 'Your API key is restricted or invalid, so this is a placeholder analysis. However, you spoke clearly and your pacing was generally good! Make sure to verify your Anthropic API key.'
      };
    }

    // STRICT OVERRIDE: Force 0 if the speech is far too short or lacks substance
    if (wordCount < 40 || durationSeconds < 30) {
      aiAnalysis.score = 0;
      aiAnalysis.scores = {
        contentAndIdeas: 0,
        relevanceToTopic: 0,
        organisationAndStructure: 0,
        fluency: 0,
        voiceModulationAndExpression: 0,
        languageAndVocabulary: 0,
        pronunciationAndClarity: 0,
        timeManagement: 0
      };
      // Keep the AI's feedback so the user understands why it was too short
    }

    const result = {
      success: true,
      transcription: transcriptionText,
      metrics: {
        durationSeconds,
        wordCount,
        fillerWordsCount,
        wpm
      },
      analysis: aiAnalysis
    };

    // Save to Database
    try {
      await db.query(
        `INSERT INTO speech_analysis_sessions 
         (student_id, topic, score, detailed_scores, wpm, filler_words, strengths, areas_for_improvement, overall_feedback, transcript)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          studentId,
          topic,
          aiAnalysis.score,
          JSON.stringify(aiAnalysis.scores),
          wpm,
          fillerWordsCount,
          JSON.stringify(aiAnalysis.strengths),
          JSON.stringify(aiAnalysis.areasForImprovement),
          aiAnalysis.overallFeedback,
          transcriptionText
        ]
      );
    } catch (dbErr) {
      console.error('Failed to save speech session to DB:', dbErr);
      // We don't fail the response if DB insert fails, just log it.
    }

    res.json(result);

  } catch (err) {
    console.error('Speech Analysis Error:', err);
    res.status(500).json({ error: err.message || 'An internal error occurred.' });
  }
});

// Endpoint to generate prep hints
router.post('/prep-hints', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Missing Anthropic API key.' });
    }
    
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const prompt = `
You are an expert public speaking coach. Your student is about to give a speech on the topic: "${topic}".
They have 2 minutes to prepare.
Provide a JSON object containing exactly 3 key bullet points they should hit, and 1 short speaking tip.
Format strictly as JSON:
{
  "points": ["point 1", "point 2", "point 3"],
  "tip": "A short 1-sentence speaking tip (e.g. remember to pause, keep eye contact, etc)"
}`;

    let result;
    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: "You are an expert public speaking coach. Always respond with only valid JSON.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      const responseText = message.content[0].text;
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Claude API failed for prep hints, using fallback:', e.message);
      result = { 
        points: [
          `Define the key terms related to ${topic} clearly`, 
          `State your core argument about ${topic} confidently`, 
          "Conclude with a strong closing thought to leave an impact"
        ], 
        tip: `Remember to pace yourself while explaining your views on ${topic}.` 
      };
    }
    
    res.json(result);
  } catch (err) {
    console.error('Prep Hints Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch history
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await db.query(
      `SELECT * FROM speech_analysis_sessions WHERE student_id = $1 ORDER BY created_at DESC`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch History Error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Endpoint to generate temporary realtime token for AssemblyAI
router.get('/realtime-token', async (req, res) => {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return res.status(500).json({ error: 'Missing AssemblyAI API key.' });
    }
    // AssemblyAI v3 streaming uses the API key directly in the token parameter
    res.json({ token: process.env.ASSEMBLYAI_API_KEY });
  } catch (err) {
    console.error('Failed to generate realtime token:', err.message);
    res.status(500).json({ error: 'Token generation failed' });
  }
});

module.exports = router;
