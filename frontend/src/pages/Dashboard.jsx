import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Trophy, TrendingUp, BarChart2, Star, Zap, Award, Clock,
  MessageSquare, Mic, Flame, Shield, Crown, Sparkles, Target, Heart,
  Sword, BookOpen, FileText, Medal, Gem, RefreshCw, Dumbbell, MessageCircle,
  Brain, Globe, Users, ChevronRight, Cpu, Radio, CheckCircle2, Flag, X
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import HUDCard from '../components/HUDCard';
import { API_BASE } from '../api';
import PremiumEnrollModal from '../components/PremiumEnrollModal';
import { COUNTRY_CODES } from '../countryCodes';

const ThinkQuestModal = ({ user, onDismiss, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState('');
  
  const SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Sciences', 'CT & AI'];

  const [formData, setFormData] = useState({
    name: user?.name || '',
    classLevel: '',
    email: user?.email || '',
    countryCode: '+91',
    phone: '',
    city: '',
    state: '',
    subjects: [],
  });

  const [indForm, setIndForm] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    countryCode: '+91',
    schoolName: user?.school || '',
    category: 'Student',
    grade: '',
    city: '',
    state: '',
    subjects: [],
  });

  const [indSubmitting, setIndSubmitting] = useState(false);
  const [indError, setIndError] = useState('');
  
  const handleIndChange = (e) => setIndForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleSubject = (subject, isInd = false) => {
    if (isInd) {
      setIndForm(prev => ({ ...prev, subjects: prev.subjects.includes(subject) ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject] }));
    } else {
      setFormData(prev => ({ ...prev, subjects: prev.subjects.includes(subject) ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject] }));
    }
  };

  const handleIndividualEnroll = async (e) => {
    e.preventDefault();
    if (!indForm.studentName || !indForm.email || !indForm.mobile || !indForm.grade || !indForm.schoolName || !indForm.city || !indForm.state) {
      setIndError('Please fill in all required fields.');
      return;
    }
    setIndSubmitting(true);
    setIndError('');
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: indForm.email,
          school_code: 'INDIVIDUAL',
          name: indForm.studentName,
          classLevel: indForm.grade,
          age: null,
          city: indForm.city,
          state: indForm.state,
          contactEmail: indForm.email,
          parentPhone: `${indForm.countryCode} ${indForm.mobile.trim()}`,
          parentName: indForm.schoolName,
          subjects: indForm.subjects.join(', '),
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to register.');

      setSchoolName('INDIVIDUAL');
      setStep(3); // Go to success step
    } catch (err) {
      setIndError(err.message || 'Network error. Please try again.');
      setIndSubmitting(false);
    }
  };

  const handleVerify = async (isIndividual = false) => {
    setError('');
    
    if (isIndividual) {
      setCode('INDIVIDUAL');
      setSchoolName('Independent Participant');
      setStep(2);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/olympiad/verify-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_code: code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSchoolName(data.school.name);
        setStep(2);
      } else {
        setError(data.error || 'Invalid School Code');
      }
    } catch (e) {
      setError('Error verifying code. Check connection.');
    }
  };

  const handleEnroll = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/olympiad/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          school_code: code,
          name: formData.name,
          classLevel: formData.classLevel,
          contactEmail: formData.email,
          parentPhone: `${formData.countryCode} ${formData.phone.trim()}`,
          city: formData.city,
          state: formData.state,
          subjects: formData.subjects.join(', '),
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.error || 'Enrollment failed.');
      }
    } catch (e) {
      setError('Error enrolling. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: 8,
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem',
    boxSizing: 'border-box', height: '46px'
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s' }}>
      <div style={{ width: '95%', maxWidth: step === 4 ? '660px' : '420px', maxHeight: step === 4 ? '96vh' : '90vh', overflowY: step === 4 ? 'visible' : 'auto', background: 'linear-gradient(135deg, #1f0505 0%, #3d0a0a 100%)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: step === 4 ? '1.5rem 1.75rem' : '2rem', position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {step !== 3 && (
          <button onClick={onDismiss} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        )}
        
        {step === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={24} color="#ef4444" strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>ThinkQuest <span style={{ color: '#ef4444' }}>Olympiad</span></h2>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.15rem' }}>Enter your School Code to join</div>
              </div>
            </div>
            
            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            
            <input 
              type="text" 
              placeholder="ENTER SCHOOL CODE" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em' }}
              autoFocus
            />
            <button 
              onClick={() => handleVerify(false)}
              disabled={!code.trim()}
              style={{ width: '100%', padding: '1rem', borderRadius: 12, background: code.trim() ? '#ef4444' : 'rgba(239,68,68,0.3)', color: '#fff', fontSize: '1.05rem', fontWeight: 800, border: 'none', cursor: code.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginBottom: '1rem' }}
            >
              Verify Code
            </button>

            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>OR</div>

            <button 
              onClick={() => setStep(4)}
              style={{ width: '100%', padding: '1rem', borderRadius: 12, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Individual Registration
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0, marginBottom: '0.5rem', textAlign: 'center' }}>Student Details</h2>
            <div style={{ fontSize: '0.85rem', color: '#ef4444', textAlign: 'center', marginBottom: '1.25rem', fontWeight: 600 }}>Enrolling in: {schoolName}</div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <input type="text" placeholder="Full Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />

            <input type="email" placeholder="Email Address *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />

            {/* Phone with country code */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select
                value={formData.countryCode}
                onChange={e => setFormData({...formData, countryCode: e.target.value})}
                style={{ ...inputStyle, width: '90px', padding: '0 0.5rem', marginBottom: 0, flexShrink: 0 }}
              >
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} style={{ background: '#1e293b', color: '#fff' }}>{c.code}</option>)}
              </select>
              <input type="tel" placeholder="WhatsApp Number *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            </div>

            <select value={formData.classLevel} onChange={e => setFormData({...formData, classLevel: e.target.value})} style={{...inputStyle, appearance: 'none', backgroundColor: 'rgba(0,0,0,0.4)', color: formData.classLevel ? '#fff' : '#94a3b8'}}>
              <option value="" disabled>Select Grade *</option>
              {Array.from({length: 8}, (_, i) => `Grade ${i + 5}`).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="City *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              <input type="text" placeholder="State *" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            </div>

            {/* Subject Selection */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Select Subjects</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SUBJECTS.map(s => (
                  <div key={s} onClick={() => toggleSubject(s)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: 99, border: `1px solid ${formData.subjects.includes(s) ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, background: formData.subjects.includes(s) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.8rem', fontWeight: 600, color: formData.subjects.includes(s) ? '#ef4444' : '#94a3b8', userSelect: 'none' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${formData.subjects.includes(s) ? '#ef4444' : '#475569'}`, background: formData.subjects.includes(s) ? '#ef4444' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {formData.subjects.includes(s) && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleEnroll}
              disabled={!formData.name || !formData.classLevel || !formData.email || !formData.phone || !formData.city || !formData.state}
              style={{ width: '100%', padding: '1rem', borderRadius: 12, background: (formData.name && formData.classLevel && formData.email && formData.phone && formData.city && formData.state) ? '#ef4444' : 'rgba(239,68,68,0.3)', color: '#fff', fontSize: '1.05rem', fontWeight: 800, border: 'none', cursor: (formData.name && formData.classLevel && formData.email && formData.phone && formData.city && formData.state) ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginTop: '1rem' }}
            >
              Complete Enrollment
            </button>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Star size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>Success!</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              You have been successfully enrolled {schoolName === 'INDIVIDUAL' ? 'as an individual participant' : <>in <strong>{schoolName}</strong></>} for the ThinkQuest Olympiad!
            </p>
            <button 
              onClick={onSuccess}
              style={{ width: '100%', padding: '1rem', borderRadius: 12, background: '#ef4444', color: '#fff', fontSize: '1.05rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
            >
              Enter Olympiad Dashboard
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={22} color="#ef4444" strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Individual <span style={{ color: '#ef4444' }}>Registration</span></h2>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.1rem' }}>ThinkQuest Olympiad</div>
              </div>
            </div>

            {indError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: 8 }}>{indError}</div>}

            <form onSubmit={handleIndividualEnroll}>
              {/* Row 1: Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Full Name</label>
                  <input type="text" name="studentName" value={indForm.studentName} onChange={handleIndChange} placeholder="e.g. Rahul Sharma" style={{ ...inputStyle, height: 44, padding: '0 0.9rem', marginBottom: 0, fontSize: '0.88rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Email</label>
                  <input type="email" name="email" value={indForm.email} onChange={handleIndChange} placeholder="rahul@email.com" style={{ ...inputStyle, height: 44, padding: '0 0.9rem', marginBottom: 0, fontSize: '0.88rem' }} required />
                </div>
              </div>

              {/* Row 2: WhatsApp — fixed layout so number field doesn't stretch */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>WhatsApp Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select name="countryCode" value={indForm.countryCode} onChange={handleIndChange} style={{ ...inputStyle, width: '100px', height: 44, padding: '0 0.5rem', marginBottom: 0, fontSize: '0.88rem', flexShrink: 0 }}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} style={{ background: '#1e293b', color: '#fff' }}>{c.code}</option>)}
                  </select>
                  <input type="tel" name="mobile" value={indForm.mobile} onChange={handleIndChange} placeholder="Enter your number" style={{ ...inputStyle, flex: 1, height: 44, padding: '0 0.9rem', marginBottom: 0, fontSize: '0.88rem' }} required />
                </div>
              </div>

              {/* Row 3: School / Organisation + Grade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>School / Organisation</label>
                  <input type="text" name="schoolName" value={indForm.schoolName} onChange={handleIndChange} placeholder="e.g. DPS" style={{ ...inputStyle, height: 44, padding: '0 0.9rem', marginBottom: 0, fontSize: '0.88rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Grade</label>
                  <select name="grade" value={indForm.grade} onChange={handleIndChange} style={{ ...inputStyle, height: 44, padding: '0 0.5rem', marginBottom: 0, fontSize: '0.88rem' }} required>
                    <option value="" disabled>Select</option>
                    {Array.from({length: 8}, (_, i) => `Grade ${i + 5}`).map(c => <option key={c} value={c} style={{ background: '#1e293b', color: '#fff' }}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: City + State */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>City</label>
                  <input type="text" name="city" value={indForm.city} onChange={handleIndChange} placeholder="City" style={{ ...inputStyle, height: 44, padding: '0 0.9rem', marginBottom: 0, fontSize: '0.88rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>State</label>
                  <input type="text" name="state" value={indForm.state} onChange={handleIndChange} placeholder="State" style={{ ...inputStyle, height: 44, padding: '0 0.9rem', marginBottom: 0, fontSize: '0.88rem' }} required />
                </div>
              </div>


              {/* Row 5: Subjects */}
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Select Subjects</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {SUBJECTS.map(s => (
                    <div key={s} onClick={() => toggleSubject(s, true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: 99, border: `1px solid ${indForm.subjects.includes(s) ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, background: indForm.subjects.includes(s) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.82rem', fontWeight: 600, color: indForm.subjects.includes(s) ? '#ef4444' : '#94a3b8', userSelect: 'none' }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${indForm.subjects.includes(s) ? '#ef4444' : '#475569'}`, background: indForm.subjects.includes(s) ? '#ef4444' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {indForm.subjects.includes(s) && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={indSubmitting}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 12, background: indSubmitting ? 'rgba(239,68,68,0.5)' : '#ef4444', color: '#fff', fontSize: '1rem', fontWeight: 800, border: 'none', cursor: indSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                {indSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Helpers ─── */
const formatCategory = (key) => {
  const map = {
    avg_argument: 'Argument', avg_rebuttal: 'Rebuttal', avg_clarity: 'Clarity',
    avg_fluency: 'Fluency', avg_persuasiveness: 'Persuasion', avg_knowledge: 'Knowledge',
    avg_respect: 'Respect', avg_consistency: 'Consistency',
    'Argument Quality': 'Argument', 'Rebuttal & Engagement': 'Rebuttal',
    'Clarity & Coherence': 'Clarity', 'Speech Fluency': 'Fluency',
    'Persuasiveness': 'Persuasion', 'Knowledge & Evidence': 'Knowledge',
    'Respectfulness & Tone': 'Respect', 'Consistency & Position': 'Consistency',
  };
  return map[key] || key;
};

function getScoreBar(val, color) {
  return (
    <div className="skill-bar-track" style={{ height: 6, marginTop: 4 }}>
      <div
        className="skill-bar-fill"
        style={{
          width: `${(val / 10) * 100}%`,
          background: color,
          '--bar-delay': '100ms',
        }}
      />
    </div>
  );
}

let cachedStats = null;
let cachedStudentId = null;

/* ─── Mode card data ─── */
const SENIOR_MODES = [
  {
    id: 'debate',
    title: 'Debate Arena',
    desc: '1-on-1 ranked debate with AI. Earn GForce tokens and climb the global leaderboard.',
    tag: 'RANKED',
    icon: Zap,
    color: '#FF6B00',
    grad: 'linear-gradient(135deg, #1c0a00, #3d1200)',
    glow: 'rgba(255,107,0,0.35)',
    available: true,
    path: (isJunior) => isJunior ? '/debate' : '/debate-instructions?next=/debate',
  },
  {
    id: 'mock-un',
    title: 'Model UN',
    desc: 'Represent your country in a global diplomacy session. Negotiate, persuade, and lead.',
    tag: 'WORLD STAGE',
    icon: Globe,
    color: '#00d4ff',
    grad: 'linear-gradient(135deg, #00101a, #001f36)',
    glow: 'rgba(0,212,255,0.25)',
    path: () => '/debate-instructions?next=/mock-un',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
  {
    id: 'persona',
    title: 'Wisdom Arena',
    desc: 'Step into the shoes of historical legends — debate as Gandhi, Churchill, or Lincoln.',
    tag: 'ROLEPLAY',
    icon: Users,
    color: '#a855f7',
    grad: 'linear-gradient(135deg, #0d001a, #1b0036)',
    glow: 'rgba(168,85,247,0.3)',
    path: () => '/debate-instructions?next=/persona',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
  {
    id: 'supertutor',
    title: 'Super Tutor',
    desc: 'Your personal AI coach. Ask questions, drill concepts, and sharpen your technique.',
    tag: 'COACHING',
    icon: Brain,
    color: '#10b981',
    grad: 'linear-gradient(135deg, #001a11, #002a1a)',
    glow: 'rgba(16,185,129,0.25)',
    path: () => '/conversational-agent',
    available: true,
  },
  {
    id: 'speech-coach',
    title: 'Speech Coach',
    desc: 'Work on your vocal clarity, pacing, and delivery with your personal AI speech trainer.',
    tag: 'SPEECH',
    icon: Radio,
    color: '#e879f9',
    grad: 'linear-gradient(135deg, #1a001f, #2d0040)',
    glow: 'rgba(232,121,249,0.25)',
    path: () => '/speech-coach',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  },
  {
    id: 'speech-analysis',
    title: 'Speech Analysis',
    desc: 'Analyze your spoken debate speeches with AI to get actionable feedback and metrics.',
    tag: 'ANALYSIS',
    icon: Mic,
    color: '#3b82f6',
    grad: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
    glow: 'rgba(59,130,246,0.25)',
    path: () => '/speech-analysis',
    levels: ['Level 3', 'Level 4', 'Level 5'],
  }
];

const JUNIOR_MODES = [
  { id: 'debate', title: 'Debate Practice', desc: 'Talk with your AI friend and practice speaking!', color: '#7c3aed', grad: 'linear-gradient(135deg, #7c3aed, #a855f7)', icon: Mic, path: () => '/debate' },
  { id: 'mock-un', title: 'Model UN', desc: 'Be a world leader and discuss big ideas!', color: '#0ea5e9', grad: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', icon: Globe, path: () => '/mock-un', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'persona', title: 'Famous Figures', desc: 'Debate as legendary heroes from history!', color: '#d946ef', grad: 'linear-gradient(135deg, #d946ef, #a855f7)', icon: Users, path: () => '/persona', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'supertutor', title: 'Super Tutor', desc: 'Ask your AI any question — it always helps!', color: '#10b981', grad: 'linear-gradient(135deg, #10b981, #34d399)', icon: Brain, path: () => '/conversational-agent' },
  { id: 'speech-coach', title: 'Speech Coach', desc: 'Improve your speaking skills with AI voice training!', color: '#e879f9', grad: 'linear-gradient(135deg, #e879f9, #a855f7)', icon: Radio, path: () => '/speech-coach', levels: ['Level 3', 'Level 4', 'Level 5'] },
  { id: 'speech-analysis', title: 'Speech Analysis', desc: 'Get your speeches analyzed by AI for instant feedback!', color: '#3b82f6', grad: 'linear-gradient(135deg, #3b82f6, #60a5fa)', icon: Mic, path: () => '/speech-analysis', levels: ['Level 3', 'Level 4', 'Level 5'] },
];

const BADGE_ICON_MAP = {
  first_debate: Flame, ten_debates: Dumbbell, fifty_debates: Shield, hundred_debates: Crown,
  score_8_plus: Star, score_9_plus: Sparkles, all_above_5: Target, all_above_7: Gem,
  perfect_respect: Heart, argument_master: Brain, rebuttal_master: Sword, fluency_master: Mic,
  evidence_master: BookOpen, persuasion_master: MessageSquare, streak_3: Flame, streak_5: Zap,
  streak_10: Trophy, big_improvement: TrendingUp, words_10k: MessageCircle, words_50k: FileText,
  elo_1200: Medal, elo_1500: Award, elo_1800: Star, elo_2000: Gem, elo_2200: Crown,
};

const ALL_BADGES = [
  { id: 'first_debate',     name: 'First Flame',    desc: 'Complete your first debate',           color: '#f97316' },
  { id: 'ten_debates',      name: 'Contender',      desc: 'Complete 10 debates',                  color: '#f97316' },
  { id: 'fifty_debates',    name: 'Gladiator',      desc: 'Complete 50 debates',                  color: '#ef4444' },
  { id: 'hundred_debates',  name: 'Conqueror',      desc: 'Complete 100 debates',                 color: '#eab308' },
  { id: 'score_8_plus',     name: 'Sharp Mind',     desc: 'Score 8.0+ in a debate',               color: '#facc15' },
  { id: 'score_9_plus',     name: 'Elite Debater',  desc: 'Score 9.0+ in a debate',               color: '#a855f7' },
  { id: 'all_above_5',      name: 'All-Rounder',    desc: 'Score 5+ in all categories',           color: '#06b6d4' },
  { id: 'all_above_7',      name: 'Diamond Mind',   desc: 'Score 7+ in all categories',           color: '#8b5cf6' },
  { id: 'perfect_respect',  name: 'Diplomat',       desc: 'Score 10/10 in Respectfulness',        color: '#10b981' },
  { id: 'argument_master',  name: 'The Arguer',     desc: 'Score 9+ in Argument Quality',         color: '#6366f1' },
  { id: 'rebuttal_master',  name: 'Rebuttal King',  desc: 'Score 9+ in Rebuttal',                 color: '#ef4444' },
  { id: 'fluency_master',   name: 'Orator',         desc: 'Score 9+ in Speech Fluency',           color: '#f59e0b' },
  { id: 'evidence_master',  name: 'Scholar',        desc: 'Score 9+ in Knowledge',                color: '#0ea5e9' },
  { id: 'persuasion_master',name: 'Persuader',      desc: 'Score 9+ in Persuasiveness',           color: '#d946ef' },
  { id: 'streak_3',         name: 'On a Roll',      desc: 'Debate 3 days in a row',               color: '#f97316' },
  { id: 'streak_5',         name: 'Fire Streak',    desc: 'Debate 5 days in a row',               color: '#ef4444' },
  { id: 'streak_10',        name: 'Unstoppable',    desc: 'Debate 10 days in a row',              color: '#eab308' },
  { id: 'big_improvement',  name: 'Rising Star',    desc: 'Improve score 2+ pts in a row',        color: '#10b981' },
  { id: 'words_10k',        name: 'Wordsmith',      desc: 'Speak 10k+ words total',               color: '#06b6d4' },
  { id: 'words_50k',        name: 'Grand Orator',   desc: 'Speak 50k+ words total',               color: '#8b5cf6' },
  { id: 'elo_1200',         name: 'Bronze Mind',    desc: 'Reach 1,200 tokens',                   color: '#cd7f32' },
  { id: 'elo_1500',         name: 'Silver Tongue',  desc: 'Reach 1,500 tokens',                   color: '#94a3b8' },
  { id: 'elo_1800',         name: 'Gold Debater',   desc: 'Reach 1,800 tokens',                   color: '#eab308' },
  { id: 'elo_2000',         name: 'Sapphire Elite', desc: 'Reach 2,000 tokens',                   color: '#38bdf8' },
  { id: 'elo_2200',         name: 'Amethyst',       desc: 'Reach 2,200 tokens',                   color: '#a855f7' },
];

const TIER_ICON_MAP = {
  Unranked: <Shield size={20} color="#64748b" strokeWidth={2} />,
  Bronze:   <Medal size={20} color="#cd7f32" strokeWidth={2} />,
  Silver:   <Award size={20} color="#94a3b8" strokeWidth={2} />,
  Gold:     <Star  size={20} color="#eab308" strokeWidth={2} />,
  Platinum: <Gem   size={20} color="#38bdf8" strokeWidth={2} />,
  Diamond:  <Sparkles size={20} color="#818cf8" strokeWidth={2} />,
  Master:   <Trophy size={20} color="#f97316" strokeWidth={2} />,
  Grandmaster: <Crown size={20} color="#ec4899" strokeWidth={2} />,
};

const StatBadge = ({ icon: Icon, label, value, color, isJunior }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: isJunior ? '#fff' : `${color}10`, 
    border: `1.5px solid ${color}30`,
    padding: '0.5rem 0.85rem', borderRadius: 16,
    whiteSpace: 'nowrap', flexShrink: 0,
    boxShadow: isJunior ? `0 4px 12px ${color}15` : 'none',
  }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color={color} strokeWidth={2.5} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: isJunior ? 'var(--j-text)' : 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isJunior ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                            */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(() =>
    (user?.studentId || user?.username) === cachedStudentId ? cachedStats : null
  );
  const [loading, setLoading] = useState(!stats);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showThinkQuestModal, setShowThinkQuestModal] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ loading: false, msg: '', type: '' });

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus({ loading: true, msg: '', type: '' });
    try {
      const activeId = user?.studentId || user?.username;
      const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: activeId, couponCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponStatus({ loading: false, msg: data.message, type: 'success' });
        setCouponCode('');
        // School/plan upgrade code
        if (data.plan) {
          const updatedUser = { ...user, subscription_plan: data.plan, subscription_status: 'active' };
          if (setUser) setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Clear stats cache so dashboard re-fetches fresh time limits on return
          cachedStats = null;
          cachedStudentId = null;
          // Navigate to the congratulations page (same as Razorpay flow)
          setTimeout(() => navigate(`/premium-success?plan=${data.plan}`), 800);
        } else {
          // Regular time coupon — optimistically add seconds
          if (stats && stats.timeLimits && !stats.timeLimits.error) {
            const bonusSeconds = couponCode.toUpperCase() === 'VVIP30' ? 1800 : 600;
            setStats(prev => ({
              ...prev,
              timeLimits: {
                ...prev.timeLimits,
                remainingRanked: prev.timeLimits.remainingRanked + bonusSeconds,
                limitTotal: prev.timeLimits.limitTotal + bonusSeconds
              }
            }));
          }
          setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
        }
      } else {
        setCouponStatus({ loading: false, msg: data.error || 'Failed to redeem', type: 'error' });
        setTimeout(() => { setShowCoupon(false); setCouponStatus({ loading: false, msg: '', type: '' }); }, 2500);
      }
    } catch (err) {
      setCouponStatus({ loading: false, msg: 'Network error', type: 'error' });
    }
  };

  const isJunior = ['Level 1', 'Level 2', 'Class 1-3', 'Class 3-5', 'KG', 'Class KG', 'KG-2', 'Class 1-5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'kg'].includes(user?.classLevel) && !['Professional', 'College Student'].includes(user?.grade);

  const getNormalizedLevel = (cls) => {
    if (user?.grade === 'Professional' || user?.grade === 'College Student' || user?.category === 'Professional') return 'Level 5';
    if (!cls) return 'Level 1';
    if (cls.startsWith('Level ')) return cls;
    if (['KG', 'kg', 'Class 1', 'Class 2', 'Class KG', 'KG-2', 'Class 1-3', 'Class 1-5'].includes(cls)) return 'Level 1';
    if (['Class 3', 'Class 4', 'Class 5', 'Class 3-5'].includes(cls)) return 'Level 2';
    if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) return 'Level 3';
    if (['Class 9', 'Class 10'].includes(cls)) return 'Level 4';
    if (['Class 11', 'Class 12'].includes(cls)) return 'Level 5';
    // Any other category like Professional or College Student gets Level 5 access
    return 'Level 5';
  };
  const normalizedLevel = getNormalizedLevel(user?.classLevel);
  const isBasicLevel = ['Level 1', 'Level 2'].includes(normalizedLevel);

  const [minimunRegistered, setMinimunRegistered] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetch(`${API_BASE}/api/minimun/status/${user.email}`)
        .then(res => res.json())
        .then(data => setMinimunRegistered(data.registered))
        .catch(console.error);
    }
  }, [user?.email]);

  useEffect(() => {
    const activeId = user?.studentId || user?.username;
    if (!activeId) return;
    if (activeId === cachedStudentId && cachedStats) {
      setStats(cachedStats); setLoading(false);
    }
    Promise.all([
      fetch(`${API_BASE}/api/analytics/${activeId}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API_BASE}/api/time-limits/${activeId}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => null),
    ]).then(([analyticsData, timeData]) => {
      const combined = { ...analyticsData, timeLimits: timeData || { remainingRanked: 600, error: true } };
      cachedStats = combined; cachedStudentId = activeId;
      setStats(combined);
      if (setUser) setUser(prev => {
        const updated = { ...prev, gforceTokens: Math.round(combined.gforce_tokens || 0), streak: combined.current_streak || 0, rank: combined.tier?.name || null };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      setLoading(false);
    }).catch(() => { setStats(prev => prev || { error: true }); setLoading(false); });
  }, [user?.studentId, user?.username]);

  if (!user) return null;

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: isJunior ? '#7c3aed' : '#FF6B00', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Loading your stats...</span>
      </div>
    );
  }

  /* ─── Data ─── */
  const gforce = Math.round(stats.gforce_tokens || 0);
  const tier = stats.tier || { name: 'Unranked', color: '#64748b' };
  const TierIcon = () => TIER_ICON_MAP[tier.name] || <Shield size={20} color={tier.color} />;
  const dailyMins = stats?.timeLimits && !stats.timeLimits.error ? Math.floor(stats.timeLimits.remainingRanked / 60) : null;
  const earnedSet = new Set((stats.badges || []).map(b => b.id || b));
  const earnedBadges = ALL_BADGES.filter(b => earnedSet.has(b.id));
  const lockedBadges = ALL_BADGES.filter(b => !earnedSet.has(b.id));
  const displayBadges = [...earnedBadges, ...lockedBadges].slice(0, 12);

  const recentScoresData = (stats.score_trend || []).map((d, i) => ({ name: `#${i + 1}`, score: d.overall_score }));
  const skillData = Object.entries(stats.category_averages || {})
    .filter(([, val]) => val !== null)
    .map(([key, val]) => ({ subject: formatCategory(key), A: val, fullMark: 10 }));

  const modes = isJunior ? JUNIOR_MODES : SENIOR_MODES;
  const availableModes = modes.filter(m => {
    if (isBasicLevel && (m.id === 'supertutor' || m.id === 'speech-coach')) return false;
    if (m.levels) return m.levels.includes(normalizedLevel);
    if (m.accessKey) return normalizedLevel === m.accessKey;
    return true;
  });

  /* ─── Chart theming ─── */
  const chartBg    = isJunior ? '#fff' : 'transparent';
  const gridColor  = isJunior ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.05)';
  const axisColor  = isJunior ? '#a78bfa' : '#334155';
  const lineColor  = isJunior ? '#7c3aed' : '#FF6B00';
  const radarFill  = isJunior ? 'rgba(124,58,237,0.12)' : 'rgba(255,107,0,0.1)';
  const radarStroke= isJunior ? '#7c3aed' : '#FF6B00';

  /* ══════════════════════════════════════════════════════════
     SENIOR DASHBOARD
  ══════════════════════════════════════════════════════════ */
  if (!isJunior) return (
    <>
      {showPremiumModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.85)', overflowY: 'auto' }}>
          <PremiumEnrollModal user={user} onDismiss={() => setShowPremiumModal(false)} />
        </div>
      )}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '4rem' }}>

      {/* ── Hero Greeting ── */}
      <div className="welcome-card animate-fade-in" style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 24, padding: '2rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(0,0,0,0) 60%)',
        border: '1px solid rgba(255,107,0,0.12)',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00 0%, #f97316 100%)', border: '2px solid rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px rgba(255,107,0,0.3)' }}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user.name?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                Welcome back
              </div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                <span className="gradient-text">{user.name}</span>
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.2rem' }}>
                @{user.studentId}
              </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>

              {user.classLevel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    {user.grade
                      ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                      : user.classLevel}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', color: '#FF6B00', padding: '0.1rem 0.4rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                    {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'PRO' : 'DEMO'}
                  </div>
                </div>
              )}
              
              {/* Redeem Coupon Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
                {!showCoupon ? (
                  <div
                    onClick={() => setShowCoupon(true)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: 99, padding: '3px 10px',
                      fontSize: 12, fontWeight: 700, color: '#fb923c',
                      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                      lineHeight: 1, height: 26, boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; }}
                  >
                    Redeem
                  </div>
                ) : couponStatus.msg ? (
                  // Inline success/error message inside the pill
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: couponStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${couponStatus.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 99, padding: '3px 10px',
                    fontSize: 12, fontWeight: 700,
                    color: couponStatus.type === 'success' ? '#10b981' : '#ef4444',
                    lineHeight: 1, height: 26, boxSizing: 'border-box', whiteSpace: 'nowrap',
                  }}>
                    {couponStatus.msg}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.25)',
                    borderRadius: 99, padding: '0.15rem 0.3rem 0.15rem 0.65rem',
                    animation: 'fadeIn 0.2s'
                  }}>
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        background: 'transparent', border: 'none', color: '#ffedd5', width: '90px', fontSize: '0.72rem',
                        fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none', letterSpacing: '0.05em',
                      }}
                      autoFocus
                      onBlur={() => { if (!couponCode && !couponStatus.loading) setShowCoupon(false); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
                    />
                    <button
                      onClick={handleRedeemCoupon}
                      disabled={couponStatus.loading || !couponCode.trim()}
                      style={{
                        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        color: '#fb923c', padding: '0.2rem 0.6rem', borderRadius: 99,
                        fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer',
                        opacity: couponStatus.loading || !couponCode.trim() ? 0.5 : 1
                      }}
                    >
                      {couponStatus.loading ? '...' : 'APPLY'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

          {dailyMins !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Daily Time Left</span>
                <span style={{ color: '#fff' }}>{dailyMins}m</span>
              </div>
              <div className="xp-track" style={{ height: 6, background: 'rgba(0,0,0,0.2)' }}>
                <div className="xp-fill" style={{ width: `${Math.min((dailyMins / 60) * 100, 100)}%`, background: '#fff' }} />
              </div>
            </div>
          )}
        </div>

        {/* Demo Account Upgrade Banner (Senior) */}
        {(!user?.subscription_plan || user?.subscription_plan === 'free') && stats?.timeLimits && stats.timeLimits.remainingRanked <= 0 && (
          <div 
            onClick={() => setShowPremiumModal(true)}
            style={{ 
              position: 'relative', zIndex: 2, marginTop: '2rem', padding: '1rem 1.25rem', borderRadius: 16, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.05))',
              border: '1px solid rgba(255,107,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(255,107,0,0.1)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,107,0,0.08))'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.05))'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: 'rgba(255,107,0,0.2)', color: '#FF6B00', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Crown size={22} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.01em' }}>Demo Account</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upgrade to Pro to unlock unlimited time and features!</span>
              </div>
            </div>
            <div style={{ background: '#FF6B00', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}>
              Upgrade Now <ChevronRight size={16} />
            </div>
          </div>
        )}
      </div>

      {/* ── Mode Cards ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Choose Your Mode</h2>
        </div>
        <div className="no-scrollbar modes-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {availableModes.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => navigate(mode.path(isJunior))}
                className="mode-card"
                style={{
                  background: mode.grad,
                  border: `1px solid ${mode.color}25`,
                  color: '#fff',
                  minHeight: 200,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  animation: `cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                }}
              >
                {/* Top dec */}


                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${mode.color}25`, border: `1px solid ${mode.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={mode.color} strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: mode.color, background: `${mode.color}18`, border: `1px solid ${mode.color}30`, padding: '0.2rem 0.6rem', borderRadius: 99 }}>
                      {mode.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>{mode.title}</h3>
                  <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0, lineHeight: 1.55 }}>{mode.desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: mode.color }}>
                  <span>Start Now</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

            {/* ── Event Tiles ── */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Upcoming Events</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* G-Talk Cohort 2 */}
        <div
          onClick={() => navigate('/cohort')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e0f2d 0%, #291244 100%)',
            border: '1px solid rgba(168,85,247,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(168,85,247,0.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,85,247,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(168,85,247,0.1)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #a855f7, #e879f9)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#a855f7', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              LIVE COHORT 2.0
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#a855f7" strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            G-Talk <span style={{ color: '#a855f7' }}>Cohort 2</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
            Master Public Speaking & Debating with live online sessions, interactive exercises, and peer feedback.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#a855f7' }}>
            Learn More <ChevronRight size={14} />
          </div>
        </div>






        {/* ThinkQuest Olympiad */}
        <div
          onClick={() => {
            if (user?.olympiad_registered) {
              navigate('/olympiad-dashboard');
            } else {
              setShowThinkQuestModal(true);
            }
          }}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1f0505 0%, #3d0a0a 100%)',
            border: '1px solid rgba(239,68,68,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(239,68,68,0.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(239,68,68,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(239,68,68,0.1)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ef4444, #fca5a5)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
                  NEW CHALLENGE
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={16} color="#ef4444" strokeWidth={2.5} />
                </div>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                <span style={{ color: '#ef4444' }}>ThinkQuest</span> Olympiad
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
                Practice daily for the Grand Cognitive Challenge!
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>
              Register Now <ChevronRight size={14} />
            </div>
          </div>
        </div>

        {/* Indus MUN Hybrid */}
        <div
          onClick={() => navigate('/indus-mun')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(234,179,8,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(234,179,8,0.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(234,179,8,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(234,179,8,0.1)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #eab308, #fef08a)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#eab308', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              NEW EVENT
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#eab308" strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Indus MUN <span style={{ color: '#eab308' }}>Hybrid</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            International Hybrid MUN for Grades 6 to 12. Registration is Free.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#eab308' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>

        {/* Speak English Without Fear */}
        <div
          onClick={() => navigate('/english-session')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
            border: '1px solid rgba(13,148,136,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(13,148,136,0.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(13,148,136,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,148,136,0.1)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #0d9488, #5eead4)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#14b8a6', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              FREE SESSION
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={16} color="#14b8a6" strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Speak English <span style={{ color: '#14b8a6' }}>Without Fear</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Parent-Child Confidence-Building Session (Grades 3–8). 16.08.2026.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#14b8a6' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>

        {/* Great India Freedom Challenge */}
        <div
          onClick={() => navigate('/freedom-quiz')}
          style={{
            borderRadius: 18, padding: '1.4rem 1.5rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #431407 0%, #1a0500 100%)',
            border: '1px solid rgba(249,115,22,0.2)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.25s, box-shadow 0.25s',
            boxShadow: '0 4px 24px rgba(249,115,22,0.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(249,115,22,0.1)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f97316, #fdba74)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.22)', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
              NEW CHALLENGE
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flag size={16} color="#f97316" strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Great India <span style={{ color: '#f97316' }}>Freedom Challenge</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Freedom Quiz for All Indian Citizens on August 15th, 2026. Free Registration!
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#f97316' }}>
            Register Now <ChevronRight size={14} />
          </div>
        </div>
      </div>
      </div>
    </div>

      {showThinkQuestModal && (
        <ThinkQuestModal
          user={user}
          onDismiss={() => setShowThinkQuestModal(false)}
          onSuccess={() => {
            if (setUser) setUser({ ...user, olympiad_registered: true });
            setShowThinkQuestModal(false);
            navigate('/olympiad-dashboard');
          }}
        />
      )}
    </>
  );

  /* ══════════════════════════════════════════════════════════
     JUNIOR DASHBOARD
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      {showPremiumModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', overflowY: 'auto' }}>
          <PremiumEnrollModal user={user} onDismiss={() => setShowPremiumModal(false)} />
        </div>
      )}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* ── Hero Welcome Card ── */}
      <div className="welcome-card" style={{
        borderRadius: 28, padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #e879f9 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(124,58,237,0.4)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0 }}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : user.name?.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.1rem' }}>Welcome back!</div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{user.name}</h1>
            <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700, marginTop: '0.1rem' }}>
              @{user.studentId}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                  {user.grade
                    ? (user.grade.startsWith('Class') ? user.grade.replace('Class', 'Grade') : user.grade)
                    : user.classLevel}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, background: '#fff', color: '#7c3aed', padding: '0.1rem 0.4rem', borderRadius: 4, letterSpacing: '0.05em' }}>
                  {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'PRO' : 'DEMO'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Account Upgrade Banner (Junior) */}
        {(!user?.subscription_plan || user?.subscription_plan === 'free') && stats?.timeLimits && stats.timeLimits.remainingRanked <= 0 && (
          <div 
            onClick={() => setShowPremiumModal(true)}
            style={{ 
              position: 'relative', zIndex: 2, marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 20, cursor: 'pointer',
              background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#fff', color: '#7c3aed', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Crown size={24} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Demo Account</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Upgrade to Pro for unlimited fun!</span>
              </div>
            </div>
            <div style={{ background: '#fff', color: '#7c3aed', padding: '0.6rem 1.25rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Upgrade <ChevronRight size={16} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* ── Mode Cards ── */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 1rem', color: 'var(--j-text)' }}>Let's Practice!</h2>
        <div className="no-scrollbar modes-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px), 1fr))', gap: '1rem' }}>
          {availableModes.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => navigate(mode.path(true))}
                style={{
                  background: mode.grad,
                  borderRadius: 24, padding: '1.5rem',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  minHeight: 160,
                  boxShadow: `0 6px 24px ${mode.color}30`,
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
                  position: 'relative', overflow: 'hidden',
                  animation: `cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 40px ${mode.color}45`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${mode.color}30`; }}
              >
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{mode.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85, lineHeight: 1.45 }}>{mode.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {showThinkQuestModal && (
        <ThinkQuestModal
          user={user}
          onDismiss={() => setShowThinkQuestModal(false)}
          onSuccess={() => {
            if (setUser) setUser({ ...user, olympiad_registered: true });
            setShowThinkQuestModal(false);
            navigate('/olympiad/practice');
          }}
        />
      )}
    </>
  );
}
