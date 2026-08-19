const JUNIOR_MODES = [
  { id: 'debate', title: 'Debate Practice' },
  { id: 'mock-un', title: 'Model UN', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'persona', title: 'Famous Figures', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'supertutor', title: 'Super Tutor' },
  { id: 'speech-coach', title: 'Speech Coach', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'speech-analysis', title: 'Speech Analysis', levels: ['Level 3', 'Level 4', 'Level 5'] },
];
const SENIOR_MODES = [];

const getNormalizedLevel = (cls) => {
  if (!cls) return 'Level 1';
  if (cls.startsWith('Level ')) return cls;
  if (['KG', 'kg', 'Class 1', 'Class 2', 'Class KG', 'KG-2', 'Class 1-3', 'Class 1-5'].includes(cls)) return 'Level 1';
  if (['Class 3', 'Class 4', 'Class 5', 'Class 3-5'].includes(cls)) return 'Level 2';
  if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
  if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
  if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
  return 'Level 5';
};

const testValues = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg', 'Professional', 'College Student', undefined, null, '', 'Random'];

for (const val of testValues) {
  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2','Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(val);
  const normalizedLevel = getNormalizedLevel(val);
  const isBasicLevel = ['Level 1', 'Level 2'].includes(normalizedLevel);
  const modes = isJunior ? JUNIOR_MODES : SENIOR_MODES;
  const availableModes = modes.filter(m => {
    if (isBasicLevel && (m.id === 'supertutor' || m.id === 'speech-coach')) return false;
    if (m.levels) return m.levels.includes(normalizedLevel);
    if (m.accessKey) return normalizedLevel === m.accessKey;
    return true;
  });
  
  if (isJunior && availableModes.length > 1) {
    console.log(`BINGO! val: ${val} produces isJunior=true and ${availableModes.length} modes!`);
  }
}
console.log("Done testing.");
