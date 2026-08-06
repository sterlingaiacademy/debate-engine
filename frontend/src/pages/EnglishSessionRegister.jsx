import React, { useState } from 'react';
import { User, Users, Phone, Mail, GraduationCap, School, CheckCircle, Sparkles, MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';

const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+971', country: 'UAE' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+65', country: 'Singapore' },
  { code: '+974', country: 'Qatar' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+968', country: 'Oman' },
  { code: '+973', country: 'Bahrain' },
  { code: '+965', country: 'Kuwait' }
];

export default function EnglishSessionRegister() {
  const [form, setForm] = useState({
    studentName: '',
    parentName: '',
    mobile: '',
    countryCode: '+91',
    email: '',
    schoolName: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbyfE9K21v8-K82W17C32R2oU2iB5WJ8R9u9g1YyU-X9T6qO1G9c0v9sZ8/exec', {
        method: 'POST',
        body: new URLSearchParams({
          formType: 'english_session',
          ...form,
          fullMobile: `${form.countryCode}${form.mobile}`
        })
      });
      
      const result = await response.json();
      if (result.result === 'success') {
        setSuccess(true);
      } else {
        throw new Error(result.error || 'Failed to register');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#020617', padding: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center text-center"
          style={{
            maxWidth: '500px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,107,0,0.2)',
            borderRadius: '24px',
            padding: '4rem 2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,0,0.1)'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{ marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '50%' }}
          >
            <CheckCircle size={64} color="#10b981" />
          </motion.div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Registration Successful!</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Thank you for registering for the <strong>Speak English Without Fear</strong> session! We will share the Zoom details on your WhatsApp number shortly.
          </p>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/"
            style={{
              padding: '0.875rem 2rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MoveRight size={18} /> Return to Home
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' }}>
      
      {/* Background Animated Orbs */}
      <motion.div 
        animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'rgba(255,107,0,0.15)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}
      />
      <motion.div 
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '10%', right: '15%', width: '500px', height: '500px', background: 'rgba(124,58,237,0.1)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}
      />
      <motion.div 
        animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'rgba(0,212,255,0.1)', borderRadius: '50%', filter: 'blur(90px)', zIndex: 0 }}
      />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
          style={{ marginBottom: '3rem' }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Sparkles size={16} color="#FF6B00" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e2e8f0' }}>NANO SKOOL <span style={{ color: '#FF6B00', margin: '0 0.5rem' }}>|</span> GRACE & FORCE.COM</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            SPEAK ENGLISH<br/>
            <span style={{ color: '#FF6B00' }}>WITHOUT FEAR!</span>
          </h1>

          <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 700, color: '#fba11b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} /> Parent-Child Confidence-Building Session
            </span>
          </div>
          
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2rem' }}>
            Experience AI-Powered English Speaking Practice. Overcome hesitation, speak clearly, and build confidence together!
          </p>

          <div className="flex flex-wrap justify-center gap-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem 0', width: '100%', maxWidth: '700px' }}>
             <div className="flex flex-col items-center gap-2">
                <Users size={24} color="#94a3b8" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Grades 3-8 & Parents</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <CheckCircle size={24} color="#94a3b8" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>09 Aug 2026 • 4:00 PM</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <User size={24} color="#94a3b8" />
                <div className="flex flex-col items-center">
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Ms Sohini Roy Biswas</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>English Faculty, 21K School</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '560px',
            margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}
        >
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Free Live Practical Session</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Register below to secure your spot via Zoom</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            
            <div className="flex flex-col" style={{ gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Student Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required 
                    value={form.studentName}
                    onChange={e => setForm({...form, studentName: e.target.value})}
                    placeholder="E.g. Rahul Kumar"
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Parent Name</label>
                <div style={{ position: 'relative' }}>
                  <Users size={18} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required 
                    value={form.parentName}
                    onChange={e => setForm({...form, parentName: e.target.value})}
                    placeholder="E.g. Amit Kumar"
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  required 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="parent@example.com"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>WhatsApp Number</label>
              <div className="flex gap-2">
                <select 
                  value={form.countryCode}
                  onChange={e => setForm({...form, countryCode: e.target.value})}
                  style={{ width: '110px', padding: '1rem 0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer', transition: '0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code} style={{ color: '#000' }}>{c.code} {c.country}</option>
                  ))}
                </select>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="tel" 
                    required 
                    value={form.mobile}
                    onChange={e => setForm({...form, mobile: e.target.value})}
                    placeholder="9876543210"
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>School Name</label>
              <div style={{ position: 'relative' }}>
                <School size={18} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  required 
                  value={form.schoolName}
                  onChange={e => setForm({...form, schoolName: e.target.value})}
                  placeholder="Your School"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Grade</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={18} color="#64748b" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                <select 
                  required
                  value={form.grade}
                  onChange={e => setForm({...form, grade: e.target.value})}
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: form.grade ? '#fff' : '#64748b', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: '0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <option value="" disabled>Select Grade (3 to 8 only)</option>
                  {[3,4,5,6,7,8].map(g => (
                    <option key={g} value={g} style={{ color: '#000' }}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}
              >
                {errorMsg}
              </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '1.2rem', 
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF9500 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '1.15rem', 
                fontWeight: 800, 
                cursor: loading ? 'not-allowed' : 'pointer', 
                opacity: loading ? 0.7 : 1, 
                marginTop: '1rem', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem', 
                boxShadow: '0 8px 25px rgba(255, 107, 0, 0.35)',
                transition: 'box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = '0 12px 30px rgba(255, 107, 0, 0.5)'}
              onMouseLeave={(e) => e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 0, 0.35)'}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Processing...
                </>
              ) : 'Register Free at GraceandForce.com'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
