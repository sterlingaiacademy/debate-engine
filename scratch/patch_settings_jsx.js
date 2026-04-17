const fs = require('fs');
let file = "frontend/src/pages/Settings.jsx";
let content = fs.readFileSync(file, 'utf8');

const settingsComponent = `
import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Camera, UploadCloud, Loader2 } from 'lucide-react';

export default function Settings({ user, setUser }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePayment = () => {
    if (window.Razorpay) {
      const options = {
        key: 'rzp_live_Sdf05PuAU9ehu9',
        amount: '199900',
        currency: 'INR',
        name: 'G FORCE AI',
        description: 'Pro Plan Upgrade',
        handler: function(response) {
          alert('Payment Successful!');
        },
        prefill: { name: user?.name, email: 'student@example.com', contact: '9999999999' },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } else {
      alert("Razorpay SDK not loaded yet.");
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
          // Compress via Canvas down to small base64
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
             if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
             }
          } else {
             if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
             }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed JPEG
          const base64Avatar = canvas.toDataURL('image/jpeg', 0.7);

          // Upload to your Node API
          fetch('/api/user/avatar', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ studentId: user.studentId || user.username, avatar: base64Avatar })
          })
          .then(r => r.json())
          .then(data => {
             if(data.success) {
                setUser({ ...user, avatar: base64Avatar });
             } else {
                alert("Failed to save profile picture.");
             }
          })
          .catch(err => {
             console.error(err);
             alert("Error saving profile picture.");
          })
          .finally(() => {
             setUploading(false);
          });
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

        {/* Existing Billing Section */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Plan & Billing</h2>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
            border: '1px solid rgba(139, 92, 246, 0.2)', 
            padding: '2rem', 
            borderRadius: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CURRENT PLAN</div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Free Plan</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Basic debate access limits and standard voices.</p>
            </div>
            <button 
              onClick={handlePayment}
              style={{ background: 'linear-gradient(90deg, #F97316, #E8392A)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.3)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'none'}
            >
              Upgrade to Pro Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, settingsComponent);
console.log('Settings modified successfully');
