import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { GradientBars } from '../components/ui/gradient-bars';
import { TrustElements } from '../components/ui/trust-elements';
import ShinyButton from '../components/ui/shiny-button';
import SpinnerButton from '../components/ui/spinner-button';
import {
  Mic, Zap, Trophy, BarChart2, Globe, Star, ChevronDown,
  CheckCircle, ArrowRight, Play, Shield, Brain, Sparkles, Users, Download
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



/* ─── FAQ Accordion ─── */
const FAQS = [
  { q: 'What age group is G Force AI designed for?', a: 'G Force AI is designed for students from KG through Class 12, with 5 adaptive difficulty levels that automatically match their school class.' },
  { q: 'How does the AI scoring work?', a: 'Our AI judge evaluates 8 dimensions: argument quality, rebuttal engagement, clarity, speech fluency, persuasiveness, knowledge & evidence, respectfulness, and position consistency — giving a holistic debate score.' },
  { q: 'Can students use the mobile app and web app together?', a: 'Yes! Both the Android app and web app connect to the same backend and Supabase database, so scores, leaderboards, and progress sync in real time across devices.' },
  { q: 'What is Mock UN mode?', a: 'Mock UN is a premium debate simulation where students take on country delegate personas and debate global motions in a United Nations-style format, powered by ElevenLabs voice AI.' },
  { q: 'Is there a free tier?', a: 'Yes! The Free tier includes unlimited practice debates with limited ranked matches per day. School and Enterprise plans unlock unlimited ranked debates, advanced analytics, and priority support.' },
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
          G Force AI uses advanced voice AI to coach students from KG to Class 12 in real-time debates — scoring arguments, tracking growth, and building the leaders of tomorrow.
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
              { icon: <Trophy size={28} />, title: 'Global Leaderboards', desc: 'Students compete on ELO-rated leaderboards — filterable by class, school, region, and country — driving healthy competition.', color: '#FBBF24' },
              { icon: <Globe size={28} />, title: 'Mock UN Mode', desc: 'An immersive simulation where students play country delegates and debate global motions in a voice-powered UN format.', color: '#E8392A' },
              { icon: <Zap size={28} />, title: 'Voice-First AI', desc: 'Powered by ElevenLabs, students speak naturally and get instant AI responses, building real speaking confidence.', color: '#F97316' },
              { icon: <Shield size={28} />, title: 'Adaptive Levels', desc: 'Five difficulty tiers automatically matched to school class (KG → Class 12) ensure every student is appropriately challenged.', color: '#FBBF24' },
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
              { num: '01', icon: <Users size={32} />, title: 'Create Your Account', desc: 'Sign up with your student ID and pick your school class. The platform automatically assigns the right debate level for you.' },
              { num: '02', icon: <Mic size={32} />, title: 'Pick a Debate Mode', desc: 'Choose from Ranked Debates, Persona Practice, or Mock UN. Select your topic, pick a side, and start speaking.' },
              { num: '03', icon: <Star size={32} />, title: 'Get Scored & Improve', desc: 'Receive a detailed AI report card after every debate. Track your ELO rating, streaks, and badges as you improve over time.' },
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
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <span className="lp-section-badge">Pricing</span>
            <h2 className="lp-section-h2">Simple, Transparent Pricing</h2>
            <p className="lp-section-sub">Start free. Scale with your school.</p>
          </div>
          <div className="lp-pricing-grid">
            {[
              {
                name: 'Free', price: '₹0', period: '/forever',
                desc: 'Perfect for individual students getting started.',
                highlight: false,
                features: ['3 ranked debates/day', 'All 5 difficulty levels', 'Basic AI scoring report', 'Global leaderboard access', 'Android & Web app'],
                cta: 'Get Started Free', ctaLink: '/register',
              },
              {
                name: 'Individual', price: '₹999', period: '/month',
                desc: 'For students wanting to accelerate their growth.',
                highlight: false,
                features: ['Unlimited practice debates', '10 ranked debates/day', 'Detailed AI scoring report', 'Priority support', 'Android & Web app'],
                cta: 'Get Individual Plan', ctaLink: '/register',
              },
              {
                name: 'School', price: '₹2999', period: '/student/month',
                desc: 'Ideal for classrooms and debate clubs.',
                highlight: true,
                features: ['Unlimited ranked debates', 'Mock UN access', 'Detailed 8-dimension report', 'Teacher analytics dashboard', 'Class & school leaderboards', 'Priority support'],
                cta: 'Start School Plan', ctaLink: '/register',
              },
              {
                name: 'Enterprise', price: 'Custom', period: '',
                desc: 'For institutions needing full control.',
                highlight: false,
                features: ['Everything in School', 'Bulk student onboarding', 'Custom AI personas', 'White-label branding', 'Dedicated account manager', 'SLA & uptime guarantee'],
                cta: 'Contact Sales', ctaLink: '/register',
              },
            ].map(({ name, price, period, desc, highlight, features, cta, ctaLink }) => (
              <div key={name} className={`lp-pricing-card lp-reveal ${highlight ? 'lp-pricing-featured' : ''}`}>
                {highlight && <div className="lp-pricing-badge">Most Popular</div>}
                <div className="lp-pricing-name">{name}</div>
                <div className="lp-pricing-price">
                  <span className="lp-pricing-amount">{price}</span>
                  <span className="lp-pricing-period">{period}</span>
                </div>
                <p className="lp-pricing-desc">{desc}</p>
                <ul className="lp-pricing-features">
                  {features.map(f => (
                    <li key={f}><CheckCircle size={16} color={highlight ? '#F97316' : '#10b981'} />{f}</li>
                  ))}
                </ul>
                <Link to={ctaLink} className={`lp-pricing-cta ${highlight ? 'lp-btn-brand' : 'lp-btn-outline-dark'}`}>
                  {cta} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
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
