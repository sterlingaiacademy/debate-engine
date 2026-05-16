import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
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
        '3-Dimension AI report', 'Teacher dashboard', 'School leaderboards', 'Priority support',
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
  { q: 'How does the AI scoring work?', a: 'Our AI judge evaluates 3 dimensions: argument quality, fluency, and persuasiveness — giving a holistic debate score.' },
  { q: 'Can students use the mobile app and web app together?', a: 'Yes! Both the Android app and web app connect to the same backend database, so scores, leaderboards, and progress sync in real time across devices.' },
  { q: 'What is Model UN mode?', a: 'Model UN is a premium debate simulation where students take on country delegate personas and debate global motions in a United Nations-style format, powered by our advanced AI voice system.' },
  { q: 'Is there a free tier?', a: 'Yes! The Free tier includes unlimited practice debates with limited Debate Arena matches per day. School and Enterprise plans unlock unlimited Debate Arena matches, advanced analytics, and priority support.' },
  { q: 'How do I set up G Force AI for my school?', a: "Contact us via the Enterprise plan or email us directly. We'll onboard your school, create student accounts in bulk, and provide a dedicated dashboard for teachers." },
  { q: 'Is student data kept private?', a: 'Absolutely. All data is stored securely in our private database (hosted on Vultr). We never sell student data and comply with standard data privacy guidelines.' },
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
  const isMobileApp = window.isReactNativeWebView || window.navigator.userAgent.includes('GraceAndForce');
  const navigate = useNavigate();

  useEffect(() => {
    // The WebView injects window.isReactNativeWebView asynchronously
    // We check periodically for the first 2 seconds
    const checkTimer = setInterval(() => {
      if (window.isReactNativeWebView || window.navigator.userAgent.includes('GraceAndForce')) {
        navigate('/login', { replace: true });
      }
    }, 100);
    setTimeout(() => clearInterval(checkTimer), 2000);
    return () => clearInterval(checkTimer);
  }, [navigate]);

  if (isMobileApp) {
    return <Navigate to="/login" replace />;
  }

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
          <a href="#terms" className="lp-nav-link">Terms and Conditions</a>
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
            href="/grace-and-force.apk"
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
              { icon: <BarChart2 size={28} />, title: 'Real-time Scoring', desc: 'After every debate, an AI judge scores 3 dimensions including argument quality, fluency, and persuasiveness.', color: '#F97316' },
              { icon: <Trophy size={28} />, title: 'Global Leaderboards', desc: 'Students compete on token-ranked leaderboards — filterable by grade, school, region, and country — driving healthy competition.', color: '#FBBF24' },
              { icon: <Globe size={28} />, title: 'Model UN Mode', desc: 'An immersive simulation where students play country delegates and debate global motions in a voice-powered UN format.', color: '#E8392A' },
              { icon: <Zap size={28} />, title: 'Voice-First AI', desc: 'Students speak naturally and get instant AI responses using our advanced voice AI engine, building real speaking confidence.', color: '#F97316' },
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

                  {/* ── PRIVACY POLICY ── */}
      <section className="lp-section lp-section-alt" id="privacy">
        <div className="lp-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="lp-section-header lp-reveal" style={{ textAlign: 'center' }}>
            <span className="lp-section-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>Data & Privacy</span>
            <h2 className="lp-section-h2">Global Privacy Policy</h2>
            <p className="lp-section-sub">Last Updated: 17 May 2026</p>
          </div>
          <div className="lp-privacy-card" style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <p style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>G FORCE AI</p>
              <p>Global Privacy Policy for Debate and Speech Coaching App<br/>
              Voice-first platform | AI coaching | TTS | Leaderboards | Progress monitoring | Users 16+<br/>
              Effective Date: 15 May 2026<br/>
              Contact: info@nanoskool.com</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>1. Scope and Acceptance</h3>
              <p style={{ marginBottom: "0.5rem" }}>This Privacy Policy explains how G Force AI / Grace & Force AI (“G Force”, “we”, “our”, or “us”) collects, uses, stores, protects, shares, and deletes personal data when users access our website, mobile apps, AI debate coach, speech coach, voice-first practice tools, text-to-speech features, leaderboards, competitions, live cohorts, dashboards, and related services.</p>
              <p style={{ marginBottom: "0.5rem" }}>By creating an account, using the app, subscribing to a plan, joining a cohort, participating in a leaderboard, uploading content, using voice features, or accessing any G Force AI service, you confirm that you have read and accepted this Privacy Policy.</p>
              <p style={{ marginBottom: "0.5rem" }}>If you are under the applicable legal age of majority but above 16, you may use the platform only with appropriate parental/legal guardian awareness, consent, and supervision where required by law.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>2. Eligibility: 16+ Platform and Parental Responsibility</h3>
              <p style={{ marginBottom: "0.5rem" }}>G Force AI is intended for users aged 16 years and above. The platform is not intended for unsupervised use by children below 16 years of age.</p>
              <p style={{ marginBottom: "0.5rem" }}>Parents and legal guardians are solely responsible for ensuring that minor students do not misuse the platform, create unauthorized accounts, submit personal data, upload voice/audio/content, participate in leaderboards, or make purchases without parental consent, lawful authority, and supervision.</p>
              <p style={{ marginBottom: "0.5rem" }}>Where a parent, school, coach, or institution permits a minor to use the platform, that adult or institution is responsible for obtaining all legally required permissions and for supervising safe, lawful, and age-appropriate use.</p>
              <p style={{ marginBottom: "0.5rem" }}>We reserve the right to suspend, restrict, or delete accounts where we reasonably believe age, consent, safety, or legal requirements are not satisfied.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>3. Information We Collect</h3>
              <p style={{ marginBottom: "0.5rem" }}>Account and identity data: name, email address, phone number, username, password/authentication data, country, city, school/institution, grade/class, age confirmation, parent/guardian details where required, and profile details voluntarily provided.</p>
              <p style={{ marginBottom: "0.5rem" }}>Voice, audio, and speech data: microphone input, practice recordings, debate simulations, pronunciation samples, speech transcripts, voice interaction logs, fluency metrics, pause/filler-word patterns, pace, tone, pitch, confidence indicators, TTS interaction history, and related coaching analytics.</p>
              <p style={{ marginBottom: "0.5rem" }}>Learning and progress data: scores, badges, practice history, leaderboard position, ranking history, streaks, assignments, feedback, improvement trends, AI-generated coaching recommendations, debate rubrics, MUN/diplomacy practice results, and certification progress.</p>
              <p style={{ marginBottom: "0.5rem" }}>User-generated content: speeches, debate arguments, prompts, chat messages, essays, documents, profile content, uploaded files, comments, competition entries, and public/shared submissions.</p>
              <p style={{ marginBottom: "0.5rem" }}>Technical data: IP address, device identifiers, browser, operating system, app version, crash logs, cookies, session data, approximate location, language settings, and usage analytics.</p>
              <p style={{ marginBottom: "0.5rem" }}>Payment and transaction data: plan type, subscription status, invoices, payment confirmation, tax data, transaction IDs, and limited payment metadata. We do not store full card numbers when payments are processed by third-party payment gateways.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>4. Sensitive Data and Prohibited Uploads</h3>
              <p style={{ marginBottom: "0.5rem" }}>Users must not upload highly sensitive information such as medical records, biometric identity documents, banking passwords, government identity numbers, private legal documents, confidential third-party information, or intimate personal content unless specifically requested through a lawful and secure process.</p>
              <p style={{ marginBottom: "0.5rem" }}>G Force AI is not a medical, psychological, psychiatric, legal, immigration, financial, or therapeutic platform. Voice-confidence, emotion, sentiment, fluency, or communication analytics are educational indicators only and must not be treated as diagnosis or professional advice.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>5. How We Use Personal Data</h3>
              <p style={{ marginBottom: "0.5rem" }}>We use personal data to create and manage accounts, deliver AI speech and debate coaching, generate personalized feedback, enable TTS and voice-first interactions, maintain leaderboards, track progress, issue certificates, provide live cohort services, process payments, and offer customer support.</p>
              <p style={{ marginBottom: "0.5rem" }}>We may use data to improve platform quality, personalize learning pathways, detect misuse, prevent fraud, secure accounts, troubleshoot bugs, measure app performance, conduct internal research, and improve AI coaching accuracy.</p>
              <p style={{ marginBottom: "0.5rem" }}>We may use anonymized or aggregated data for product improvement, educational research, business analytics, and public impact reporting, provided such data does not directly identify a user.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>6. Voice Data, Recordings, Transcripts and TTS</h3>
              <p style={{ marginBottom: "0.5rem" }}>G Force AI is a voice-first coaching platform. By using microphone, recording, TTS, pronunciation, debate simulation, or speech-analysis tools, users authorize us to process voice, audio, transcript, and related performance data for app functionality.</p>
              <p style={{ marginBottom: "0.5rem" }}>Recordings may be used for playback, progress monitoring, rubric scoring, AI feedback, quality control, safety review, dispute resolution, and service improvement.</p>
              <p style={{ marginBottom: "0.5rem" }}>Users should assume that voice interactions may be converted into text transcripts and analyzed by automated systems.</p>
              <p style={{ marginBottom: "0.5rem" }}>We will not use a user’s identifiable voice recording in public advertising, promotional materials, or external showcases without separate permission, unless the user has independently made the content public through platform features.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>7. Leaderboards, Rankings and Public Display</h3>
              <p style={{ marginBottom: "0.5rem" }}>The platform may include leaderboards, challenge rankings, badges, certificates, cohort scoreboards, tournament displays, and public or semi-public achievement pages.</p>
              <p style={{ marginBottom: "0.5rem" }}>Depending on settings and program design, leaderboard data may display name, username, institution, city/country, score, badge, rank, cohort, or achievement level.</p>
              <p style={{ marginBottom: "0.5rem" }}>Users and parents/guardians understand that participation in competitions, rankings, public challenges, and leaderboards may involve visibility to other participants, coaches, institutions, or the public.</p>
              <p style={{ marginBottom: "0.5rem" }}>Where privacy controls are available, users should manage display-name and profile-visibility settings carefully.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>8. AI Systems and Automated Feedback</h3>
              <p style={{ marginBottom: "0.5rem" }}>G Force AI uses AI systems, speech-recognition tools, text-to-speech systems, language models, scoring engines, and recommendation systems to generate debate feedback, speech coaching, practice prompts, role-play simulations, progress insights, and learning suggestions.</p>
              <p style={{ marginBottom: "0.5rem" }}>AI-generated outputs may be inaccurate, incomplete, biased, delayed, or unsuitable for a specific context. They are educational aids and do not replace human judgment, teachers, parents, coaches, or professional advisors.</p>
              <p style={{ marginBottom: "0.5rem" }}>We may use automated tools to detect abusive content, unsafe behavior, academic dishonesty, impersonation, spam, or violations of our terms. Human review may be used where appropriate.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>9. Legal Basis for Processing</h3>
              <p style={{ marginBottom: "0.5rem" }}>Depending on jurisdiction, we process data based on consent, contractual necessity, legitimate interests, compliance with legal obligations, protection of users and platform integrity, educational service delivery, and, where applicable, parental or institutional authorization.</p>
              <p style={{ marginBottom: "0.5rem" }}>For India, processing is intended to align with the Digital Personal Data Protection Act, 2023, including notice, consent, legitimate uses, data-principal rights, and children’s data requirements where applicable.</p>
              <p style={{ marginBottom: "0.5rem" }}>For EU/UK users, processing is intended to align with GDPR/UK GDPR principles including lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity, confidentiality, and accountability.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>10. Children, Minors and Guardian Consent</h3>
              <p style={{ marginBottom: "0.5rem" }}>The platform is designed for users aged 16 and above. We do not knowingly provide unrestricted accounts to children below 16 without appropriate parental, guardian, school, or institutional authorization where required by law.</p>
              <p style={{ marginBottom: "0.5rem" }}>In India, a person below 18 may be treated as a child for certain personal-data purposes. Where the law requires verifiable parental consent, the parent/legal guardian or authorized institution must ensure such consent is validly obtained before the minor uses the platform.</p>
              <p style={{ marginBottom: "0.5rem" }}>In the EU/UK and other jurisdictions, digital-consent age may vary. Parents, guardians, schools, and institutions are responsible for ensuring lawful consent and supervision for student users below the applicable age threshold.</p>
              <p style={{ marginBottom: "0.5rem" }}>Parents or legal guardians may contact us to request review, correction, restriction, or deletion of a minor’s personal data, subject to verification and legal limits.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>11. Data Sharing and Third-Party Processors</h3>
              <p style={{ marginBottom: "0.5rem" }}>We may share data with trusted service providers such as cloud hosting providers, AI API providers, speech-to-text and text-to-speech providers, analytics tools, payment processors, customer support tools, email/SMS tools, security vendors, certification partners, and school/institution partners.</p>
              <p style={{ marginBottom: "0.5rem" }}>We require service providers to process data only for authorized purposes and to maintain reasonable security safeguards.</p>
              <p style={{ marginBottom: "0.5rem" }}>We may share data with schools, coaches, cohort administrators, tournament organizers, or institutional customers where the user joins through or participates in an institutional program.</p>
              <p style={{ marginBottom: "0.5rem" }}>We may disclose data if required by law, court order, regulator request, safety investigation, fraud prevention, legal claim, merger, acquisition, restructuring, or protection of rights and safety.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>12. No Sale of Personal Data</h3>
              <p style={{ marginBottom: "0.5rem" }}>We do not sell personal data as a standalone data-broker business.</p>
              <p style={{ marginBottom: "0.5rem" }}>We do not knowingly sell or share personal data of minors for behavioral advertising.</p>
              <p style={{ marginBottom: "0.5rem" }}>Advertising, analytics, and tracking practices, if introduced, will be disclosed through cookie notices or consent mechanisms where required by law.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>13. Cookies, Analytics and Tracking</h3>
              <p style={{ marginBottom: "0.5rem" }}>We may use cookies, pixels, SDKs, analytics tools, and similar technologies to maintain sessions, remember preferences, measure engagement, detect fraud, improve platform performance, and support marketing attribution.</p>
              <p style={{ marginBottom: "0.5rem" }}>Users can manage browser cookies through browser settings. Some features may not work properly if cookies are disabled.</p>
              <p style={{ marginBottom: "0.5rem" }}>Where required, users may be presented with cookie consent tools or opt-out mechanisms.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>14. International Data Transfers</h3>
              <p style={{ marginBottom: "0.5rem" }}>Because G Force AI may operate globally, personal data may be processed in countries other than the user’s country of residence.</p>
              <p style={{ marginBottom: "0.5rem" }}>Where required, we may rely on contractual safeguards, adequacy decisions, consent, legitimate operational necessity, or other lawful mechanisms for international transfers.</p>
              <p style={{ marginBottom: "0.5rem" }}>Users understand that privacy laws may differ across countries, but we aim to apply reasonable security and privacy safeguards across our operations.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>15. Data Retention</h3>
              <p style={{ marginBottom: "0.5rem" }}>We retain personal data only for as long as reasonably necessary for educational service delivery, account operation, legal compliance, dispute resolution, fraud prevention, security, billing, certification validation, and product improvement.</p>
              <p style={{ marginBottom: "0.5rem" }}>Voice recordings and transcripts may be retained for progress history, review, coaching, safety, or quality purposes unless deleted under applicable settings, account deletion, institutional agreement, or legal request.</p>
              <p style={{ marginBottom: "0.5rem" }}>Anonymized or aggregated data may be retained indefinitely for research, analytics, platform improvement, and reporting.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>16. User Rights</h3>
              <p style={{ marginBottom: "0.5rem" }}>Depending on applicable law, users may have rights to access personal data, correct inaccurate data, delete data, withdraw consent, restrict processing, object to processing, request portability, opt out of certain sharing, or complain to a regulator.</p>
              <p style={{ marginBottom: "0.5rem" }}>To exercise rights, email info@nanoskool.com with your name, registered email, account details, and request type.</p>
              <p style={{ marginBottom: "0.5rem" }}>We may verify identity before fulfilling requests and may refuse or limit requests where permitted by law, including for fraud prevention, legal claims, platform safety, certification records, billing obligations, or technical impossibility.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>17. Account Deletion and Data Export</h3>
              <p style={{ marginBottom: "0.5rem" }}>Users may request account deletion by contacting info@nanoskool.com or through in-app controls where available.</p>
              <p style={{ marginBottom: "0.5rem" }}>Account deletion may remove access to practice history, leaderboards, certificates, subscriptions, AI feedback, and cohort records.</p>
              <p style={{ marginBottom: "0.5rem" }}>Some data may remain in backups, legal records, transaction logs, abuse-prevention systems, anonymized datasets, or institutional records for a limited or legally necessary period.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>18. Security Measures</h3>
              <p style={{ marginBottom: "0.5rem" }}>We use commercially reasonable administrative, technical, and organizational safeguards including access controls, encryption where appropriate, audit logs, secure authentication, vendor review, monitoring, backup controls, and role-based internal access.</p>
              <p style={{ marginBottom: "0.5rem" }}>No internet platform can guarantee absolute security. Users are responsible for strong passwords, device safety, account confidentiality, and avoiding unsafe uploads or sharing of login credentials.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>19. User Responsibilities</h3>
              <p style={{ marginBottom: "0.5rem" }}>Users must use the platform lawfully, respectfully, and safely. Users must not submit illegal, abusive, defamatory, hateful, sexually explicit, violent, confidential, infringing, or privacy-violating content.</p>
              <p style={{ marginBottom: "0.5rem" }}>Users must not impersonate others, manipulate leaderboards, misuse AI tools, scrape platform data, reverse engineer systems, share accounts, record others without permission, or upload third-party voice/content without authorization.</p>
              <p style={{ marginBottom: "0.5rem" }}>Parents and guardians are responsible for monitoring minor users, preventing misuse, ensuring lawful consent, and reviewing the suitability of AI-generated content for the student.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>20. School and Institutional Use</h3>
              <p style={{ marginBottom: "0.5rem" }}>Where G Force AI is used through a school, college, coaching center, employer, NGO, or institution, that organization may control enrollment, access, leaderboards, dashboards, assignments, competitions, analytics, and reporting.</p>
              <p style={{ marginBottom: "0.5rem" }}>Institutions are responsible for obtaining required student/parent permissions, ensuring lawful use, and communicating program-specific privacy notices where applicable.</p>
              <p style={{ marginBottom: "0.5rem" }}>Institutional contracts may contain additional data-processing terms. In case of conflict, the signed institutional agreement may govern specific institutional data processing.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>21. Community, Competitions and Public Events</h3>
              <p style={{ marginBottom: "0.5rem" }}>If users participate in debates, MUN simulations, public-speaking contests, tournaments, showcases, webinars, livestreams, or public events, their name, image, voice, school, ranking, certificate, or performance may be visible depending on the event format and consent terms.</p>
              <p style={{ marginBottom: "0.5rem" }}>Separate event consent, media release, competition terms, or institutional approvals may apply.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>22. Changes to This Policy</h3>
              <p style={{ marginBottom: "0.5rem" }}>We may update this Privacy Policy from time to time to reflect product changes, legal updates, security improvements, or operational needs.</p>
              <p style={{ marginBottom: "0.5rem" }}>Material changes may be communicated through email, app notice, website notice, or account alert. Continued use after changes means acceptance of the updated policy.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>23. Contact</h3>
              <p style={{ marginBottom: "0.5rem" }}>For privacy questions, data requests, parental requests, school privacy coordination, or legal notices, contact: info@nanoskool.com</p>
              <p style={{ marginBottom: "0.5rem" }}>Privacy & Compliance Team, G Force AI / Grace & Force AI, Nanoskool Education Pvt Ltd, Wework Prestige Atlanta, Koramangala  Bengaluru, India</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>24. Legal Governance</h3>
              <p style={{ marginBottom: "0.5rem" }}>This Privacy Policy shall be governed by applicable Indian law, the Digital Personal Data Protection Act, 2023, applicable consumer protection laws, and where applicable, GDPR, UK GDPR, COPPA, and other relevant privacy laws based on user location and service context.</p>
              <p style={{ marginBottom: "0.5rem" }}>Disputes relating to privacy, platform use, data processing, payments, subscriptions, AI outputs, competitions, or digital services shall be subject to the jurisdiction and dispute-resolution mechanism stated in the G Force AI Terms of Service.</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>Appendix 1: Practical Privacy Controls Recommended for G Force AI Product Team</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>Age gate: require users to confirm they are 16+ and provide country of residence during onboarding.</li>
                <li>Parent/guardian flow: for users below legal adult age, provide guardian consent capture or institutional authorization workflow where applicable.</li>
                <li>Voice consent: show a clear microphone/recording notice before first recording and during live recording sessions.</li>
                <li>Display-name safety: allow students to use display names rather than full legal names on leaderboards.</li>
                <li>Leaderboard privacy: give schools/admins controls for private, cohort-only, institution-only, or public leaderboards.</li>
                <li>Recording deletion: provide account-level or institution-level deletion settings for recordings and transcripts where feasible.</li>
                <li>AI transparency: clearly label AI-generated feedback and prevent it from being treated as medical, legal, psychological, or employment advice.</li>
                <li>Data export/deletion: provide simple email or in-app rights-request process.</li>
                <li>No public promotion: do not use student recordings/images/voice in marketing without separate consent.</li>
                <li>Access controls: role-based dashboards for students, parents, coaches, schools, and admins.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* ── TERMS AND CONDITIONS ── */}
      <section className="lp-section" id="terms">
        <div className="lp-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="lp-section-header lp-reveal" style={{ textAlign: 'center' }}>
            <span className="lp-section-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Terms & Conditions</span>
            <h2 className="lp-section-h2">Terms and Conditions</h2>
            <p className="lp-section-sub">Effective Date: May 14, 2026</p>
          </div>
          <div className="lp-privacy-card" style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>1. General Policy</h3>
              <p>Because Grace & Force provides digital educational content, AI-powered coaching systems, live mentoring, downloadable resources, cohort-based learning, speech/debate simulations, AI voice interaction systems, certifications, and personalized performance analytics, all purchases are generally considered non-refundable once substantial access or usage has begun. However, limited refund windows are available under specific conditions described below.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>2. 7-Day Satisfaction Guarantee (Annual Pro/Max Only)</h3>
              <p>For eligible annual subscriptions (Pro or Max Yearly), users may request a refund within seven (7) calendar days from the date of enrollment if ALL the following conditions are met:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.4rem', marginBottom: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>The participant has completed less than 5% of the course/program.</li>
                <li>The participant has not attended more than one live mentoring/coaching session.</li>
                <li>The participant has not received certification.</li>
                <li>The participant has not violated community or platform policies.</li>
                <li>The participant submits the request in writing to info@nanoskool.com.</li>
              </ul>
              <p>Refund requests outside these conditions may be denied. <strong>Note: The 7-day refund guarantee is ONLY applicable for annual billing of Pro or Max plans.</strong></p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>3. Non-Refundable Services</h3>
              <p>The following purchases are strictly non-refundable: AI-generated personalized coaching reports, 1:1 mentoring sessions already completed, Debate tournament fees, MUN registrations, Certification examination fees, Custom enterprise/school solutions, Lifetime-access products, Discounted promotional purchases, Completed bootcamps, AI voice cloning/training services, Physical event tickets, and International immersion programs.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>4. Subscriptions</h3>
              <p>Users may cancel subscriptions at any time through their account dashboard. Cancellation stops future billing only. Already processed subscription payments are non-refundable. Access continues until the current billing cycle ends.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>5. Parental Consent & Minor Accounts</h3>
              <p>For users under the age required by local law, a parent/legal guardian must authorize purchases. Parents may request cancellation of recurring subscriptions at any time. Refunds remain subject to this policy.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>6. Cohort Programs & Live Bootcamps</h3>
              <p>Because cohort seats are limited: 14+ days before start: 80% refund. 7–13 days before start: 50% refund. Less than 7 days: No refund. Administrative/payment gateway fees may be deducted.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>7. Missed Classes & Rescheduling</h3>
              <p>No refunds or credits are provided for missed sessions, late arrivals, scheduling conflicts, voluntary withdrawal, internet/device issues on the user side, examination conflicts, travel limitations, or failure to participate. Users may reschedule a live coaching session if notice is given at least 24 hours before the scheduled session. Late cancellations or no-shows may result in forfeiture of the session.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>8. Platform Termination & Force Majeure</h3>
              <p>Grace & Force reserves the right to suspend or terminate access without refund if a user engages in abuse, harassment, hate speech, malicious AI manipulation, illegal recording, academic dishonesty, impersonation, or breaches child safety policies. Grace & Force shall not be liable for interruptions or cancellations caused by natural disasters, pandemics, internet outages, cyberattacks, government restrictions, or circumstances beyond reasonable control.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>9. Chargeback Fraud Prevention</h3>
              <p>Grace & Force maintains enrollment records, login activity, attendance logs, AI interaction logs, and digital consent records to prevent fraudulent chargebacks and comply with payment regulations.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>10. Payment Gateways & Refund Processing</h3>
              <p>Payments processed through third-party providers (Stripe, Razorpay, Apple, Google Play, PayPal) may additionally be governed by those platforms’ refund policies. Approved refunds are processed to the original payment method and may take 7–14 business days depending on banking/payment provider timelines.</p>
            </div>

            <div>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>11. Contact & Legal Governance</h3>
              <p>Refund and cancellation requests must be submitted to: <strong>info@nanoskool.com</strong> with full name, registered email, order ID, program purchased, and reason for request. This policy shall be governed by applicable Indian law, the Digital Personal Data Protection Act (DPDP), applicable consumer protection laws, and where applicable, GDPR consumer regulations for EU/UK users.</p>
            </div>

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
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq'], ['Privacy & Terms', '#privacy'], ['Terms and Conditions', '#terms'], ['Login', '/login'], ['Get Started', '/register']].map(([label, href]) => (
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
