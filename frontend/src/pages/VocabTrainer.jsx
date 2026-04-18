import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, ChevronLeft, RotateCcw, Check, X, Trophy, Zap, Star, Lock } from 'lucide-react';
import { VOCAB_CATEGORIES, generateQuiz } from '../data/vocabCards';

const STORAGE_KEY = 'vocab_progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

export default function VocabTrainer({ user }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(loadProgress);
  const [selected, setSelected] = useState(null);   // category id
  const [mode, setMode] = useState('grid');          // 'grid' | 'cards' | 'quiz' | 'result'
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [tokensAwarded, setTokensAwarded] = useState(null);

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);
  const accent = isJunior ? '#7c3aed' : '#FF6B00';

  const cat = VOCAB_CATEGORIES.find(c => c.id === selected);

  /* ── Start category ── */
  const startCards = (catId) => {
    setSelected(catId);
    setCardIdx(0);
    setFlipped(false);
    setMode('cards');
  };

  const startQuiz = () => {
    const q = generateQuiz(cat);
    setQuiz(q);
    setQuizIdx(0);
    setAnswers([]);
    setChosen(null);
    setMode('quiz');
  };

  const handleAnswer = (opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === quiz[quizIdx].correct;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (quizIdx + 1 < quiz.length) {
        setQuizIdx(i => i + 1);
        setChosen(null);
      } else {
        finishQuiz(newAnswers);
      }
    }, 900);
  };

  const finishQuiz = async (finalAnswers) => {
    const score = finalAnswers.filter(Boolean).length;
    const catId = selected;
    const prev = loadProgress();
    const wasFirst = !prev[catId];
    const tokens = score === 5 ? 75 : score >= 3 ? 30 : 0;

    if (tokens > 0) {
      try {
        await fetch('/api/claim-vocab-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user.studentId, tokensEarned: tokens }),
        });
      } catch {}
    }

    const newProg = { ...prev, [catId]: { bestScore: Math.max(prev[catId]?.bestScore || 0, score), attempts: (prev[catId]?.attempts || 0) + 1 } };
    saveProgress(newProg);
    setProgress(newProg);
    setTokensAwarded(tokens);
    setMode('result');
  };

  /* ── Grid ── */
  if (mode === 'grid') {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} color={accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 900, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>Vocab Trainer</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Master 60 essential debate terms across 6 categories.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,280px),1fr))', gap: '1rem' }}>
          {VOCAB_CATEGORIES.map(cat => {
            const p = progress[cat.id];
            const best = p?.bestScore ?? null;
            const mastered = best === 5;
            return (
              <div key={cat.id} onClick={() => startCards(cat.id)} className="glass-card"
                style={{ padding: '1.5rem', cursor: 'pointer', border: mastered ? `1px solid ${cat.color}50` : '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `${cat.color}05`, opacity: mastered ? 1 : 0, transition: 'opacity 0.3s' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cat.color}15`, border: `1px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color={cat.color} />
                  </div>
                  {mastered && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#10b98115', border: '1px solid #10b98140', borderRadius: 99, padding: '0.2rem 0.6rem' }}>
                      <Check size={12} color="#10b981" />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>MASTERED</span>
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{cat.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{cat.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cat.cards.length} cards</span>
                  {best !== null && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cat.color }}>Best: {best}/5</span>
                  )}
                </div>
                <div style={{ marginTop: '0.75rem', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: cat.color, width: `${best !== null ? (best / 5) * 100 : 0}%`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall progress */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Trophy size={20} color="#eab308" />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {Object.values(progress).filter(p => p?.bestScore === 5).length} / {VOCAB_CATEGORIES.length} categories mastered
          </span>
        </div>
      </div>
    );
  }

  /* ── Flashcards ── */
  if (mode === 'cards' && cat) {
    const card = cat.cards[cardIdx];
    return (
      <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setMode('grid')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back
          </button>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{cat.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Card {cardIdx + 1} of {cat.cards.length}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '2rem' }}>
          <div style={{ height: '100%', background: cat.color, borderRadius: 99, width: `${((cardIdx + 1) / cat.cards.length) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* Card */}
        <div onClick={() => setFlipped(f => !f)} style={{ cursor: 'pointer', perspective: 1000, height: 280, marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s ease', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            {/* Front */}
            <div className="glass-card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', border: `1px solid ${cat.color}30` }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Term</div>
              <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '1rem' }}>{card.term}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tap to reveal definition</div>
            </div>
            {/* Back */}
            <div className="glass-card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', border: `1px solid ${cat.color}40`, background: `linear-gradient(135deg, ${cat.color}08, transparent)` }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Definition</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>{card.definition}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>{card.example}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false); }}
            disabled={cardIdx === 0}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.75rem 1.25rem', cursor: 'pointer', color: cardIdx === 0 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            <ChevronLeft size={16} /> Prev
          </button>
          {cardIdx < cat.cards.length - 1 ? (
            <button onClick={() => { setCardIdx(i => i + 1); setFlipped(false); }}
              style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40`, borderRadius: 12, padding: '0.75rem 1.5rem', cursor: 'pointer', color: cat.color, fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={startQuiz}
              style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`, border: 'none', borderRadius: 12, padding: '0.75rem 1.5rem', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: `0 0 20px ${cat.color}40` }}>
              Take Quiz <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Quiz ── */
  if (mode === 'quiz' && cat) {
    const q = quiz[quizIdx];
    if (!q) return null;
    return (
      <div className="animate-fade-in" style={{ maxWidth: 580, margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{cat.name} Quiz</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Q{quizIdx + 1} / {quiz.length}</div>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: '2rem' }}>
          <div style={{ height: '100%', background: cat.color, borderRadius: 99, width: `${((quizIdx + 1) / quiz.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center', border: `1px solid ${cat.color}20` }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Which term matches this definition?</div>
          <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 600 }}>{q.definition}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {q.options.map(opt => {
            let bg = 'rgba(255,255,255,0.04)';
            let border = '1px solid rgba(255,255,255,0.08)';
            let color = 'var(--text-primary)';
            if (chosen) {
              if (opt === q.correct) { bg = '#10b98115'; border = '1px solid #10b98140'; color = '#10b981'; }
              else if (opt === chosen && opt !== q.correct) { bg = '#ef444415'; border = '1px solid #ef444440'; color = '#ef4444'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)}
                style={{ background: bg, border, borderRadius: 14, padding: '1rem 1.25rem', cursor: chosen ? 'default' : 'pointer', color, fontWeight: 700, fontSize: '0.95rem', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {opt}
                {chosen && opt === q.correct && <Check size={18} color="#10b981" />}
                {chosen && opt === chosen && opt !== q.correct && <X size={18} color="#ef4444" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Result ── */
  if (mode === 'result' && cat) {
    const score = answers.filter(Boolean).length;
    const pct = (score / quiz.length) * 100;
    const col = score === 5 ? '#10b981' : score >= 3 ? '#f59e0b' : '#ef4444';
    return (
      <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', border: `1px solid ${col}30`, background: `linear-gradient(135deg, ${col}06, transparent)` }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${col}15`, border: `2px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            {score === 5 ? <Trophy size={36} color={col} /> : score >= 3 ? <Star size={36} color={col} /> : <RotateCcw size={36} color={col} />}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: col, lineHeight: 1, marginBottom: '0.25rem' }}>{score} / {quiz.length}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {score === 5 ? 'Perfect score! Category mastered.' : score >= 3 ? 'Good work! Try again to master it.' : 'Keep studying — you\'ve got this.'}
          </div>
          {tokensAwarded > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 99, padding: '0.5rem 1.25rem', marginBottom: '1.5rem' }}>
              <Zap size={16} color="#eab308" />
              <span style={{ fontWeight: 800, color: '#eab308', fontSize: '0.9rem' }}>+{tokensAwarded} GForce Tokens earned</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setMode('cards'); setCardIdx(0); setFlipped(false); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.75rem 1.25rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              Review Cards
            </button>
            <button onClick={startQuiz}
              style={{ background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: 12, padding: '0.75rem 1.25rem', cursor: 'pointer', color: accent, fontWeight: 700, fontSize: '0.875rem' }}>
              Retry Quiz
            </button>
            <button onClick={() => setMode('grid')}
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none', borderRadius: 12, padding: '0.75rem 1.25rem', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
              All Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
