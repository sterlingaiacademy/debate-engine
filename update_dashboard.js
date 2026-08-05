const fs = require('fs');

const dashboardPath = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

const rawTilesPath = 'raw_tiles2.txt';
const rawTiles = fs.readFileSync(rawTilesPath, 'utf8');

// 1. Add Flag to imports
content = content.replace(
  'Brain, Globe, Users, ChevronRight, Cpu, Radio, CheckCircle2',
  'Brain, Globe, Users, ChevronRight, Cpu, Radio, CheckCircle2, Flag'
);

// 2. Extract sections
const eventTilesStart = content.indexOf('{/* ── Event Tiles ── */}');
const modeCardsStart = content.indexOf('{/* ── Mode Cards ── */}');
const quickStatsStart = content.indexOf('{/* ── Quick Stats (Minimized) ── */}');

if (eventTilesStart === -1 || modeCardsStart === -1 || quickStatsStart === -1) {
  console.error('Could not find sections');
  process.exit(1);
}

const beforeEventTiles = content.substring(0, eventTilesStart);
const modeCardsSection = content.substring(modeCardsStart, quickStatsStart);
const afterQuickStats = content.substring(quickStatsStart);

// The user wants Mode Cards at top, then Event Tiles at bottom (before Quick Stats? Or after Quick Stats?)
// Usually, it's Mode Cards, then Event Tiles, then Quick Stats, then Charts, then Badges.
// Let's place Event Tiles right after Mode Cards.

const newContent = beforeEventTiles +
  modeCardsSection +
  '      {/* ── Event Tiles ── */}\n' +
  rawTiles + '\n\n      ' +
  afterQuickStats;

fs.writeFileSync(dashboardPath, newContent);
console.log('Successfully updated Dashboard.jsx');
