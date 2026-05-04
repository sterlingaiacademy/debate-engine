import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Save, Trash2, Check, AlertCircle, Zap, BookOpen, Database, PenLine } from 'lucide-react';
import { API_BASE } from '../api';

/* ── PEEL scoring heuristics (rule-based, no AI) ── */
const EVIDENCE_KW  = ['according to','research shows','studies show','data','statistics','percent','%','survey','report','found that','published','example','instance','case','demonstrated','study','evidence','fact','experts'];
const LOGIC_KW     = ['therefore','because','since','hence','thus','consequently','as a result','this means','which leads','due to','owing to','implies','shows that','proves','demonstrates'];
const LINK_KW      = ['therefore','this shows','which means','in conclusion','thus','hence','consequently','this proves','this demonstrates','this is why','ultimately','this confirms'];
const HEDGE_KW     = ['maybe','perhaps','i think','i guess','sort of','kind of','probably','might','possibly','i feel','not sure','i suppose'];

function scoreText(text = '', kws, target = 5, deduct = []) {
  const t = text.toLowerCase();
  const hits = kws.filter(k => t.includes(k)).length;
  const pen = deduct.filter(k => t.includes(k)).length;
  const raw = Math.min(10, (hits / target) * 10 - pen * 1.5);
  return Math.max(0, Math.round(raw * 10) / 10);
}

function scoreArgument({ point = '', evidence = '', explain = '', link = '' }) {
  const wc = s => s.trim().split(/\s+/).filter(Boolean).length;
  const pointScore    = Math.min(10, (wc(point) >= 10 ? 7 : wc(point) >= 5 ? 5 : 2) + (LOGIC_KW.some(k => point.toLowerCase().includes(k)) ? 2 : 0));
  const evidenceScore = scoreText(evidence, EVIDENCE_KW, 2, HEDGE_KW);
  const explainScore  = Math.min(10, ((wc(explain) >= 25 ? 7 : wc(explain) >= 15 ? 5 : 2) + scoreText(explain, LOGIC_KW, 2)));
  const linkScore     = scoreText(link, LINK_KW, 1);
  return Math.round(((pointScore + evidenceScore + explainScore + linkScore) / 4) * 10) / 10;
}

function wordCount(s = '') { return s.trim().split(/\s+/).filter(Boolean).length; }

const STEPS = [
  {
    key: 'point',
    label: 'Point',
    abbr: 'P',
    color: '#FF6B00',
    title: 'State Your Claim',
    prompt: 'Write your main argument in 1–2 clear sentences. Start with "I argue that..." or "The evidence shows..."',
    minWords: 8,
    tips: ['Be direct — state exactly what you believe', 'Include WHY in one word (because, since)'],
    check: v => wordCount(v) >= 8,
    feedback: v => wordCount(v) < 8 ? `Too short — aim for at least 8 words (currently ${wordCount(v)})` : LOGIC_KW.some(k => v.toLowerCase().includes(k)) ? 'Strong claim with logical connector.' : 'Good — add a "because" or "since" to strengthen it.',
  },
  {
    key: 'evidence',
    label: 'Evidence',
    abbr: 'E',
    color: '#0ea5e9',
    title: 'Back It Up',
    prompt: 'Provide a statistic, study, example, or fact that supports your claim. Name your source if possible.',
    minWords: 10,
    tips: ['Use statistics with percentages for maximum impact', 'Name specific sources: "A 2023 UNESCO report found..."'],
    check: v => wordCount(v) >= 10 && EVIDENCE_KW.some(k => v.toLowerCase().includes(k)),
    feedback: v => wordCount(v) < 10 ? `Too short — add more detail (${wordCount(v)} words)` : !EVIDENCE_KW.some(k => v.toLowerCase().includes(k)) ? 'Add an evidence keyword: "according to", "research shows", "example"...' : 'Solid evidence — cite a specific source to make it even stronger.',
  },
  {
    key: 'explain',
    label: 'Explain',
    abbr: 'E',
    color: '#10b981',
    title: 'Connect the Dots',
    prompt: 'Explain WHY this evidence proves your point. Don\'t assume the connection is obvious — spell it out.',
    minWords: 15,
    tips: ['Use "this shows that..." or "this means that..."', 'Explain the cause-and-effect relationship'],
    check: v => wordCount(v) >= 15,
    feedback: v => wordCount(v) < 15 ? `Need more explanation (${wordCount(v)} words — aim for 15+)` : LOGIC_KW.some(k => v.toLowerCase().includes(k)) ? 'Well explained with logical connectors.' : 'Good — add "this shows" or "this means" to connect your evidence.',
  },
  {
    key: 'link',
    label: 'Link',
    abbr: 'L',
    color: '#8b5cf6',
    title: 'Circle Back',
    prompt: 'Link your argument back to the debate motion. Use "Therefore...", "This proves that..." or "Hence..."',
    minWords: 8,
    tips: ['Always end by restating your position', 'Remind the judge WHY this wins you the debate'],
    check: v => wordCount(v) >= 8 && LINK_KW.some(k => v.toLowerCase().includes(k)),
    feedback: v => wordCount(v) < 8 ? `Too short (${wordCount(v)} words)` : !LINK_KW.some(k => v.toLowerCase().includes(k)) ? 'Add a link word: "therefore", "this proves", "ultimately"...' : 'Perfect — your argument is complete.',
  },
];

export default function ArgumentBuilder({ user }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ point: '', evidence: '', explain: '', link: '', motion: '' });
  const [submitted, setSubmitted] = useState(false);
  const [savedArgs, setSavedArgs] = useState([]);
  const [loadingBank, setLoadingBank] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('builder'); // 'builder' | 'bank'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const textRef = useRef(null);

  const isJunior = ['Level 1','Level 2','Class 1-3','Class 3-5','KG','Class KG','KG-2',
    'Class 1-5','Class 1','Class 2','Class 3','Class 4','Class 5','kg'].includes(user?.classLevel);
  const accent = isJunior ? '#7c3aed' : '#FF6B00';

  const currentStep = STEPS[step];
  const currentVal  = values[currentStep?.key] || '';
  const score       = submitted ? scoreArgument(values) : null;
  const isValid     = currentStep?.check(currentVal);

  useEffect(() => { textRef.current?.focus(); }, [step]);
  useEffect(() => { fetchBank(); }, []);

  async function fetchBank() {
    try {
      const r = await fetch(`${API_BASE}/api/argument-bank/${user.studentId}`);
      const d = await r.json();
      setSavedArgs(d.arguments || []);
    } catch {}
    setLoadingBank(false);
  }

  async function saveArgument() {
    setSaving(true);
    const argScore = scoreArgument(values);
    try {
      const r = await fetch("${API_BASE}/api/argument-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.studentId, ...values, score: argScore }),
      });
      if (r.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchBank();
      }
    } catch {}
    setSaving(false);
  }

  async function deleteArgument(id) {
    try {
      await fetch(`${API_BASE}/api/argument-bank/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.studentId }),
      });
      setSavedArgs(a => a.filter(x => x.id !== id));
    } catch {}
  }

  const reset = () => { setStep(0); setValues({ point: '', evidence: '', explain: '', link: '', motion: '' }); setSubmitted(false); };

  /* ── ARGUMENT BANK VIEW ── */
  if (view === 'bank') {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 780, margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setView('builder')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Builder
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Argument Bank</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>{savedArgs.length} saved arguments</p>
          </div>
        </div>

        {loadingBank ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : savedArgs.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Database size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No saved arguments yet</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Build and save your first PEEL argument below.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedArgs.map((arg, i) => (
              <div key={arg.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', animation: `staggerIn 0.35s ${i * 50}ms both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    {arg.motion && <div style={{ fontSize: '0.72rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{arg.motion}</div>}
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{arg.point}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: arg.score >= 7 ? '#10b981' : arg.score >= 5 ? '#f59e0b' : '#ef4444' }}>{arg.score}/10</div>
                    <button onClick={() => deleteArgument(arg.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {arg.evidence && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}><span style={{ color: '#0ea5e9', fontWeight: 700 }}>E: </span>{arg.evidence}</div>}
                {arg.link && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{arg.link}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── BUILDER VIEW ── */
  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PenLine size={22} color={accent} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.15rem', letterSpacing: '-0.02em' }}>Argument Builder</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>Build a complete PEEL argument step by step.</p>
          </div>
        </div>
        <button onClick={() => setView('bank')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.5rem 0.875rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
          <Database size={14} /> Bank ({savedArgs.length})
        </button>
      </div>

      {/* Motion input */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Debate Motion (optional)</label>
        <input value={values.motion} onChange={e => setValues(v => ({ ...v, motion: e.target.value }))}
          placeholder="e.g. Social media has done more harm than good"
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', fontWeight: 600 }} />
      </div>

      {/* PEEL step indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {STEPS.map((s, i) => (
          <div key={s.key} onClick={() => !submitted && setStep(i)} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step || submitted ? s.color : i === step ? `${s.color}60` : 'rgba(255,255,255,0.06)', cursor: submitted ? 'default' : 'pointer', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <div key={s.key} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: i === step || submitted ? 1 : 0.4, transition: 'opacity 0.2s' }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: i <= step || submitted ? `${s.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${i <= step || submitted ? s.color : 'transparent'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: s.color }}>{s.abbr}</div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Submitted: full argument view */}
      {submitted ? (
        <div>
          {/* Score */}
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', border: `1px solid ${score >= 7 ? '#10b98130' : '#f59e0b30'}` }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>{score.toFixed(1)}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
              {score >= 8 ? 'Excellent PEEL argument!' : score >= 6 ? 'Good structure — refine your evidence.' : 'Keep practising — focus on evidence and linking.'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.7rem 1.25rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                Build Another
              </button>
              <button onClick={saveArgument} disabled={saving}
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none', borderRadius: 12, padding: '0.7rem 1.25rem', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {saveSuccess ? <><Check size={16} /> Saved!</> : <><Save size={16} /> {saving ? 'Saving...' : 'Save to Bank'}</>}
              </button>
            </div>
          </div>

          {/* Full argument breakdown */}
          {STEPS.map(s => {
            const val = values[s.key];
            return val ? (
              <div key={s.key} className="glass-card" style={{ padding: '1.25rem', marginBottom: '0.75rem', borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{s.label}</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{val}</div>
              </div>
            ) : null;
          })}
        </div>
      ) : (
        /* Active step */
        <div>
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: `1px solid ${currentStep.color}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${currentStep.color}15`, border: `1px solid ${currentStep.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: currentStep.color }}>{currentStep.abbr}</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{currentStep.title}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>{currentStep.prompt}</div>
            <textarea ref={textRef} value={currentVal}
              onChange={e => setValues(v => ({ ...v, [currentStep.key]: e.target.value }))}
              placeholder={`Write your ${currentStep.label.toLowerCase()} here...`}
              rows={4}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${isValid ? currentStep.color + '40' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '0.875rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
            />
            {/* Feedback */}
            {currentVal.length > 5 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.75rem' }}>
                {isValid ? <Check size={14} color="#10b981" style={{ marginTop: '0.1rem', flexShrink: 0 }} /> : <AlertCircle size={14} color="#f59e0b" style={{ marginTop: '0.1rem', flexShrink: 0 }} />}
                <span style={{ fontSize: '0.78rem', color: isValid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{currentStep.feedback(currentVal)}</span>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', background: `${currentStep.color}05` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: currentStep.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Tips</div>
            {currentStep.tips.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: currentStep.color, marginTop: '0.45rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.75rem 1.25rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!isValid}
                style={{ background: isValid ? `${currentStep.color}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${isValid ? currentStep.color + '40' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '0.75rem 1.5rem', cursor: isValid ? 'pointer' : 'not-allowed', color: isValid ? currentStep.color : 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', transition: 'all 0.2s' }}>
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)} disabled={!isValid}
                style={{ background: isValid ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : 'rgba(255,255,255,0.03)', border: 'none', borderRadius: 12, padding: '0.75rem 1.5rem', cursor: isValid ? 'pointer' : 'not-allowed', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', boxShadow: isValid ? `0 0 20px ${accent}40` : 'none', transition: 'all 0.2s' }}>
                Score My Argument <Zap size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
