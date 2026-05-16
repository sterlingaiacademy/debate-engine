export const JUNIOR_CLASSES = [
  'Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG',
  'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg',
];

export const isJuniorUser = (user) => JUNIOR_CLASSES.includes(user?.classLevel);

export const SENIOR = {
  bg: '#000000',
  bgCard: '#0d0d0d',
  bgCardAlt: '#111111',
  surface: 'rgba(255,255,255,0.04)',
  surfaceBorder: 'rgba(255,255,255,0.08)',
  accent: '#FF6B00',
  accentLight: '#FF6B0020',
  accentBorder: '#FF6B0040',
  text: '#F1F5F9',
  textMuted: '#64748B',
  textSub: '#475569',
  purple: '#a855f7',
  cyan: '#00d4ff',
  green: '#10b981',
  danger: '#ef4444',
  gold: '#eab308',
  tabBar: '#0a0a0a',
  tabBarBorder: 'rgba(255,255,255,0.06)',
};

export const JUNIOR = {
  bg: '#faf5ff',
  bgGrad: ['#faf5ff', '#fff0f7', '#f0f9ff'],
  bgCard: '#ffffff',
  bgCardAlt: '#f8f4ff',
  surface: 'rgba(124,58,237,0.06)',
  surfaceBorder: 'rgba(124,58,237,0.12)',
  accent: '#7c3aed',
  accentLight: 'rgba(124,58,237,0.12)',
  accentBorder: 'rgba(124,58,237,0.25)',
  accentGrad: ['#7c3aed', '#a855f7'],
  text: '#1e1b4b',
  textMuted: '#7c3aed',
  textSub: '#a78bfa',
  pink: '#f43f5e',
  orange: '#f97316',
  green: '#10b981',
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(124,58,237,0.1)',
};

export function getTheme(user) {
  return isJuniorUser(user) ? JUNIOR : SENIOR;
}

export const TIER_COLORS = {
  Unranked: '#64748b',
  Bronze: '#cd7f32',
  Silver: '#94a3b8',
  Gold: '#f59e0b',
  Platinum: '#38bdf8',
  Diamond: '#818cf8',
  Master: '#f97316',
  Grandmaster: '#ec4899',
};
