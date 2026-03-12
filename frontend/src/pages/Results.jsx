import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, RotateCcw, MessageSquareDiff, FlaskConical, Shield, GraduationCap, TrendingUp } from 'lucide-react';

// Icons aligned to ElevenLabs 5 criteria
const METRIC_ICONS = [MessageSquareDiff, FlaskConical, Shield, GraduationCap, TrendingUp];
const METRIC_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Results({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const evaluation = state?.evaluation;
  const session = state?.sessionData || {
    debateTopic: 'Unknown Topic',
    debateScore: evaluation?.overallScore ?? 72,
    argumentsCount: 0,
    sessionDuration: 0,
  };

  const isJunior = user.classLevel === 'Class 1-3';
  const score = evaluation?.overallScore ?? session.debateScore;

  const metrics = evaluation?.metrics ?? [
    { name: 'Argument Strength and Clarity', score: 60 },
    { name: 'Evidence and Logical Reasoning Usage', score: 55 },
    { name: 'Rebuttal Effectiveness', score: 65 },
    { name: 'Debate Technique Adherence', score: 58 },
    { name: 'Overall Performance/Improvement', score: 63 },
  ];

  const feedback = evaluation?.feedback ??
    "Complete a full debate session to receive detailed AI judge feedback on your performance.";

  const analysisDetails = evaluation?.analysisDetails;
  const elData = evaluation?.elevenLabsData;
  const isRealEvaluation = !!evaluation;

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Practising!';
  const scoreEmoji = score >= 80 ? '🏆' : score >= 60 ? '🎯' : '💪';

  const circumference = 2 * Math.PI * 66;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 64px - 1.5rem)', overflow: 'hidden' }}>

      {/* Page header */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: isJunior ? '3rem' : '2rem' }}>{scoreEmoji}</span>
        <h2 style={{ fontWeight: 800, fontSize: '1.75rem', marginTop: '0.5rem' }}>Debate Complete!</h2>
        <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
          Results for: <strong>{session.debateTopic}</strong>
        </p>
        {isRealEvaluation && (
          <span className="badge badge-green" style={{ marginTop: '0.5rem', display: 'inline-flex', gap: '0.25rem' }}>
            ✅ Real AI Judge Evaluation
          </span>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'stretch', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.25rem', paddingBottom: '0.5rem' }}>

        {/* Left: Score Circle + ElevenLabs Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Overall Score
            </p>
            <div className="score-ring-wrap" style={{ margin: '0 auto 1rem', position: 'relative', width: 140, height: 140 }}>
              <svg viewBox="0 0 144 144" style={{ width: 140, height: 140 }}>
                <circle cx="72" cy="72" r="66" fill="none" stroke="var(--bg-tertiary)" strokeWidth="11" />
                <circle
                  cx="72" cy="72" r="66"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - score / 100)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</span>
                <span className="text-secondary text-sm">/ 100</span>
              </div>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.125rem', color: scoreColor }}>{scoreLabel}</p>
            {isJunior && <div className="animate-celebrate" style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>🎉</div>}

            {/* Session stats */}
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Turns', val: session.argumentsCount },
                { label: 'Duration', val: `${Math.floor(session.sessionDuration / 60)}m ${session.sessionDuration % 60}s` },
                ...(analysisDetails ? [{ label: 'Words', val: analysisDetails.totalWords }] : []),
              ].map(({ label, val }) => (
                <div key={label} style={{
                  textAlign: 'center', padding: '0.5rem 0.75rem',
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>{val}</p>
                  <p className="text-muted text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ElevenLabs Data Card */}
          {elData && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📊 ElevenLabs Coach Scores
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Argument Clarity', val: elData.argument_clarity_score, max: 5 },
                  { label: 'Evidence & Logic', val: elData.evidence_logic_score, max: 5 },
                  { label: 'Rebuttal', val: elData.rebuttal_score, max: 5 },
                ].map(({ label, val, max }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[...Array(max)].map((_, i) => (
                        <div key={i} style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: i < val ? '#7c3aed' : 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                        }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {elData.session_feedback_summary && (
                <p className="text-muted text-xs" style={{ marginTop: '0.875rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{elData.session_feedback_summary}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Metrics & Feedback */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ElevenLabs Evaluation Criteria
            </p>
            {isRealEvaluation && analysisDetails && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {analysisDetails.studentTurns} turns · {analysisDetails.avgWordsPerTurn} avg words/turn
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {metrics.map(({ name, score: val }, i) => {
              const Icon = METRIC_ICONS[i];
              const color = METRIC_COLORS[i];
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={15} color={color} />
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{name}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color }}>{val}/100</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${val}%`, background: color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Judge Feedback */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            marginTop: '1rem',
            padding: '1rem 1.25rem',
            background: isJunior
              ? 'linear-gradient(135deg, #fdf4ff, #eff6ff)'
              : 'var(--accent-light)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isJunior ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)'}`,
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: isJunior ? '#7c3aed' : 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🤖 AI Judge Feedback {isRealEvaluation ? '(Based on your actual debate)' : ''}
            </p>
            <p className="text-secondary text-sm" style={{ lineHeight: 1.65, fontStyle: 'italic' }}>
              "{feedback}"
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingBottom: '0.5rem', flexShrink: 0 }}>
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
