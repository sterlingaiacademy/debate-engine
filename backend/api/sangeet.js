const express   = require('express');
const Anthropic  = require('@anthropic-ai/sdk');
const db         = require('../database');

const router = express.Router();
const PASS_THRESHOLD = 60;

// ── POST /api/sangeet/score ─────────────────────────────────────────────────
// Now uses Claude Haiku 4.5 for ALL grades.
// If no audio was detected (empty pitchReadings), Claude scores 0.
router.post('/score', async (req, res) => {
  try {
    const {
      studentId,
      grade,
      taskType,
      prompt,        // task description shown to student
      pitchReadings, // array of { hz, sargam, cents } — collected in real time
      onsetCount,    // number of sound onsets detected (rhythm proxy)
      raga,
    } = req.body;

    if (!studentId || !grade) {
      return res.status(400).json({ error: 'Missing required fields: studentId, grade' });
    }

    const gradeNum = parseInt(grade.replace('G', ''), 10);
    const readings = Array.isArray(pitchReadings) ? pitchReadings : [];
    const noAudio  = readings.length < 3; // fewer than 3 pitch readings = essentially silent

    let pitchScore      = 0;
    let rhythmScore     = 0;
    let expressionScore = 0;
    let overallScore    = 0;
    let aiFeedback      = '';

    // ── Build pitch summary for Claude ──────────────────────────────────────
    let pitchSummary;
    if (noAudio) {
      pitchSummary = 'No audio detected — the student did not sing or make any sound during the recording.';
    } else {
      const deviations = readings.map(r => Math.abs(r.cents ?? 0));
      const avgDev  = (deviations.reduce((a, b) => a + b, 0) / deviations.length).toFixed(1);
      const maxDev  = Math.max(...deviations).toFixed(1);
      const smooth  = Math.round((deviations.filter(d => d <= 25).length / deviations.length) * 100);
      // Summarise the note sequence (max 30 notes to keep prompt compact)
      const noteSeq = readings.slice(0, 30).map(r => `${r.sargam}(${r.cents >= 0 ? '+' : ''}${r.cents}¢)`).join(' → ');

      pitchSummary =
        `Notes detected: ${readings.length}\n` +
        `Average pitch deviation from nearest chromatic note: ${avgDev} cents\n` +
        `Max pitch deviation: ${maxDev} cents\n` +
        `Pitch smoothness (% readings within 25¢): ${smooth}%\n` +
        `Sound onsets (rhythm events): ${onsetCount ?? 'unknown'}\n` +
        `Note sequence sample: ${noteSeq}`;
    }

    // ── Claude Haiku 4.5 scoring — ALL grades ───────────────────────────────
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const gradeContext =
          gradeNum <= 3 ? 'beginner (G1–G3): judge gently, focus on effort and basic pitch/rhythm presence.' :
          gradeNum <= 6 ? 'intermediate (G4–G6): expects sargam accuracy and steady rhythm.' :
          gradeNum <= 9 ? 'advanced (G7–G9): expects raga grammar, ornamentation, and expression.' :
          'expert (G10–G12): expects full expression, improvisation, and compositional awareness.';

        const ragaLine = raga ? `Raga context: ${raga}` : '';

        const message = await anthropic.messages.create({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 450,
          system:     'You are an expert Indian classical and Western music vocal evaluator. You must return ONLY valid JSON, no markdown, no explanation outside the JSON.',
          messages: [{
            role: 'user',
            content:
`Evaluate this music student's vocal performance and return scores.

Grade: ${grade} — ${gradeContext}
Task: ${prompt}
Task type: ${taskType}
${ragaLine}

Audio data:
${pitchSummary}

Scoring rules:
- If no audio was detected → all scores must be 0, feedback explains student must sing.
- Pitch score (0–100): how accurately and steadily they matched the required notes/pitches.
- Rhythm score (0–100): how steady and on-beat their timing was.
- Expression score (0–100): musical phrasing, tone quality, intent, and ornamentation (weight this higher for G7+).
- Be strict: a good score requires genuine effort and accuracy.
- Overall is weighted: G1–G6 use pitch 50% + rhythm 50%; G7–G9 use pitch 40% + rhythm 30% + expression 30%; G10–G12 use pitch 30% + rhythm 20% + expression 50%.

Respond with exactly this JSON:
{
  "pitchScore": <0-100>,
  "rhythmScore": <0-100>,
  "expressionScore": <0-100>,
  "overallScore": <0-100>,
  "feedback": "<2-3 sentences: specific observation about what you heard + one clear actionable tip. Encouraging but honest.>"
}`,
          }],
        });

        const raw    = message.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(raw);

        pitchScore      = Math.max(0, Math.min(100, Math.round(Number(parsed.pitchScore      ?? 0))));
        rhythmScore     = Math.max(0, Math.min(100, Math.round(Number(parsed.rhythmScore     ?? 0))));
        expressionScore = Math.max(0, Math.min(100, Math.round(Number(parsed.expressionScore ?? 0))));
        overallScore    = Math.max(0, Math.min(100, Math.round(Number(parsed.overallScore    ?? 0))));
        aiFeedback      = parsed.feedback || 'Keep practicing — every great musician started exactly where you are.';

      } catch (claudeErr) {
        console.error('Sangeet Claude error:', claudeErr.message);
        // Hard fallback — penalise silence, give partial credit if notes detected
        if (noAudio) {
          pitchScore = rhythmScore = expressionScore = overallScore = 0;
          aiFeedback = 'No sound was detected during recording. Make sure your microphone is working and try singing into it clearly.';
        } else {
          pitchScore = rhythmScore = expressionScore = 40;
          overallScore = 40;
          aiFeedback = 'Could not reach AI scorer. Your attempt was recorded — keep practising!';
        }
      }
    } else {
      // No API key configured
      pitchScore = rhythmScore = expressionScore = 0;
      overallScore = 0;
      aiFeedback = 'AI scoring is not configured. Please contact your teacher.';
    }

    const passed = overallScore >= PASS_THRESHOLD;

    // ── Save to DB ───────────────────────────────────────────────────────────
    try {
      await db.query(
        `INSERT INTO sangeet_scores
           (student_id, grade, task_type, prompt, pitch_score, rhythm_score, expression_score, overall_score, feedback, passed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [studentId, grade, taskType, prompt, pitchScore, rhythmScore, expressionScore, overallScore, aiFeedback, passed]
      );
    } catch (dbErr) {
      console.error('Sangeet DB save error:', dbErr.message);
    }

    return res.json({ pitchScore, rhythmScore, expressionScore, overallScore, feedback: aiFeedback, passed, grade });

  } catch (err) {
    console.error('Sangeet /score error:', err);
    return res.status(500).json({ error: 'Scoring failed. Please try again.' });
  }
});

// ── GET /api/sangeet/history/:studentId ─────────────────────────────────────
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { grade }     = req.query;
    const values        = grade ? [studentId, grade] : [studentId];
    const gradeFilter   = grade ? 'AND grade = $2' : '';

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
