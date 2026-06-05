import { useState } from 'react';
import {
  Mic, Calendar, Clock, Star, ChevronRight, CheckCircle,
  Users, Award, BookOpen, Zap, ArrowRight, Play, Shield,
  MessageSquare, Target, Flame
} from 'lucide-react';

const COHORT_DETAILS = {
  name: 'G-Talk Cohort 1',
  tagline: 'Speech & Debate Bootcamp',
  price: '₹499',
  originalPrice: '₹4,999',
  duration: '4 Weeks',
  cert: true,
  status: 'open', // open | upcoming | closed
  startDate: 'June 15, 2026',
  endDate: 'July 13, 2026',
  seats: 48,
  seatsLeft: 12,
  registrationDeadline: 'June 12, 2026',
};

const CURRICULUM = [
  {
    week: 1,
    title: 'Foundations of Public Speaking',
    color: '#FF6B00',
    topics: ['Voice modulation & projection', 'Body language & stage presence', 'Eliminating filler words', 'Structured thinking frameworks'],
  },
  {
    week: 2,
    title: 'Argument Construction',
    color: '#00d4ff',
    topics: ['PEEL structure', 'Evidence-based reasoning', 'Anticipating counterarguments', 'Logical fallacies to avoid'],
  },
  {
    week: 3,
    title: 'Live Debate Techniques',
    color: '#a855f7',
    topics: ['Rebuttal mastery', 'Cross-examination skills', 'Time management in debates', 'Reading the room & adapting'],
  },
  {
    week: 4,
    title: 'Grand Finale & Certification',
    color: '#10b981',
    topics: ['Mock debate tournament', 'Individual feedback sessions', 'Peer evaluation', 'Certificate of Completion awarded'],
  },
];

const PERKS = [
  { icon: Mic, label: 'Live Sessions', desc: '2× weekly live sessions with expert coaches', color: '#FF6B00' },
  { icon: Users, label: 'Small Cohorts', desc: 'Max 50 students per batch for personal attention', color: '#00d4ff' },
  { icon: Award, label: 'Certificate', desc: 'Shareable certificate of completion included', color: '#a855f7' },
  { icon: Zap, label: 'AI Practice', desc: 'Unlimited AI debate practice between sessions', color: '#10b981' },
  { icon: BookOpen, label: 'Study Material', desc: 'Exclusive worksheets & resource library', color: '#f59e0b' },
  { icon: MessageSquare, label: 'Community', desc: 'Private cohort WhatsApp group with mentors', color: '#ec4899' },
];

const TESTIMONIALS = [
  { name: 'Arjun S.', grade: 'Grade 11', text: "G-Talk completely transformed how I present ideas. I won my school MUN last month!", stars: 5, avatar: 'A' },
  { name: 'Priya M.', grade: 'Grade 9', text: "The structured curriculum and AI practice helped me speak confidently in class.", stars: 5, avatar: 'P' },
  { name: 'Rahul K.', grade: 'Grade 12', text: "Best ₹499 I ever spent. The certificate helped in my college application too.", stars: 5, avatar: 'R' },
];

export default function GTalkCohort({ user }) {
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    setRegistering(true);
    // Redirect to payment / registration flow
    setTimeout(() => {
      window.open('https://graceandforce.com/register-gtalk', '_blank');
      setRegistering(false);
    }, 800);
  };

  const pctFull = Math.round(((COHORT_DETAILS.seats - COHORT_DETAILS.seatsLeft) / COHORT_DETAILS.seats) * 100);

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}
    >
      {/* ── Hero Banner ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 24,
        background: 'linear-gradient(135deg, #1a0500 0%, #2d0d00 40%, #0d001a 100%)',
        border: '1px solid rgba(255,107,0,0.2)',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 20px 60px rgba(255,107,0,0.15)',
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)',
              color: '#FF6B00', padding: '0.3rem 0.85rem', borderRadius: 99,
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B00', animation: 'pulse 1.5s infinite' }} />
              NOW OPEN
            </span>
            <span style={{
              background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
              color: '#a855f7', padding: '0.3rem 0.85rem', borderRadius: 99,
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em',
            }}>
              🎓 CERT INCLUDED
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, margin: '0 0 0.5rem',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            background: 'linear-gradient(135deg, #FF6B5A 0%, #FF6B00 50%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {COHORT_DETAILS.name}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {COHORT_DETAILS.tagline} — Become a confident, articulate speaker in just 4 weeks.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {[
              { icon: Calendar, label: 'Starts', value: COHORT_DETAILS.startDate },
              { icon: Clock, label: 'Duration', value: COHORT_DETAILS.duration },
              { icon: Users, label: 'Cohort Size', value: `Max ${COHORT_DETAILS.seats}` },
              { icon: Shield, label: 'Certificate', value: 'Included' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={16} color="#FF6B00" strokeWidth={2} />
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 800 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Seats progress */}
          <div style={{ marginBottom: '1.75rem', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                <Flame size={12} style={{ display: 'inline', marginRight: 4, color: '#f97316' }} />
                {COHORT_DETAILS.seatsLeft} seats left
              </span>
              <span style={{ fontSize: '0.75rem', color: '#FF6B00', fontWeight: 800 }}>{pctFull}% full</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, width: `${pctFull}%`,
                background: 'linear-gradient(90deg, #FF6B00, #fbbf24)',
                transition: 'width 1s ease',
              }} />
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.02em' }}>
                {COHORT_DETAILS.price}
              </span>
              <span style={{ fontSize: '1rem', color: '#475569', fontWeight: 700, marginLeft: '0.5rem', textDecoration: 'line-through' }}>
                {COHORT_DETAILS.originalPrice}
              </span>
              <span style={{
                display: 'inline-flex', marginLeft: '0.5rem',
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: 99,
                fontSize: '0.7rem', fontWeight: 800,
              }}>90% OFF</span>
            </div>
            <button
              id="gtalk-register-btn"
              onClick={handleRegister}
              disabled={registering || registered}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: registered ? '#10b981' : 'linear-gradient(135deg, #FF6B5A, #FF6B00)',
                color: '#fff', border: 'none', padding: '0.85rem 2rem',
                borderRadius: 99, fontSize: '1rem', fontWeight: 800, cursor: registering ? 'wait' : 'pointer',
                boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: 'none',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!registering) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              {registered ? <><CheckCircle size={18} /> Registered!</> :
               registering ? 'Redirecting...' :
               <><Play size={16} strokeWidth={3} /> Register — {COHORT_DETAILS.price}</>}
            </button>
            <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
              Deadline: {COHORT_DETAILS.registrationDeadline}
            </span>
          </div>
        </div>
      </div>

      {/* ── What You Get ── */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Included</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>What You Get</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
          {PERKS.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '1.25rem',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${color}08`;
                e.currentTarget.style.border = `1px solid ${color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, marginBottom: '0.85rem',
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} strokeWidth={2} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{label}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Curriculum ── */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>4-Week Program</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Curriculum</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {CURRICULUM.map((week, i) => (
            <div key={week.week} style={{
              background: 'rgba(255,255,255,0.02)', border: `1px solid ${week.color}20`,
              borderLeft: `3px solid ${week.color}`, borderRadius: '0 16px 16px 0',
              padding: '1.25rem 1.5rem',
              animation: `cardEnter 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${week.color}20`, border: `1px solid ${week.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 900, color: week.color,
                }}>
                  W{week.week}
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {week.title}
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {week.topics.map(topic => (
                  <div key={topic} style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: `${week.color}0d`, border: `1px solid ${week.color}20`,
                    padding: '0.3rem 0.75rem', borderRadius: 99,
                    fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8',
                  }}>
                    <CheckCircle size={12} color={week.color} strokeWidth={2.5} />
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Alumni Reviews</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>What Students Say</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {TESTIMONIALS.map(({ name, grade, text, stars, avatar }) => (
            <div key={name} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.85rem' }}>
                {[...Array(stars)].map((_, i) => <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" strokeWidth={0} />)}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.65, margin: '0 0 1rem', fontStyle: 'italic' }}>
                "{text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #FF6B5A, #FF6B00)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                }}>
                  {avatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>{grade}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA Banner ── */}
      <div style={{
        borderRadius: 20, padding: '2rem',
        background: 'linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(168,85,247,0.1) 100%)',
        border: '1px solid rgba(255,107,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1.25rem',
      }}>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: '0.3rem' }}>
            Only {COHORT_DETAILS.seatsLeft} seats remaining!
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Registration closes {COHORT_DETAILS.registrationDeadline}
          </div>
        </div>
        <button
          id="gtalk-register-bottom-btn"
          onClick={handleRegister}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, #FF6B5A, #FF6B00)',
            color: '#fff', border: 'none', padding: '0.85rem 2rem',
            borderRadius: 99, fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255,107,0,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          Secure Your Spot <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
