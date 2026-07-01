import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Monitor, Award, ChevronRight, CheckCircle2, Globe, Users, Play, Shield } from 'lucide-react';
import { API_BASE } from '../api';
import { COUNTRY_CODES } from '../countryCodes';

export default function MiniMunRegister({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    countryCode: '+91',
    schoolName: user?.school || '',
    grade: '',
    city: '',
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
    if (!form.studentName || !form.email || !form.mobile || !form.grade || !form.schoolName || !form.city) {
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
      const res = await fetch(`${API_BASE}/api/minimun/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.studentId || user?.username || null,
          studentName: form.studentName,
          email: form.email,
          mobile: `${form.countryCode} ${form.mobile.trim()}`,
          grade: form.grade,
          schoolName: form.schoolName,
          city: form.city,
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
        name: 'Mini MUN Sunday',
        description: 'Programme Registration',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/minimun/verify-payment`, {
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
          name: form.studentName,
          email: form.email,
          contact: `${form.countryCode}${form.mobile.trim()}`,
        },
        theme: {
          color: '#1d4ed8' // Blue theme
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
    onFocus: e => { e.target.style.borderColor = '#ef4444'; e.target.style.background = 'rgba(239,68,68,0.04)'; },
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
            Thank you for registering for <strong>Mini MUN Sunday</strong>. Your payment was successful and we will contact you soon with your Zoom details.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: '#fff', border: 'none', padding: '1rem 2.5rem',
              borderRadius: 99, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
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
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 24, padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }} />
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Award size={40} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Already Registered
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
            You have already registered for Mini MUN Sunday with this email address. We look forward to seeing you!
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: 99, fontWeight: 800, cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* HEADER SECTION */}
      <div style={{
        background: 'linear-gradient(to bottom, rgba(29, 78, 216, 0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '4rem 1rem 3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract Background Element */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: 1000, height: '100%', opacity: 0.2, zIndex: 0,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', 
            padding: '0.5rem 1rem', borderRadius: 99, color: '#ef4444', 
            fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem' 
          }}>
            <Award size={16} /> MUN Lessons for Students
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#fff', margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1d4ed8' }}>MINI</span> MUN <span style={{ color: '#ef4444' }}>SUNDAY</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', color: '#94a3b8', margin: '0 auto 2.5rem', maxWidth: 650, lineHeight: 1.6 }}>
            Practical MUN lessons and techniques. Develop Public Speaking, Learn Diplomacy, Enhance Critical Thinking and Build Teamwork every Sunday.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={24} color="#3b82f6" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Time</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>10:00 AM - 11:00 AM</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.2)', padding: '0.5rem', borderRadius: 8, color: '#ef4444', fontWeight: 900, fontSize: '1.1rem' }}>
                ₹99/-
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Registration Fee</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Per Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
        
        {/* INFO COLUMN */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            What you get every Sunday
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Monitor size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>LIVE ZOOM CLASS</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Engage in a live Mini MUN session with expert mentors and delegates from across the country.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Play size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>30 MINUTES PRACTICE TIME</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Practice your speech, debate and MUN skills on G-Force AI with AI-powered feedback.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={24} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>PARTICIPATION CERTIFICATE</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Earn a participation certificate and recognition for your efforts and skills.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REGISTRATION FORM COLUMN */}
        <div>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Register Now
            </h2>

            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Student Full Name</label>
                <input type="text" name="studentName" value={form.studentName} onChange={handleChange} placeholder="e.g. Rahul Sharma" style={fieldStyle} {...focusHandlers} required />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. rahul@example.com" style={fieldStyle} {...focusHandlers} required />
              </div>

              <div>
                <label style={labelStyle}>WhatsApp Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select name="countryCode" value={form.countryCode} onChange={handleChange} style={{ ...fieldStyle, width: '120px', cursor: 'pointer' }} {...focusHandlers}>
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} style={{ background: '#1e293b', color: '#fff' }}>{c.code} {c.name}</option>
                    ))}
                  </select>
                  <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter your number" style={{ ...fieldStyle, flex: 1 }} {...focusHandlers} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>School Name</label>
                  <input type="text" name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="e.g. DPS" style={fieldStyle} {...focusHandlers} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Grade/Class</label>
                  <input type="text" name="grade" value={form.grade} onChange={handleChange} placeholder="e.g. Class 10" style={fieldStyle} {...focusHandlers} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" style={fieldStyle} {...focusHandlers} required />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={submitting || !razorpayReady}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #1d4ed8, #ef4444)',
                    color: '#fff',
                    border: 'none',
                    padding: '1.1rem',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: submitting || !razorpayReady ? 'not-allowed' : 'pointer',
                    opacity: submitting || !razorpayReady ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={e => { if (!submitting && razorpayReady) e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {submitting ? 'Processing...' : 'Pay ₹99 & Register'}
                  {!submitting && <ChevronRight size={18} />}
                </button>
                <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                  Payments are processed securely via Razorpay
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
