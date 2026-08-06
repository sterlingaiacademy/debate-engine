import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ChevronRight, School, User, Phone, Mail, Users, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

export default function EnglishSessionRegister({ user }) {
  const navigate = useNavigate();
  // Only pre-fill grade if it's a valid number between 3 and 8
  const initialGrade = (user?.grade || user?.classLevel || '').toString();
  const validGrade = ['3', '4', '5', '6', '7', '8'].includes(initialGrade) ? initialGrade : '';

  const [form, setForm] = useState({
    studentName: user?.name || '',
    parentName: '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || '',
    countryCode: '+91',
    schoolName: user?.schoolName || user?.school || '',
    grade: validGrade,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.parentName || !form.email || !form.mobile || !form.schoolName || !form.grade) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }
    
    const gradeNum = parseInt(form.grade.replace(/[^0-9]/g, ''), 10);
    if (isNaN(gradeNum) || gradeNum < 3 || gradeNum > 8) {
      setErrorMsg("This session is exclusively for students from Grade 3 to Grade 8.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/english-session/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          studentName: form.studentName,
          parentName: form.parentName,
          email: form.email,
          mobile: `${form.countryCode} ${form.mobile.trim()}`,
          schoolName: form.schoolName,
          grade: form.grade,
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

  const InputField = ({ label, icon: Icon, type = "text", name, value, onChange, placeholder, required = true, isSelect = false, options = [] }) => {
    const isFocused = focusedInput === name;
    
    return (
      <motion.div variants={fadeInUp} className="flex flex-col gap-1.5 w-full">
        <label className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider pl-1">
          {label}
        </label>
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'opacity-0'}`} />
          <div className={`relative flex items-center bg-slate-900/50 backdrop-blur-md border ${isFocused ? 'border-blue-500/50' : 'border-white/10'} rounded-xl transition-colors duration-300 overflow-hidden`}>
            <div className={`pl-4 pr-3 py-3 transition-colors ${isFocused ? 'text-blue-400' : 'text-slate-400'}`}>
              <Icon size={18} />
            </div>
            {isSelect ? (
              <select
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocusedInput(name)}
                onBlur={() => setFocusedInput(null)}
                className={`w-full bg-transparent border-none py-3 pr-4 text-base outline-none cursor-pointer appearance-none ${value ? 'text-white' : 'text-slate-500'}`}
              >
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => (
                  <option key={opt.value} value={opt.value} className="text-black">{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocusedInput(name)}
                onBlur={() => setFocusedInput(null)}
                placeholder={placeholder}
                className="w-full bg-transparent border-none py-3 pr-4 text-white placeholder-slate-600 outline-none text-base"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-[#020617] text-white flex flex-col items-center justify-center font-['Plus_Jakarta_Sans'] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-6 shadow-2xl"
        >
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-blue-500/20 p-4 rounded-full">
              <CheckCircle2 size={64} className="text-blue-500" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-4 tracking-tight">
            Registration Successful!
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8 text-lg">
            You have successfully registered for the "Speak English Without Fear" live session. See you on August 9th!
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')} 
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none py-4 px-8 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
          >
            Go to Dashboard <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-['Plus_Jakarta_Sans'] pb-20 relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-[20%] w-[60%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 px-6 pt-16 lg:pt-24 items-center lg:items-start">
        
        {/* Hero Section */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-4 lg:pt-12"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
            <div className="bg-red-600 px-3 py-1 rounded shadow-lg shadow-red-600/20 font-black tracking-wider text-sm">
              NANO SKOOL
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="font-extrabold text-blue-400 tracking-wider text-sm flex items-center gap-1">
              GRACE<span className="text-white">&</span>FORCE.COM
            </div>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white block">SPEAK ENGLISH</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-200 block">WITHOUT FEAR!</span>
          </motion.h1>
          
          <motion.div variants={fadeInUp} className="mt-6 mb-8 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 rounded-full font-bold text-sm md:text-base tracking-wide shadow-lg shadow-orange-500/20 border border-orange-400/30">
            <Sparkles size={18} className="text-orange-200" />
            Parent-Child Confidence-Building Session
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl font-medium">
            Experience AI-Powered English Speaking Practice. Overcome hesitation, speak clearly, and build confidence together!
          </motion.p>
          
          <motion.div variants={staggerContainer} className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
            {[
              { icon: Users, label: "Grades 3-8 & Parents" },
              { icon: CheckCircle2, label: "09 Aug 2026 • 4:00 PM" },
              { icon: User, label: "Ms Sohini Roy Biswas", sub: "English Faculty, 21K School" }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} whileHover={{ y: -5 }} className="flex flex-col items-center lg:items-start gap-3">
                <div className="bg-blue-500/10 p-3.5 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <feature.icon size={28} />
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-bold text-slate-200">{feature.label}</span>
                  {feature.sub && <span className="text-xs text-slate-400 mt-1">{feature.sub}</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="w-full lg:w-1/2 max-w-md w-full shrink-0"
        >
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
            
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />

            <div className="text-center mb-8 relative">
              <h2 className="text-2xl font-black text-white mb-2">Free Live Practical Session</h2>
              <p className="text-slate-400 text-sm font-medium">Register below to secure your spot via Zoom</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-5 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Student Name" icon={User} name="studentName" value={form.studentName} onChange={v => setForm({...form, studentName: v})} placeholder="E.g. Rahul" />
                <InputField label="Parent Name" icon={Users} name="parentName" value={form.parentName} onChange={v => setForm({...form, parentName: v})} placeholder="E.g. Amit" />
              </div>

              <InputField label="Email Address" icon={Mail} type="email" name="email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="parent@example.com" />
              
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider pl-1">
                  WhatsApp Number
                </label>
                <div className="flex gap-3">
                  <div className="relative group w-28 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                    <select 
                      value={form.countryCode}
                      onChange={e => setForm({...form, countryCode: e.target.value})}
                      className="relative w-full h-full bg-slate-900/50 backdrop-blur-md border border-white/10 focus:border-blue-500/50 rounded-xl px-3 text-white text-base outline-none cursor-pointer appearance-none transition-colors"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code} className="text-black">{c.code} {c.country}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur transition-opacity duration-300 ${focusedInput === 'mobile' ? 'opacity-30' : 'opacity-0'}`} />
                      <div className={`relative flex items-center bg-slate-900/50 backdrop-blur-md border ${focusedInput === 'mobile' ? 'border-blue-500/50' : 'border-white/10'} rounded-xl transition-colors duration-300 overflow-hidden`}>
                        <div className={`pl-4 pr-3 py-3 transition-colors ${focusedInput === 'mobile' ? 'text-blue-400' : 'text-slate-400'}`}>
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          required
                          value={form.mobile}
                          onChange={e => setForm({...form, mobile: e.target.value})}
                          onFocus={() => setFocusedInput('mobile')}
                          onBlur={() => setFocusedInput(null)}
                          placeholder="9876543210"
                          className="w-full bg-transparent border-none py-3 pr-4 text-white placeholder-slate-600 outline-none text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <InputField label="School Name" icon={School} name="schoolName" value={form.schoolName} onChange={v => setForm({...form, schoolName: v})} placeholder="Your School" />
              
              <InputField 
                label="Grade" 
                icon={GraduationCap} 
                name="grade" 
                value={form.grade} 
                onChange={v => setForm({...form, grade: v})} 
                placeholder="Select Grade (3-8)" 
                isSelect={true}
                options={[3,4,5,6,7,8].map(g => ({ value: String(g), label: `Grade ${g}` }))}
              />

              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold mt-2"
                  >
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.4)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                type="submit" 
                disabled={loading}
                className={`w-full mt-4 py-4 rounded-xl text-white font-black text-lg flex items-center justify-center gap-2 transition-all ${
                  loading ? 'bg-slate-700 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-500/20 border border-orange-400/30'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Register Free via ZOOM <ArrowRight size={20} /></>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
