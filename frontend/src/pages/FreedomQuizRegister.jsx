import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, ChevronRight, User, Phone, Mail, Calendar, Flag, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function FreedomQuizRegister({ user }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || '',
    countryCode: '+91',
    city: '',
    age: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.city || !form.age) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/freedom-quiz/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: `${form.countryCode} ${form.mobile.trim()}`,
          city: form.city,
          age: form.age,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden', position: 'relative' }}>
        
        {/* Background tricolor accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)' }} />
        
        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,153,51,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(19,136,8,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50 }}
          style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: '4rem 2.5rem', textAlign: 'center', maxWidth: 480, margin: '2rem', position: 'relative', zIndex: 10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 60, delay: 0.2 }}
            style={{ display: 'inline-flex', background: 'rgba(19,136,8,0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}
          >
            <CheckCircle2 size={64} color="#16a34a" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(to right, #ff9933, #ffffff, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem', letterSpacing: '-0.02em' }}
          >
            Jai Hind!
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}
          >
            You have successfully registered for the <strong style={{ color: '#e2e8f0' }}>Great India Freedom Challenge</strong>. Get ready for the quiz on August 15th!
          </motion.p>
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(255,153,51,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'linear-gradient(135deg, #ff9933, #ea580c)', color: '#fff', border: 'none', padding: '1.1rem 2.5rem', borderRadius: 16, fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
          >
            Go to Dashboard <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden', position: 'relative' }}>
      
      {/* Dynamic Backgrounds */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)', zIndex: 10 }} />
      
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,153,51,0.2) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }}
      />
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(19,136,8,0.2) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }}
      />

      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', minHeight: '100vh', padding: '2rem', gap: '2rem', maxWidth: '1400px', margin: '0 auto', alignItems: 'center' }}>
        
        {/* Left Column: Hero Content */}
        <motion.div 
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}
        >
          <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '0.4rem 0.8rem', borderRadius: 8, fontWeight: 900, letterSpacing: '0.05em', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>
              NANO SKOOL
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontWeight: 800, color: '#ff9933', letterSpacing: '0.05em', fontSize: '1.1rem' }}>
              GRACE<span style={{ color: '#fff' }}>&</span>FORCE.COM
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.5rem', background: 'linear-gradient(to right, #ff9933, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GREAT INDIA
            </h1>
            <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #138808, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 10px 30px rgba(19, 136, 8, 0.3)' }}>
              FREEDOM CHALLENGE
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.3)', padding: '0.75rem 1.5rem', borderRadius: 99, width: 'fit-content' }}>
            <Award size={20} color="#ff9933" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.05em', color: '#ff9933' }}>
              NATIONAL FREEDOM QUIZ
            </span>
          </motion.div>

          <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 500 }}>
            Celebrate India's Heritage and Achievements! Compete nationally and win exciting Cash Vouchers up to <strong style={{ color: '#fff' }}>₹10,000</strong>.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(255,153,51,0.15)', padding: '0.75rem', borderRadius: 12, color: '#ff9933' }}>
                <Flag size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Eligibility</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>All Indian Citizens</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(19,136,8,0.15)', padding: '0.75rem', borderRadius: 12, color: '#4ade80' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Event Date</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>15 August 2026</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Registration Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 50, delay: 0.3 }}
          style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}
        >
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,153,51,0.1)', padding: '0.75rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <Sparkles size={28} color="#ff9933" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Free Registration
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Join thousands of citizens across India.</p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Form Input Group */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required 
                    value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})}
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s' }}
                    onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,153,51,0.5)' }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="email" 
                    required 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="citizen@india.com"
                    style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s' }}
                    onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,153,51,0.5)' }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>WhatsApp Number</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select 
                    value={form.countryCode}
                    onChange={e => setForm({...form, countryCode: e.target.value})}
                    style={{ width: '110px', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff', fontSize: '1.05rem', outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} style={{ color: '#000' }}>{c.code}</option>
                    ))}
                  </select>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone size={20} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="tel" 
                      required 
                      value={form.mobile}
                      onChange={e => setForm({...form, mobile: e.target.value})}
                      placeholder="9876543210"
                      style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s' }}
                      onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,153,51,0.5)' }}
                      onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>City / State</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={20} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      required 
                      value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                      placeholder="Mumbai, MH"
                      style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s' }}
                      onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,153,51,0.5)' }}
                      onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Age</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={20} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="number" 
                      required 
                      min="5"
                      max="100"
                      value={form.age}
                      onChange={e => setForm({...form, age: e.target.value})}
                      placeholder="E.g. 24"
                      style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s' }}
                      onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,153,51,0.5)' }}
                      onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, color: '#fca5a5', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {errorMsg}
                </motion.div>
              )}

              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: '0 10px 30px rgba(19, 136, 8, 0.3)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{ width: '100%', padding: '1.25rem', background: 'linear-gradient(135deg, #ff9933, #ea580c)', color: '#fff', border: 'none', borderRadius: 16, fontSize: '1.15rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', letterSpacing: '0.05em' }}
              >
                {loading ? 'Processing...' : 'Register Now'} <ChevronRight size={22} />
              </motion.button>
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
