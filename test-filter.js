const JUNIOR_MODES = [
  { id: 'debate', title: 'Debate Practice' },
  { id: 'mock-un', title: 'Model UN', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'persona', title: 'Famous Figures', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'supertutor', title: 'Super Tutor' },
  { id: 'speech-coach', title: 'Speech Coach', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'speech-analysis', title: 'Speech Analysis', levels: ['Level 3', 'Level 4', 'Level 5'] },
];

const normalizedLevel = "Level 1";
const isBasicLevel = true;

const availableModes = JUNIOR_MODES.filter(m => {
  if (isBasicLevel && (m.id === 'supertutor' || m.id === 'speech-coach')) return false;
  if (m.levels) return m.levels.includes(normalizedLevel);
  if (m.accessKey) return normalizedLevel === m.accessKey;
  return true;
});

console.log(availableModes.map(m => m.id));
