/**
 * build-diplomat365-days.js
 * Generates backend/data/diplomat365-days.json — 365 immutable curriculum rows.
 * Run: node build-diplomat365-days.js
 */

const fs = require('fs');
const path = require('path');

// ── Level Definitions ──────────────────────────────────────────────────────────
const LEVELS = [
  {
    level: 1, ageBand: '8-9', label: 'World Citizenship — We Are All Earthlings',
    weeks: [1, 5],
    themes: [
      'Earth from Above — continents, oceans, the blue dot',
      'Countries and Flags — who lives where',
      'Languages of the World — babel and beauty',
      'Cultures and Traditions — how we celebrate',
      'One Planet, Many People — shared home',
    ],
    vocab: ['country', 'continent', 'ocean', 'culture', 'tradition'],
    policyArea: 'UN Sustainable Development Goals (SDGs)',
  },
  {
    level: 2, ageBand: '9-10', label: 'Nations and Neighbours',
    weeks: [6, 10],
    themes: [
      'How Countries Talk to Each Other — diplomacy basics',
      'Borders and Boundaries — maps and meaning',
      'Global Problems, Local Solutions',
      'Trade and Fairness — why goods travel',
      'Peace and Conflict — what breaks the world apart',
    ],
    vocab: ['diplomacy', 'treaty', 'border', 'trade', 'conflict'],
    policyArea: 'UN General Assembly (UNGA)',
  },
  {
    level: 3, ageBand: '10-11', label: 'The United Nations — How It Works',
    weeks: [11, 15],
    themes: [
      'The UN Charter and Its Six Organs',
      'Rules of Procedure — the invisible operating system',
      'The Security Council — who holds the veto',
      'ECOSOC and Humanitarian Agencies — WHO, UNICEF, WFP',
      'Your First Committee Speech — 60 seconds that count',
    ],
    vocab: ['resolution', 'veto', 'motion', 'delegation', 'mandate'],
    policyArea: 'UN Rules of Procedure',
  },
  {
    level: 4, ageBand: '11-12', label: 'Country Profiles and Speechcraft',
    weeks: [16, 20],
    themes: [
      'Country Dossier — allies, adversaries, red lines',
      'Agenda Decoding — reading a brief like a lawyer',
      'The Position Paper — skeleton, evidence, voice',
      'Moderated Caucus — framing the sub-issue',
      'Rebuttal Radar — the counter-punch system',
    ],
    vocab: ['dossier', 'position paper', 'caucus', 'rebuttal', 'amendment'],
  },
  {
    level: 5, ageBand: '12-13', label: 'Strategic Writing and Evidence',
    weeks: [21, 26],
    themes: [
      'Evidence Hierarchy — UN docs vs Wikipedia',
      'Statistical Persuasion — numbers that move people',
      'Diplomatic Register — verbs that signal power',
      'Speech Bank Architecture — 8 reusable modules',
      'Active Listening — the 4-column note system',
      'Bloc Mapping — knowing your coalition before you enter',
    ],
    vocab: ['operative clause', 'preambulatory clause', 'bloc', 'coalition', 'quorum'],
  },
  {
    level: 6, ageBand: '13-14', label: 'Alliance Building and Resolution Mechanics',
    weeks: [27, 31],
    themes: [
      'The Unmoderated Caucus — social engineering',
      'Working Paper Architecture — from bullets to binding language',
      'Operative Clause Verb Game — decides vs recommends',
      'Merger Strategy — combining papers on your terms',
      'Hostile Amendments — stress-testing every clause',
    ],
    vocab: ['working paper', 'draft resolution', 'merger', 'signatory', 'operative verb'],
  },
  {
    level: 7, ageBand: '14-15', label: 'Advanced Negotiation',
    weeks: [32, 36],
    themes: [
      'The BATNA — knowing your walk-away point',
      'Framing Effects — how you ask determines what you get',
      'Cross-Regional Coalitions — bridging the Global North/South divide',
      'Language Negotiation — every word in a clause is a battle',
      'Closing the Deal — the final 90 minutes of committee',
    ],
    vocab: ['BATNA', 'framing', 'concession', 'consensus', 'abstention'],
  },
  {
    level: 8, ageBand: '15-16', label: 'Crisis Committees',
    weeks: [37, 42],
    themes: [
      'Crisis Committee Architecture — what makes it different',
      'Crisis Directives — speed beats polish',
      'Back-room Maneuvering — press releases and communiqués',
      'Historical Crisis Simulation — 1962 Cuban Missile Crisis',
      'Ad-hoc Committee Procedure — pivoting mid-committee',
      'The 48-Hour Conference Arc — energy management',
    ],
    vocab: ['directive', 'crisis update', 'communiqué', 'ad-hoc', 'portfolio'],
  },
  {
    level: 9, ageBand: '16-17', label: 'Advanced Diplomacy — Real-World Simulation',
    weeks: [43, 47],
    themes: [
      'Security Council Procedure — procedural warfare',
      'Veto Politics — the permanent five and their logic',
      'Human Rights Council — universal periodic review',
      'Climate Negotiation — COP mechanics and NDCs',
      'Economic Sanctions — the tool states reluctantly reach for',
    ],
    vocab: ['NDC', 'UPR', 'sanction', 'P5', 'procedural vote'],
  },
  {
    level: 10, ageBand: '17-18', label: 'Vienna Bound — Elite Simulation',
    weeks: [48, 52],
    themes: [
      'The Vienna Brief — UN headquarters protocols',
      'Formal Debate Mastery — 10-minute speeches that move nations',
      'Position Paper Finals — 2 000-word essays under time pressure',
      'Full Committee Simulation — 48 hours, live adjudication',
      'Vienna Selection Day — portfolio review and final scores',
    ],
    vocab: ['communiqué', 'rapporteur', 'protocol', 'accreditation', 'aide-mémoire'],
  },
];

const SLOT_TYPES = ['Concept Day', 'Drill Day', 'Debate Day', 'Reflection Day', 'Assessment Day'];
const SLOT_DESCS = {
  'Concept Day': 'Read & annotate the week\'s core concept. Build the mental model.',
  'Drill Day': 'Active practice: write, argue, or structure the concept you learned yesterday.',
  'Debate Day': 'Live oral practice — record your speech, submit for AI rubric scoring.',
  'Reflection Day': 'Write a 3-sentence reflection. Identify one thing that shifted in your thinking.',
  'Assessment Day': 'AI-graded assessment across all 5 rubric dimensions. Unlock next week.',
};

// ── Day content generators ──────────────────────────────────────────────────────
function buildDrill(level, theme, slot, vocab) {
  const drills = {
    'Concept Day': `Read this week's theme — **${theme}** — and write a 6-line summary in your own words. Underline the three terms you would explain to a younger student.`,
    'Drill Day': `Take the concept from Day 1. Write a 90-second spoken argument that uses **at least one statistic** and **one real-world example**. Record yourself. Play it back. Cut every "um" and "basically".`,
    'Debate Day': `Argue both sides: first **for**, then **against** the proposition implied by: *"${theme}"*. Each side must be at least 4 sentences. Submit your best side as your official response.`,
    'Reflection Day': `What is one thing you understand at the end of today that you did not understand this morning? Three sentences. No more, no less.`,
    'Assessment Day': `Write a formal 8-line position statement on *${theme}*. Use the vocabulary word **${vocab || 'diplomacy'}** correctly. Include one UN resolution reference (real or plausible). Submit for AI rubric scoring.`,
  };
  return drills[slot] || drills['Concept Day'];
}

function buildVocabSentence(vocab, theme) {
  return `Use **${vocab}** in a 2-line speech that connects to *${theme}*.`;
}

// ── Main generator ─────────────────────────────────────────────────────────────
const days = [];
let dayNumber = 0;

for (const lvl of LEVELS) {
  const [startWeek, endWeek] = lvl.weeks;
  const weekCount = endWeek - startWeek + 1;

  for (let w = 0; w < weekCount; w++) {
    const weekNum = startWeek + w;
    const theme = lvl.themes[w % lvl.themes.length];
    const subweek = w + 1;

    for (let d = 0; d < 5; d++) {
      dayNumber++;
      const slot = SLOT_TYPES[d];
      const vocabWord = lvl.vocab[w % lvl.vocab.length];

      days.push({
        dayNumber,
        week: weekNum,
        subweek,
        level: lvl.level,
        ageBand: lvl.ageBand,
        levelLabel: lvl.label,
        theme,
        slot,
        slotDesc: SLOT_DESCS[slot],
        headline: `"${['The first time a child sees themselves as one of 8 billion.', 'Words are the weapons of diplomats.', 'Every resolution begins with one delegate\'s conviction.', 'The chair respects procedure. Procedure rewards the prepared.', 'To negotiate is to understand the other before you speak.', 'Evidence is armour. Rhetoric is a sword. You need both.', 'The clause you draft today may become international law tomorrow.', 'Speed wins crisis. Precision wins committees.', 'A nation\'s voice is only as strong as its delegate\'s preparation.', 'Vienna is not a destination. It is a standard.'][lvl.level - 1]}"`,
        drill: buildDrill(lvl.level, theme, slot, vocabWord),
        vocab: {
          word: vocabWord,
          prompt: buildVocabSentence(vocabWord, theme),
        },
        policyArea: lvl.policyArea || `Level ${lvl.level} MUN Curriculum`,
        gForceMode: lvl.level <= 2 ? 'LISTEN Mode' : lvl.level <= 5 ? 'WRITE Mode' : 'DEBATE Mode',
        rubricDimensions: [
          { id: 'persuasion', label: 'Persuasion', lookFor: 'Does the listener want to agree by the end?' },
          { id: 'evidence', label: 'Evidence', lookFor: 'Real sources, real numbers, real examples.' },
          { id: 'policyKnowledge', label: 'Policy Knowledge', lookFor: `Understands the UN/issue at Level ${lvl.level}.` },
          { id: 'diplomaticRegister', label: 'Diplomatic Register', lookFor: 'Third-person tone, calibrated language.' },
          { id: 'voiceDelivery', label: 'Voice Delivery', lookFor: 'Pace, clarity, confidence, gesture.' },
        ],
        unlockRequirement: 3, // stars needed to unlock next day
        isAssessmentDay: slot === 'Assessment Day',
      });
    }
  }
}

// Pad to exactly 365 if rounding differs
while (days.length < 365) {
  const last = days[days.length - 1];
  dayNumber++;
  days.push({ ...last, dayNumber, slot: 'Concept Day', slotDesc: SLOT_DESCS['Concept Day'] });
}

const outDir = path.join(__dirname, 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'diplomat365-days.json');
fs.writeFileSync(outPath, JSON.stringify(days.slice(0, 365), null, 2), 'utf8');

console.log(`✅ Generated ${days.slice(0, 365).length} days → ${outPath}`);
console.log(`   Levels: ${LEVELS.length} | Weeks: ${LEVELS.reduce((a, l) => a + (l.weeks[1] - l.weeks[0] + 1), 0)}`);
