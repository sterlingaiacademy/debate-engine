const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../database');

const router = express.Router();

// Grade scoring weights (pitch, rhythm, expression)
const GRADE_WEIGHTS = {
  G1:  { pitch: 0.5, rhythm: 0.5, expression: 0 },
  G2:  { pitch: 0.5, rhythm: 0.5, expression: 0 },
  G3:  { pitch: 0.5, rhythm: 0.5, expression: 0 },
  G4:  { pitch: 0.5, rhythm: 0.5, expression: 0 },
  G5:  { pitch: 0.5, rhythm: 0.5, expression: 0 },
  G6:  { pitch: 0.5, rhythm: 0.5, expression: 0 },
  G7:  { pitch: 0.4, rhythm: 0.3, expression: 0.3 },
  G8:  { pitch: 0.4, rhythm: 0.3, expression: 0.3 },
  G9:  { pitch: 0.4, rhythm: 0.3, expression: 0.3 },
  G10: { pitch: 0.3, rhythm: 0.2, expression: 0.5 },
  G11: { pitch: 0.3, rhythm: 0.2, expression: 0.5 },
  G12: { pitch: 0.3, rhythm: 0.2, expression: 0.5 },
};

const PASS_THRESHOLD = 60;

// ── POST /api/sangeet/score ─────────────────────────────────────────────────
router.post('/score', async (req, res) => {
  try {
    const {
      studentId, grade, taskType, prompt,
      pitchScore, rhythmScore,
      pitchData,   // { avgDeviation, maxDeviation, smoothness, notesSung }
      raga,
    } = req.body;

    if (!studentId || !grade || pitchScore === undefined || rhythmScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields: studentId, grade, pitchScore, rhythmScore' });
    }

    const weights = GRADE_WEIGHTS[grade] || GRADE_WEIGHTS.G1;
    const gradeNum = parseInt(grade.replace('G', ''), 10);
    const needsExpression = gradeNum >= 7 && weights.expression > 0;

    let expressionScore = null;
    let aiFeedback = '';

    // ── Expression scoring via Claude Haiku 4.5 (G7–G12 only) ──────────────
    if (needsExpression && process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const pitchSummary = pitchData
          ? `Average pitch deviation: ${pitchData.avgDeviation?.toFixed(1) ?? 'N/A'} cents | ` +
            `Max deviation: ${pitchData.maxDeviation?.toFixed(1) ?? 'N/A'} cents | ` +
            `Pitch smoothness: ${pitchData.smoothness?.toFixed(0) ?? 'N/A'}% | ` +
            `Notes detected: ${pitchData.notesSung ?? 'N/A'}`
          : `Pitch score: ${pitchScore}/100`;

        const ragaContext = raga ? `Raga context: ${raga}` : '';

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: 'You are an expert Indian classical and Western music vocal coach evaluating student performances. Respond only with valid JSON, no markdown.',
          messages: [{
            role: 'user',
            content: `Evaluate a Grade ${gradeNum} music student's vocal performance.

Task: ${prompt}
Task type: ${taskType}
${ragaContext}
${pitchSummary}
Rhythm score: ${rhythmScore}/100

Score the musical expression (0–100) based on:
- Tonal quality and control
- Musical phrasing and legato flow
- Ornamentation appropriateness for grade level
- Emotional expression and musical intent

Respond with this exact JSON:
{
  "expressionScore": <number 0-100>,
  "feedback": "<2-3 sentences: specific observation + one actionable tip, encouraging tone>"
}`,
          }],
        });

        const raw = message.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(raw);
        expressionScore = Math.max(0, Math.min(100, Number(parsed.expressionScore)));
        aiFeedback = parsed.feedback || '';
      } catch (claudeErr) {
        console.error('Sangeet Claude error:', claudeErr.message);
        // Graceful fallback — don't 500
        expressionScore = Math.round((pitchScore + rhythmScore) / 2);
        aiFeedback = 'Keep practicing — focus on smooth, connected notes and steady breath support.';
      }
    }

    // ── Calculate overall score ─────────────────────────────────────────────
    let overallScore;
    if (needsExpression) {
      overallScore = Math.round(
        pitchScore * weights.pitch +
        rhythmScore * weights.rhythm +
        (expressionScore ?? 0) * weights.expression
      );
    } else {
      overallScore = Math.round(pitchScore * weights.pitch + rhythmScore * weights.rhythm);
    }
    overallScore = Math.max(0, Math.min(100, overallScore));

    // ── Generate feedback for G1–G6 (no AI) ────────────────────────────────
    if (!aiFeedback) {
      const pitchMsg =
        pitchScore >= 85 ? 'Excellent pitch accuracy — your ear is very precise!' :
        pitchScore >= 70 ? 'Good pitch — keep focusing on matching the target note cleanly.' :
        pitchScore >= 50 ? 'Your pitch is developing well. Try humming slowly to tune in.' :
        'Focus on matching the target note. Practice with a tanpura drone in the background.';

      const rhythmMsg =
        rhythmScore >= 85 ? 'Excellent timing — your rhythm sense is very steady!' :
        rhythmScore >= 70 ? 'Good rhythm. Try counting aloud while you clap or sing.' :
        rhythmScore >= 50 ? 'Your timing is improving. Practice with a metronome at a slow tempo.' :
        'Focus on keeping a steady beat. Clap to a metronome before singing.';

      aiFeedback = `${pitchMsg} ${rhythmMsg}`;
    }

    const passed = overallScore >= PASS_THRESHOLD;

    // ── Save to database ────────────────────────────────────────────────────
    try {
      await db.query(
        `INSERT INTO sangeet_scores
           (student_id, grade, task_type, prompt, pitch_score, rhythm_score, expression_score, overall_score, feedback, passed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [studentId, grade, taskType, prompt, pitchScore, rhythmScore, expressionScore, overallScore, aiFeedback, passed]
      );
    } catch (dbErr) {
      console.error('Sangeet DB save error:', dbErr.message);
      // Still return the score even if DB fails
    }

    return res.json({
      pitchScore,
      rhythmScore,
      expressionScore,
      overallScore,
      feedback: aiFeedback,
      passed,
      grade,
    });

  } catch (err) {
    console.error('Sangeet /score error:', err);
    return res.status(500).json({ error: 'Scoring failed. Please try again.' });
  }
});

// ── GET /api/sangeet/history/:studentId ────────────────────────────────────
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { grade } = req.query;

    const values = grade ? [studentId, grade] : [studentId];
    const gradeFilter = grade ? 'AND grade = $2' : '';

    const result = await db.query(
      `SELECT id, grade, task_type, prompt, pitch_score, rhythm_score, expression_score,
              overall_score, feedback, passed, created_at
       FROM sangeet_scores
       WHERE student_id = $1 ${gradeFilter}
       ORDER BY created_at DESC
       LIMIT 30`,
      values
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Sangeet /history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
