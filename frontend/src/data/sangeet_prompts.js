// Indian note frequencies (Sa = C4 = 261.63 Hz, standard concert pitch)
const SA = 261.63, RE = 293.66, GA = 329.63;
const MA = 349.23, MA_T = 370.00, PA = 392.00;
const DHA = 440.00, NI = 493.88, SA2 = 523.25;
const NI_K = 466.16; // komal Ni

// ── Stage & Grade Metadata ──────────────────────────────────────────────────
export const STAGE_MAP = {
  G1:  { stage: 1, name: 'LISTEN', color: '#10b981', desc: 'The Ear Awakens' },
  G2:  { stage: 1, name: 'LISTEN', color: '#10b981', desc: 'The Ear Awakens' },
  G3:  { stage: 1, name: 'LISTEN', color: '#10b981', desc: 'The Ear Awakens' },
  G4:  { stage: 2, name: 'SOUND',  color: '#3b82f6', desc: 'Voice & Pattern' },
  G5:  { stage: 2, name: 'SOUND',  color: '#3b82f6', desc: 'Voice & Pattern' },
  G6:  { stage: 2, name: 'SOUND',  color: '#3b82f6', desc: 'Voice & Pattern' },
  G7:  { stage: 3, name: 'SPEAK',  color: '#a855f7', desc: 'Repertoire & Expression' },
  G8:  { stage: 3, name: 'SPEAK',  color: '#a855f7', desc: 'Repertoire & Expression' },
  G9:  { stage: 3, name: 'SPEAK',  color: '#a855f7', desc: 'Repertoire & Expression' },
  G10: { stage: 4, name: 'CREATE', color: '#f59e0b', desc: 'The Composer Track' },
  G11: { stage: 4, name: 'CREATE', color: '#f59e0b', desc: 'The Composer Track' },
  G12: { stage: 4, name: 'CREATE', color: '#f59e0b', desc: 'The Composer Track' },
};

// ── Grade tolerance bands ───────────────────────────────────────────────────
export const TOLERANCE = {
  G1:  { pitchCents: 50, rhythmMs: 150 },
  G2:  { pitchCents: 50, rhythmMs: 150 },
  G3:  { pitchCents: 50, rhythmMs: 150 },
  G4:  { pitchCents: 35, rhythmMs: 100 },
  G5:  { pitchCents: 35, rhythmMs: 100 },
  G6:  { pitchCents: 35, rhythmMs: 100 },
  G7:  { pitchCents: 25, rhythmMs: 80  },
  G8:  { pitchCents: 25, rhythmMs: 80  },
  G9:  { pitchCents: 25, rhythmMs: 80  },
  G10: { pitchCents: 15, rhythmMs: 50  },
  G11: { pitchCents: 15, rhythmMs: 50  },
  G12: { pitchCents: 15, rhythmMs: 50  },
};

// ── Grade scoring weights ───────────────────────────────────────────────────
export const GRADE_WEIGHTS = {
  G1:  { pitch: 0.5, rhythm: 0.5, expression: 0   },
  G2:  { pitch: 0.5, rhythm: 0.5, expression: 0   },
  G3:  { pitch: 0.5, rhythm: 0.5, expression: 0   },
  G4:  { pitch: 0.5, rhythm: 0.5, expression: 0   },
  G5:  { pitch: 0.5, rhythm: 0.5, expression: 0   },
  G6:  { pitch: 0.5, rhythm: 0.5, expression: 0   },
  G7:  { pitch: 0.4, rhythm: 0.3, expression: 0.3 },
  G8:  { pitch: 0.4, rhythm: 0.3, expression: 0.3 },
  G9:  { pitch: 0.4, rhythm: 0.3, expression: 0.3 },
  G10: { pitch: 0.3, rhythm: 0.2, expression: 0.5 },
  G11: { pitch: 0.3, rhythm: 0.2, expression: 0.5 },
  G12: { pitch: 0.3, rhythm: 0.2, expression: 0.5 },
};

// ── Prompt banks per grade ──────────────────────────────────────────────────
export const PROMPTS = {
  G1: [
    {
      type: 'pitch_match',
      task: 'Hum or sing this note: Sa',
      instruction: 'Press Record, then hum "Sa" (like "Do" in Do-Re-Mi). Hold the note for 3 seconds.',
      targetHz: SA, targetNote: 'Sa', duration: 6,
    },
    {
      type: 'pitch_match',
      task: 'Sing a HIGH sound, then a LOW sound',
      instruction: 'First sing something high-pitched, then drop your voice down to something low.',
      targetHz: null, targetNote: null, duration: 8,
    },
    {
      type: 'rhythm_clap',
      task: 'Clap this pattern: ▪ ▪ _ ▪  (3 claps — skip beat 3)',
      instruction: 'Clap on 1, 2, then skip 3, then clap 4. Repeat this 3 times at a steady pace.',
      targetHz: null, targetNote: null, duration: 12,
    },
  ],
  G2: [
    {
      type: 'pitch_match',
      task: 'Hum Sa for 2 seconds, then hum Pa (Do → Sol)',
      instruction: 'Hold Sa for 2 seconds, then jump your voice up to Pa for 2 seconds.',
      targetHz: PA, targetNote: 'Sa → Pa', duration: 8,
    },
    {
      type: 'rhythm_clap',
      task: 'Clap a 3-beat waltz: ▪ ▪ ▪  (1-2-3, repeat)',
      instruction: 'Clap every beat of a 3-beat cycle. Keep it steady and even. Repeat 4 times.',
      targetHz: null, targetNote: null, duration: 12,
    },
    {
      type: 'pitch_match',
      task: 'Make a short, low "dum" sound like a tabla drum',
      instruction: 'Hum a low, short, resonant sound — like a tabla drum stroke.',
      targetHz: null, targetNote: null, duration: 6,
    },
  ],
  G3: [
    {
      type: 'pitch_match',
      task: 'Sing Sa - Re - Ga (Do - Re - Mi)',
      instruction: 'Sing each note clearly and hold it for 1.5 seconds: Sa... Re... Ga...',
      targetHz: SA, targetNote: 'Sa Re Ga', duration: 10,
    },
    {
      type: 'rhythm_clap',
      task: 'Clap 4/4: ▪ _ ▪ ▪  (clap 1, skip 2, clap 3 and 4)',
      instruction: 'Clap on beats 1, 3, and 4. Skip beat 2. Repeat 4 times.',
      targetHz: null, targetNote: null, duration: 12,
    },
    {
      type: 'pitch_match',
      task: 'Glide your voice slowly from Sa (low) all the way up to Sa\' (high)',
      instruction: 'Start at a comfortable low pitch and slowly, smoothly slide your voice up to a higher pitch.',
      targetHz: SA2, targetNote: 'Sa glide to Sa\'', duration: 8,
    },
  ],
  G4: [
    {
      type: 'sargam',
      task: 'Sing the full ascending sargam: Sa Re Ga Ma Pa Dha Ni Sa\'',
      instruction: 'Sing each of the 8 notes. Hold each note for about 1 second, clear and steady.',
      targetHz: SA, targetNote: 'Full Sargam ↑', duration: 15,
    },
    {
      type: 'interval',
      task: 'Sing Sa, pause, then jump to Ma (perfect fourth)',
      instruction: 'Sing Sa clearly, pause for a moment, then jump directly to Ma without sliding.',
      targetHz: MA, targetNote: 'Sa → Ma', duration: 8,
    },
    {
      type: 'rhythm_clap',
      task: 'Keep teentaal: 16-beat cycle — clap all 16 beats evenly at a slow tempo',
      instruction: 'Clap all 16 beats of teentaal steadily. Count 1-2-3-4 four times.',
      targetHz: null, targetNote: null, duration: 16,
    },
  ],
  G5: [
    {
      type: 'sargam',
      task: 'Sing Alankar #1: Sa Re Ga — Re Ga Ma — Ga Ma Pa',
      instruction: 'Sing this ascending 3-note grouping pattern. Slight pause between groups.',
      targetHz: SA, targetNote: 'Alankar 1', duration: 15,
    },
    {
      type: 'interval',
      task: 'Sing Sa, pause, then jump to Pa (perfect fifth)',
      instruction: 'Sing Sa, pause, then jump cleanly to Pa. No sliding — a direct jump.',
      targetHz: PA, targetNote: 'Sa → Pa', duration: 8,
    },
    {
      type: 'rhythm_clap',
      task: 'Adi tala: 8-beat cycle in 3+2+3 grouping',
      instruction: 'Clap 8 beats. Emphasize beats 1, 4, and 6 (the group starts). Repeat 2 times.',
      targetHz: null, targetNote: null, duration: 14,
    },
  ],
  G6: [
    {
      type: 'sargam',
      task: 'Sing Alankar #5: Sa Re Ga Ma, Re Ga Ma Pa, Ga Ma Pa Dha',
      instruction: 'Sing 4 notes per group, smoothly overlapping. Feel the flowing pattern.',
      targetHz: SA, targetNote: 'Alankar 5', duration: 16,
    },
    {
      type: 'sargam',
      task: 'Descend from Sa\' to Sa: Sa\' Ni Dha Pa Ma Ga Re Sa',
      instruction: 'Sing the full descending sargam. Each note clear and steady.',
      targetHz: SA2, targetNote: 'Sargam descending', duration: 15,
    },
    {
      type: 'interval',
      task: 'Sing Sa - Ga - Pa - Sa\' (arpeggiated tonic chord)',
      instruction: 'Jump between these 4 notes. Each jump should be clean — not a slide.',
      targetHz: SA, targetNote: 'Sa Ga Pa Sa\'', duration: 10,
    },
  ],
  G7: [
    {
      type: 'raga_phrase',
      task: 'Sing Yaman aroha: Ni Re Ga Ma# Pa Dha Ni Sa\'',
      instruction: 'Sing the ascending Yaman scale unhurriedly. Feel the evening, romantic mood of the raga.',
      targetHz: NI_K, targetNote: 'Yaman Aroha', duration: 20, raga: 'Yaman',
    },
    {
      type: 'raga_phrase',
      task: 'Sing Bilawal aroha: Sa Re Ga Ma Pa Dha Ni Sa\'',
      instruction: 'Sing the ascending Bilawal scale. Clean, bright, and unhurried.',
      targetHz: SA, targetNote: 'Bilawal Aroha', duration: 18, raga: 'Bilawal',
    },
    {
      type: 'expression',
      task: 'Sing Sa, then slide smoothly to Pa (meend)',
      instruction: 'Start on Sa. Slowly and continuously glide your voice up to Pa — no jumping, pure legato.',
      targetHz: PA, targetNote: 'Meend Sa→Pa', duration: 12, raga: 'Any',
    },
  ],
  G8: [
    {
      type: 'raga_phrase',
      task: 'Sing Bhairav aroha: Sa Re♭ Ga Ma Pa Dha♭ Ni Sa\'',
      instruction: 'Re and Dha are komal (flat). Sing with a grave, devotional morning mood.',
      targetHz: SA, targetNote: 'Bhairav Aroha', duration: 20, raga: 'Bhairav',
    },
    {
      type: 'raga_phrase',
      task: 'Sing Yaman pakad: Ni Re Ga Re (characteristic phrase)',
      instruction: 'Sing this short characteristic Yaman phrase. Linger slightly on the Ga.',
      targetHz: NI_K, targetNote: 'Yaman Pakad', duration: 12, raga: 'Yaman',
    },
    {
      type: 'expression',
      task: 'Sing Sa → Pa with vibrato on Pa, then return to Sa',
      instruction: 'Glide to Pa, add a gentle vibrato (even wobble) on Pa for 3 seconds, then resolve back to Sa.',
      targetHz: PA, targetNote: 'Sa Pa (vibrato) Sa', duration: 15, raga: 'Any',
    },
  ],
  G9: [
    {
      type: 'raga_phrase',
      task: 'Sing the bandish mukhda: "Eri mana laa go" in Yaman',
      instruction: 'Sing this opening phrase of a Yaman bandish with feeling and proper tonal placement.',
      targetHz: NI_K, targetNote: 'Yaman Bandish', duration: 20, raga: 'Yaman',
    },
    {
      type: 'expression',
      task: 'Sing Pa - Ma# - Ga in Yaman with kan-swar (grace notes before each note)',
      instruction: 'Add a subtle, quick grace note just before each of the three main notes.',
      targetHz: PA, targetNote: 'Yaman + Kan-Swar', duration: 15, raga: 'Yaman',
    },
    {
      type: 'composition_phrase',
      task: 'Improvise a short phrase using only Sa Re Ga Ma of Bilawal',
      instruction: 'Create your own 4–6 note musical idea using just those four notes. Be creative!',
      targetHz: null, targetNote: 'Bilawal improvisation', duration: 20, raga: 'Bilawal',
    },
  ],
  G10: [
    {
      type: 'improvise',
      task: 'Freely improvise for 20 seconds in Yaman raga',
      instruction: 'Use only Yaman notes. Move freely — alap style, no fixed beat. Focus on mood and flow.',
      targetHz: null, targetNote: 'Yaman improvisation', duration: 25, raga: 'Yaman',
    },
    {
      type: 'improvise',
      task: 'Compose and sing a short 2-bar melody in C major scale',
      instruction: 'Create an original melody in C major. Your rhythm and direction — just make it musical.',
      targetHz: null, targetNote: 'C major original', duration: 20, raga: 'C major',
    },
    {
      type: 'expression',
      task: 'Sing a Bhairav phrase using meend, vibrato, and dynamic variation',
      instruction: 'Use smooth slides (meend), steady vibrato, and vary your volume (soft → loud → soft).',
      targetHz: SA, targetNote: 'Bhairav full expression', duration: 25, raga: 'Bhairav',
    },
  ],
  G11: [
    {
      type: 'improvise',
      task: 'Sing a 15-second alap in Yaman — no rhythm, pure melodic exploration',
      instruction: 'Explore Yaman raga very slowly and expressively. No beat. Let each phrase breathe.',
      targetHz: null, targetNote: 'Yaman alap', duration: 20, raga: 'Yaman',
    },
    {
      type: 'composition_phrase',
      task: 'Compose and sing an original mukhda (opening phrase) in any raga',
      instruction: 'State your raga first, then sing your own composed 4-line phrase. Originality is key.',
      targetHz: null, targetNote: 'Original mukhda', duration: 30, raga: 'Student choice',
    },
    {
      type: 'expression',
      task: 'Sing "Sa Pa Sa" three times: first peaceful, then sad, then joyful',
      instruction: 'Same 3 notes, three emotional characters. Change your tone, breath, and attack each time.',
      targetHz: SA, targetNote: 'Sa Pa Sa × 3 moods', duration: 20, raga: 'Any',
    },
  ],
  G12: [
    {
      type: 'improvise',
      task: 'Perform: alap in your chosen raga (15s) + a composed bandish phrase (15s)',
      instruction: 'Name your raga. First: free alap (15s). Then: a composed/rehearsed bandish phrase (15s).',
      targetHz: null, targetNote: 'Alap + Bandish', duration: 35, raga: 'Student choice',
    },
    {
      type: 'composition_phrase',
      task: 'Compose and perform an original sthayi (main section) in any raga',
      instruction: 'All artistic choices are yours. State your raga and perform your composed sthayi.',
      targetHz: null, targetNote: 'Original sthayi', duration: 30, raga: 'Any',
    },
    {
      type: 'expression',
      task: 'Demonstrate gamak, meend, and vibrato clearly in a single phrase',
      instruction: 'Sing a 15-second phrase that unmistakably showcases all three ornaments in sequence.',
      targetHz: null, targetNote: 'Gamak + Meend + Vibrato', duration: 20, raga: 'Any',
    },
  ],
};
