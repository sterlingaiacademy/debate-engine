import { useState } from 'react';
import { API_BASE } from '../api';
import { Crown, Clock, Phone, User, School, CheckCircle } from 'lucide-react';

/**
 * PremiumEnrollModal
 * 
 * Shows a "daily limit reached" message + enrollment interest form.
 * Props:
 *   user       – the current user object
 *   onDismiss  – callback when user clicks "Back to Dashboard"
 */
export default function PremiumEnrollModal({ user, onDismiss }) {
  const [form, setForm] = useState({
    parentPhone: '',
    school: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.parentPhone || !form.school) {
      setError('Please fill in Parent Phone and School.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.studentId,
          studentName: user?.name,
          grade: user?.classLevel,
          parentPhone: form.parentPhone,
          school: form.school,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2.5rem 1.5rem',
      gap: '1.5rem',
      overflowY: 'auto',
      maxWidth: '520px',
      margin: '0 auto',
      width: '100%',
    }}>

      {/* ── Daily Limit Banner ── */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(249,115,22,0.08) 100%)',
        border: '1.5px solid rgba(239,68,68,0.25)',
        borderRadius: '20px',
        padding: '1.75rem 1.5rem 1.5rem',
        textAlign: 'center',
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏱️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
          You've used today's practice time
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Your daily 10-minute limit has been reached.<br />
          <strong style={{ color: 'var(--text-primary)' }}>You can continue at 12:00 AM IST tomorrow.</strong>
        </p>

        {/* Countdown chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '99px', padding: '0.35rem 0.9rem',
          marginTop: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626',
        }}>
          <Clock size={13} />
          Resets at midnight IST
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          OR GET UNLIMITED ACCESS
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* ── Premium Enroll Form / Success ── */}
      {submitted ? (
        /* ── Success State ── */
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.08) 100%)',
          border: '1.5px solid rgba(16,185,129,0.25)',
          borderRadius: '20px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          animation: 'fadeIn 0.4s ease',
        }}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
            You're on the list! 🎉
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            We've received your enrollment. Our team will reach out to your parents within <strong>24–48 hours</strong> with premium access details.
          </p>
        </div>
      ) : (
        /* ── Enroll Form ── */
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(217,70,239,0.06) 100%)',
          border: '1.5px solid rgba(139,92,246,0.2)',
          borderRadius: '20px',
          padding: '1.75rem 1.5rem',
          animation: 'fadeIn 0.4s ease',
        }}>
          {/* Premium header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Enroll for Premium</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unlimited time · More AI voices · Priority support</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.25rem' }}>
            {/* Student Name (read-only) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1px solid var(--border)' }}>
              <User size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                readOnly
                value={user?.name || ''}
                placeholder="Student Name"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)', width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            {/* Class (read-only) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>🎓</span>
              <input
                readOnly
                value={user?.classLevel || ''}
                placeholder="Class"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)', width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            {/* Parent Phone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-primary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1.5px solid rgba(139,92,246,0.3)' }}>
              <Phone size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
              <input
                type="tel"
                name="parentPhone"
                placeholder="Parent / Guardian Phone *"
                value={form.parentPhone}
                onChange={handleChange}
                required
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            {/* School */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-primary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1.5px solid rgba(139,92,246,0.3)' }}>
              <School size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
              <input
                type="text"
                name="school"
                placeholder="School Name *"
                value={form.school}
                onChange={handleChange}
                required
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                color: '#fff', border: 'none', borderRadius: '12px',
                padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <Crown size={16} />
              {submitting ? 'Submitting…' : 'Enroll for Premium →'}
            </button>
          </form>
        </div>
      )}

      {/* ── Back to Dashboard ── */}
      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', borderRadius: '10px',
          padding: '0.65rem 1.5rem', fontWeight: 600, fontSize: '0.9rem',
          cursor: 'pointer', width: '100%',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
