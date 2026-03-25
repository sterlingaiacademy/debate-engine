import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, RotateCcw, Target, Zap, MessageSquare, Mic, Lightbulb, BookOpen, HeartHandshake, ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info, MicOff } from 'lucide-react';

const CATEGORY_ICONS = {
  "Argument Quality": Target,
  "Rebuttal & Engagement": Zap,
  "Clarity & Coherence": MessageSquare,
  "Speech Fluency": Mic,
  "Persuasiveness": Lightbulb,
  "Knowledge & Evidence": BookOpen,
  "Respectfulness & Tone": HeartHandshake,
  "Consistency & Position": ShieldCheck,
};

const CATEGORY_COLORS = {
  "Argument Quality": "#3b82f6",
  "Rebuttal & Engagement": "#ef4444",
  "Clarity & Coherence": "#10b981",
  "Speech Fluency": "#f59e0b",
  "Persuasiveness": "#8b5cf6",
  "Knowledge & Evidence": "#ec4899",
  "Respectfulness & Tone": "#14b8a6",
  "Consistency & Position": "#6366f1",
};

function getScoreColor(score) {
  if (score >= 8.5) return '#10b981'; // Bright green
  if (score >= 7.0) return '#34d399'; // Light green
  if (score >= 5.0) return '#facc15'; // Yellow
  if (score >= 3.0) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

function SkillCard({ category }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[category.name] || Target;
  const color = getScoreColor(category.score);
  
  // Clean up details text if it has capping warning
  const isCapped = category.details?.includes('Capped:');
  const detailsText = category.details?.split(' | ⚠ Capped:')[0] || '';

  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={16} style={{ color: CATEGORY_COLORS[category.name] || color }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {category.name}
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
              ×{category.weight.toFixed(1)}
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {isCapped && <Info size={14} color="#f97316" title="Score capped — insufficient participation to fully assess." style={{ cursor: 'help' }} />}
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color }}>{category.score.toFixed(1)}/10</span>
        </div>
      </div>
      
      <div className="progress-track" style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
        <div className="progress-fill" style={{ height: '100%', width: `${(category.score / 10) * 100}%`, background: color, transition: 'width 1s ease-out' }} />
      </div>
      
      {!expanded ? (
        <button 
          onClick={() => setExpanded(true)}
          style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem', cursor: 'pointer' }}
        >
          Details <ChevronDown size={14} />
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem', animation: 'fadeIn 0.2s ease' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{detailsText}</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {category.sub_scores && Object.entries(category.sub_scores).map(([k, v]) => {
              if (Array.isArray(v) || typeof v === 'object') return null; 
              let keyName = k.replace(/_/g, ' ');
              keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
              return (
                <span key={k} style={{ fontSize: '0.7rem', background: 'var(--bg-tertiary)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{keyName}: </span> 
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}
                  </span>
                </span>
              );
            })}
          </div>

          <button 
            onClick={() => setExpanded(false)}
            style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem', cursor: 'pointer' }}
          >
            Hide <ChevronUp size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Results({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const evaluation = state?.evaluation;

  // Level 1 and 2 skip full evaluation
  const isJunior = ['Level 1', 'Level 2', 'Class 1-3'].includes(user.classLevel);
  if (isJunior || evaluation?.skipped) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2.5rem' }}>Debate Complete!</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
            <RotateCcw size={18} /> Dashboard
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/debate')}>
            <Play size={18} fill="currentColor" /> Next Debate
          </button>
        </div>
      </div>
    );
  }

  // Error State
  if (evaluation?.error) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: '2rem' }}>
        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--error)', marginBottom: '1rem' }}>Evaluation Error</h2>
        <p className="text-secondary" style={{ fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
          {evaluation.error}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/debate')}>Try Again</button>
        </div>
      </div>
    );
  }

  // Section 11: Insufficient Data State
  if (evaluation?.insufficient_data) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <MicOff size={40} color="var(--text-muted)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Not Enough Speech to Evaluate</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '450px', lineHeight: 1.5 }}>
            {evaluation.insufficient_data_reason || `You spoke only ${evaluation?.stats?.total_words || 0} words across ${evaluation?.stats?.total_turns || 0} turns. The judge needs at least a few substantive arguments to provide meaningful feedback.`}
          </p>
          
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/debate')} style={{ width: '100%', maxWidth: '300px', marginBottom: '2rem' }}>
            <Play size={18} fill="currentColor" /> Try Again
          </button>
          
          <div style={{ width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={16} /> Quick Tips for Next Time:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#92400e', fontSize: '0.85rem' }}>
              <li>Engage with the topic — state your position clearly and give at least one supporting reason.</li>
              <li>Aim to speak for at least 30 seconds per turn with a clear claim and evidence.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Normal View State Definitions
  const score = evaluation?.overall_score || 0;
  const grade = evaluation?.grade || "N/A";
  const categories = evaluation?.categories || [];
  const stats = evaluation?.stats || {};
  const wrongSide = categories.find(c => c.name === "Consistency & Position")?.sub_scores?.wrong_side;
  const sideColor = evaluation?.debater?.side?.toUpperCase() === 'FOR' ? 'var(--success)' : 'var(--error)';

  const scoreColor = getScoreColor(score);
  const circumference = 2 * Math.PI * 66;
  const dashoffset = circumference * (1 - score / 10);

  const formatTip = (tipStr) => {
    const match = tipStr.match(/^\[(.*?)\]\s*(.*)$/);
    if (!match) return { category: '', instruction: tipStr };
    return { category: match[1], instruction: match[2] };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Section 1: Result Header */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{evaluation?.debater?.name || user.name}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{evaluation?.debater?.class || user.classLevel} &bull; {user.school || 'Debate Arena'}</p>
          </div>
          <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}<br/>
             {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontStyle: 'italic', fontWeight: 600, color: 'var(--text-primary)' }}>
            "{evaluation?.motion || 'Unknown Motion'}"
          </span>
          <span style={{ background: `${sideColor}15`, color: sideColor, border: `1px solid ${sideColor}40`, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {evaluation?.debater?.side || 'Unknown'}
          </span>
          {wrongSide && (
            <span title="Side confusion detected during debate." style={{ display: 'inline-flex', alignItems: 'center', color: '#f97316', cursor: 'help' }}>
              <AlertTriangle size={16} />
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 2: Score Overview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', borderTop: `6px solid ${scoreColor}` }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Overall Score</h3>
            
            <div className="score-ring-wrap" style={{ margin: '0 auto 1.5rem', position: 'relative', width: 160, height: 160 }}>
              <svg viewBox="0 0 144 144" style={{ width: 160, height: 160 }}>
                <circle cx="72" cy="72" r="66" fill="none" stroke={`${scoreColor}20`} strokeWidth="12" />
                <circle
                  cx="72" cy="72" r="66"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '10px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)' }}>{score.toFixed(1)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>/ 10</span>
              </div>
            </div>
            
            <div style={{ fontSize: '1.1rem', fontWeight: 800, padding: '0.4rem 1.5rem', background: `${scoreColor}15`, color: scoreColor, borderRadius: '99px', border: `1px solid ${scoreColor}40`, marginBottom: '2rem' }}>
              Grade: {grade}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '100%' }}>
               <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                 <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.total_turns || 0}</p>
                 <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase' }}>Turns</p>
               </div>
               <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                 <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.total_words || 0}</p>
                 <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase' }}>Words</p>
               </div>
               <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                 <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.avg_words_per_turn || 0}</p>
                 <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase' }}>Words/Turn</p>
               </div>
            </div>
            
            {/* ELO Changes Widget if available */}
            {evaluation?.leaderboard_update && (
              <div style={{ width: '100%', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Rating</span>
                       <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         {Math.round(evaluation.leaderboard_update.new_elo)}
                         <span style={{ fontSize: '0.85rem', color: evaluation.leaderboard_update.elo_change >= 0 ? '#10b981' : '#ef4444' }}>
                           {evaluation.leaderboard_update.elo_change > 0 ? '+' : ''}{Math.round(evaluation.leaderboard_update.elo_change)}
                         </span>
                       </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Global Rank</span>
                       <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>#{evaluation.leaderboard_update.rank}</span>
                    </div>
                 </div>
              </div>
            )}
            
          </div>

          {/* Section 4: Key Strengths */}
          <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 800, color: '#10b981', marginBottom: '1rem' }}>
               <CheckCircle2 size={18} /> Key Strengths
             </h3>
             <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
               {evaluation?.strengths?.map((s, i) => {
                 const match = s.match(/^\[(.*?)\]\s*(.*)$/);
                 return (
                   <li key={i} style={{ fontSize: '0.9rem', lineHeight: 1.5, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                     <span style={{ color: '#10b981', marginTop: '0.1rem' }}>•</span>
                     {match ? (
                       <span><strong style={{ color: 'var(--text-primary)' }}>[{match[1]}]</strong> {match[2]}</span>
                     ) : (
                       <span>{s}</span>
                     )}
                   </li>
                 )
               })}
             </ul>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 5: Areas to Improve */}
          {evaluation?.areas_to_improve?.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #f97316', background: 'linear-gradient(to right, #fff7ed 0%, #ffffff 100%)' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#ea580c', marginBottom: '1rem' }}>
                 <Target size={20} /> Areas to Improve
               </h3>
               <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                 {evaluation.areas_to_improve.map((tipStr, i) => {
                   const { category, instruction } = formatTip(tipStr);
                   return (
                     <li key={i} style={{ fontSize: '0.95rem', lineHeight: 1.5, paddingLeft: '0.5rem' }}>
                       {category && <strong style={{ color: '#b45309', marginRight: '0.35rem' }}>[{category}]</strong>}
                       {instruction}
                     </li>
                   );
                 })}
               </ol>
            </div>
          )}

          {/* Section 3: Skill Breakdown Grid */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Skill Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {categories.map(c => <SkillCard key={c.name} category={c} />)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Section 6: Key Moments Timeline */}
            <div className="card">
               <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Key Moments</h3>
               {evaluation?.key_moments?.length > 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                   {/* Vertical line line */}
                   <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '6px', width: '2px', background: 'var(--border)', zIndex: 0 }} />
                   
                   {evaluation.key_moments.map((m, i) => {
                     const isPositive = m.includes('✓');
                     const isNegative = m.includes('⚠') || m.includes('cost credibility');
                     const dotColor = isPositive ? '#10b981' : isNegative ? '#f59e0b' : '#3b82f6';
                     
                     return (
                       <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                         <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: dotColor, border: '3px solid white', flexShrink: 0, marginTop: '4px', boxShadow: '0 0 0 1px var(--border)' }} />
                         <div style={{ fontSize: '0.9rem', lineHeight: 1.4, color: 'var(--text-primary)', background: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', width: '100%' }}>
                           {m.replace('✓', '').replace('⚠', '').trim()}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No standout moments detected — try to develop your arguments more fully in your next debate.</p>
               )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
               {/* Section 7: Fallacy Alert */}
               {evaluation?.fallacies_detected?.length > 0 && (
                 <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#b91c1c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <AlertTriangle size={18} /> Fallacies Detected
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     {evaluation.fallacies_detected.map((f, i) => (
                       <div key={i}>
                         <strong style={{ color: '#991b1b', fontSize: '0.9rem', display: 'block' }}>{f.type}</strong>
                         <span style={{ fontSize: '0.85rem', color: '#7f1d1d', fontStyle: 'italic' }}>"{f.excerpt}"</span>
                       </div>
                     ))}
                   </div>
                   <p style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #fecaca' }}>
                     Logical fallacies weaken your argument's credibility. Attack the reasoning, not tradition or emotion.
                   </p>
                 </div>
               )}

               {/* Section 8: Persuasion Techniques */}
               <div className="card">
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Persuasion Techniques</h3>
                 {evaluation?.persuasion_techniques?.length > 0 ? (
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                     {evaluation.persuasion_techniques.map(t => (
                       <span key={t} style={{ background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '0.25rem 0.6rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                         {t}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No persuasion techniques detected. Try using rhetorical questions, analogies, or specific data to strengthen your next debate.</p>
                 )}
               </div>

               {/* Section 9: Speech Disfluency Report */}
               {evaluation?.disfluency_report && (
                 <div className="card">
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Speech Disfluency</h3>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'Stutters', val: evaluation.disfluency_report.stutters },
                        { label: 'Restarts', val: evaluation.disfluency_report.restarts },
                        { label: 'Repeats', val: evaluation.disfluency_report.word_repetitions },
                        { label: 'Trailing', val: evaluation.disfluency_report.trailing_off }
                      ].map(d => (
                         <div key={d.label} style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                           <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1 }}>{d.val}</div>
                           <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase' }}>{d.label}</div>
                         </div>
                      ))}
                   </div>
                   
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                     Total: {evaluation.disfluency_report.total} disfluencies 
                     {stats.total_words > 0 ? ` (${((evaluation.disfluency_report.total / stats.total_words) * 100).toFixed(1)} per 100 words).` : '.'}
                   </p>
                   
                   {stats.total_words > 0 && ((evaluation.disfluency_report.total / stats.total_words) * 100) > 2.0 && (
                     <p style={{ fontSize: '0.85rem', color: '#ea580c', margin: '0.5rem 0 0 0', fontWeight: 600 }}>
                       Tip: Try slowing down — a deliberate pause is stronger than a stutter.
                     </p>
                   )}
                   {stats.total_words > 0 && ((evaluation.disfluency_report.total / stats.total_words) * 100) < 0.5 && (
                     <p style={{ fontSize: '0.85rem', color: '#10b981', margin: '0.5rem 0 0 0', fontWeight: 600 }}>
                       Excellent verbal fluency — smooth and confident delivery.
                     </p>
                   )}
                 </div>
               )}

               {/* Section 10: Opponent's Key Challenges */}
               {evaluation?.ai_challenges_summary?.length > 0 && (
                 <div className="card">
                   <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Review These Challenges</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Substantive questions your opponent asked that you should be prepared to answer:</p>
                   <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                     {evaluation.ai_challenges_summary.map((q, i) => (
                       <li key={i}>{q}</li>
                     ))}
                   </ol>
                 </div>
               )}

            </div>
          </div>
          
        </div>
      </div>

      {/* Section 12: Bottom Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '2rem auto 0 auto', width: '100%' }}>
         <button className="btn btn-primary btn-lg" onClick={() => navigate('/debate')} style={{ width: '100%' }}>
           <Play size={18} fill="currentColor" /> Start New Debate
         </button>
         <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
           Go to Dashboard
         </button>
      </div>

    </div>
  );
}
