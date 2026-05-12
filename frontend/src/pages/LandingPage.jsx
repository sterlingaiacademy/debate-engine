import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { GradientBars } from '../components/ui/gradient-bars';
import { TrustElements } from '../components/ui/trust-elements';
import ShinyButton from '../components/ui/shiny-button';
import SpinnerButton from '../components/ui/spinner-button';
import {
  Mic, Zap, Trophy, BarChart2, Globe, Star, ChevronDown,
  CheckCircle, ArrowRight, Play, Shield, Brain, Sparkles, Users, Download, Clock, Calendar
} from 'lucide-react';

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('lp-revealed'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.lp-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Logo component using actual image ─── */
function Logo({ height = 44 }) {
  return (
    <img
      src={logoImg}
      alt="G Force AI"
      style={{ height, width: 'auto', display: 'block', objectFit: 'contain' }}
    />
  );
}

/* ─── Pricing toggle section ─── */
function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Demo',
      badge: 'lp-plan-free',
      price: { monthly: '₹0', yearly: '₹0' },
      period: { monthly: '', yearly: '' },
      desc: 'No credit card needed. Try it free.',
      features: ['3 matches/day', 'All 5 levels', 'Basic AI report', 'Leaderboard', 'Android & Web'],
      checkColor: '#10b981',
      cta: 'Get Started',
      ctaClass: 'lp-btn-outline-dark',
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'lp-plan-pro',
      price: { monthly: '₹2,999', yearly: '₹29,999' },
      period: { monthly: '/mo', yearly: '/yr' },
      desc: yearly ? '7,300 min · 20 min/day' : '600 min · 20 min/day',
      features: [
        yearly ? '7,300 min / year' : '600 min / month',
        '20 min per day', 'Unlimited practice',
        'AI scoring report', 'Priority support', 'Android & Web',
      ],
      checkColor: '#F97316',
      cta: yearly ? 'Get Pro Yearly' : 'Get Pro Monthly',
      ctaClass: 'lp-btn-outline-dark',
      highlight: yearly,
      highlightLabel: 'Best Value',
    },
    {
      id: 'max',
      name: 'Max',
      badge: 'lp-plan-max',
      price: { monthly: '₹8,999', yearly: '₹89,999' },
      period: { monthly: '/mo', yearly: '/yr' },
      desc: yearly ? '22,000 min · 60 min/day' : '1,800 min · 60 min/day',
      features: [
        yearly ? '22,000 min / year' : '1,800 min / month',
        '60 min per day', 'Debate Arena', 'Model UN access',
        '8-dim AI report', 'Teacher dashboard', 'School leaderboards', 'Priority support',
      ],
      checkColor: '#F97316',
      cta: yearly ? 'Start Max Yearly' : 'Start Max Monthly',
      ctaClass: 'lp-btn-brand',
      featured: true,
      featuredLabel: 'Most Popular',
    },
  ];

  return (
    <div className="lp-reveal">
      {/* Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.1)', padding: '4px', gap: '4px',
        }}>
          <button
            onClick={() => setYearly(false)}
            style={{
              padding: '0.45rem 1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.25s',
              background: !yearly ? '#fff' : 'transparent',
              color: !yearly ? '#0a0a0a' : '#94a3b8',
            }}
          >Monthly</button>
          <button
            onClick={() => setYearly(true)}
            style={{
              padding: '0.45rem 1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: yearly ? 'linear-gradient(90deg,#E8392A,#F97316)' : 'transparent',
              color: yearly ? '#fff' : '#94a3b8',
            }}
          >
            Yearly
            <span style={{
              background: yearly ? 'rgba(255,255,255,0.25)' : 'rgba(249,115,22,0.15)',
              color: yearly ? '#fff' : '#F97316',
              fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.5rem',
              borderRadius: '999px', letterSpacing: '0.04em',
            }}>Save 17%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'stretch',
      }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`lp-pricing-card${plan.featured ? ' lp-pricing-featured' : ''}`}
            style={{
              position: 'relative',
              ...(plan.highlight && !plan.featured ? { borderColor: 'rgba(249,115,22,0.45)' } : {}),
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            {/* Top badge */}
            {(plan.featured || plan.highlight) && (
              <div className={plan.featured ? 'lp-pricing-badge' : undefined} style={!plan.featured ? {
                position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg,#E8392A,#F97316)', color: '#fff',
                borderRadius: '999px', padding: '0.2rem 0.9rem',
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap',
              } : {}}>
                {plan.featured ? plan.featuredLabel : plan.highlightLabel}
              </div>
            )}

            <div style={{ marginBottom: '0.75rem' }}>
              <span className={`lp-plan-badge ${plan.badge}`}>{plan.name}</span>
            </div>

            <div className="lp-pricing-price" style={{ margin: '0.5rem 0 0.25rem' }}>
              <span className="lp-pricing-amount">{plan.price[yearly ? 'yearly' : 'monthly']}</span>
              <span className="lp-pricing-period">{plan.period[yearly ? 'yearly' : 'monthly']}</span>
            </div>
            <p className="lp-pricing-desc" style={{ marginBottom: '1.25rem' }}>{plan.desc}</p>

            <ul className="lp-pricing-features" style={{ flex: 1 }}>
              {plan.features.map(f => (
                <li key={f}><CheckCircle size={14} color={plan.checkColor} />{f}</li>
              ))}
            </ul>

            <Link to="/register" className={`lp-pricing-cta ${plan.ctaClass}`} style={{ marginTop: 'auto' }}>
              {plan.cta} <ArrowRight size={15} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}



/* ─── FAQ Accordion ─── */
const FAQS = [
  { q: 'What age group is G Force AI designed for?', a: 'G Force AI is designed for students from KG through Grade 12, with 5 adaptive difficulty levels that automatically match their school grade.' },
  { q: 'How does the AI scoring work?', a: 'Our AI judge evaluates 8 dimensions: argument quality, rebuttal engagement, clarity, speech fluency, persuasiveness, knowledge & evidence, respectfulness, and position consistency — giving a holistic debate score.' },
  { q: 'Can students use the mobile app and web app together?', a: 'Yes! Both the Android app and web app connect to the same backend and Supabase database, so scores, leaderboards, and progress sync in real time across devices.' },
  { q: 'What is Model UN mode?', a: 'Model UN is a premium debate simulation where students take on country delegate personas and debate global motions in a United Nations-style format, powered by ElevenLabs voice AI.' },
  { q: 'Is there a free tier?', a: 'Yes! The Free tier includes unlimited practice debates with limited Debate Arena matches per day. School and Enterprise plans unlock unlimited Debate Arena matches, advanced analytics, and priority support.' },
  { q: 'How do I set up G Force AI for my school?', a: "Contact us via the Enterprise plan or email us directly. We'll onboard your school, create student accounts in bulk, and provide a dedicated dashboard for teachers." },
  { q: 'Is student data kept private?', a: 'Absolutely. All data is stored securely in Supabase (hosted on AWS). We never sell student data and comply with standard data privacy guidelines.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lp-faq-item" onClick={() => setOpen(!open)}>
      <div className="lp-faq-q">
        <span>{q}</span>
        <ChevronDown size={20} className={`lp-faq-icon ${open ? 'lp-faq-open' : ''}`} />
      </div>
      <div className={`lp-faq-a ${open ? 'lp-faq-a-open' : ''}`}>
        <p>{a}</p>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function LandingPage() {
  useReveal();
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handler = () => {
      const currentScrollY = window.scrollY;
      // Hide if scrolling down and past 80px, show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setNavHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setNavHidden(false);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="lp-root">

      {/* ── NAVBAR ── */}
      <nav 
        className={`lp-nav ${navHidden ? 'lp-nav-hidden' : ''}`}
        style={{ maxWidth: '1200px', margin: '0 auto', left: 0, right: 0 }}
      >
        <Logo height={86} />
        <div className="lp-nav-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How It Works</a>
          <a href="#pricing" className="lp-nav-link">Pricing</a>
          <a href="#faq" className="lp-nav-link">FAQ</a>
        </div>
        <div className="lp-nav-cta">
          <Link to="/login" className="lp-btn-ghost">Login</Link>
          <Link to="/register" className="lp-btn-glass">Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 md:pt-40 md:pb-24 w-full overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% -20%, #161214 0%, #06080F 60%)',
          animation: "fadeIn 0.6s ease-out"
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Animated Gradient Bars Background */}
        <GradientBars />

        {/* Trust Elements Avatar Badge */}
        <div className="mb-8 z-10">
          <TrustElements />
        </div>

        {/* Headline */}
        <h1
          className="font-bold text-center z-10 lp-reveal"
          style={{
            background: "linear-gradient(to bottom, #ffffff 30%, rgba(255, 255, 255, 0.6) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.04em",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.1,
            maxWidth: "800px",
            marginBottom: "1.5rem",
            padding: "0 1rem"
          }}
        >
          Train Students to Be <br className="hidden md:block" />
          World-Class Debaters
        </h1>

        {/* Subhead */}
        <p className="text-center text-slate-400 z-10 lp-reveal" style={{
          fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
          lineHeight: 1.6,
          maxWidth: "700px",
          marginBottom: "3rem",
          padding: "0 1.5rem"
        }}>
          G Force AI uses advanced voice AI to coach students from KG to Grade 12 in real-time debates — scoring arguments, tracking growth, and building the leaders of tomorrow.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-6 relative z-10 mb-16 lp-reveal">
          <SpinnerButton
            to="/register"
            text="Start Debating Free"
          />
          <SpinnerButton
            href="https://whfmuswqbsgbmaramuhi.supabase.co/storage/v1/object/public/Downloads/grace-and-force.apk"
            text="Download Android App"
            icon={<Download size={18} />}
            theme="orange"
          />
        </div>

      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section lp-section-alt" id="features">
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <span className="lp-section-badge">Features</span>
            <h2 className="lp-section-h2">Everything Students Need to Excel</h2>
            <p className="lp-section-sub">A complete debate training system built for modern classrooms.</p>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: <Brain size={28} />, title: 'AI Debate Personas', desc: 'Students debate against carefully crafted AI opponents — from confident politicians to expert scientists — that adapt to their level.', color: '#E8392A' },
              { icon: <BarChart2 size={28} />, title: 'Real-time Scoring', desc: 'After every debate, an AI judge scores 8 dimensions including argument quality, fluency, rebuttal, and persuasiveness.', color: '#F97316' },
              { icon: <Trophy size={28} />, title: 'Global Leaderboards', desc: 'Students compete on token-ranked leaderboards — filterable by grade, school, region, and country — driving healthy competition.', color: '#FBBF24' },
              { icon: <Globe size={28} />, title: 'Model UN Mode', desc: 'An immersive simulation where students play country delegates and debate global motions in a voice-powered UN format.', color: '#E8392A' },
              { icon: <Zap size={28} />, title: 'Voice-First AI', desc: 'Powered by ElevenLabs, students speak naturally and get instant AI responses, building real speaking confidence.', color: '#F97316' },
              { icon: <Shield size={28} />, title: 'Adaptive Levels', desc: 'Five difficulty tiers automatically matched to school grade (KG → Grade 12) ensure every student is appropriately challenged.', color: '#FBBF24' },
            ].map(({ icon, title, desc, color }, i) => (
              <div key={title} className="lp-feature-card lp-reveal" style={{ '--card-delay': `${i * 80}ms`, '--card-accent': color }}>
                <div className="lp-feature-icon" style={{ background: `${color}16` }}>
                  <span style={{ color }}>{icon}</span>
                </div>
                <h3 className="lp-feature-title">{title}</h3>
                <p className="lp-feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <span className="lp-section-badge">How It Works</span>
            <h2 className="lp-section-h2">From Sign-up to Stage-Ready in Minutes</h2>
            <p className="lp-section-sub">Simple onboarding, instant debate, real growth.</p>
          </div>
          <div className="lp-steps">
            {[
              { num: '01', icon: <Users size={32} />, title: 'Create Your Account', desc: 'Sign up with your username and pick your grade. The platform automatically assigns the right debate level for you.' },
              { num: '02', icon: <Mic size={32} />, title: 'Pick a Debate Mode', desc: 'Choose from Debate Arena, Persona Practice, or Model UN. Select your topic, pick a side, and start speaking.' },
              { num: '03', icon: <Star size={32} />, title: 'Get Scored & Improve', desc: 'Receive a detailed AI report card after every debate. Track your Gforce Tokens, streaks, and badges as you improve over time.' },
            ].map(({ num, icon, title, desc }, i) => (
              <div key={num} className="lp-step lp-reveal" style={{ '--step-delay': `${i * 120}ms` }}>
                <div className="lp-step-num">{num}</div>
                <div className="lp-step-icon">{icon}</div>
                <h3 className="lp-step-title">{title}</h3>
                <p className="lp-step-desc">{desc}</p>
                {i < 2 && <div className="lp-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section lp-section-alt" id="pricing">
        <div className="lp-container" style={{ maxWidth: '1100px' }}>
          <div className="lp-section-header lp-reveal">
            <span className="lp-section-badge">Pricing</span>
            <h2 className="lp-section-h2">Simple, Transparent Pricing</h2>
            <p className="lp-section-sub">Start free. Scale with your school.</p>
          </div>

          {/* ── Monthly / Yearly toggle ── */}
          <PricingSection />
        </div>
      </section>



      {/* ── FAQ ── */}
      <section className="lp-section" id="faq">
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <span className="lp-section-badge">FAQ</span>
            <h2 className="lp-section-h2">Frequently Asked Questions</h2>
            <p className="lp-section-sub">Everything you need to know before you start.</p>
          </div>
          <div className="lp-faq-list lp-reveal">
            {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── PRIVACY & TERMS ── */}
      <section className="lp-section lp-section-alt" id="privacy">
        <div className="lp-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="lp-section-header lp-reveal" style={{ textAlign: 'center' }}>
            <span className="lp-section-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>Data & Privacy</span>
            <h2 className="lp-section-h2">Your Data is Safe With Us</h2>
            <p className="lp-section-sub">We prioritize the security and privacy of our students above all else.</p>
          </div>
          <div className="lp-reveal lp-privacy-card">
            <p style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                <Shield size={20} color="#10b981" /> No Student Data Storage
              </strong>
              We do not track, log, or permanently store any sensitive student metrics, personal information, or chat transcripts. All AI debates are processed securely over encrypted channels and deleted from our evaluation servers immediately after the session concludes.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                <Shield size={20} color="#10b981" /> Strict Educational Privacy
              </strong>
              G Force AI adheres rigidly to COPPA guidelines and foremost educational privacy standards. We provide a completely locked-down environment ensuring maximum safety for students of all ages.
            </p>
            <p>
              <strong style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                <CheckCircle size={20} color="#10b981" /> Educational Terms of Use
              </strong>
              By using our service, you agree to our standard terms which dictate that our platform is exclusively meant for educational growth and debate practice.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <Logo height={110} />
            <p className="lp-footer-tagline">Building confident, articulate student leaders through the power of AI debate training.</p>
          </div>
          <div className="lp-footer-links">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq'], ['Privacy & Terms', '#privacy'], ['Login', '/login'], ['Get Started', '/register']].map(([label, href]) => (
              href.startsWith('#')
                ? <a key={label} href={href} className="lp-footer-link">{label}</a>
                : <Link key={label} to={href} className="lp-footer-link">{label}</Link>
            ))}
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 G Force AI. All rights reserved.</span>
            <span>Crafting Leaders</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
