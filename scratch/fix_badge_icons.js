const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Step 1: Update Lucide imports to include all needed badge icons
const oldImport = `import { Play, Users, Trophy, TrendingUp, BarChart2, Star, Zap, Award, Clock, MessageSquare, Mic } from 'lucide-react';`;
const newImport = `import { Play, Users, Trophy, TrendingUp, BarChart2, Star, Zap, Award, Clock, MessageSquare, Mic,
  Flame, Shield, Crown, Sparkles, Target, Heart, Cpu, Sword, BookOpen, FileText, Medal,
  Gem, RefreshCw, Dumbbell, MessageCircle, Brain } from 'lucide-react';`;

if (c.includes(oldImport)) {
  c = c.replace(oldImport, newImport);
  console.log('Imports updated');
} else {
  console.log('Import line not found');
}

// Step 2: Replace the ALL_BADGES icon emojis with Lucide component references
// We'll store iconComponent name as a string key, then render via a lookup
const oldCatalog = `  const ALL_BADGES = [
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
  const earnedSet = new Set((stats.badges || []).map(b => b.id || b));`;

const newCatalog = `  // Badge icon component lookup — NO emojis, only Lucide icons
  const BADGE_ICON_MAP = {
    first_debate:     (p) => <Flame {...p} />,
    ten_debates:      (p) => <Dumbbell {...p} />,
    fifty_debates:    (p) => <Shield {...p} />,
    hundred_debates:  (p) => <Crown {...p} />,
    score_8_plus:     (p) => <Star {...p} />,
    score_9_plus:     (p) => <Sparkles {...p} />,
    all_above_5:      (p) => <Target {...p} />,
    all_above_7:      (p) => <Gem {...p} />,
    perfect_respect:  (p) => <Heart {...p} />,
    argument_master:  (p) => <Brain {...p} />,
    rebuttal_master:  (p) => <Sword {...p} />,
    fluency_master:   (p) => <Mic {...p} />,
    evidence_master:  (p) => <BookOpen {...p} />,
    persuasion_master:(p) => <MessageSquare {...p} />,
    streak_3:         (p) => <Flame {...p} />,
    streak_5:         (p) => <Zap {...p} />,
    streak_10:        (p) => <Trophy {...p} />,
    big_improvement:  (p) => <TrendingUp {...p} />,
    words_10k:        (p) => <MessageCircle {...p} />,
    words_50k:        (p) => <FileText {...p} />,
    elo_1200:         (p) => <Medal {...p} />,
    elo_1500:         (p) => <Award {...p} />,
    elo_1800:         (p) => <Star {...p} />,
    elo_2000:         (p) => <Gem {...p} />,
    elo_2200:         (p) => <Crown {...p} />,
  };
  const ALL_BADGES = [
    { id: 'first_debate',     name: 'First Flame',    desc: 'Complete your first debate',            cat: 'Debates', color: '#f97316' },
    { id: 'ten_debates',      name: 'Contender',      desc: 'Complete 10 debates',                   cat: 'Debates', color: '#f97316' },
    { id: 'fifty_debates',    name: 'Gladiator',      desc: 'Complete 50 debates',                   cat: 'Debates', color: '#ef4444' },
    { id: 'hundred_debates',  name: 'Conqueror',      desc: 'Complete 100 debates',                  cat: 'Debates', color: '#eab308' },
    { id: 'score_8_plus',     name: 'Sharp Mind',     desc: 'Score 8.0+ in a debate',                cat: 'Quality', color: '#facc15' },
    { id: 'score_9_plus',     name: 'Elite Debater',  desc: 'Score 9.0+ in a debate',                cat: 'Quality', color: '#a855f7' },
    { id: 'all_above_5',      name: 'All-Rounder',    desc: 'Score 5+ across all categories',        cat: 'Quality', color: '#06b6d4' },
    { id: 'all_above_7',      name: 'Diamond Mind',   desc: 'Score 7+ across all categories',        cat: 'Quality', color: '#8b5cf6' },
    { id: 'perfect_respect',  name: 'Diplomat',       desc: 'Score 10/10 in Respectfulness',         cat: 'Skills',  color: '#10b981' },
    { id: 'argument_master',  name: 'The Arguer',     desc: 'Score 9+ in Argument Quality',          cat: 'Skills',  color: '#6366f1' },
    { id: 'rebuttal_master',  name: 'Rebuttal King',  desc: 'Score 9+ in Rebuttal & Engagement',     cat: 'Skills',  color: '#ef4444' },
    { id: 'fluency_master',   name: 'Orator',         desc: 'Score 9+ in Speech Fluency',            cat: 'Skills',  color: '#f59e0b' },
    { id: 'evidence_master',  name: 'Scholar',        desc: 'Score 9+ in Knowledge & Evidence',      cat: 'Skills',  color: '#0ea5e9' },
    { id: 'persuasion_master',name: 'Persuader',      desc: 'Score 9+ in Persuasiveness',            cat: 'Skills',  color: '#d946ef' },
    { id: 'streak_3',         name: 'On a Roll',      desc: 'Debate 3 days in a row',                cat: 'Streaks', color: '#f97316' },
    { id: 'streak_5',         name: 'Fire Streak',    desc: 'Debate 5 days in a row',                cat: 'Streaks', color: '#ef4444' },
    { id: 'streak_10',        name: 'Unstoppable',    desc: 'Debate 10 days in a row',               cat: 'Streaks', color: '#eab308' },
    { id: 'big_improvement',  name: 'Rising Star',    desc: 'Improve score 2+ pts in a row',         cat: 'Growth',  color: '#10b981' },
    { id: 'words_10k',        name: 'Wordsmith',      desc: 'Speak 10,000+ words total',             cat: 'Growth',  color: '#06b6d4' },
    { id: 'words_50k',        name: 'Grand Orator',   desc: 'Speak 50,000+ words total',             cat: 'Growth',  color: '#8b5cf6' },
    { id: 'elo_1200',         name: 'Bronze Mind',    desc: 'Reach 1,200 Gforce Tokens',             cat: 'Tokens',  color: '#cd7f32' },
    { id: 'elo_1500',         name: 'Silver Tongue',  desc: 'Reach 1,500 Gforce Tokens',             cat: 'Tokens',  color: '#94a3b8' },
    { id: 'elo_1800',         name: 'Gold Debater',   desc: 'Reach 1,800 Gforce Tokens',             cat: 'Tokens',  color: '#eab308' },
    { id: 'elo_2000',         name: 'Sapphire Elite', desc: 'Reach 2,000 Gforce Tokens',             cat: 'Tokens',  color: '#38bdf8' },
    { id: 'elo_2200',         name: 'Amethyst',       desc: 'Reach 2,200 Gforce Tokens',             cat: 'Tokens',  color: '#a855f7' },
  ];
  const earnedSet = new Set((stats.badges || []).map(b => b.id || b));`;

if (c.includes(oldCatalog)) {
  c = c.replace(oldCatalog, newCatalog);
  console.log('Catalog replaced with Lucide icons');
} else {
  console.log('Catalog not found, searching for partial...');
  const idx = c.indexOf("const ALL_BADGES = [");
  console.log('ALL_BADGES at:', idx);
}

// Step 3: Update badge rendering - replace emoji span with Lucide icon component
const oldIconRender = `<span style={{ fontSize: '1.75rem', filter: earned ? 'none' : 'grayscale(100%)' }}>{badge.icon}</span>`;
const newIconRender = `<div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: earned ? badge.color + '22' : 'rgba(255,255,255,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: earned ? '1px solid ' + badge.color + '55' : '1px solid rgba(255,255,255,0.08)',
                          }}>
                            {BADGE_ICON_MAP[badge.id]?.({ size: 18, color: earned ? badge.color : '#475569', strokeWidth: 2 })}
                          </div>`;

if (c.includes(oldIconRender)) {
  c = c.replace(oldIconRender, newIconRender);
  console.log('Icon render updated');
} else {
  console.log('Icon render not found');
}

// Step 4: Remove the lock emoji, replace with a lock icon (SVG inline)
const oldLock = `{!earned && <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>🔒</span>}`;
const newLock = `{!earned && <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>—</div>}`;

if (c.includes(oldLock)) {
  c = c.replace(oldLock, newLock);
  console.log('Lock updated');
} else {
  console.log('Lock not found');
}

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', c);
console.log('Done. Conqueror:', c.includes('Conqueror'), '| Brain:', c.includes('<Brain'));
