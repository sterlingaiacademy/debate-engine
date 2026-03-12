/**
 * AI Judge Engine — Grace and Force AI
 * Uses Google Gemini for deep qualitative semantic evaluation.
 * Criteria aligned with ElevenLabs agent evaluation criteria.
 * Falls back to rule-based NLP if no GEMINI_API_KEY is found.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ============================================
// ElevenLabs-Aligned Criteria (official names)
// ============================================
const ELEVENLABS_CRITERIA = [
  'Argument Strength and Clarity',
  'Evidence and Logical Reasoning Usage',
  'Rebuttal Effectiveness',
  'Debate Technique Adherence',
  'Overall Performance/Improvement',
];

// ============================================
// Helper functions
// ============================================
const LOGIC_CONNECTIVES = ['because', 'therefore', 'thus', 'hence', 'since', 'consequently', 'as a result', 'which means', 'this shows', 'furthermore', 'moreover', 'in addition', 'however', 'although', 'despite', 'nevertheless', 'on the other hand', 'in contrast', 'whereas', 'while', 'but', 'yet', 'this proves', 'this demonstrates'];
const EVIDENCE_PHRASES = ['research shows', 'studies show', 'evidence suggests', 'data shows', 'experts agree', 'according to', 'for example', 'for instance', 'such as', 'proves', 'demonstrates', 'illustrates', 'shows that', 'in fact', 'statistics show', 'it has been found'];
const REBUTTAL_PHRASES = ['however', 'on the other hand', 'i disagree', 'that is incorrect', 'actually', 'but', 'counter to that', 'in response', 'you said', 'your point', 'the opposing view', 'while you argue', 'though', 'despite this', 'that ignores', 'the flaw in that', 'i challenge'];
const DEBATE_TECHNIQUES = ['in conclusion', 'to summarize', 'first', 'second', 'third', 'finally', 'my main point', 'to begin', 'in contrast', 'as i stated', 'let me address', 'turning to', 'i would like to argue', 'the motion states', 'we propose', 'i stand by'];
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'basically', 'literally', 'actually', 'honestly', 'i mean', 'well', 'so yeah', 'right'];

function getStudentMessages(transcript) {
  return transcript.filter(msg => msg.role === 'user' && msg.text && msg.text.trim().length > 0);
}
function getStudentText(sm) { return sm.map(m => m.text.toLowerCase()).join(' '); }
function countPhrases(text, phrases) {
  return phrases.reduce((count, phrase) => {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

// ============================================
// Fallback Rule-Based Engine (ElevenLabs criteria)
// ============================================
function fallbackJudge(transcript, topic, isJunior) {
  const sm = getStudentMessages(transcript);
  const text = getStudentText(sm);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const argumentClarity = Math.min(95, Math.max(20,
    Math.round((sm.map(m => m.text.trim().split(/\s+/).length).reduce((a, b) => a + b, 0) / Math.max(1, sm.length) / 40) * 100)
  ));
  const evidenceLogic = Math.min(95, Math.max(20,
    Math.round(20 + (countPhrases(text, EVIDENCE_PHRASES) / 5) * 70 + (countPhrases(text, LOGIC_CONNECTIVES) / 10) * 20)
  ));
  const rebuttalScore = Math.min(95, Math.max(15,
    Math.round(15 + (countPhrases(text, REBUTTAL_PHRASES) / 4) * 80)
  ));
  const debateTechnique = Math.min(95, Math.max(20,
    Math.round(30 + (countPhrases(text, DEBATE_TECHNIQUES) / 5) * 60 - (countPhrases(text, FILLER_WORDS) / Math.max(wordCount, 1)) * 200)
  ));
  const overallImprovement = Math.min(95, Math.max(20,
    Math.round((argumentClarity * 0.3 + evidenceLogic * 0.3 + rebuttalScore * 0.2 + debateTechnique * 0.2) + (sm.length > 3 ? 5 : 0))
  ));

  const metrics = [
    { name: 'Argument Strength and Clarity', score: argumentClarity || 50 },
    { name: 'Evidence and Logical Reasoning Usage', score: evidenceLogic || 50 },
    { name: 'Rebuttal Effectiveness', score: rebuttalScore || 50 },
    { name: 'Debate Technique Adherence', score: debateTechnique || 50 },
    { name: 'Overall Performance/Improvement', score: overallImprovement || 50 },
  ];

  const overallScore = Math.round(metrics.reduce((s, m, i) => s + m.score * [0.25, 0.25, 0.20, 0.15, 0.15][i], 0));

  return {
    overallScore,
    metrics,
    feedback: "Fallback evaluation used — add GEMINI_API_KEY to unlock full AI scoring.",
    elevenLabsData: null,
    analysisDetails: {
      studentTurns: sm.length,
      totalWords: wordCount,
      avgWordsPerTurn: sm.length ? Math.round(wordCount / sm.length) : 0
    }
  };
}

// ============================================
// Google Gemini LLM Engine (ElevenLabs-aligned)
// ============================================
async function evaluateDebate(transcript, topic, isJunior, elevenLabsData = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY found. Using rule-based fallback.");
    return fallbackJudge(transcript, topic, isJunior);
  }

  const sm = getStudentMessages(transcript);
  const text = getStudentText(sm);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const analysisDetails = {
    studentTurns: sm.length,
    totalWords: wordCount,
    avgWordsPerTurn: sm.length ? Math.round(wordCount / sm.length) : 0
  };

  if (sm.length === 0) {
    return fallbackJudge(transcript, topic, isJunior);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const formattedTranscript = transcript
      .map(t => `${t.role === 'user' ? 'Student' : 'AI Coach'}: ${t.text}`)
      .join('\n');

    const juniorNote = isJunior
      ? 'This is a JUNIOR student (Class 1-3, age 6-8). Be very gentle, encouraging and use simple language. Scores should lean 55-90 to motivate young learners.'
      : 'This is a SENIOR student (Class 10-12). Apply rigorous academic debate standards. Scores should reflect actual performance (30-95 range).';

    // Build ElevenLabs grounding section if data is available
    let elSection = '';
    if (elevenLabsData) {
      const dvars = elevenLabsData.dataVars || {};
      const analysis = elevenLabsData.analysis || {};
      elSection = `
IMPORTANT — ElevenLabs Agent Already Collected These Scores During The Session:
These are the ACTUAL evaluation scores collected by the live AI debate coach during the call.
Use these as your primary grounding data to make your scoring consistent with what ElevenLabs measured:

- argument_clarity_score (1-5): ${dvars.argument_clarity_score ?? 'N/A'}
- evidence_logic_score (1-5): ${dvars.evidence_logic_score ?? 'N/A'}
- rebuttal_score (1-5): ${dvars.rebuttal_score ?? 'N/A'}
- session_feedback_summary: "${dvars.session_feedback_summary ?? 'N/A'}"
${analysis.evaluation_criteria_results ? `- ElevenLabs Criteria Evaluation: ${JSON.stringify(analysis.evaluation_criteria_results, null, 2)}` : ''}
${analysis.transcript_summary ? `- Transcript Summary: ${analysis.transcript_summary}` : ''}

Convert the 1-5 ElevenLabs scores to 0-100 for the relevant metrics by multiplying by 20.
Your overall scoring should be CONSISTENT with these collected measurements.
`;
    }

    const prompt = `You are an expert debate coach AI working alongside an ElevenLabs voice agent.
Evaluate the student's performance in this debate session using EXACTLY the same 5 criteria used by the ElevenLabs debate coach agent.

${juniorNote}
${elSection}

Debate Topic: "${topic || 'General Debate'}"

Full Transcript:
${formattedTranscript}

Evaluate ONLY the student's contributions (lines starting with "Student:").

Score each of the 5 criteria from 0 to 100. Compute an overall score (weighted average).
Provide detailed, personalized feedback that mirrors what an ElevenLabs debate coach would say — warm, specific, and actionable.

Also extract/confirm these data fields matching the ElevenLabs data collection variables:
- argument_clarity_score: 1-5 scale
- evidence_logic_score: 1-5 scale  
- rebuttal_score: 1-5 scale
- session_feedback_summary: One sentence overall summary

Return ONLY valid JSON in this exact format:
{
  "overallScore": 78,
  "metrics": [
    { "name": "Argument Strength and Clarity", "score": 80 },
    { "name": "Evidence and Logical Reasoning Usage", "score": 75 },
    { "name": "Rebuttal Effectiveness", "score": 70 },
    { "name": "Debate Technique Adherence", "score": 82 },
    { "name": "Overall Performance/Improvement", "score": 78 }
  ],
  "feedback": "Detailed personalized feedback here.",
  "elevenLabsData": {
    "argument_clarity_score": 4,
    "evidence_logic_score": 3,
    "rebuttal_score": 3,
    "session_feedback_summary": "One sentence summary."
  }
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let evaluationData;

    try {
      evaluationData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return fallbackJudge(transcript, topic, isJunior);
    }

    // Ensure metrics are in canonical ElevenLabs criteria order
    const sortedMetrics = ELEVENLABS_CRITERIA.map(criteriaName => {
      const found = evaluationData.metrics?.find(m => m.name === criteriaName);
      return found ? found : { name: criteriaName, score: 50 };
    });

    return {
      overallScore: evaluationData.overallScore ?? 65,
      metrics: sortedMetrics,
      feedback: evaluationData.feedback ?? '',
      elevenLabsData: evaluationData.elevenLabsData ?? null,
      analysisDetails,
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    return fallbackJudge(transcript, topic, isJunior);
  }
}

module.exports = { evaluateDebate };
