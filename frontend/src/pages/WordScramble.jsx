import { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Trophy, RotateCcw, Lightbulb, Check, X, Shuffle } from 'lucide-react';

// ── Word banks ──────────────────────────────────────────────────────
const SENIOR_WORDS = [
  { word: 'REBUTTAL',    definition: 'A counterargument that directly responds to the opposing side\'s point', hint: 'What you say when you disagree with a point just made' },
  { word: 'FALLACY',     definition: 'An error in reasoning that makes an argument logically invalid', hint: 'A mistake in logic — like blaming a person instead of their argument' },
  { word: 'RHETORIC',    definition: 'The art of using language effectively and persuasively', hint: 'The skill of speaking that makes audiences believe you' },
  { word: 'PREMISE',     definition: 'A statement that forms the foundation of an argument', hint: 'The starting point of your reasoning chain' },
  { word: 'EVIDENCE',    definition: 'Facts or information used to support a claim in a debate', hint: 'Proof — statistics, studies, examples — that backs up your point' },
  { word: 'CONCESSION',  definition: 'Acknowledging a valid point made by the opponent before countering it', hint: 'Giving the other side some credit before you counter them' },
  { word: 'ETHOS',       definition: 'An appeal to the speaker\'s credibility and trustworthiness', hint: 'Why the audience should trust the person speaking' },
  { word: 'PATHOS',      definition: 'An appeal to the audience\'s emotions to persuade them', hint: 'Making the audience feel something — sadness, fear, hope' },
  { word: 'LOGOS',       definition: 'An appeal to logic and reason using data and evidence', hint: 'Persuading through facts and rational argument' },
  { word: 'ANALOGY',     definition: 'A comparison between two different things to explain a concept', hint: 'Like saying: "Arguing without evidence is like building without a foundation"' },
  { word: 'ANAPHORA',    definition: 'Repeating a word or phrase at the start of successive clauses', hint: '"I have a dream... I have a dream... I have a dream"' },
  { word: 'REFUTE',      definition: 'To prove that an argument or statement is wrong or false', hint: 'Showing the opponent\'s point does not hold up' },
  { word: 'ANTITHESIS',  definition: 'Placing two contrasting ideas directly next to each other', hint: '"Ask not what your country can do for you, ask what you can do..."' },
  { word: 'ASSERTION',   definition: 'A confident claim made as fact, without requiring full proof', hint: 'Stating something confidently as your position' },
  { word: 'SYLLOGISM',   definition: 'Logical reasoning: if two premises are true, the conclusion follows', hint: 'All men are mortal. Socrates is a man. Therefore...' },
  { word: 'PERSUADE',    definition: 'To cause someone to believe something through argument or reasoning', hint: 'The ultimate goal of every debater' },
  { word: 'HYPERBOLE',   definition: 'Deliberate exaggeration used for emphasis or dramatic effect', hint: '"I\'ve told you a million times to check your sources"' },
  { word: 'COGENT',      definition: 'Clear, logical, and convincing — describes a very strong argument', hint: 'The highest compliment for an argument' },
  { word: 'SIGNPOST',    definition: 'A phrase that tells the audience what you are about to argue', hint: '"My first point is..." or "In conclusion..." are examples' },
  { word: 'VERDICT',     definition: 'The final decision or judgment delivered after a debate', hint: 'The judge\'s final call on who won' },
];

const JUNIOR_WORDS = [
  { word: 'DEBATE',   definition: 'A structured discussion where two sides argue different views', hint: 'A formal argument between two teams' },
  { word: 'ARGUE',    definition: 'To give reasons for or against something in a discussion', hint: 'What you do when you disagree and explain why' },
  { word: 'REASON',   definition: 'An explanation for why you believe something is true', hint: 'Why you think your point is right' },
  { word: 'PROOF',    definition: 'Evidence that shows something is definitely true', hint: 'Facts that show your point is correct' },
  { word: 'JUDGE',    definition: 'A person who listens and decides who wins the debate', hint: 'The person who gives the final score' },
  { word: 'TOPIC',    definition: 'The subject or question being discussed in a debate', hint: 'What the debate is all about' },
  { word: 'AGREE',    definition: 'To have the same opinion as someone else', hint: 'When you think the same thing as another person' },
  { word: 'LISTEN',   definition: 'To pay careful attention to what the other person is saying', hint: 'Something good debaters always do' },
  { word: 'OPINION',  definition: 'A personal view or belief that is not necessarily a fact', hint: 'What YOU think about a topic' },
  { word: 'SPEECH',   definition: 'A formal talk given in front of an audience', hint: 'Standing up and talking to many people' },
  { word: 'FACTS',    definition: 'Information that is true and can be checked and proven', hint: 'Real, provable information — not just opinions' },
  { word: 'CLAIM',    definition: 'A statement that you say is true and will argue for', hint: 'Something you confidently state as true' },
  { word: 'LOGIC',    definition: 'Thinking in a clear, sensible, and ordered way', hint: 'Using your brain carefully and clearly' },
  { word: 'REFUTE',   definition: 'To show that someone else\'s argument or claim is wrong', hint: 'Proving the other team is wrong' },
  { word: 'MOTION',   definition: 'The statement that the debate is about — one side argues for it', hint: 'The exact sentence being debated' },
  { word: 'POINT',    definition: 'A single clear idea that supports your argument', hint: 'One thing you want the audience to remember' },
];

// ── Helpers ────────────────────────────────────────────────────────
function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  // Make sure it's different from the original
  if (result === word && word.length > 1) return scrambleWord(word);
  return result;
}

function pickRounds(isJunior, n = 8) {
  const pool = [...(isJunior ? JUNIOR_WORDS : SENIOR_WORDS)];
  return pool.sort(() => Math.random() - 0.5).slice(0, Math.min(n, pool.length));
}

const TOTAL_ROUNDS = 8;

// ── GameBoard subcomponent (remounted on reset via key prop) ────────
function GameBoard({ user, isJunior, accent, onReset }) {
  const [rounds]          = useState(() => pickRounds(isJunior, TOTAL_ROUNDS));
  const [roundIdx, setRoundIdx]   = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [usedTiles, setUsedTiles] = useState([]);
  const [selected, setSelected]   = useState([]); // [{tileIdx, char}]
  const [showHint, setShowHint]   = useState(false);
  const [hintUsed, setHintUsed]   = useState(false);
  const [lives, setLives]         = useState(3);
  const [score, setScore]         = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase]         = useState('playing'); // 'playing'|'correct'|'wrong'|'done'
  const [tokensAwarded, setTokensAwarded] = useState(null);
  // Store latest score/correctCount in refs so goNext can read them synchronously
  const scoreRef    = useRef(0);
  const correctRef  = useRef(0);

  const current = rounds[roundIdx];

  // ── Init round ──────────────────────────────────────────────────
  useEffect(() => {
    if (!current) return;
    const s = scrambleWord(current.word);
    setScrambled(s);
    setUsedTiles(new Array(current.word.length).fill(false));
    setSelected([]);
    setShowHint(false);
    setHintUsed(false);
    setPhase('playing');
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-check when all tiles placed ───────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || !current) return;
    if (selected.length !== current.word.length) return;

    const guess = selected.map(s => s.char).join('');
    if (guess === current.word) {
      const pts = hintUsed ? 5 : 10;
      const newScore = score + pts;
      const newCorrect = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
      scoreRef.current   = newScore;
      correctRef.current = newCorrect;
      setPhase('correct');
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setPhase('wrong');
    }
  }, [selected.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tile interaction ────────────────────────────────────────────
  const clickTile = (i) => {
    if (phase !== 'playing' || usedTiles[i]) return;
    const newUsed = [...usedTiles];
    newUsed[i] = true;
    setUsedTiles(newUsed);
    setSelected(prev => [...prev, { tileIdx: i, char: scrambled[i] }]);
  };

  const clearSelection = () => {
    if (phase !== 'playing') return;
    setUsedTiles(new Array(current.word.length).fill(false));
    setSelected([]);
  };

  // ── Next round or end game ──────────────────────────────────────
  const goNext = () => {
    const isLast     = roundIdx >= TOTAL_ROUNDS - 1;
    const isGameOver = lives <= 0; // lives was already decremented before this call

    if (isLast || isGameOver) {
      // End game — use refs for the latest values
      const finalTokens = Math.max(1, Math.floor(scoreRef.current / 2));
      setTokensAwarded(finalTokens);
      setPhase('done');
      fetch('/api/claim-vocab-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.studentId, tokensEarned: finalTokens }),
      }).catch(() => {});
    } else {
      setRoundIdx(r => r + 1);
    }
  };

  // ── Done screen ─────────────────────────────────────────────────
  if (phase === 'done') {
    const pct = Math.round((correctRef.current / TOTAL_ROUNDS) * 100);
    const resultColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    const message = pct >= 75
      ? 'Excellent! You know your debate vocabulary.'
      : pct >= 50
      ? 'Good work — keep practising to master more terms.'
      : 'Keep going — vocabulary improves with every game.';

    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', border: `1px solid ${resultColor}25` }}>
          <div style={{ fontSize: '4.5rem', fontWeight: 900, color: resultColor, lineHeight: 1, marginBottom: '0.25rem' }}>
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

          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {message}
          </div>

          <button onClick={onReset} style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            border: 'none', borderRadius: 14, padding: '0.875rem 2rem',
            cursor: 'pointer', color: '#fff', fontWeight: 800, fontSize: '1rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: `0 0 24px ${accent}40`,
          }}>
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  // ── Playing screen ──────────────────────────────────────────────
  const slotLetters = current
    ? current.word.split('').map((_, i) => selected[i]?.char || null)
    : [];

  const isCorrect = phase === 'correct';
  const isWrong   = phase === 'wrong';
  const slotColor = isCorrect ? '#10b981' : isWrong ? '#ef4444' : accent;
  const slotBg    = isCorrect ? 'rgba(16,185,129,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : `${accent}15`;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* HUD row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        {/* Lives */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[1, 2, 3].map(n => (
            <Heart key={n} size={22}
              fill={n <= lives ? '#ef4444' : 'transparent'}
              color={n <= lives ? '#ef4444' : 'rgba(255,255,255,0.15)'}
              style={{ transition: 'all 0.3s' }} />
          ))}
        </div>
        {/* Round */}
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
          Word {roundIdx + 1} of {TOTAL_ROUNDS}
        </div>
        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: accent, fontSize: '0.95rem' }}>
          <Trophy size={16} color={accent} /> {score} pts
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '1.75rem' }}>
        <div style={{ height: '100%', background: accent, borderRadius: 99, width: `${(roundIdx / TOTAL_ROUNDS) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Definition card */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', border: `1px solid ${accent}20` }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Unscramble the word that matches this definition
        </div>
        <div style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 600 }}>
          {current?.definition}
        </div>
        {showHint && (
          <div style={{ marginTop: '0.875rem', padding: '0.6rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, fontSize: '0.84rem', color: '#f59e0b', fontStyle: 'italic', fontWeight: 600 }}>
            Hint: {current?.hint}
          </div>
        )}
      </div>

      {/* Answer slots */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {slotLetters.map((char, i) => (
          <div key={i} style={{
            width: 46, height: 54, borderRadius: 12,
            background: char ? slotBg : 'rgba(255,255,255,0.04)',
            border: `2px solid ${char ? slotColor + '80' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 900,
            color: char ? slotColor : 'transparent',
            fontFamily: 'monospace',
            transition: 'all 0.2s',
          }}>
            {char || ''}
          </div>
        ))}
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
            ? <><Check size={18} color="#10b981" /><span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>Correct! +{hintUsed ? 5 : 10} pts</span></>
            : <><X size={18} color="#ef4444" /><span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>The word was: <strong style={{ letterSpacing: '0.05em' }}>{current?.word}</strong></span></>
          }
        </div>
      )}

      {/* Scrambled tiles */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {scrambled.split('').map((char, i) => (
            <button key={i} onClick={() => clickTile(i)} disabled={usedTiles[i]}
              style={{
                width: 46, height: 54, borderRadius: 12,
                background: usedTiles[i] ? 'rgba(255,255,255,0.02)' : `${accent}12`,
                border: `2px solid ${usedTiles[i] ? 'rgba(255,255,255,0.04)' : accent + '45'}`,
                color: usedTiles[i] ? 'transparent' : accent,
                fontSize: '1.4rem', fontWeight: 900,
                cursor: usedTiles[i] ? 'default' : 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'monospace',
                transform: usedTiles[i] ? 'scale(0.9)' : 'scale(1)',
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
          <>
            <button onClick={clearSelection} disabled={selected.length === 0}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.875rem',
                cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                color: selected.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s',
              }}>
              <RotateCcw size={15} /> Clear
            </button>
            {!showHint && (
              <button onClick={() => { setShowHint(true); setHintUsed(true); }}
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12,
                  padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer', color: '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                <Lightbulb size={15} /> Hint  (-5 pts)
              </button>
            )}
          </>
        )}

        {(isCorrect || isWrong) && (
          <button onClick={goNext}
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              border: 'none', borderRadius: 12,
              padding: '0.75rem 2rem', fontWeight: 800, fontSize: '0.95rem',
              cursor: 'pointer', color: '#fff',
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
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: 520, margin: '0 auto 2rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shuffle size={24} color={accent} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 900, margin: '0 0 0.15rem', letterSpacing: '-0.02em' }}>Word Scramble</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Unscramble the debate term from its definition. 8 words, 3 lives.
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
