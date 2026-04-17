const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Remove any existing ALL_BADGES definition first
if (c.includes('const ALL_BADGES')) {
  const start = c.indexOf('\n  // Full badge catalog');
  const end = c.indexOf('\n  const earnedIds', start) + 1;
  if (start > 0 && end > start) {
    c = c.substring(0, start) + c.substring(end);
    console.log('Removed old catalog');
  }
}

// Insert badge catalog before "  return (" in Dashboard component
const badgeCatalog = `
  // Full badge catalog — mirrors backend leaderboard.py award() calls
  const ALL_BADGES = [
    { id: 'first_debate',     icon: '\\uD83D\\uDD25', name: 'First Flame',     desc: 'Complete your first debate',            cat: 'Debates', color: '#f97316' },
    { id: 'ten_debates',      icon: '\\uD83D\\uDCAA', name: 'Contender',       desc: 'Complete 10 debates',                   cat: 'Debates', color: '#f97316' },
    { id: 'fifty_debates',    icon: '\\u2694\\uFE0F', name: 'Gladiator',       desc: 'Complete 50 debates',                   cat: 'Debates', color: '#ef4444' },
    { id: 'hundred_debates',  icon: '\\uD83D\\uDC51', name: 'Conqueror',       desc: 'Complete 100 debates',                  cat: 'Debates', color: '#eab308' },
    { id: 'score_8_plus',     icon: '\\u2B50',        name: 'Sharp Mind',      desc: 'Score 8.0+ in a single debate',         cat: 'Quality', color: '#facc15' },
    { id: 'score_9_plus',     icon: '\\uD83C\\uDF1F', name: 'Elite Debater',   desc: 'Score 9.0+ in a single debate',         cat: 'Quality', color: '#a855f7' },
    { id: 'all_above_5',      icon: '\\uD83C\\uDFAF', name: 'All-Rounder',     desc: 'Score 5+ across all categories',        cat: 'Quality', color: '#06b6d4' },
    { id: 'all_above_7',      icon: '\\uD83D\\uDC8E', name: 'Diamond Mind',    desc: 'Score 7+ across all categories',        cat: 'Quality', color: '#8b5cf6' },
    { id: 'perfect_respect',  icon: '\\uD83D\\uDD4A\\uFE0F', name: 'Diplomat', desc: 'Score 10/10 in Respectfulness',         cat: 'Skills',  color: '#10b981' },
    { id: 'argument_master',  icon: '\\uD83E\\uDDE0', name: 'The Arguer',      desc: 'Score 9+ in Argument Quality',          cat: 'Skills',  color: '#6366f1' },
    { id: 'rebuttal_master',  icon: '\\uD83D\\uDDE1\\uFE0F', name: 'Rebuttal King', desc: 'Score 9+ in Rebuttal & Engagement', cat: 'Skills', color: '#ef4444' },
    { id: 'fluency_master',   icon: '\\uD83C\\uDF99\\uFE0F', name: 'Orator',   desc: 'Score 9+ in Speech Fluency',           cat: 'Skills',  color: '#f59e0b' },
    { id: 'evidence_master',  icon: '\\uD83D\\uDCDA', name: 'Scholar',         desc: 'Score 9+ in Knowledge & Evidence',      cat: 'Skills',  color: '#0ea5e9' },
    { id: 'persuasion_master',icon: '\\uD83C\\uDFAD', name: 'Persuader',       desc: 'Score 9+ in Persuasiveness',            cat: 'Skills',  color: '#d946ef' },
    { id: 'streak_3',         icon: '\\uD83D\\uDD34', name: 'On a Roll',       desc: 'Debate 3 days in a row',                cat: 'Streaks', color: '#f97316' },
    { id: 'streak_5',         icon: '\\uD83D\\uDFE0', name: 'Fire Streak',     desc: 'Debate 5 days in a row',                cat: 'Streaks', color: '#ef4444' },
    { id: 'streak_10',        icon: '\\uD83C\\uDFC6', name: 'Unstoppable',     desc: 'Debate 10 days in a row',               cat: 'Streaks', color: '#eab308' },
    { id: 'big_improvement',  icon: '\\uD83D\\uDCC8', name: 'Rising Star',     desc: 'Improve score by 2+ points in a row',   cat: 'Growth',  color: '#10b981' },
    { id: 'words_10k',        icon: '\\uD83D\\uDCAC', name: 'Wordsmith',       desc: 'Speak 10,000+ words total',             cat: 'Growth',  color: '#06b6d4' },
    { id: 'words_50k',        icon: '\\uD83D\\uDCD6', name: 'Grand Orator',    desc: 'Speak 50,000+ words total',             cat: 'Growth',  color: '#8b5cf6' },
    { id: 'elo_1200',         icon: '\\uD83E\\uDD49', name: 'Bronze Mind',     desc: 'Reach 1,200 Gforce Tokens',             cat: 'Tokens',  color: '#b87333' },
    { id: 'elo_1500',         icon: '\\uD83E\\uDD48', name: 'Silver Tongue',   desc: 'Reach 1,500 Gforce Tokens',             cat: 'Tokens',  color: '#94a3b8' },
    { id: 'elo_1800',         icon: '\\uD83E\\uDD47', name: 'Gold Debater',    desc: 'Reach 1,800 Gforce Tokens',             cat: 'Tokens',  color: '#eab308' },
    { id: 'elo_2000',         icon: '\\uD83D\\uDCA0', name: 'Sapphire Elite',  desc: 'Reach 2,000 Gforce Tokens',             cat: 'Tokens',  color: '#38bdf8' },
    { id: 'elo_2200',         icon: '\\uD83D\\uDC9C', name: 'Amethyst',        desc: 'Reach 2,200 Gforce Tokens',             cat: 'Tokens',  color: '#a855f7' },
  ];
  const earnedSet = new Set((stats.badges || []).map(b => b.id || b));
`;

// Find the line just before "  return (" in component (after the CustomLineTooltip definition)
const insertPoint = '  const CustomLineTooltip';
const insertIdx = c.lastIndexOf(insertPoint);
if (insertIdx === -1) {
  console.log('Insert point not found, trying "return ("');
  const ri = c.lastIndexOf('  return (\n    <div className=');
  if (ri === -1) { console.log('ERROR: no insert point'); process.exit(1); }
  c = c.substring(0, ri) + badgeCatalog + c.substring(ri);
} else {
  c = c.substring(0, insertIdx) + badgeCatalog + '\n  ' + c.substring(insertIdx);
}

// Also fix the earnedIds -> earnedSet reference in badge wall
c = c.replace(/earnedIds\.size/g, 'earnedSet.size');
c = c.replace(/earnedIds\.has/g, 'earnedSet.has');

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);
console.log('Done');
console.log('Conqueror:', c.includes('Conqueror'));
console.log('hundred_debates:', c.includes('hundred_debates'));
console.log('earnedSet:', c.includes('earnedSet'));
