/**
 * diplomat365-grader.js
 * Built-in 5-dimension rubric scorer — no external AI needed.
 * Scoring is SLOT-AWARE: Concept Days are graded leniently,
 * Assessment Days are graded strictly. Early days are more forgiving.
 */

// ── Keyword banks ──────────────────────────────────────────────────────────────

const PERSUASION_MARKERS = [
  // Basic connectives (any student should use these)
  'because', 'so', 'also', 'and', 'but', 'or', 'if', 'when',
  // Intermediate transitions
  'therefore', 'thus', 'consequently', 'as a result', 'in conclusion',
  'it is clear', 'this shows', 'this means', 'must', 'should', 'important',
  'it is imperative', 'we urge', 'we call upon', 'clearly', 'undeniably',
  // Rhetorical
  'imagine', 'consider', 'what if', 'how can we', 'why', 'is it not',
  // Concession + rebuttal
  'while it is true', 'although', 'however', 'nevertheless', 'despite',
  'on the other hand', 'the delegate of', 'the honourable delegate',
  // Basic opinion markers
  'i think', 'i believe', 'in my opinion', 'i feel', 'we should', 'we need',
];

const EVIDENCE_MARKERS = [
  // Numbers and stats (very broad)
  /\b\d+(\.\d+)?(%|million|billion|thousand|percent|countries|nations|delegates|years|km|people|students)?\b/i,
  /\b(19|20)\d{2}\b/, // years
  /A\/RES\/\d+/i,      // UN resolution refs
  /S\/RES\/\d+/i,
  /SDG\s?\d+/i,
  // Very common citation phrases
  'according to', 'data shows', 'studies indicate', 'research confirms',
  'the world bank', 'unicef', 'undp', 'who ', 'iaea',
  'as reported by', 'statistics', 'survey', 'report',
  'resolution', 'article', 'chapter', 'treaty', 'convention',
  // Casual evidence phrases that any student would use
  'for example', 'for instance', 'such as', 'like', 'including',
  'scientists say', 'experts say', 'it is said', 'it is known',
];

const POLICY_KNOWLEDGE_MARKERS = [
  // Very general geography/world knowledge (Day 1 level)
  'earth', 'world', 'continent', 'ocean', 'country', 'countries', 'nation',
  'planet', 'globe', 'global', 'international', 'people', 'population',
  // UN-related (any student should know some of these)
  'united nations', 'un ', 'unicef', 'who ', 'general assembly', 'security council',
  'ecosoc', 'secretariat', 'undp', 'unhcr', 'iaea', 'unfccc', 'wfp',
  // MUN procedure
  'moderated caucus', 'unmoderated caucus', 'working paper', 'draft resolution',
  'operative clause', 'preambulatory', 'amendment', 'motion', 'quorum',
  // Policy vocab
  'sovereignty', 'multilateral', 'bilateral', 'ratify', 'sanction',
  'veto', 'consensus', 'abstain', 'sdgs', 'humanitarian', 'peacekeeping',
  'mandate', 'charter', 'protocol', 'diplomacy', 'diplomat', 'delegate',
  // Theme-related Day 1 words
  'blue dot', 'blue marble', 'atmosphere', 'biosphere', 'geography',
  'africa', 'asia', 'europe', 'america', 'antarctica', 'australia',
  'pacific', 'atlantic', 'indian ocean', 'arctic',
];

const DIPLOMATIC_REGISTER_MARKERS = [
  // Very basic formal writing (any student)
  'in summary', 'in conclusion', 'to summarize', 'in my view', 'i would like',
  'it is important', 'we must', 'we should', 'it is necessary',
  // Intermediate formal
  'the delegation of', 'this delegation', 'my delegation',
  'the honourable', 'distinguished delegate', 'fellow delegates',
  'this body', 'the committee', 'the representative of',
  // Calibrated language
  'calls upon', 'urges', 'encourages', 'requests', 'recommends',
  'deeply concerned', 'noting with concern', 'affirming', 'recalling',
  'reaffirming', 'bearing in mind', 'mindful of', 'recognizing',
  // Basic formal language any student uses
  'furthermore', 'moreover', 'additionally', 'firstly', 'secondly',
  'in addition', 'as a result', 'on the other hand', 'in contrast',
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

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
 * Liberal normalise — rewards students for partial engagement.
 * Even 1 match gives a decent score.
 */
function normalise(raw, max, lenient = false) {
  if (raw <= 0) return lenient ? 1 : 0; // lenient: floor of 1 even with 0 matches
  const ratio = raw / max;
  if (ratio >= 0.6) return 5;
  if (ratio >= 0.35) return 4;
  if (ratio >= 0.18) return 3;
  if (ratio >= 0.08) return 2;
  return 1;
}

function scoreVoiceDelivery(text, lenient = false) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;

  // Lenient mode: shorter responses score well too
  let score;
  if (lenient) {
    if (words >= 200) score = 5;
    else if (words >= 120) score = 4;
    else if (words >= 70)  score = 3;
    else if (words >= 40)  score = 2;
    else if (words >= 15)  score = 1;
    else score = 0;
  } else {
    if (words >= 450) score = 5;
    else if (words >= 300) score = 4;
    else if (words >= 200) score = 3;
    else if (words >= 120) score = 2;
    else if (words >= 50)  score = 1;
    else score = 0;
  }

  // Sentence variety bonus
  if (avgWordsPerSentence > 4 && avgWordsPerSentence < 35 && sentences >= 2) {
    score = Math.min(5, score + 1);
  }

  return Math.round(Math.min(5, score));
}

// ── Slot-aware difficulty multipliers ──────────────────────────────────────────

const SLOT_LENIENCY = {
  'Concept Day':    { lenient: true,  maxes: [12, 8, 8, 10, null], unlockAt: 2 },
  'Drill Day':      { lenient: false, maxes: [10, 8, 10, 10, null], unlockAt: 3 },
  'Debate Day':     { lenient: false, maxes: [8,  7, 10, 8,  null], unlockAt: 3 },
  'Reflection Day': { lenient: true,  maxes: [10, 6, 8,  8,  null], unlockAt: 2 },
  'Assessment Day': { lenient: false, maxes: [8,  7, 10, 8,  null], unlockAt: 4 },
};

// Early day bonus: Days 1–30 get a +2 bonus to totalScore
function earlyDayBonus(dayNumber) {
  if (!dayNumber) return 2;
  if (dayNumber <= 7)  return 4;
  if (dayNumber <= 30) return 3;
  if (dayNumber <= 90) return 1;
  return 0;
}

// ── Main export ────────────────────────────────────────────────────────────────

function gradeSubmission(text, dayData = {}) {
  const slot = dayData?.slot || 'Concept Day';
  const dayNumber = dayData?.dayNumber || 1;

  // Too short
  if (!text || text.trim().split(/\s+/).filter(Boolean).length < 8) {
    return {
      dims: { persuasion: 0, evidence: 0, policyKnowledge: 0, diplomaticRegister: 0, voiceDelivery: 0 },
      totalScore: 0,
      stars: 1,
      feedback: 'Your submission is too short. Please write at least 3–4 sentences to get graded.',
      unlocked: false,
    };
  }

  const cfg = SLOT_LENIENCY[slot] || SLOT_LENIENCY['Concept Day'];
  const { lenient, maxes, unlockAt } = cfg;

  const persuasion       = normalise(countMatches(text, PERSUASION_MARKERS),       maxes[0], lenient);
  const evidence         = normalise(countMatches(text, EVIDENCE_MARKERS),         maxes[1], lenient);
  const policyKnowledge  = normalise(countMatches(text, POLICY_KNOWLEDGE_MARKERS), maxes[2], lenient);
  const diplomaticRegister = normalise(countMatches(text, DIPLOMATIC_REGISTER_MARKERS), maxes[3], lenient);
  const voiceDelivery    = scoreVoiceDelivery(text, lenient);

  const dims = { persuasion, evidence, policyKnowledge, diplomaticRegister, voiceDelivery };

  // Raw total + early day bonus
  const rawTotal   = persuasion + evidence + policyKnowledge + diplomaticRegister + voiceDelivery;
  const bonus      = earlyDayBonus(dayNumber);
  const totalScore = Math.min(25, rawTotal + bonus);

  // Stars: 1 star per 5 points, min 1
  const stars = Math.max(1, Math.min(5, Math.ceil(totalScore / 5)));

  // Feedback
  const weakDims = Object.entries(dims)
    .filter(([, v]) => v < 3)
    .sort(([, a], [, b]) => a - b) // weakest first
    .map(([k]) => k);

  const feedbackMap = {
    persuasion: slot === 'Concept Day'
      ? 'Add a few connecting words (because, therefore, so) to link your ideas.'
      : 'Strengthen your conclusion — add a clear call to action or a rhetorical question.',
    evidence: slot === 'Concept Day'
      ? 'Add at least one fact, example, or number (e.g. "Earth has 7 continents and 5 oceans").'
      : 'Back your claims with numbers, dates, or a UN resolution reference.',
    policyKnowledge: slot === 'Concept Day'
      ? 'Mention key topic words — e.g. continents, oceans, the blue dot, or UN.'
      : 'Use MUN vocabulary — mention a UN organ, resolution, or procedure term.',
    diplomaticRegister: slot === 'Concept Day'
      ? 'Try to write in full sentences with a clear introduction and conclusion.'
      : 'Use formal language — "This delegation urges…" or "The committee notes…"',
    voiceDelivery: 'Write a bit more — aim for at least 6 complete sentences.',
  };

  const feedbackLines = weakDims.length > 0
    ? weakDims.slice(0, 2).map(d => `• ${feedbackMap[d]}`).join('\n')
    : '✨ Excellent work! You covered all dimensions well. Keep this up tomorrow.';

  const starLabel = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][stars];
  const unlocked  = stars >= unlockAt;

  const feedback = unlocked
    ? `${starLabel} Well done! You scored ${totalScore}/25.\n${feedbackLines}`
    : `${starLabel} You scored ${totalScore}/25. Coach hint:\n${feedbackLines}`;

  return { dims, totalScore, stars, feedback, unlocked };
}

module.exports = { gradeSubmission };
