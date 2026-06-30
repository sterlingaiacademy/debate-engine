import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Monitor, Award, ChevronRight, CheckCircle2, Globe, Users, BookOpen } from 'lucide-react';
import { API_BASE } from '../api';

const ROLES = ['Teacher', 'MUN Coordinator', 'Principal', 'Other'];
const EXPERIENCES = ['0-2 years', '3-5 years', '5+ years'];
const HEAR_ABOUT = ['Social Media', 'Email Newsletter', 'Colleague/Friend', 'Other'];

export default function MUNMentorRegister({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    schoolName: user?.school || '',
    city: '',
    role: '',
    experience: '',
    reason: '',
    hearAbout: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(typeof window !== 'undefined' && !!window.Razorpay);

  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile || !form.role || !form.schoolName || !form.experience) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!razorpayReady) {
      setErrorMsg('Payment gateway is still loading. Please wait a moment.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/munmentor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          role: form.role,
          schoolName: form.schoolName,
          city: form.city,
          experience: form.experience,
          reason: form.reason,
          hearAbout: form.hearAbout,
        }),
      });
      const data = await res.json();
      
      if (res.status === 409) {
        setStatus('already');
        setSubmitting(false);
        return;
      }
      
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment.');

      const options = {
        key: 'rzp_live_SpxzVJVdO5A5xr',
        amount: data.amount,
        currency: 'INR',
        name: 'MUN Mentor Master Class',
        description: 'Certificate Programme Registration',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/munmentor/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                registrationId: data.registrationId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setStatus('success');
            } else {
              setErrorMsg('Payment verification failed. Please contact support.');
            }
          } catch {
            setErrorMsg('Payment verification error. Please contact support.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
            setErrorMsg('Payment was cancelled. Please try again.');
          }
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.mobile,
        },
        theme: {
          color: '#F97316'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setErrorMsg(`Payment Failed: ${response.error.description}`);
        setSubmitting(false);
      });
      rzp.open();
      
    } catch (err) {
      setErrorMsg(err.message || 'Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '0.875rem 1.1rem',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '0.45rem',
  };

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#FBBF24'; e.target.style.background = 'rgba(251,191,36,0.04)'; },
    onBlur: e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; },
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 24, padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
          <CheckCircle2 size={72} color="#10b981" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Registration Successful!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
            Thank you for registering for the <strong>MUN Mentor Master Class</strong>. Your payment was successful and we will contact you soon with further details.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', padding: '1rem 2.5rem',
              borderRadius: 99, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 24, padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #F97316, #ea580c)' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Already Registered
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 2.5rem' }}>
            You have already registered and paid for the MUN Mentor Master Class.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              color: '#fff', border: 'none', padding: '0.9rem 2.5rem',
              borderRadius: 99, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* ── PROGRAMME DETAILS (Extracted from Poster) ── */}
      <div style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 24, padding: '3rem 2rem', marginBottom: '2.5rem',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FBBF24, #F97316)' }} />
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251,191,36,0.1)', color: '#FBBF24', padding: '0.5rem 1.2rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '1.5rem' }}>
            <Award size={16} /> CERTIFICATE PROGRAMME
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            MUN Mentor <br/><span style={{ color: '#FBBF24' }}>Master Class</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            INSPIRE LEADERS. SHAPE THE FUTURE.
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', margin: '1rem auto 0', maxWidth: 500, lineHeight: 1.6 }}>
            Exclusive training for Teachers & MUN Coordinators.
          </p>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <Calendar size={32} color="#FBBF24" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Duration</div>
            <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>10 Days</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <Clock size={32} color="#00d4ff" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Schedule</div>
            <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>Fridays & Saturdays <br/>Evening</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, margin: '0 auto 1rem' }}>₹</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Fee</div>
            <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: 800 }}>INR 999/-</div>
          </div>
        </div>

        {/* Benefits & Gains */}
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
            What You Will Gain
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: BookOpen, title: 'Comprehensive MUN Knowledge', desc: 'From basics to advanced strategies' },
              { icon: Monitor, title: 'Committee Management Skills', desc: 'Plan, organize and run successful MUNs' },
              { icon: Users, title: 'Student Mentorship Techniques', desc: 'Nurture confident global citizens' },
              { icon: Globe, title: 'Global Educator Network', desc: 'Connect, collaborate and grow' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={20} color="#FBBF24" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{item.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REGISTRATION FORM ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: '2.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FBBF24, #F97316)' }} />

        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
            Register for the Master Class
          </h2>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
            Fill in your details below to register. You will be prompted to complete the payment of INR 999 securely via Razorpay.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" style={fieldStyle} {...focusHandlers} required />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number *</label>
              <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="Mobile number" style={fieldStyle} {...focusHandlers} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" style={fieldStyle} {...focusHandlers} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Role / Designation *</label>
              <select name="role" value={form.role} onChange={handleChange} style={{ ...fieldStyle, cursor: 'pointer' }} {...focusHandlers} required>
                <option value="" style={{ background: '#0a0a0a' }}>Select your role</option>
                {ROLES.map(r => (
                  <option key={r} value={r} style={{ background: '#0a0a0a' }}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Years of Experience *</label>
              <select name="experience" value={form.experience} onChange={handleChange} style={{ ...fieldStyle, cursor: 'pointer' }} {...focusHandlers} required>
                <option value="" style={{ background: '#0a0a0a' }}>Select experience level</option>
                {EXPERIENCES.map(e => (
                  <option key={e} value={e} style={{ background: '#0a0a0a' }}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>School / Institution Name *</label>
              <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="Full name of your school" style={fieldStyle} {...focusHandlers} required />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Your city" style={fieldStyle} {...focusHandlers} />
            </div>
          </div>
          
          <div>
            <label style={labelStyle}>Why do you want to join this Master Class?</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Briefly describe your goals..." style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} {...focusHandlers} />
          </div>

          <div>
            <label style={labelStyle}>How did you hear about us?</label>
            <select name="hearAbout" value={form.hearAbout} onChange={handleChange} style={{ ...fieldStyle, cursor: 'pointer' }} {...focusHandlers}>
              <option value="" style={{ background: '#0a0a0a' }}>Select an option</option>
              {HEAR_ABOUT.map(h => (
                <option key={h} value={h} style={{ background: '#0a0a0a' }}>{h}</option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !razorpayReady}
            style={{
              background: (submitting || !razorpayReady) ? 'rgba(251,191,36,0.5)' : 'linear-gradient(135deg, #FBBF24, #F59E0B)',
              color: '#1a1a1a', border: 'none', padding: '1.1rem 2rem',
              borderRadius: 12, fontWeight: 900, fontSize: '1.05rem',
              cursor: (submitting || !razorpayReady) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(251,191,36,0.3)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
              marginTop: '1rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
            }}
          >
            {!razorpayReady ? 'Loading Gateway...' : submitting ? 'Processing...' : 'Register & Pay INR 999'} 
            {(!submitting && razorpayReady) && <ChevronRight size={18} strokeWidth={2.5} />}
          </button>
        </form>
      </div>
    </div>
  );
}
