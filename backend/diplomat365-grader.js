/**
 * diplomat365-grader.js
 * Built-in 5-dimension rubric scorer — no external AI needed.
 * Scores submitted text across: Persuasion, Evidence, Policy Knowledge,
 * Diplomatic Register, Voice Delivery. Each dim: 0–5. Stars = ceil(total/5).
 */

// ── Keyword banks ──────────────────────────────────────────────────────────────

const PERSUASION_MARKERS = [
  // Transitions & conclusions
  'therefore', 'thus', 'consequently', 'as a result', 'in conclusion',
  'it is clear that', 'this demonstrates', 'this proves', 'must', 'should',
  'it is imperative', 'we urge', 'we call upon', 'clearly', 'undeniably',
  // Rhetorical
  'imagine', 'consider', 'what if', 'how can we', 'why', 'is it not',
  // Concession + rebuttal
  'while it is true', 'although', 'however', 'nevertheless', 'despite',
  'on the other hand', 'the delegate of', 'the honourable delegate',
];

const EVIDENCE_MARKERS = [
  // Numbers and stats
  /\b\d+(\.\d+)?(%|million|billion|thousand|percent|countries|nations|delegates|years)\b/i,
  /\b(19|20)\d{2}\b/, // years
  /A\/RES\/\d+/i,      // UN resolution refs
  /S\/RES\/\d+/i,
  /SDG\s?\d+/i,
  // Citation phrases
  'according to', 'data shows', 'studies indicate', 'research confirms',
  'the world bank', 'unicef', 'undp', 'who reports', 'iaea',
  'as reported by', 'statistics from', 'survey', 'report states',
  'resolution', 'article', 'chapter', 'treaty', 'convention',
];

const POLICY_KNOWLEDGE_MARKERS = [
  // UN organs & bodies
  'general assembly', 'security council', 'ecosoc', 'secretariat',
  'unicef', 'undp', 'who', 'unhcr', 'iaea', 'unfccc', 'wfp', 'ilo',
  // MUN procedure
  'moderated caucus', 'unmoderated caucus', 'working paper', 'draft resolution',
  'operative clause', 'preambulatory', 'amendment', 'motion', 'quorum',
  'right of reply', 'point of order', 'yield the floor', 'placard',
  // Policy vocab
  'sovereignty', 'multilateral', 'bilateral', 'ratify', 'sanction',
  'veto', 'consensus', 'abstain', 'ndcs', 'cop', 'sdgs', 'oda',
  'humanitarian', 'peacekeeping', 'mandate', 'charter', 'protocol',
];

const DIPLOMATIC_REGISTER_MARKERS = [
  // Third-person / formal
  'the delegation of', 'this delegation', 'my delegation',
  'the honourable', 'distinguished delegate', 'fellow delegates',
  'this body', 'the committee', 'the representative of',
  // Calibrated language
  'calls upon', 'urges', 'encourages', 'requests', 'recommends',
  'deeply concerned', 'noting with concern', 'affirming', 'recalling',
  'reaffirming', 'bearing in mind', 'mindful of', 'recognizing',
  // Hedging
  'it is the position of', 'the delegation believes', 'in the view of',
  'it may be suggested', 'consideration should be given',
];

// Voice delivery is proxied via text structure signals
// (actual audio not available; we grade the written submission as a proxy)

// ── Scorer ─────────────────────────────────────────────────────────────────────

/**
 * Count how many markers appear in text (case-insensitive).
 * Accepts string or RegExp entries.
 */
function countMatches(text, markers) {
  const lower = text.toLowerCase();
  let count = 0;
  for (const m of markers) {
    if (m instanceof RegExp) {
      if (m.test(text)) count++;
    } else {
      if (lower.includes(m.toLowerCase())) count++;
    }
  }
  return count;
}

/**
 * Normalise a raw match count to a 0–5 score.
 * thresholds: [1-match→1, 2→2, 4→3, 6→4, 9→5]
 */
function normalise(raw, max) {
  if (raw <= 0) return 0;
  const ratio = raw / max;
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.65) return 4;
  if (ratio >= 0.40) return 3;
  if (ratio >= 0.20) return 2;
  return 1;
}

/**
 * Score voice delivery from text structure:
 * - Word count (50+ → floor score of 1; 120+ → 2; 200+ → 3; 300+ → 4; 450+ → 5)
 * - Sentence count & variety
 * - Paragraph breaks
 */
function scoreVoiceDelivery(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 4).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;

  let score = 0;
  if (words >= 50)  score = 1;
  if (words >= 120) score = 2;
  if (words >= 200) score = 3;
  if (words >= 300) score = 4;
  if (words >= 450) score = 5;

  // Sentence variety bonus: penalise very uniform sentence length
  if (avgWordsPerSentence > 5 && avgWordsPerSentence < 30 && sentences >= 3) {
    score = Math.min(5, score + 0.5);
  }

  return Math.round(Math.min(5, score));
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * gradeSubmission(text, dayData)
 * Returns:
 * {
 *   dims: { persuasion, evidence, policyKnowledge, diplomaticRegister, voiceDelivery },
 *   totalScore: number (0–25),
 *   stars: number (1–5),
 *   feedback: string,
 *   unlocked: boolean
 * }
 */
function gradeSubmission(text, dayData = {}) {
  if (!text || text.trim().length < 10) {
    return {
      dims: { persuasion: 0, evidence: 0, policyKnowledge: 0, diplomaticRegister: 0, voiceDelivery: 0 },
      totalScore: 0,
      stars: 1,
      feedback: 'Your submission was too short. Please write at least 3–4 sentences.',
      unlocked: false,
    };
  }

  const persuasion      = normalise(countMatches(text, PERSUASION_MARKERS), 8);
  const evidence        = normalise(countMatches(text, EVIDENCE_MARKERS), 7);
  const policyKnowledge = normalise(countMatches(text, POLICY_KNOWLEDGE_MARKERS), 10);
  const diplomaticRegister = normalise(countMatches(text, DIPLOMATIC_REGISTER_MARKERS), 8);
  const voiceDelivery   = scoreVoiceDelivery(text);

  const dims = { persuasion, evidence, policyKnowledge, diplomaticRegister, voiceDelivery };
  const totalScore = persuasion + evidence + policyKnowledge + diplomaticRegister + voiceDelivery;
  const stars = Math.max(1, Math.min(5, Math.ceil(totalScore / 5)));

  // Generate targeted feedback
  const weakDims = Object.entries(dims)
    .filter(([, v]) => v < 3)
    .map(([k]) => k);

  const feedbackMap = {
    persuasion: 'Strengthen your conclusion — add a clear call to action or a rhetorical question.',
    evidence: 'Back your claims with numbers, dates, or a UN resolution reference.',
    policyKnowledge: 'Use MUN-specific vocabulary: mention a UN organ, resolution, or procedure term.',
    diplomaticRegister: 'Adopt third-person diplomatic voice: "This delegation urges…" or "The committee notes…"',
    voiceDelivery: 'Expand your response — aim for at least 200 words with varied sentence lengths.',
  };

  const feedbackLines = weakDims.length > 0
    ? weakDims.slice(0, 2).map(d => `• ${feedbackMap[d]}`).join('\n')
    : '✨ Excellent work across all dimensions! Keep this standard in tomorrow\'s session.';

  const starLabel = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][stars];

  const feedback = stars >= 3
    ? `${starLabel} Well done! You scored ${totalScore}/25.\n${feedbackLines}`
    : `${starLabel} You scored ${totalScore}/25. Coach AI hint:\n${feedbackLines}`;

  return {
    dims,
    totalScore,
    stars,
    feedback,
    unlocked: stars >= 3,
  };
}

module.exports = { gradeSubmission };
