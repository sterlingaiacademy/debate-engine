
import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Camera, UploadCloud, Loader2, Crown, Phone, School, CheckCircle, Clock, User } from 'lucide-react';
import { API_BASE } from '../api';

export default function Settings({ user, setUser }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Enrollment form state
  const [enrollForm, setEnrollForm] = useState({ parentPhone: '', school: '' });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollSubmitted, setEnrollSubmitted] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const handleEnrollChange = (e) => {
    setEnrollForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollForm.parentPhone || !enrollForm.school) {
      setEnrollError('Please fill in Parent Phone and School.');
      return;
    }
    setEnrollError('');
    setEnrollSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.studentId,
          studentName: user?.name,
          grade: user?.classLevel,
          parentPhone: enrollForm.parentPhone,
          school: enrollForm.school,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEnrollSubmitted(true);
      } else {
        setEnrollError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setEnrollError('Network error. Please check your connection.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       alert("Please select a valid image file.");
       return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
             if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
             if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64Avatar = canvas.toDataURL('image/jpeg', 0.7);

          fetch(`${API_BASE}/api/user/avatar`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ studentId: user.studentId || user.username, avatar: base64Avatar })
          })
          .then(r => r.json())
          .then(data => {
             if (data.success) {
                const updatedUser = { ...user, avatar: base64Avatar };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
             } else {
                alert("Failed to save profile picture.");
             }
          })
          .catch(err => {
             console.error(err);
             alert("Error saving profile picture.");
          })
          .finally(() => { setUploading(false); });
       };
       img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
         <SettingsIcon size={28} color="var(--accent)" />
         <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Picture Section */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Camera size={20} color="var(--text-secondary)" /> Profile Customization
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px dashed var(--border)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
               )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Upload Avatar</h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>We recommend a square image (JPEG or PNG). It will be resized automatically.</p>
               <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
               <button
                 onClick={() => fileInputRef.current?.click()}
                 disabled={uploading}
                 style={{
                   width: 'fit-content', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                   padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
                   display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s'
                 }}
               >
                 {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                 {uploading ? "Compressing & Saving..." : "Select Image"}
               </button>
            </div>
          </div>
        </div>

        {/* Go Premium / Enrollment Section */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={20} color="#8b5cf6" /> Go Premium
          </h2>

          {/* Current plan chip + description */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(217,70,239,0.07) 100%)',
            border: '1.5px solid rgba(139,92,246,0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.75rem', background: 'rgba(139,92,246,0.12)', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '0.5rem' }}>
                <Clock size={11} /> CURRENT PLAN · FREE
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem' }}>10 mins / day</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Upgrade for unlimited practice time, more AI voices & priority support.</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
              color: '#fff', padding: '0.4rem 1rem', borderRadius: '99px',
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              COMING SOON
            </div>
          </div>

          {/* Enrollment Form or Success */}
          {enrollSubmitted ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
              padding: '1.75rem', borderRadius: '14px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(5,150,105,0.07) 100%)',
              border: '1.5px solid rgba(16,185,129,0.2)',
            }}>
              <CheckCircle size={40} color="#10b981" />
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>You're on the list! 🎉</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                We'll contact your parents within <strong>24–48 hours</strong> with premium access details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
                Interested in Premium? Fill in your parent's contact details — we'll reach out:
              </p>

              {/* Student Name (read-only) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1px solid var(--border)' }}>
                <User size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  readOnly
                  value={user?.name || ''}
                  placeholder="Student Name"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)', width: '100%', fontFamily: 'inherit', cursor: 'default' }}
                />
              </div>

              {/* Class (read-only) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>🎓</span>
                <input
                  readOnly
                  value={user?.classLevel || ''}
                  placeholder="Class"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)', width: '100%', fontFamily: 'inherit', cursor: 'default' }}
                />
              </div>

              {/* Parent Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1.5px solid rgba(139,92,246,0.25)' }}>
                <Phone size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
                <input
                  type="tel"
                  name="parentPhone"
                  placeholder="Parent / Guardian Phone *"
                  value={enrollForm.parentPhone}
                  onChange={handleEnrollChange}
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              {/* School */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.65rem 0.9rem', border: '1.5px solid rgba(139,92,246,0.25)' }}>
                <School size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  name="school"
                  placeholder="School Name *"
                  value={enrollForm.school}
                  onChange={handleEnrollChange}
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }}
                />
              </div>

              {enrollError && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{enrollError}</p>
              )}

              <button
                type="submit"
                disabled={enrollSubmitting}
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                  border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px',
                  color: '#fff', fontWeight: 700, cursor: enrollSubmitting ? 'not-allowed' : 'pointer',
                  opacity: enrollSubmitting ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                  transition: 'transform 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontSize: '0.95rem',
                }}
                onMouseEnter={e => { if (!enrollSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                <Crown size={16} />
                {enrollSubmitting ? 'Submitting…' : 'Enroll for Premium →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
