
import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Camera, UploadCloud, Loader2, Crown, Phone, School, CheckCircle, Clock, User, Share2, Copy, Check, Shield } from 'lucide-react';
import { API_BASE } from '../api';
import PremiumEnrollModal from '../components/PremiumEnrollModal';

export default function Settings({ user, setUser }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Biometrics State
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const isMobileApp = typeof window !== 'undefined' && window.isReactNativeWebView;

  React.useEffect(() => {
    if (isMobileApp) {
      const handleStatus = (e) => setBiometricsEnabled(e.detail.enabled);
      window.addEventListener('BIOMETRICS_STATUS', handleStatus);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CHECK_BIOMETRICS_STATUS' }));
      }
      return () => window.removeEventListener('BIOMETRICS_STATUS', handleStatus);
    }
  }, [isMobileApp]);

  const toggleBiometrics = () => {
    const newValue = !biometricsEnabled;
    setBiometricsEnabled(newValue);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOGGLE_BIOMETRICS', value: newValue }));
    }
  };

  // Enrollment logic moved to PremiumEnrollModal

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
    <div className="animate-fade-in settings-container" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
         <SettingsIcon size={28} color="var(--accent)" />
         <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Settings</h1>
      </div>

      <div className="settings-list">
        {/* Profile Picture Section */}
        <div className="card settings-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Camera size={20} color="var(--text-secondary)" /> Profile Customization
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{
              position: 'relative',
              width: '100px', height: '100px',
              flexShrink: 0,           /* ← prevents oval stretching on mobile */
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              border: '2px dashed var(--border)',
              overflow: 'hidden',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
               {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
               )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
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

        {/* ── Security Section (Mobile Only) ──────────────── */}
        {isMobileApp && (
          <div className="card settings-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#10b981" /> Security Settings
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>App Lock (Biometrics / Passcode)</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Require Face ID, Touch ID, or PIN to open the G-Force app.</p>
              </div>
              <button 
                onClick={toggleBiometrics}
                style={{
                  position: 'relative',
                  width: '56px',
                  height: '30px',
                  borderRadius: '15px',
                  border: biometricsEnabled ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  background: biometricsEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  flexShrink: 0,
                  boxShadow: biometricsEnabled ? '0 0 10px rgba(16,185,129,0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: biometricsEnabled ? '29px' : '3px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }} />
              </button>
            </div>
          </div>
        )}

        {/* ── Share & Earn QR Code ─────────────────────────── */}
        {user?.studentId && (() => {
          const referralUrl = `https://graceandforce.com/register?ref=${encodeURIComponent(user.studentId)}`;
          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=ffffff&bgcolor=0d1117&data=${encodeURIComponent(referralUrl)}`;
          const handleCopy = () => {
            navigator.clipboard.writeText(referralUrl).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          };
          return (
            <div className="card settings-card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={20} color="#F97316" /> Share & Earn
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Share your referral link — you earn <strong style={{ color: '#F97316' }}>+200 tokens</strong> when a friend joins, and they get <strong style={{ color: '#F97316' }}>+50 bonus tokens</strong> on signup.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {/* QR Code */}
                <div style={{
                  flexShrink: 0,
                  background: '#0d1117',
                  border: '2px solid rgba(249,115,22,0.3)',
                  borderRadius: '16px',
                  padding: '12px',
                  boxShadow: '0 4px 20px rgba(249,115,22,0.15)',
                }}>
                  <img
                    src={qrSrc}
                    alt="Referral QR Code"
                    width={150} height={150}
                    style={{ display: 'block', borderRadius: '8px' }}
                  />
                </div>

                {/* Link + Copy */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: '200px', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your referral link</span>
                    <div style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '0.6rem 0.9rem',
                      fontSize: '0.78rem', color: '#F97316',
                      wordBreak: 'break-all', lineHeight: 1.5, fontFamily: 'monospace',
                    }}>
                      {referralUrl}
                    </div>
                  </div>

                  <button
                    onClick={handleCopy}
                    style={{
                      width: 'fit-content',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none',
                      background: copied
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #E8392A 0%, #F97316 100%)',
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                      cursor: 'pointer', transition: 'all 0.25s',
                      boxShadow: copied ? '0 4px 12px rgba(16,185,129,0.35)' : '0 4px 12px rgba(232,57,42,0.35)',
                    }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    📱 Your friends can scan the QR code or use your link to sign up.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Go Premium / Enrollment Section */}
        <div className="card settings-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={20} color="#8b5cf6" /> Go Premium
          </h2>

          {/* Current plan chip + description */}
          {(!user?.subscription_plan || user?.subscription_plan === 'free') && (
            <>
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
              </div>
              <PremiumEnrollModal user={user} mode="settings" onDismiss={() => {}} />
            </>
          )}

          {user?.subscription_plan === 'pro' && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(217,70,239,0.1) 100%)',
                border: '2px solid rgba(168,85,247,0.3)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(168,85,247,0.2)', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', marginBottom: '1rem' }}>
                  <Crown size={14} /> CURRENT PLAN · PRO
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>You are a Pro Member! 🎉</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '400px', marginInline: 'auto' }}>
                  You have 20 minutes of daily practice time, access to premium features, and priority support.
                </p>
              </div>
              <PremiumEnrollModal user={user} mode="settings" onDismiss={() => {}} />
            </>
          )}

          {user?.subscription_plan === 'max' && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(234,88,12,0.1) 100%)',
                border: '2px solid rgba(249,115,22,0.4)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(249,115,22,0.1)',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(249,115,22,0.2)', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 800, color: '#fb923c', marginBottom: '1rem' }}>
                  <Crown size={14} /> CURRENT PLAN · MAX
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fb923c' }}>You are a Max Member! 🚀</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '400px', marginInline: 'auto' }}>
                  You have UNLIMITED daily practice time, 100% access to all AI personas, and the ultimate G-Force experience.
                </p>
              </div>
              <PremiumEnrollModal user={user} mode="settings" onDismiss={() => {}} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
