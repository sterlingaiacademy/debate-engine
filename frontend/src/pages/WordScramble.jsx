import { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Trophy, RotateCcw, Check, X, Shuffle } from 'lucide-react';
import { API_BASE } from '../api';

// ── Word banks ──────────────────────────────────────────────────────
const SENIOR_WORDS = [
  { word: 'REBUTTAL',    definition: 'A counterargument that directly responds to the opposing side\'s point' },
  { word: 'FALLACY',     definition: 'An error in reasoning that makes an argument logically invalid' },
  { word: 'RHETORIC',    definition: 'The art of using language effectively and persuasively' },
  { word: 'PREMISE',     definition: 'A statement that forms the foundation of an argument' },
  { word: 'EVIDENCE',    definition: 'Facts or information used to support a claim in a debate' },
  { word: 'CONCESSION',  definition: 'Acknowledging a valid point made by the opponent before countering it' },
  { word: 'ETHOS',       definition: 'An appeal to the speaker\'s credibility and trustworthiness' },
  { word: 'PATHOS',      definition: 'An appeal to the audience\'s emotions to persuade them' },
  { word: 'LOGOS',       definition: 'An appeal to logic and reason using data and evidence' },
  { word: 'ANALOGY',     definition: 'A comparison between two different things to explain a concept' },
  { word: 'ANAPHORA',    definition: 'Repeating a word or phrase at the start of successive clauses for emphasis' },
  { word: 'REFUTE',      definition: 'To prove that an argument or statement is wrong or false' },
  { word: 'ASSERTION',   definition: 'A confident claim stated as fact, without requiring full proof' },
  { word: 'SYLLOGISM',   definition: 'If two premises are true, the conclusion must logically follow' },
  { word: 'PERSUADE',    definition: 'To cause someone to believe or do something through argument' },
  { word: 'HYPERBOLE',   definition: 'Deliberate exaggeration used for emphasis or dramatic effect' },
  { word: 'COGENT',      definition: 'Clear, logical, and convincing — describes a very strong argument' },
  { word: 'SIGNPOST',    definition: 'A phrase that tells the audience what you are about to argue' },
  { word: 'VERDICT',     definition: 'The final decision or judgment delivered at the end of a debate' },
  { word: 'ANTITHESIS',  definition: 'Placing two contrasting ideas directly next to each other for effect' },
];

const JUNIOR_WORDS = [
  { word: 'DEBATE',   definition: 'A structured discussion where two sides argue different views' },
  { word: 'ARGUE',    definition: 'To give reasons for or against something in a discussion' },
  { word: 'REASON',   definition: 'An explanation for why you believe something is true' },
  { word: 'PROOF',    definition: 'Evidence that shows something is definitely true' },
  { word: 'JUDGE',    definition: 'A person who listens and decides who wins the debate' },
  { word: 'TOPIC',    definition: 'The subject or question being discussed in a debate' },
  { word: 'LISTEN',   definition: 'To pay careful attention to what the other person is saying' },
  { word: 'OPINION',  definition: 'A personal view or belief that is not necessarily a fact' },
  { word: 'SPEECH',   definition: 'A formal talk given in front of an audience' },
  { word: 'CLAIM',    definition: 'A statement that you say is true and will argue for' },
  { word: 'LOGIC',    definition: 'Thinking in a clear, sensible, and ordered way' },
  { word: 'REFUTE',   definition: 'To show that someone else\'s argument or claim is wrong' },
  { word: 'MOTION',   definition: 'The statement that the debate is about — one side argues for it' },
  { word: 'POINT',    definition: 'A single clear idea that supports your argument' },
  { word: 'FACTS',    definition: 'Information that is true and can be checked and proven' },
  { word: 'AGREE',    definition: 'To have the same opinion as someone else about something' },
];

const TOTAL_ROUNDS = 8;

// ── Helpers ────────────────────────────────────────────────────────

/** Pick which letter positions to pre-reveal as hints */
function pickRevealPositions(word, isJunior) {
  const len = word.length;
  const positions = new Set();

  // Always reveal the first letter
  positions.add(0);

  if (isJunior) {
    // Junior: reveal every 3rd position → e.g. LISTEN → L _ _ T E _
    for (let i = 3; i < len; i += 3) positions.add(i);
    // Also reveal second-to-last letter for short words
    if (len >= 5) positions.add(len - 2);
  } else {
    // Senior: reveal every 4th position → e.g. CONCESSION → C _ _ _ E _ _ _ O _
    for (let i = 4; i < len; i += 4) positions.add(i);
  }

  return positions;
}

/** Shuffle array in place using Fisher-Yates */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Scramble unrevealed chars, ensuring result ≠ original order */
function scrambleTiles(chars) {
  if (chars.length <= 1) return [...chars];
  const result = shuffle(chars);
  // If shuffle produced same order by coincidence, swap first two
  if (result.join('') === chars.join('')) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

function pickRounds(isJunior, n = TOTAL_ROUNDS) {
  const pool = isJunior ? JUNIOR_WORDS : SENIOR_WORDS;
  return shuffle([...pool]).slice(0, Math.min(n, pool.length));
}

// ── GameBoard ──────────────────────────────────────────────────────
function GameBoard({ user, isJunior, accent, onReset }) {
  const [rounds]              = useState(() => pickRounds(isJunior));
  const [roundIdx, setRoundIdx] = useState(0);

  // slots: full word length array, pre-revealed positions filled, others null
  const [slots, setSlots]       = useState([]);
  // isRevealed: bool[] marking pre-given positions (they never change)
  const [isRevealed, setIsRevealed] = useState([]);
  // tiles: only the unrevealed chars, scrambled
  const [tiles, setTiles]       = useState([]);
  const [usedTiles, setUsedTiles] = useState([]);

  const [lives, setLives]               = useState(3);
  const [score, setScore]               = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase]               = useState('playing'); // playing|correct|wrong|done
  const [tokensAwarded, setTokensAwarded] = useState(null);

  // Refs to read final values synchronously in goNext
  const scoreRef   = useRef(0);
  const correctRef = useRef(0);
  const livesRef   = useRef(3);   // mirror of lives state for goNext
  const currentRef = useRef(rounds[0]);

  // ── Init round ──────────────────────────────────────────────────
  useEffect(() => {
    const current = rounds[roundIdx];
    if (!current) return;
    currentRef.current = current;

    const revealSet = pickRevealPositions(current.word, isJunior);

    const initSlots = current.word.split('').map((char, i) =>
      revealSet.has(i) ? char : null
    );
    const revealedBools = current.word.split('').map((_, i) => revealSet.has(i));
    const unrevealedChars = current.word.split('').filter((_, i) => !revealSet.has(i));
    const scrambledTiles  = scrambleTiles(unrevealedChars);

    setSlots(initSlots);
    setIsRevealed(revealedBools);
    setTiles(scrambledTiles);
    setUsedTiles(new Array(scrambledTiles.length).fill(false));
    setPhase('playing');
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-check when all slots are filled ───────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const current = currentRef.current;
    if (!current) return;
    // Guard: slots not yet initialized (empty array on first render)
    if (slots.length === 0 || slots.length !== current.word.length) return;
    if (slots.some(s => s === null)) return; // blanks still remaining

    const guess = slots.join('');
    if (guess === current.word) {
      const newScore   = score + 10;
      const newCorrect = correctCount + 1;
      scoreRef.current   = newScore;
      correctRef.current = newCorrect;
      setScore(newScore);
      setCorrectCount(newCorrect);
      setPhase('correct');
    } else {
      const newLives = lives - 1;
      livesRef.current = newLives;   // keep ref in sync before state update
      setLives(newLives);
      setPhase('wrong');
    }
  }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Interactions ────────────────────────────────────────────────
  const clickTile = (tileIdx) => {
    if (phase !== 'playing' || usedTiles[tileIdx]) return;

    // Find the leftmost empty (null) slot
    const nextEmpty = slots.findIndex(s => s === null);
    if (nextEmpty === -1) return;

    const newSlots = [...slots];
    newSlots[nextEmpty] = tiles[tileIdx];

    const newUsed = [...usedTiles];
    newUsed[tileIdx] = true;

    setSlots(newSlots);
    setUsedTiles(newUsed);
  };

  const clearSelection = () => {
    if (phase !== 'playing') return;
    // Reset to pre-revealed state only
    const current = currentRef.current;
    setSlots(current.word.split('').map((char, i) => isRevealed[i] ? char : null));
    setUsedTiles(new Array(tiles.length).fill(false));
  };

  const goNext = () => {
    const isLast     = roundIdx >= TOTAL_ROUNDS - 1;
    // Use ref — lives state may not have updated yet when goNext is called
    const isGameOver = livesRef.current <= 0;

    if (isLast || isGameOver) {
      const finalTokens = Math.max(1, Math.floor(scoreRef.current / 2));
      setTokensAwarded(finalTokens);
      setPhase('done');
      fetch("${API_BASE}/api/claim-vocab-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.studentId, tokensEarned: finalTokens }),
      }).catch(() => {});
    } else {
      // Set phase immediately to remove the Next button from DOM —
      // prevents double-click from calling setRoundIdx twice.
      // The init useEffect resets phase to 'playing' for the new round.
      setPhase('transitioning');
      setRoundIdx(r => r + 1);
    }
  };

  // ── Done screen ─────────────────────────────────────────────────
  if (phase === 'done') {
    const pct = Math.round((correctRef.current / TOTAL_ROUNDS) * 100);
    const col = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', border: `1px solid ${col}25` }}>
          <div style={{ fontSize: '4.5rem', fontWeight: 900, color: col, lineHeight: 1, marginBottom: '0.25rem' }}>
            {scoreRef.current}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>points</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {correctRef.current} / {TOTAL_ROUNDS} words correct
          </div>
          {tokensAwarded > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 99, padding: '0.5rem 1.25rem', marginBottom: '1.5rem' }}>
              <Zap size={16} color="#eab308" />
              <span style={{ fontWeight: 800, color: '#eab308' }}>+{tokensAwarded} GForce Tokens earned</span>
            </div>
          )}
          <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.6 }}>
            {pct >= 75 ? 'Excellent! You know your debate vocabulary.' : pct >= 50 ? 'Good work — keep practising to master more terms.' : 'Keep going — vocabulary improves with every game.'}
          </div>
          <button onClick={onReset} style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none',
            borderRadius: 14, padding: '0.875rem 2rem', cursor: 'pointer', color: '#fff',
            fontWeight: 800, fontSize: '1rem', display: 'inline-flex', alignItems: 'center',
            gap: '0.5rem', boxShadow: `0 0 24px ${accent}40`,
          }}>
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  // ── Playing screen ──────────────────────────────────────────────
  const current = currentRef.current;
  const isCorrect = phase === 'correct';
  const isWrong   = phase === 'wrong';

  // Guard: isRevealed may still be [] on very first render
  const userFilledCount = isRevealed.length > 0
    ? slots.filter((s, i) => s !== null && !isRevealed[i]).length
    : 0;
  const totalUserSlots  = isRevealed.length > 0
    ? slots.filter((_, i) => !isRevealed[i]).length
    : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[1, 2, 3].map(n => (
            <Heart key={n} size={22}
              fill={n <= lives ? '#ef4444' : 'transparent'}
              color={n <= lives ? '#ef4444' : 'rgba(255,255,255,0.15)'}
              style={{ transition: 'all 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Word {roundIdx + 1} of {TOTAL_ROUNDS}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: accent, fontSize: '0.95rem' }}>
          <Trophy size={16} color={accent} /> {score} pts
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '1.75rem' }}>
        <div style={{ height: '100%', background: accent, borderRadius: 99, width: `${(roundIdx / TOTAL_ROUNDS) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Definition */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center', border: `1px solid ${accent}20` }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Fill in the blanks — what debate term is this?
        </div>
        <div style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 600 }}>
          {current?.definition}
        </div>
      </div>

      {/* Answer slots */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {slots.map((char, i) => {
          const isPre = isRevealed[i];
          const isFilled = char !== null;

          let bg          = 'rgba(255,255,255,0.04)';
          let borderColor = 'rgba(255,255,255,0.1)';
          let textColor   = 'var(--text-primary)';
          let opacity     = 1;

          if (isPre && isFilled) {
            // Pre-revealed letter — shown in muted style
            bg          = 'rgba(255,255,255,0.06)';
            borderColor = 'rgba(255,255,255,0.18)';
            textColor   = 'rgba(255,255,255,0.5)';
          } else if (!isPre && isFilled) {
            // User-placed letter
            bg          = isCorrect ? 'rgba(16,185,129,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : `${accent}15`;
            borderColor = isCorrect ? '#10b981' : isWrong ? '#ef4444' : `${accent}60`;
            textColor   = isCorrect ? '#10b981' : isWrong ? '#ef4444' : accent;
          } else {
            // Empty user slot
            borderColor = isWrong ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)';
          }

          return (
            <div key={i} style={{
              width: 44, height: 52, borderRadius: 12,
              background: bg, border: `2px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', fontWeight: 900,
              color: textColor,
              fontFamily: 'monospace',
              transition: 'all 0.2s',
              opacity,
            }}>
              {char || ''}
            </div>
          );
        })}
      </div>

      {/* Small progress hint */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {userFilledCount} of {totalUserSlots} blanks filled
          {isRevealed.filter(Boolean).length > 0 && (
            <span style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.25)' }}>
              · grey letters are hints
            </span>
          )}
        </span>
      </div>

      {/* Feedback banner */}
      {(isCorrect || isWrong) && (
        <div className="animate-fade-in" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          marginBottom: '1.25rem', padding: '0.75rem 1.25rem', borderRadius: 12,
          background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isCorrect ? '#10b98130' : '#ef444430'}`,
        }}>
          {isCorrect
            ? <><Check size={18} color="#10b981" /><span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>Correct! +10 pts</span></>
            : <><X size={18} color="#ef4444" /><span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>The word was: <strong style={{ letterSpacing: '0.05em' }}>{current?.word}</strong></span></>
          }
        </div>
      )}

      {/* Scrambled tiles — only the unrevealed characters */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {tiles.map((char, i) => (
            <button key={i} onClick={() => clickTile(i)} disabled={usedTiles[i]}
              style={{
                width: 44, height: 52, borderRadius: 12,
                background: usedTiles[i] ? 'rgba(255,255,255,0.02)' : `${accent}12`,
                border: `2px solid ${usedTiles[i] ? 'rgba(255,255,255,0.04)' : accent + '50'}`,
                color: usedTiles[i] ? 'transparent' : `${accent}`,
                fontSize: '1.3rem', fontWeight: 900,
                cursor: usedTiles[i] ? 'default' : 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'monospace',
                transform: usedTiles[i] ? 'scale(0.88)' : 'scale(1)',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!usedTiles[i]) e.currentTarget.style.transform = 'scale(1.12)'; }}
              onMouseLeave={e => { if (!usedTiles[i]) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {usedTiles[i] ? '' : char}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {phase === 'playing' && (
          <button onClick={clearSelection} disabled={userFilledCount === 0}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
              padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
              cursor: userFilledCount > 0 ? 'pointer' : 'not-allowed',
              color: userFilledCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
            }}>
            <RotateCcw size={15} /> Clear
          </button>
        )}

        {(isCorrect || isWrong) && (
          <button onClick={goNext} style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            border: 'none', borderRadius: 12, padding: '0.75rem 2rem',
            fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', color: '#fff',
            boxShadow: `0 4px 16px ${accent}40`,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {roundIdx >= TOTAL_ROUNDS - 1 || lives <= 0 ? 'See Results' : 'Next Word'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Root export ─────────────────────────────────────────────────────
export default function WordScramble({ user }) {
  const [gameKey, setGameKey] = useState(0);

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);
  const accent = isJunior ? '#7c3aed' : '#FF6B00';

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: 520, margin: '0 auto 2rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shuffle size={24} color={accent} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 900, margin: '0 0 0.15rem', letterSpacing: '-0.02em' }}>Word Scramble</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Fill in the missing letters to complete the debate term. {isJunior ? 'More hints for you!' : '8 words, 3 lives.'}
          </p>
        </div>
      </div>

      <GameBoard
        key={gameKey}
        user={user}
        isJunior={isJunior}
        accent={accent}
        onReset={() => setGameKey(k => k + 1)}
      />
    </div>
  );
}
